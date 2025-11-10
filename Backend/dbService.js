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
                    cleaning_type, rooms, preferred_date, proposed_budget, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;

                connection.query(query, [client_id, service_address, service_address_city, service_address_state, service_address_zip, 
                cleaning_type, num_rooms, preferred_datetime, proposed_budget, notes ?? null], (err, results) => {
                    if (err) reject(err);
                    else resolve(results.insertId);
                });
            });

            // Insert up to 5 photo URLs (if any)
            if (photo_urls && photo_urls.length > 0) {
                const query = `INSERT INTO request_photos (request_id, photo_url) VALUES ?`;
                const values = photo_urls.slice(0, 5).map(url => [requestResult, url]);
                await new Promise((resolve, reject) => {
                    connection.query(query, [values], (err) => {
                    if (err) reject(err);
                    else resolve();
                    });
                });
            }

            return { success: true, request_id: requestResult };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = DbService;