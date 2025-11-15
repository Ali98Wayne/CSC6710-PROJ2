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

    async insertNewUser(username, password, first_name, last_name, address, address_city, address_state, address_zip, phone, 
                email, card_num, card_month, card_year, card_cvv) {
        
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
                    email, credit_card_num, credit_card_month, credit_card_year, credit_card_cvv, signup_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());
                `;
                connection.query(query, [username, password_hash, first_name, last_name, address, address_city, address_state, address_zip, 
                    phone, email, card_num, card_month, card_year, card_cvv], (err, result) => {
                    if(err) reject(err);
                    else resolve(result.insertId);
                });
            });

            return { id: insertId, username, password, first_name, last_name, address, address_city, address_state, address_zip, 
                phone, email, card_num, card_month, card_year, card_cvv};

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

    async badClients(){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `
                        SELECT DISTINCT
                        u.user_id AS client_id, u.username, u.first_name, u.last_name
                        FROM Users u
                        JOIN Request_Cleaning r ON u.user_id = r.client_id
                        WHERE r.bill_status = 'Unpaid'
                        AND r.bill_due_date < (CURDATE() - INTERVAL 7 DAY);
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

    async listServiceOrders(){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `
                        SELECT request_id, client_id, service_address_street, service_address_city, 
                        service_address_state, service_address_zip, cleaning_type, rooms, preferred_date, proposed_budget, request_date, order_generated, bill_generated
                        FROM Request_Cleaning
                        ORDER BY request_id DESC
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
            return response[0];  // Return the first (and only) record
        } catch (err) {
            throw err;
        }
    }

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
    
async generateServiceBill(requestId) {
        try {
            await new Promise((resolve, reject) => {
                const query = `UPDATE Request_Cleaning SET bill_status = 'Unpaid', bill_due_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY) WHERE request_id = ?;`;
                connection.query(query, [requestId], (err, results) => {
                    if (err) reject(new Error(err.message));
                    else resolve(results);
                });
            });

            await new Promise((resolve, reject) => {
                const query = `UPDATE Request_Cleaning SET bill_generated = 1 WHERE request_id = ? AND bill_generated = 0;`;
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

    async clientLoadRequests(username) {
        try {
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = `SELECT 
                        r.request_id,
                        r.order_generated,
                        r.bill_generated
                        FROM Request_Cleaning r
                        JOIN Users u ON r.client_id = u.user_id
                        WHERE u.username = ?
                        ORDER BY r.request_id DESC;`;
                     connection.query(query, [username], (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );
            return response;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = DbService;