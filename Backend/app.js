// Backend: application services, accessible by URLs

const express = require('express')
const cors = require ('cors')
const dotenv = require('dotenv')
const path = require('path');
dotenv.config()

const app = express();

const dbService = require('./dbService');

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: false}));

// Serve the frontend by manually defining the Frontend folder path
app.use(express.static(path.join(__dirname, '../Frontend')));

// Register a new user
app.post('/addUser', (request, response) => {
    const { username, password, first_name, last_name, address, address_city, address_state, address_zip, phone, 
                email, card_num, card_month, card_year, card_cvv } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.insertNewUser(username, password, first_name, last_name, address, address_city, address_state, address_zip, phone, 
                email, card_num, card_month, card_year, card_cvv);

    result
      .then(data => response.json({ success: true, data }))
      .catch(err => {
          console.error(err);
          response.status(500).json({ success: false, error: err.message });
      });
});

// Login the user given a correct username and password combination
app.post("/loginUser", (request, response) => {
    const { username, password } = request.body;
    const db = dbService.getDbServiceInstance();
    const result = db.loginUser(username, password);

    result
      .then(data => response.json(data))
      .catch(err => console.log(err));
});

// Submit the service request, leaving the notes & photo_links
app.post("/addServiceRequest", async (request, response) => {
    const { username, requestAddress, requestAddressCity, requestAddressState, requestAddressZip, requestCleaningType,
    requestRoomAmount, requestDateTime, requestBudget, requestNotes, photo_urls } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.insertNewRequest(
        username, requestAddress, requestAddressCity, requestAddressState, requestAddressZip, requestCleaningType,
        requestRoomAmount, requestDateTime, requestBudget, requestNotes, Array.isArray(photo_urls) ? photo_urls : JSON.parse(photo_urls || "[]")
    ); // If photo_links is empty, pass it as an empty array

    result
      .then(data => response.json(data))
      .catch(err => console.log(err));
});

// Search users that have the most service orders. "request" is unused, must be a parameter so "response" isn't mistaken for a request and throws an error
app.get('/mostServiceOrders', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result =  db.mostServiceOrders(); 

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// Search for the most quotes in a month
app.get('/monthQuotes', (request, response) => {
    const {quoteAcceptMonth} = request.query;
    const db = dbService.getDbServiceInstance();
    const result =  db.acceptedMonthQuotes(quoteAcceptMonth); 

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// Search for the most rooms in a job
app.get('/largestJob', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result =  db.largestJob(); 

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// Search for clients that processed quotes but haven't paid their bill
app.get('/badClients', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result =  db.badClients(); 

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// Fetch the current DB USER
app.get('/userInfo', (req, res) => {
    res.json({
        dbUser: process.env.DB_USER,
        isAnna: process.env.DB_USER.toLowerCase() === 'anna'
    });
});

// Listen on the fixed port: 5050
app.listen(5050, () => {
});
