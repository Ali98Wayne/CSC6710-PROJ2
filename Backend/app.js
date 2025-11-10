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

// add new user
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

app.post("/addServiceRequest", async (request, response) => {
    const { username, requestAddress, requestAddressCity, requestAddressState, requestAddressZip, requestCleaningType,
    requestRoomAmount, requestDateTime, requestBudget, requestNotes, photo_urls } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.insertNewRequest(
        username, requestAddress, requestAddressCity, requestAddressState, requestAddressZip, requestCleaningType,
        requestRoomAmount, requestDateTime, requestBudget, requestNotes, Array.isArray(photo_urls) ? photo_urls : JSON.parse(photo_urls || "[]")
    );

    result
      .then(data => response.json(data))
      .catch(err => console.log(err));
});

// Listen on the fixed port: 5050
app.listen(5050, () => {
});
