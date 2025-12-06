// database services, accessbile by DbService methods.

const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt'); // for password hashing
dotenv.config(); // read from .env file

let instance = null; 


// if you use .env to configure
console.log("HOST: " + process.env.DB_HOST);
console.log("DB USER: " + process.env.DB_USER);
console.log("PASSWORD: " + process.env.DB_PASSWORD);
console.log("DATABASE: " + process.env.DB_DATABASE);
console.log("DB PORT: " + process.env.DB_PORT);

const connection = mysql.createConnection({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,        
     password: process.env.DB_PASSWORD,
     database: process.env.DB_DATABASE,
     port: process.env.DB_PORT
});

connection.connect((err) => {
     if(err){
        console.log(err.message);
     }
     console.log('db ' + connection.state);    // to see if the DB is connected or not
});

// the following are database functions, 

class DbService{
    static getDbServiceInstance(){ // only one instance is sufficient
        return instance? instance: new DbService();
    }

    async insertNewUser(username, password, first_name, last_name, address, address_city, address_state, address_zip, phone, email) {
        
        try {
            // check if username exists
            const existing = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users WHERE username = ?";
                connection.query(query, [username], (err, results) => {
                    if(err) reject(err);
                    else resolve(results);
                });
            });

            if(existing.length > 0) throw new Error("Username already exists");

            // Password hashing with 10 salt rounds
            const password_hash = await bcrypt.hash(password, 10);

