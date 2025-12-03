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

// Anna responds to a request with a quote or rejection
app.post('/addQuote', async (req, res) => {
    const { requestId, responderId, quotePrice, scheduledStart, scheduledEnd, note, status } = req.body;
    const db = dbService.getDbServiceInstance();
    try {
        const result = await db.upsertQuote(requestId, responderId, quotePrice, scheduledStart, scheduledEnd, note, status);
        res.json({ success: true, result });
    } catch(err) { 
        res.json({ success: false, error: err.message }); 
    }
});

app.post('/renegotiateQuote', async (req, res) => {
    const { quoteId, note } = req.body; 

    if (!quoteId || !note) {
        return res.json({ success: false, error: "Missing required fields: quoteId, note, or clientId." });
    }

    const db = dbService.getDbServiceInstance();

    try {
        await db.renegotiateQuote(quoteId, note); 
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

app.post('/rejectQuote', async (req, res) => {
    const { quoteId, note } = req.body;

    if (!quoteId || !note) {
        return res.json({ success: false, error: "Missing required fields: quoteId and note." });
    }

    const db = dbService.getDbServiceInstance();

    try {
        await db.rejectQuote(quoteId, note);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

app.post('/cancelQuote', async (req, res) => {
    const { quoteId, note } = req.body;

    if (!quoteId || !note) {
        return res.json({ success: false, error: "Missing required fields: quoteId and note." });
    }

    const db = dbService.getDbServiceInstance();

    try {
        await db.cancelQuote(quoteId, note);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

app.post('/client/accept-quote', async (req, res) => {
    const { requestId } = req.body;
    const db = dbService.getDbServiceInstance();

    try {
        // 1. Update Anna's quote to accepted
        await db.updateQuote(requestId, 'accepted');

        // 2. Done — respond success
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

// Client submits a counter-note for negotiation
app.post('/counterQuote', async (req, res) => {
  const { requestId, responderId, note } = req.body;
  const db = dbService.getDbServiceInstance();
  try {
    const result = await db.counterQuote(requestId, responderId, note);
    res.json({ success: true, result });
  } catch(err) { res.json({ success: false, error: err.message }); }
});

// Anna resubmits a quote
app.post('/resubmitQuote', async (req, res) => {
    const { quoteId, newPrice, newStart, newEnd, note } = req.body; 

    if (!quoteId || !newPrice || !newStart || !newEnd || !note) {
        return res.json({ success: false, error: "Missing required fields: quoteId, newPrice, newStart, newEnd, or note." });
    }

    const db = dbService.getDbServiceInstance();

    try {
        await db.resubmitQuote(quoteId, newPrice, newStart, newEnd, note); 
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
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

// 4. Uncommitted Clients
app.get('/uncommittedClients', async (req, res) => {
    const db = dbService.getDbServiceInstance();
    try {
        const data = await db.uncommittedClients();
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

// 6. Prospective Clients
app.get('/prospectiveClients', async (req, res) => {
    const db = dbService.getDbServiceInstance();
    try {
        const data = await db.prospectiveClients();
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

// 8. Overdue Bills
app.get('/overdueBills', async (req, res) => {
    const db = dbService.getDbServiceInstance();
    try {
        const data = await db.overdueBills();
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

// 10. Good Clients
app.get('/goodClients', async (req, res) => {
    const db = dbService.getDbServiceInstance();
    try {
        const data = await db.goodClients();
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

// Fetch the current DB USER
app.get('/userInfo', (request, response) => {
    response.json({
        dbUser: process.env.DB_USER,
        isAnna: process.env.DB_USER.toLowerCase() === 'anna'
    });
});

// List all service order requests to Anna Johnson
app.get('/listServiceOrders', async (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result =  db.listServiceOrders(); 

    result
    .then(data => response.json({data}))
    .catch(err => console.log(err));
});

// Get a user corresponding to a specific user ID
app.get('/getUser/:userId', async (request, response) => {
  const { userId } = request.params;
  const db = dbService.getDbServiceInstance();

  try {
    const result = await db.getUser(userId);

    if (!result) {
      return response.json({ success: false, error: "User Not Found" });
    }

    response.json({ success: true, request: result });
  } catch (err) {
    console.error(err);
    response.json({ success: false, error: err.message });
  }
});

// Get a service order corresponding to a specific request ID
app.get('/getRequest/:requestId', async (request, response) => {
  const { requestId } = request.params;
  const db = dbService.getDbServiceInstance();

  try {
    const result = await db.getRequest(requestId);

    if (!result) {
      return response.json({ success: false, error: "Service Request Not Found" });
    }

    response.json({ success: true, request: result });
  } catch (err) {
    console.error(err);
    response.json({ success: false, error: err.message });
  }
});

// Get a service bill corresponding to a specific request ID
app.get('/getBill/:requestId', async (request, response) => {
  const { requestId } = request.params;
  const db = dbService.getDbServiceInstance();

  try {
    const result = await db.getBill(requestId);

    if (!result) {
      return response.json({ success: false, error: "Service Bill Not Found" });
    }

    response.json({ success: true, request: result });
  } catch (err) {
    console.error(err);
    response.json({ success: false, error: err.message });
  }
});

// Get a service bill's history corresponding to a specific bill id
app.get('/getBillHistory/:billId', async (req, res) => {
  const { billId } = req.params;
  const db = dbService.getDbServiceInstance();

  try {
    const result = await db.getBillHistory(billId);
    res.json({ success: true, history: result });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});


// Generate a service order corresponding to a specific client from the service order list
app.get('/generateServiceOrder/:requestId', async (request, response) => {
  const { requestId } = request.params;
  const db = dbService.getDbServiceInstance();

  try {
    const result = await db.generateServiceOrder(requestId);

    if (!result) {
      return response.json({ success: false, error: "Service Request Not Found" });
    }

    response.json({ success: true, request: result });
  } catch (err) {
    console.error(err);
    response.json({ success: false, error: err.message });
  }
});

// Generate a service order corresponding to a specific client from the service order list
app.get('/generateServiceBill/:requestId', async (request, response) => {
  const { requestId } = request.params;
  const db = dbService.getDbServiceInstance();

  try {
    const result = await db.generateServiceBill(requestId);

    if (!result) {
      return response.json({ success: false, error: "Service Request Not Found" });
    }

    response.json({ success: true, request: result });
  } catch (err) {
    console.error(err);
    response.json({ success: false, error: err.message });
  }
});

// Fetch all client requests along with their quote/negotiation status
app.get('/clientLoadRequests/:username', async (req, res) => {
  const { username } = req.params;
  const db = dbService.getDbServiceInstance();

  try {
    const requests = await db.clientLoadRequests(username);

    if (!requests) {
      return res.json({ success: false, error: "Username Not Found" });
    }

    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

// Fetch all pending requests that need Anna's quote
app.get('/pendingRequests', async (req, res) => {
    const db = dbService.getDbServiceInstance();
    try {
        const requests = await db.getPendingRequestsForAnna(); // fetch only unhandled requests
        res.json({ requests });
    } catch (err) {
        console.error('Error fetching pending requests:', err);
        res.status(500).json({ error: err.message });
    }
});

// Fetch all pending quotes that need Anna's resubmission
app.get('/pendingQuotes', async (req, res) => {
    const db = dbService.getDbServiceInstance();
    try {
        const requests = await db.getPendingQuotesForAnna();
        res.json({ requests });
    } catch (err) {
        console.error('Error fetching pending quotes:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/client/pay-bill', async (req, res) => {
    const { billId } = req.body;
    if (!billId) return res.json({ success: false, error: 'Missing info' });

    const db = dbService.getDbServiceInstance();

    try {
        await db.payBill(billId);  // <-- use the new dbService method
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

// Anna revises a bill (adjusts amount, adds note)
app.post('/reviseBill', async (req, res) => {
    const { billId, newAmount, note } = req.body;
    
    if (!billId || !newAmount) {
        return res.json({ success: false, error: "Missing required fields" });
    }

    const db = dbService.getDbServiceInstance();

    try {
        await db.reviseBill(billId, newAmount, note);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

app.post('/client/disputeBill', async (req, res) => {
    const { billId, note, userId } = req.body;
    
    if (!billId || !note || !userId) return res.json({ success: false, error: "Missing info" });

    const db = dbService.getDbServiceInstance();
    try {
        await db.disputeBill(billId, note, userId);
        res.json({ success: true });
    } catch (err) {
        console.error("Error disputing bill:", err);
        res.json({ success: false, error: err.message });
    }
});

// Listen on the fixed port: 5050
app.listen(5050, () => {
});