            // insert new user
            const insertId = await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO users (username, password, first_name, last_name, address_street, address_city, address_state, address_zip, phone, 
                    email, signup_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());
                `;
                connection.query(query, [username, password_hash, first_name, last_name, address, address_city, address_state, address_zip, 
                    phone, email], (err, result) => {
                    if(err) reject(err);
                    else resolve(result.insertId);
                });
            });

            return { id: insertId, username, password, first_name, last_name, address, address_city, address_state, address_zip, 
                phone, email};

        } catch(err) {
            throw err;
        }
    }

    async loginUser(username, password) {
        try {
            // Login query, succeeding upon correct username
            const loginResult = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users WHERE username = ?";
                connection.query(query, [username], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            if (!loginResult) return { success: false, error: "Unknown username" };

            // Compare entered password to stored hash
            const passwordMatch = await bcrypt.compare(password, loginResult.password);
            if (!passwordMatch) return { success: false, error: "Unknown password" };

            // Set the last_login value to the current timestamp only after successfully logging in
            await new Promise((resolve, reject) => {
                const query = "UPDATE users SET last_login = CURRENT_TIMESTAMP() WHERE username = ?";
                connection.query(query, [username], (err, ) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            return { success: true, username };
        } catch(err) {
            throw err;
        }
    }

    async insertNewRequest(username, service_address, service_address_city, service_address_state, service_address_zip, 
    cleaning_type, num_rooms, preferred_datetime, proposed_budget, notes, photo_urls) {
        try {
            // Query to get the user_id from the currently logged in user
            const client_id = await new Promise((resolve, reject) => {
                const getUserIdQuery = "SELECT user_id FROM users WHERE username = ?";
                connection.query(getUserIdQuery, [username], (err, results) => {
                    if (err) reject(err);
                    else if (results.length === 0) reject(new Error("User not found"));
                    else resolve(results[0].user_id);
                });
            });
            
            // Query to process the service request, the client_id is equal to the user_id
            const requestResult = await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO request_cleaning
                    (client_id, service_address_street, service_address_city, service_address_state, service_address_zip,
                    cleaning_type, rooms, preferred_date, proposed_budget, notes, photo_urls)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;

                connection.query(query, [client_id, service_address, service_address_city, service_address_state, service_address_zip, 
                cleaning_type, num_rooms, preferred_datetime, proposed_budget, notes ?? null, JSON.stringify(photo_urls || [])], (err, results) => {
                    if (err) reject(err);
                    else resolve(results.insertId);
                });
            });

            return { success: true, request_id: requestResult };
        } catch (err) {
            throw err;
        }
    }

    // Most service orders query
    async mostServiceOrders(){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `
                        SELECT
                        Users.user_id AS client_id,
                        Users.username,
                        Users.first_name,
                        Users.last_name,
                        COUNT(Request_Cleaning.request_id) AS total_requests
                        FROM Request_Cleaning
                        JOIN Users ON Request_Cleaning.client_id = Users.user_id
                        GROUP BY Users.user_id
                        ORDER BY total_requests DESC
                        LIMIT 10;
                     `;
                     connection.query(query, (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );

             return response;
         } catch(err) {
            throw err;
        }
    }

    // Uncommitted clients search query: 3+ requests but never completed an order
    async uncommittedClients() {
        try {
            const query = `
                SELECT u.user_id, u.first_name, u.last_name, u.email, COUNT(r.request_id) AS request_count
                FROM Users u
                JOIN Request_Cleaning r ON u.user_id = r.client_id
                WHERE r.order_generated = 0
                GROUP BY u.user_id
                HAVING request_count >= 3
            `;
            const response = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return response;
        } catch (err) {
            throw err;
        }
    }

    // Accepted quotes in a month search query
    async acceptedMonthQuotes(month){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `
                        SELECT 
                        r.request_id,
                        u.user_id AS client_id,
                        u.username,
                        u.first_name,
                        u.last_name,
                        r.quote_accept_date
                        FROM Request_Cleaning r
                        JOIN Users u ON r.client_id = u.user_id
                        WHERE MONTH(r.quote_accept_date) = ? 
                        ORDER BY r.quote_accept_date DESC;
                     `;
                     connection.query(query, [month], (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );

             return response;
         } catch(err) {
            throw err;
        }
    }

    // Prospective Clients search query: registered but never submitted any request
    async prospectiveClients() {
        try {
            const query = `
                SELECT u.user_id, u.first_name, u.last_name, u.email
                FROM Users u
                LEFT JOIN Request_Cleaning r ON u.user_id = r.client_id
                WHERE r.client_id IS NULL
            `;
            const response = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return response;
        } catch (err) {
            throw err;
        }
    }

    // Large job search query
    async largestJob(){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `
                        SELECT 
                        r.request_id,
                        u.user_id AS client_id,
                        u.username,
                        u.first_name,
                        u.last_name,
                        r.rooms
                        FROM Request_Cleaning r
                        JOIN Users u ON r.client_id = u.user_id
                        ORDER BY r.rooms DESC
                        LIMIT 10;
                     `;
                     connection.query(query, (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );

             return response;
         } catch(err) {
            throw err;
        }
    }

    // Overdue Bills search query: unpaid bills older than one week
    async overdueBills() {
        try {
            const query = `
                SELECT * FROM Bills
                WHERE bill_status = 'Unpaid' AND due_date < NOW() - INTERVAL 7 DAY
            `;
            const response = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return response;
        } catch (err) {
            throw err;
        }
    }

    // Bad clients search query
    async badClients(){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `
                        SELECT DISTINCT
                        u.user_id AS client_id, u.username, u.first_name, u.last_name
                        FROM Users u
                        JOIN Bills b ON u.user_id = b.client_id
                        WHERE b.bill_status = 'Unpaid'
                        AND b.due_date < (CURDATE() - INTERVAL 7 DAY);
                     `;
                     connection.query(query, (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );

             return response;
         } catch(err) {
            throw err;
        }
    }

    // Good clients search query: always paid bills within 24 hours
    async goodClients() {
        try {
            const query = `
                SELECT u.user_id, u.first_name, u.last_name, u.email
                FROM Users u
                JOIN Bills b ON u.user_id = b.client_id
                GROUP BY u.user_id
                HAVING SUM(TIMESTAMPDIFF(HOUR, b.created_at, b.payment_date) > 24) = 0
            `;
            const response = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return response;
        } catch (err) {
            throw err;
        }
    }

    // Function for Anna to get requests that haven't been quoted or rejected
    async getPendingRequestsForAnna() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT r.request_id, r.client_id, r.service_address_street, r.service_address_city, r.service_address_state,
                        r.service_address_zip, r.cleaning_type, r.rooms, r.preferred_date, r.proposed_budget,
                        r.notes, r.status, u.username
                    FROM Request_Cleaning r
                    INNER JOIN Users u ON r.client_id = u.user_id
                    LEFT JOIN Quotes q 
                        ON r.request_id = q.request_id AND q.responder_type='Anna'
                    WHERE r.status = 'pending'
                    ORDER BY r.request_date ASC
                    `;
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return response;
        } catch (err) {
            throw err;
        }
    }

    // Function for Anna to get quotes that can be canceled, rejected, or resubmitted
    async getPendingQuotesForAnna() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT q.*, u.username
                    FROM Quotes q
                    LEFT JOIN Users u ON q.client_id = u.user_id
                    WHERE (q.status = 'quoted' OR q.status = 'countered')
                    ORDER BY q.created_at ASC;
                    `;
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return response;
        } catch (err) {
            throw err;
        }
    }

    // Function for Anna to get all bills
    async getBillsForAnna() {
    try {
        const response = await new Promise((resolve, reject) => {
            const query = `
                SELECT b.bill_id, b.request_id, b.client_id, b.bill_amount, b.bill_status, b.due_date, b.note,
                    u.first_name, u.last_name, u.username
                FROM Bills b
                JOIN Users u ON b.client_id = u.user_id
                ORDER BY 
                    b.due_date ASC;
                `;
            connection.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

            return response;
        } catch (err) {
            throw err;
        }
    }

    // Function for Anna to reject a service request with a note
    async rejectRequest(requestId, note) {
        try {
            await new Promise((resolve, reject) => {
                const updateQuery = `
                    UPDATE Request_Cleaning 
                    SET status = 'rejected', anna_note = ?
                    WHERE request_id = ?;
                `;
                connection.query(updateQuery, [note, requestId], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            return { success: true };
        } catch (err) {
            throw err;
        }
    }
    
    // Function for Anna to submit a quote then add an entry to the quote history
    async submitQuote(requestId, quotePrice, start, end, note) {
        try {
            const clientId = await new Promise((resolve, reject) => {
                const q = "SELECT client_id FROM Request_Cleaning WHERE request_id = ?";
                connection.query(q, [requestId], (err, results) => {
                    if (err) reject(err);
                    else if (!results || results.length === 0) reject(new Error("Client not found"));
                    else resolve(results[0].client_id);
                });
            });

            await new Promise((resolve, reject) => {
                const updateRequest = `
                    UPDATE Request_Cleaning 
                    SET status = 'quoted'
                    WHERE request_id = ?
                `;
                connection.query(updateRequest, [requestId], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            const quoteId = await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO Quotes 
                    (request_id, client_id, quote_price, scheduled_start, scheduled_end, note, status, responder_type)
                    VALUES (?, ?, ?, ?, ?, ?, 'quoted', 'Anna') 
                `;
                connection.query(query, [requestId, clientId, quotePrice, start, end, note], 
                    (err, res) => {
                        if(err) reject(err); 
                        else resolve(res.insertId); // Resolve with the new quote_id
                    }
                );
            });

            await new Promise((resolve, reject) => {
                const historyQuery = `
                    INSERT INTO Quote_History (quote_id, client_id, responder_type, quote_price, scheduled_start, scheduled_end, status, note)
                    VALUES (?, ?, 'Anna', ?, ?, ?, 'quoted', ?);
                `;
                connection.query(historyQuery, [quoteId, clientId, quotePrice, start, end, note], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            return { success: true, quoteId: quoteId };
        } catch(err) { 
            throw err; 
        }
    }

    // Function for Anna to resubmit a quote then add an entry to the quote history
    async resubmitQuote(quoteId, newPrice, newStart, newEnd, note) {
        await new Promise((resolve, reject) => {
            const updateQuery = `
                UPDATE Quotes 
                SET responder_type = 'Anna', quote_price = ?, scheduled_start = ?, scheduled_end = ?, note = ?, status = 'quoted', response_date = CURRENT_TIMESTAMP()
                WHERE quote_id = ?;
            `;
            connection.query(updateQuery, [newPrice, newStart, newEnd, note, quoteId], (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const updatedQuoteData = await new Promise((resolve, reject) => {
            const updatedQuoteData = "SELECT * FROM Quotes WHERE quote_id = ?";
            connection.query(updatedQuoteData, [quoteId], (err, results) => {
                if (err) reject(err);
                else if (results.length === 0) reject(new Error("Quote not found"));
                else resolve(results[0]);
            });
        });
        
        await new Promise((resolve, reject) => {
            const historyQuery = `
                INSERT INTO Quote_History (quote_id, client_id, responder_type, quote_price, scheduled_start, scheduled_end, status, note)
                VALUES (?, ?, 'Anna', ?, ?, ?, ?, ?);
            `;
            connection.query(historyQuery, [quoteId, updatedQuoteData.client_id, updatedQuoteData.responder_type, updatedQuoteData.quote_price, 
                updatedQuoteData.scheduled_start, updatedQuoteData.scheduled_end, updatedQuoteData.status, updatedQuoteData.note], (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        return { success: true };
    }

    // Function for Anna to reject a quote then add an entry to the quote history
    async rejectQuote(quoteId, note) {
        try {
            await new Promise((resolve, reject) => {
                const updateQuery = `
                    UPDATE Quotes 
                    SET responder_type = 'Anna', status = 'rejected', response_date = CURRENT_TIMESTAMP()
                    WHERE quote_id = ?;
                `;
                connection.query(updateQuery, [quoteId], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            const quoteData = await new Promise((resolve, reject) => {
                const getQuoteDataQuery = "SELECT * FROM Quotes WHERE quote_id = ?";
                connection.query(getQuoteDataQuery, [quoteId], (err, results) => {
                    if (err) reject(err);
                    else if (results.length === 0) reject(new Error("Quote not found"));
                    else resolve(results[0]);
                });
            });

            await new Promise((resolve, reject) => {
                const historyQuery = `
                    INSERT INTO Quote_History (quote_id, client_id, responder_type, quote_price, scheduled_start, scheduled_end, status, note)
                    VALUES (?, ?, 'Anna', ?, ?, ?, ?, ?);
                `;
                connection.query(historyQuery, [quoteId, quoteData.client_id, quoteData.quote_price, quoteData.scheduled_start, quoteData.scheduled_end, quoteData.status, note], (err, res) => {
                    if (err) { 
                        console.log(historyQuery);
                        reject(err);
                    }
                    else resolve(res);
                });
            });

            return { success: true };
        } catch (err) {
            throw err;
        }
    }

    // Function for either the client or Anna to cancel a quote then add an entry to the quote history
    async cancelQuote(quoteId, responderType, note) {
        try {
            const quoteData = await new Promise((resolve, reject) => {
                const getQuoteDataQuery = "SELECT * FROM Quotes WHERE quote_id = ?";
                connection.query(getQuoteDataQuery, [quoteId], (err, results) => {
                    if (err) reject(err);
                    else if (results.length === 0) reject(new Error("Quote not found"));
                    else resolve(results[0]);
                });
            });

            await new Promise((resolve, reject) => {
                const historyQuery = `
                    INSERT INTO Quote_History (quote_id, client_id, responder_type, quote_price, scheduled_start, scheduled_end, status, note)
                    VALUES (?, ?, ?, ?, ?, ?, 'canceled', ?);
                `;
                connection.query(historyQuery, [quoteId, quoteData.client_id, responderType, quoteData.quote_price, quoteData.scheduled_start, quoteData.scheduled_end, note], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            await new Promise((resolve, reject) => {
                const updateQuery = `
                    UPDATE Quotes 
                    SET responder_type = 'Anna', status = 'canceled', response_date = CURRENT_TIMESTAMP()
                    WHERE quote_id = ?;
                `;
                connection.query(updateQuery, [quoteId], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            return { success: true };
        } catch (err) {
            throw err;
        }
    }

    // Function to allow Anna to revise a bill (adjust amount, add note) and store revision in Bill_History
    async reviseBill(billId, newAmount, note) {
        try {
            const clientId = await new Promise((resolve, reject) => {
                const q = "SELECT client_id FROM Bills WHERE bill_id = ?;";
                connection.query(q, [billId], (err, results) => {
                    if (err) reject(err);
                    else if (!results || results.length === 0) reject(new Error("Client not found"));
                    else resolve(results[0].client_id);
                });
            });

            await new Promise((resolve, reject) => {
                const q = `
                    INSERT INTO Bill_History (bill_id, client_id, responder_type, note, new_amount, bill_status, due_date)
                    VALUES (?, ?, 'Anna', ?, ?, 'Unpaid', DATE_ADD(CURDATE(), INTERVAL 7 DAY))
                `;
                connection.query(q, [billId, clientId, note ?? null, newAmount ?? null ], (err, res) => err ? reject(err) : resolve(res));
            });

            // Update bills table with new amount and reset status to Unpaid (so client can pay or dispute)
            await new Promise((resolve, reject) => {
                const q = `
                    UPDATE Bills
                    SET bill_amount = ?, note = ?, bill_status = 'Unpaid', due_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                    WHERE bill_id = ?
                `;
                connection.query(q, [newAmount, note, billId], (err, res) => err ? reject(err) : resolve(res));
            });

            return { success: true };
        } catch (err) {
            throw err;
        }
    }

    // Function for the client to get requests, column name conflicts are prevented using: request_status, quote_note, & quote_status
    async clientLoadRequests(username) {
        try {
            const requests = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        r.request_id, r.service_address_street, r.service_address_city, r.service_address_state, r.service_address_zip,
                        r.cleaning_type, r.rooms, r.preferred_date, r.proposed_budget, r.notes, r.order_generated, r.bill_generated,
                        r.status AS request_status, u.username, q.quote_id, q.quote_price, q.scheduled_start, q.scheduled_end,
                        q.note AS quote_note, q.status AS quote_status, q.responder_type, q.response_date
                    FROM Request_Cleaning r
                    JOIN Users u ON r.client_id = u.user_id
                    LEFT JOIN Quotes q ON q.request_id = r.request_id
                    AND q.responder_type = 'Anna'
                    WHERE u.username = ?
                    ORDER BY r.request_date ASC
                `;
                connection.query(query, [username], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Attach bills for each request
            for (let req of requests) {
                const bills = await new Promise((resolve, reject) => {
                    const q = `SELECT bill_id, bill_amount, bill_status, due_date, note 
                            FROM Bills WHERE request_id = ?`;
                    connection.query(q, [req.request_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                    });
                });
                req.bills = bills;
            }
            
            return requests;
        } catch (err) {
            throw err;
        }
    }

    // Function for the client to accept a quote then add an entry to the quote history
    async acceptQuote(requestId) {
        try {
            await new Promise((resolve, reject) => {
                const query = `UPDATE Quotes SET status = 'accepted' WHERE request_id = ?`;
                connection.query(query, [requestId], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            const quoteData = await new Promise((resolve, reject) => {
                const q = `SELECT * FROM Quotes WHERE request_id = ?`;
                connection.query(q, [requestId], (err, results) => {
                    if (err || results.length === 0) reject(new Error("Quote not found."));
                    else resolve(results[0]);
                });
            });

            // Get the quote_id from quoteData to be used for the quote history
            const quoteId = quoteData.quote_id;

            await new Promise((resolve, reject) => {
                const historyQuery = `
                    INSERT INTO Quote_History (quote_id, client_id, responder_type, note, quote_price, scheduled_start, scheduled_end, status)
                    VALUES (?, ?, 'Client', ?, ?, ?, ?, 'accepted');
                `;
                
                connection.query(historyQuery, [quoteId, quoteData.client_id, quoteData.note, quoteData.quote_price, quoteData.scheduled_start, 
                    quoteData.scheduled_end], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });
        } catch (err) {
            throw err;
        }
    }

    // Function for the client to counter a quote with a note then add an entry to the quote history
    async counterQuote(quoteId, note) {
        try {
            const quoteData = await new Promise((resolve, reject) => {
                const q = `SELECT * FROM Quotes WHERE quote_id = ?`;
                connection.query(q, [quoteId], (err, results) => {
                    if (err || results.length === 0) reject(new Error("Quote not found."));
                    else resolve(results[0]);
                });
            });

            const oldNote = quoteData.note;
         
            await new Promise((resolve, reject) => {
                const updateQuery = `
                    UPDATE Quotes 
                    SET responder_type = 'Client', 
                        status = 'countered',
                        note = ?,
                        response_date = CURRENT_TIMESTAMP()
                    WHERE quote_id = ?;
                `;
                connection.query(updateQuery, [note, quoteId], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            await new Promise((resolve, reject) => {
                const historyQuery = `
                    INSERT INTO Quote_History (quote_id, client_id, responder_type, note, quote_price, scheduled_start, scheduled_end, status)
                    VALUES (?, ?, 'Client', ?, ?, ?, ?, 'countered');
                `;
                
                connection.query(historyQuery, [quoteId, quoteData.client_id, oldNote, quoteData.quote_price, quoteData.scheduled_start, 
                    quoteData.scheduled_end], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            return { success: true };
        } catch (err) {
            throw err;
        }
    }

    // Function to allow a client to dispute a bill (adds a Bill_History entry and sets status to 'Disputed')
    async disputeBill(billId, note) {
        try {
            // Update bill status to Disputed and include a note
            await new Promise((resolve, reject) => {
                const q = "UPDATE Bills SET bill_status = 'Disputed', note = ? WHERE bill_id = ?";
                connection.query(q, [note, billId], (err, res) => err ? reject(err) : resolve(res));
            });
            
            // Get updated bill information to be inserted into the bill history
            const billData = await new Promise((resolve, reject) => {
                const billDataQuery = "SELECT * FROM Bills WHERE bill_id = ?";
                connection.query(billDataQuery, [billId], (err, results) => {
                    if (err) reject(err);
                    else if (results.length === 0) reject(new Error("Bill not found"));
                    else resolve(results[0]);
                });
            });

            // Add an entry to the bill history
            await new Promise((resolve, reject) => {
                const q = `
                    INSERT INTO Bill_History (bill_id, client_id, responder_type, note, new_amount, bill_status, due_date)
                    VALUES (?, ?, 'Client', ?, ?, 'Disputed', DATE_ADD(CURDATE(), INTERVAL 7 DAY))
                `;
                connection.query(q, [billId, billData.client_id, note, billData.bill_amount], (err, res) => err ? reject(err) : resolve(res));
            });

            return { success: true };
        } catch (err) {
            throw err;
        }
    }

    // Function to update a bill as paid
    async payBill(billId) {
        try {
            const result = await new Promise((resolve, reject) => {
                const query = `UPDATE Bills SET bill_status = 'Paid', note = 'Paid by client', payment_date = CURRENT_TIMESTAMP() WHERE bill_id = ?`;
                connection.query(query, [billId], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            // Get updated bill information to be inserted into the bill history
            const billData = await new Promise((resolve, reject) => {
                const billDataQuery = "SELECT * FROM Bills WHERE bill_id = ?";
                connection.query(billDataQuery, [billId], (err, results) => {
                    if (err) reject(err);
                    else if (results.length === 0) reject(new Error("Bill not found"));
                    else resolve(results[0]);
                });
            });

            // Add an entry to the bill history
            await new Promise((resolve, reject) => {
                const q = `
                    INSERT INTO Bill_History (bill_id, client_id, responder_type, note, new_amount, bill_status, due_date, payment_date)
                    VALUES (?, ?, 'Client', ?, ?, ?, ?, ?)
                `;
                connection.query(q, [billId, billData.client_id, billData.note, billData.bill_amount, billData.bill_status,
                    billData.due_date, billData.payment_date], (err, res) => err ? reject(err) : resolve(res));
            });
            return result;
        } catch (err) {
            throw err;
        }
    }

    // Function to get user info used in viewing a service order & bill
    async getUser(clientId) {
        try {
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `SELECT * FROM Users WHERE user_id = ?;`;
                     connection.query(query, [clientId], (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );

            return response[0];  // Return the first (and only) record
        } catch (err) {
            throw err;
        }
    }

    // Function to get request info used in viewing a service order & bill
    async getRequest(requestId) {
        try {
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `SELECT * FROM Request_Cleaning WHERE request_id = ?;`;
                     connection.query(query, [requestId], (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );

            return response[0];
        } catch (err) {
            throw err;
        }
    }

    // Function to get bill info used in view a service bill & revising a bill
    async getBill(requestId) {
        try {
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `SELECT * FROM Bills WHERE request_id = ?;`;
                     connection.query(query, [requestId], (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );

            return response[0];
        } catch (err) {
            throw err;
        }
    }

    // Function to flip the order_generated status from 0 to 1 only if it was 0 beforehand
    async generateServiceOrder(requestId) {
        try {
            await new Promise((resolve, reject) => {
                const query = `UPDATE Request_Cleaning SET order_generated = 1 WHERE request_id = ? AND order_generated = 0;`;
                connection.query(query, [requestId], (err, results) => {
                    if (err) reject(new Error(err.message));
                    else resolve(results);
                });
            });

            return { success: true };
        } catch (err) {
            throw err;
        }
    }

    // Function to flip the bill_generated status from 0 to 1 only if it was 0 beforehand    
    async generateServiceBill(requestId) {
        try {
            const requestInfo = await new Promise((resolve, reject) => {
                const query = `
                    SELECT client_id, proposed_budget 
                    FROM Request_Cleaning 
                    WHERE request_id = ?;
                `;
                connection.query(query, [requestId], (err, rows) => {
                    if (err) reject(new Error(err.message));
                    else resolve(rows[0]);
                });
            });

            if (!requestInfo) {
                throw new Error("Request not found.");
            }

            const { client_id, proposed_budget } = requestInfo;

            const insertResult = await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO Bills (request_id, client_id, bill_amount, bill_status, due_date)
                    VALUES (?, ?, ?, 'Unpaid', DATE_ADD(CURDATE(), INTERVAL 7 DAY));
                `;
                connection.query(
                    query,
                    [requestId, client_id, proposed_budget],
                    (err, result) => {
                        if (err) reject(new Error(err.message));
                        else resolve(result);
                    }
                );
            });

            const billId = insertResult.insertId;

            await new Promise((resolve, reject) => {
                const query = `
                    UPDATE Request_Cleaning
                    SET bill_generated = 1
                    WHERE request_id = ? AND bill_generated = 0;
                `;
                connection.query(query, [requestId], (err, result) => {
                    if (err) reject(new Error(err.message));
                    else resolve(result);
                });
            });

            await new Promise((resolve, reject) => {
                const query = `
                    UPDATE Bills 
                    SET bill_status = 'Unpaid'
                    WHERE request_id = ?;
                `;
                connection.query(query, [requestId], (err, result) => {
                    if (err) reject(new Error(err.message));
                    else resolve(result);
                });
            });

            return { success: true, billId };
        } catch (err) {
            throw err;
        }
    }

    // Function to get the quoteHistory to be displayed in a service order
    async getQuoteHistory(requestId) {
        try {
            const quoteId = await new Promise((resolve, reject) => {
                const q = "SELECT quote_id FROM Quotes WHERE request_id = ?;";
                connection.query(q, [requestId], (err, results) => {
                    if (err) reject(err);
                    else if (!results || results.length === 0) reject(new Error("Quote not found"));
                    else resolve(results[0].quote_id);
                });
            });

            if (quoteId === null) return [];

            const history = await new Promise((resolve, reject) => {
                const query = `SELECT * FROM Quote_History WHERE quote_id = ? ORDER BY created_at DESC`;
                connection.query(query, [quoteId], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });
            return history;
        } catch (err) { throw err; }
    }

    // Function to fetch the bill history for a given bill to be displayed in a service bill
    async getBillHistory(billId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT bh.*
                    FROM Bill_History bh
                    LEFT JOIN Users u ON bh.client_id = u.user_id
                    WHERE bh.bill_id = ?
                    ORDER BY bh.created_at ASC
                `;
                connection.query(query, [billId], (err, results) => {
                    if (err) reject(new Error(err.message));
                    else resolve(results);
                });
            });

            return response;
        } catch (err) {
            throw err;
        }
    }

    async listServiceOrders(){
        try {
             const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        r.request_id, r.client_id, r.service_address_street, r.service_address_city, 
                        r.service_address_state, r.service_address_zip, r.cleaning_type, r.rooms, 
                        r.preferred_date, r.proposed_budget, r.request_date, r.order_generated, r.bill_generated,
                        q.status AS quote_status  
                    FROM 
                        Request_Cleaning r
                    LEFT JOIN 
                        Quotes q ON r.request_id = q.request_id 
                    GROUP BY 
                        r.request_id, r.client_id, r.service_address_street, r.service_address_city, 
                        r.service_address_state, r.service_address_zip, r.cleaning_type, r.rooms, 
                        r.preferred_date, r.proposed_budget, r.request_date, r.order_generated, r.bill_generated, 
                        q.status
                    ORDER BY r.request_id DESC
                `;
                connection.query(query, (err, results) => {
                    if(err) reject(new Error(err.message));
                    else resolve(results);
                });
            });

            return response;
         } catch(err) {
            throw err;
        }
    }
}
module.exports = DbService;