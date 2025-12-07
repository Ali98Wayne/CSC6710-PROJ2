// Client dashboard view function which also refreshes content after data is successfully sent to the DB, needs to be a global function
async function loadClientDashboardData(username) {
    try {
        const response = await fetch(`/clientLoadRequests/${username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const allClientRequests = data.requests;
            renderClientRejectedRequests(allClientRequests);
            renderClientQuotes(allClientRequests);
            renderClientBills(allClientRequests);
        } else {
            alert("Error loading client data: " + (data.error || "Unknown error"));
        }

    } catch (error) {
        console.error("Failed to load client dashboard data:", error);
    }
}

// Anna dashboard view function which also refreshes content after data is successfully sent to the DB, needs to be a global function
function loadAnnaDashboardData() {
    // Reload Pending Requests
    fetch('/pendingRequests')
    .then(res => res.json())
    .then(data => {
        renderAnnaRequestUI(data.requests);
    });
    // Reload Pending Quotes
    fetch('/pendingQuotes')
    .then(res => res.json())
    .then(data => {
        renderAnnaQuoteUI(data.requests);
    });    
    // Reload Bills
    fetch('/getBills')
    .then(res => res.json())
    .then(data => {
        renderAnnaBillUI(data.requests);
    });        
}
document.addEventListener("DOMContentLoaded", function() {
    const inputFields = document.querySelectorAll("input");
    inputFields.forEach(input => input.value = ""); // Clear all input fields on page reload
    document.getElementById('signup-creditcard-month').selectedIndex = 0; // Set the default credit card month to January on page reload
    document.getElementById('signup-address-state').selectedIndex = 0; // Set the default signup state option on page reload
    document.getElementById('service-address-state').selectedIndex = 0; // Set the default service state option on page reload
    document.getElementById('cleaning-type').selectedIndex = 0; // Set the default cleaning type to Basic on page reload
    document.getElementById('monthQuotes').selectedIndex = 0; // Set the default quote search month to January on page reload
    const addPhotoButton = document.getElementById('add-photo-button');
    const photoFields = document.getElementById('photo-fields');
    let photoNum = 0; // Keeps track of how many photo link fields are on the service request page
    const photosMax = 5; // Up to 5 photo link fields can be added

    const signupSection = document.querySelector("#signup-section");
    const loginSection = document.querySelector("#login-section");

    document.querySelector("#to-login").addEventListener("click", () => {
        toSignupOrLogin("login");
    });

    document.querySelector("#to-signup").addEventListener("click", () => {
        toSignupOrLogin("signup");
    });

    // Function to swap between Sign Up & Login sections
    function toSignupOrLogin(target) {
      if (target === "login") {
          signupSection.style.display = "none"; // Hide the Sign Up section
          loginSection.style.display = "block"; // Show the Login section
      } else {
          signupSection.style.display = "block"; // Show the Sign Up section
          loginSection.style.display = "none"; // Hide the Login section
      }

      // Reset Signup & Login input fields when swapping between sections 
      document.querySelectorAll("#signup-section input, #login-section input")
          .forEach(input => (input.value = ""));
      document.querySelector("#signup-address-state").value = "";
      document.querySelector("#signup-creditcard-month").value = "January";
    }

    // Sign up implementation
    const signupBtn = document.querySelector("#signup-btn");
    signupBtn.addEventListener("click", () => {
        const first_name = document.querySelector("#signup-firstname").value.trim();
        const last_name = document.querySelector("#signup-lastname").value.trim();
        const address = document.querySelector("#signup-address").value.trim();
        const address_city = document.querySelector("#signup-address-city").value.trim();
        const address_state = document.querySelector("#signup-address-state").value.trim();
        const address_zip = document.querySelector("#signup-address-zip").value.trim();
        const phone = document.querySelector("#signup-phone").value.trim();
        const email = document.querySelector("#signup-email").value.trim();
        const card_num = document.querySelector("#signup-creditcard").value.trim();
        const card_month = document.querySelector("#signup-creditcard-month").value.trim();
        const card_year = document.querySelector("#signup-creditcard-year").value.trim();
        const card_cvv = document.querySelector("#signup-creditcard-cvv").value.trim();
        const username = document.querySelector("#signup-username").value.trim();
        const password = document.querySelector("#signup-password").value.trim();

        if (!first_name || !last_name || !address || !address_city || !address_state || 
            !address_zip || !phone || !email || !card_num || !card_month || 
            !card_year || !card_cvv || !username || !password) {
            alert("Please fill out all fields.");
            return;
        }

        fetch("http://localhost:5050/addUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, first_name, last_name, address, 
                address_city, address_state, address_zip, phone, email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("User created successfully!");
                document.querySelector("#signup-firstname").value = "";
                document.querySelector("#signup-lastname").value = "";
                document.querySelector("#signup-address").value = "";
                document.querySelector("#signup-address-city").value = "";
                document.querySelector("#signup-address-state").value = "";
                document.querySelector("#signup-address-zip").value = "";
                document.querySelector("#signup-phone").value = "";
                document.querySelector("#signup-email").value = "";
                document.querySelector("#signup-creditcard").value = "";
                document.querySelector("#signup-creditcard-month").value = "January";
                document.querySelector("#signup-creditcard-year").value = "";
                document.querySelector("#signup-creditcard-cvv").value = "";
                document.querySelector("#signup-username").value = "";
                document.querySelector("#signup-password").value = "";
                toSignupOrLogin("login"); // Send the user to the Login section after creating an account
            } else {
                alert("Error: " + (data.error || "Unknown error"));
            }
        })
        .catch(err => console.error("Signup error:", err));
    });

    document.getElementById('signup-address-zip').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
        if (input.length > 5) input = input.substring(0, 5); // Limit to 5 digits
        e.target.value = input;
    });

    // Apply dashes to the phone number field based on input length
    document.getElementById('signup-phone').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
        let formattedInput = '';

        if (input.length > 0) {
            formattedInput += input.substring(0, 3);
        }
        if (input.length > 3) {
            formattedInput += '-' + input.substring(3, 6);
        }
        if (input.length > 6) {
            formattedInput += '-' + input.substring(6, 10);
        }

        e.target.value = formattedInput;
    });

    document.getElementById('signup-creditcard').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, '');
        let formattedInput = '';

        if (input.length > 0) {
            formattedInput += input.substring(0, 4);
        }
        if (input.length > 4) {
            formattedInput += '-' + input.substring(4, 8);
        }
        if (input.length > 8) {
            formattedInput += '-' + input.substring(8, 12);
        }
        if (input.length > 12) {
            formattedInput += '-' + input.substring(12, 16);
        }

        e.target.value = formattedInput;
    });

    document.getElementById('signup-creditcard-year').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, '');
        if (input.length > 4) input = input.substring(0, 4);
        e.target.value = input;
    });

    document.getElementById('signup-creditcard-cvv').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, '');
        if (input.length > 4) input = input.substring(0, 4);
        e.target.value = input;
    });

    document.getElementById('service-address-zip').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, '');
        if (input.length > 5) input = input.substring(0, 5);
        e.target.value = input;
    });

    document.getElementById('room-amount').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, '');
        e.target.value = input;
    });

    document.getElementById('proposed-budget').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, '');
        e.target.value = input;
    });

    // Login page implementation
    const loginBtn = document.querySelector("#login-btn");
    const profileToggle = document.querySelector("#profile-toggle");
    const logoutBtn = document.querySelector("#logout-btn");

    let isAnnaUser = false; // Variable for knowing if the DB USER is Anna Johnson, false by default

    fetch('http://localhost:5050/userInfo')
    .then(res => res.json())
    .then(data => {
        isAnnaUser = data.isAnna;
        updateUI(); // Run after fetching DB USER info
    })
    .catch(err => {
        console.error('Error fetching user info:', err);
        updateUI();
    });

    // Show/hide content based on user status
    function updateUI() {
        const currentUser = localStorage.getItem("loggedInUser");
        const profileSection = document.querySelector("#profile-section");
        const profileName = document.querySelector("#profile-name");
        const serviceRequest = document.querySelector("#service-request");
        const queriesSection = document.querySelector("#queries-section");
        const queryResults = document.querySelector("#query-results");
        const queryBody = document.querySelector('#query-results tbody');
        const clientRequestsSection = document.getElementById("client-rejected-requests-section"); 
        const clientQuotesSection = document.getElementById("client-quotes-section"); 
        const clientBillsSection = document.getElementById("client-bills-section");
        const pendingRequestsSection = document.getElementById("pending-requests-section");
        const pendingQuotesSection = document.getElementById("pending-quotes-section");
        const billsSection = document.getElementById("bills-section");

        if (currentUser) {
            signupSection.style.display = "none";
            loginSection.style.display = "none";
            profileSection.style.display = "flex";
            profileName.textContent = currentUser;
            logoutBtn.style.display = "none";
            serviceRequest.style.display = "block";
            queriesSection.style.display = "none";
            queryResults.style.display = "none";
            clientRequestsSection.style.display = "block";
            clientQuotesSection.style.display = "block";
            clientBillsSection.style.display = "block";
            pendingRequestsSection.style.display = "none";
            pendingQuotesSection.style.display = "none";
            billsSection.style.display = "none";
            if (queryBody) queryBody.innerHTML = '';
            loadClientDashboardData(currentUser);
        } else if (isAnnaUser) {
            signupSection.style.display = "none";
            loginSection.style.display = "none";
            serviceRequest.style.display = "none";
            queriesSection.style.display = 'block';
            clientRequestsSection.style.display = "none";
            clientQuotesSection.style.display = "none";
            clientBillsSection.style.display = "none";
            pendingRequestsSection.style.display = "block";
            pendingQuotesSection.style.display = "block";
            billsSection.style.display = "block";
            loadAnnaDashboardData();   
        } else {
            signupSection.style.display = "block";
            loginSection.style.display = "none";
            profileSection.style.display = "none";
            serviceRequest.style.display = "none";
            inputFields.forEach(input => input.value = "");
            photoFields.innerHTML = '';
            photoNum = 0;
            addPhotoButton.style.display = 'inline-block';
            queriesSection.style.display = "none";
            queryResults.style.display = "none";
            if (queryBody) queryBody.innerHTML = '';
            clientRequestsSection.style.display = "none";
            clientQuotesSection.style.display = "none";
            clientBillsSection.style.display = "none";
            pendingRequestsSection.style.display = "none";
            pendingQuotesSection.style.display = "none";
            billsSection.style.display = "none";
        }
    }

    // Check the login status on page load
    updateUI();
    
    // Login button event listener
    loginBtn.addEventListener("click", () => {
        const username = document.querySelector("#user-input").value;
        const password = document.querySelector("#pass-input").value;

        if (!username || !password) {
            alert("The username and/or password was not entered.");
            return;
        }

        fetch("http://localhost:5050/loginUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("User logged in successfully!");
                localStorage.setItem("loggedInUser", username); // If login is successful, keep the user logged in
                updateUI();

            // Clear login input fields
            document.querySelector("#user-input").value = "";
            document.querySelector("#pass-input").value = "";
            } else {
                alert("Login failed: " + (data.error || "Unknown username or password"));
            }
        })
        .catch(err => console.error("Login error:", err));
    });

    // Page document event listener for toggling off the logout button when clicking outside the profile section
    document.addEventListener("click", () => {
        logoutBtn.style.display = "none";
    });

    // Profile section event listener, clicking the profile section (with the icon & username) toggles the logout button
    profileToggle.addEventListener("click", (event) => {
        event.stopPropagation(); // Exception to the document event listener above since the profile section should toggle the logout button
        logoutBtn.style.display = logoutBtn.style.display === "none" ? "inline-block" : "none";
    });
    
    // Logout button event listener
    logoutBtn.addEventListener("click", () => {
        alert("User logged out successfully!");
        localStorage.removeItem("loggedInUser");
        updateUI();
    });

    addPhotoButton.addEventListener('click', function() {
        if (photoNum < photosMax) {
            photoNum++;

            // Wrapper div
            const newDiv = document.createElement('div');
            newDiv.classList.add('photo-field');

            // Photo field creation
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `photo-link${photoNum}`;
            input.placeholder = `Photo ${photoNum}`;

            // Remove button creation
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.classList.add('remove-photo');
            removeButton.textContent = 'Remove';

            // Append the wrapper div with a photo field with a remove button
            newDiv.appendChild(input);
            newDiv.appendChild(removeButton);
            photoFields.appendChild(newDiv);

            // Remove photo button functionality
            removeButton.addEventListener('click', function() {
                newDiv.remove();
                photoNum--;

                // Show the "Add Photo" button again if less than 5 photo fields are shown
                if (photoNum < photosMax) {
                    addPhotoButton.style.display = 'inline-block';
                }

                // Renumber shown fields after a field has been removed
                const allInputs = photoFields.querySelectorAll('input[type="text"]');
                allInputs.forEach((inp, idx) => {
                    inp.placeholder = `Photo ${idx + 1}`;
                    inp.id = `photo-link${idx + 1}`;
                });
            });

            // Hide the "Add Photo" button if 5 photo fields are shown
            if (photoNum >= photosMax) addPhotoButton.style.display = 'none';
        } else alert(`Up to ${photosMax} photos may be added.`); // Alert the user in case the "Add Photo" button shows anyway after 5 fields are shown
    });

    const submitRequestButton = document.querySelector('#submit-button');

    submitRequestButton.addEventListener('click', function() {
        const username = localStorage.getItem("loggedInUser"); // Get the username from the currently logged in user, to match the service request user_id to
        const requestAddress = document.querySelector('#service-address').value.trim();
        const requestAddressCity = document.querySelector('#service-address-city').value.trim();
        const requestAddressState = document.querySelector('#service-address-state').value.trim();
        const requestAddressZip = document.querySelector('#service-address-zip').value.trim();
        const requestCleaningType = document.querySelector('#cleaning-type').value.trim();
        const requestRoomAmount = document.querySelector('#room-amount').value.trim();
        const requestDateTime = document.querySelector('#preferred-date-time').value.trim();
        const requestBudget = document.querySelector('#proposed-budget').value.trim();
        const requestNotes = document.querySelector('#notes')?.value.trim() || null;
        const photo_urls = Array.from(document.querySelectorAll('.photo-field input')).map(inp => inp.value.trim()) // An array for storing optional photo links

        if (!requestAddress || !requestAddressCity || !requestAddressState || !requestAddressZip || 
            !requestCleaningType || !requestRoomAmount || !requestDateTime || !requestBudget) {
            alert("Please fill out all fields.");
            return;
        }

        fetch("http://localhost:5050/addServiceRequest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, requestAddress, requestAddressCity, requestAddressState, 
                requestAddressZip, requestCleaningType, requestRoomAmount, requestDateTime, requestBudget,
                requestNotes, photo_urls : photo_urls ? JSON.stringify(photo_urls) : null}) // Pass photo_urls as a JSON if it exists, otherwise pass it as a null value
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Service Request Sent!");
                document.querySelector("#service-address").value = "";
                document.querySelector("#service-address-city").value = "";
                document.querySelector("#service-address-state").value = "";
                document.querySelector("#service-address-zip").value = "";
                document.getElementById('cleaning-type').selectedIndex = 0; // Set the default cleaning type to Basic
                document.querySelector("#room-amount").value = "";
                document.querySelector("#preferred-date-time").value = "";
                document.querySelector("#proposed-budget").value = "";
                document.querySelector("#notes").value = "";
                photoFields.innerHTML = ''; // Remove all added photo fields
                photoNum = 0; // Reset counter
                addPhotoButton.style.display = 'inline-block'; // Show the Add Photo button again
            } else alert("Error: " + (data.error || "Unknown error"));
        })
        .catch(err => console.error("Request Service Error:", err));
            // ROUTES: QUOTE & NEGOTIATION


    });
});

// Configuration for search queries & what columns to display in a table
const queryConfigs = [
    { 
        id: 'most-service-orders-btn', 
        endpoint: '/mostServiceOrders', 
        columns: ['client_id', 'username', 'first_name', 'last_name', 'total_requests'],
        error: "Most Service Orders search error"
    },
    { 
        id: 'month-quotes-search-btn', 
        endpoint: '/monthQuotes', 
        columns: ['request_id', 'client_id', 'username', 'quote_accept_date'],
        error: "Month Quotes search error",
        // Getting month value from the monthQuotes input field
        getParams: () => ({ month: document.querySelector('#monthQuotes').value })
    },
    { 
        id: 'largest-job-search-btn', 
        endpoint: '/largestJob', 
        columns: ['request_id', 'client_id', 'username', 'rooms'],
        error: "Largest Job search error"
    },
    { 
        id: 'bad-clients-search-btn', 
        endpoint: '/badClients', 
        columns: ['client_id', 'username', 'first_name', 'last_name'],
        error: "Bad Clients search error"
    },
    { 
        id: 'uncommitted-clients-btn', 
        endpoint: '/uncommittedClients', 
        columns: ['user_id', 'first_name', 'last_name', 'email', 'request_count'],
        error: "Uncommitted Clients search error"
    },
    { 
        id: 'prospective-clients-btn', 
        endpoint: '/prospectiveClients', 
        columns: ['user_id', 'first_name', 'last_name', 'email'],
        error: "Prospective Clients search error"
    },
    { 
        id: 'overdue-bills-btn', 
        endpoint: '/overdueBills', 
        columns: ['bill_id', 'request_id', 'client_id', 'bill_amount', 'bill_status', 'due_date', 'payment_date', 'note'],
        error: "Overdue Bills search error"
    },
    { 
        id: 'good-clients-btn', 
        endpoint: '/goodClients', 
        columns: ['user_id', 'first_name', 'last_name', 'email'],
        error: "Good Clients search error"
    }
];

// Handles the search query URL & sending the config to the searchResultsTable
function handleSearchQuery(config) {
    let url = `http://localhost:5050${config.endpoint}`;
    
    // Add parameters for dynamic searches (ex. month)
    if (config.getParams) {
        const params = config.getParams();
        const queryString = new URLSearchParams(params).toString();
        url += `?${queryString}`;
    }

    fetch(url)
    .then(response => response.json())
    .then(data => searchResultsTable(data.data, config.columns))
    .catch(err => console.error(`${config.error}:`, err));
}

// Search query event listeners
queryConfigs.forEach(config => {
    const button = document.querySelector(`#${config.id}`);
    if (button) {
        // Use an arrow function to pass the config object to the generic handler
        button.addEventListener('click', () => handleSearchQuery(config));
    }
});

// Function for showing query results in a table that differs in what columns are shown
function searchResultsTable(query_data, columnsToShow = []) {
    const queryResults = document.querySelector("#query-results");
    const queryTableHead = document.querySelector('#query-results thead'); 
    const queryTableBody = document.querySelector('#query-results tbody');

    // Show the query results table, the idea is to only show when any of the search buttons (that call this function) are clicked
    queryResults.style.display = "table";

    // Prevent leftover columns from a previous query from appearing in a query with no results
    queryTableHead.innerHTML = "";
    queryTableBody.innerHTML = "";

    // If the query does not have a result, indicate this through HTML text
    if (!query_data || query_data.length === 0) {
        queryTableBody.innerHTML = `
            <tr>
                <td colspan="${columnsToShow.length}">
                    <h2>No results for the query</h2>
                </td>
            </tr>
        `;
        return;
    }

    // Build query search results table header
    queryTableHead.innerHTML = `
    <tr>${columnsToShow.map(col => `<th>${col}</th>`).join('')}</tr>`; // Array of HTML column name strings is joined into a single string without commas

    // Build query search results table body
    // Array of HTML row result strings is joined into a single string without commas
    queryTableBody.innerHTML = query_data.map(row => `
    <tr>
        ${columnsToShow.map(col => { // Nested mapping of HTML column results
            let value = row[col]; // Set row results of each column
            if (col === 'signup_date' && value)
                // Format signup_date as MM/DD/YYYY
                value = new Date(value).toLocaleDateString();
            if (col === 'last_login')
                // Ternary operation to format last_login as "MM/DD/YYYY, HH:MM:SS AM/PM" for users that have signed in or "NULL" if not
                value = value ? new Date(value).toLocaleString() : 'NULL';
            return `<td>${value}</td>`; // Return a mapped row result of a mapped column
        }).join('')}
    </tr>
    `).join('');
}

// Function for Anna Quotes view to pre-fill Start & End DATETIME type fields
function formatDateTimeLocal(sqlDateTimeString) {
    if (!sqlDateTimeString) return '';
    // Replaces space with 'T' and truncates seconds/milliseconds
    return sqlDateTimeString.replace(' ', 'T').substring(0, 16);
}

// Allows Anna to view requests that can be rejected or submitted as a quote
function renderAnnaRequestUI(requests) {
    const sectionContainer = document.getElementById('pending-requests-section');
    const container = document.getElementById('pending-requests-list');

    if (!requests || requests.length === 0) {
    if (sectionContainer) sectionContainer.style.display = 'none';
    container.innerHTML = ''; // Ensure the list is empty
    return; 
    }

    if (sectionContainer) sectionContainer.style.display = 'block';

    container.innerHTML = '';

    requests.forEach(req => {

    const div = document.createElement('div');
    div.className = 'ui-card dark-card request-item-card';

    div.innerHTML = `
        <div class="card-header">
            <div class="meta-info">
                <span class="request-label">Request #${req.request_id}</span>
                <span class="request-label">Client ID: ${req.client_id} | User: ${req.username}</span>
            </div>
            <span class="status-tag status-tag-pending">Pending Quote</span>
        </div>
        
        <div class="card-body request-form-body">
            <div class="detail-row">
                <span>Address:</span>
                <span>${req.service_address_street}, ${req.service_address_city}, ${req.service_address_state} ${req.service_address_zip}</span>
            </div>
            <div class="detail-row">
                <span>Cleaning Type:</span>
                <span>${req.cleaning_type}</span>
            </div>
            <div class="detail-row">
                <span>Rooms:</span>
                <span>${req.rooms}</span>
            </div>
            <div class="detail-row">
                <span>Preferred Date:</span>
                <span>${new Date(req.preferred_date).toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span>Proposed Budget:</span>
                <span>$${Number(req.proposed_budget).toFixed(2)}</span>
            </div>
            ${req.notes ? `<p class="request-note">Note: ${req.notes}</p>` : ''}
            <div class="input-group">
                <label for="request-price-${req.request_id}">Price ($):</label>
                <input type="number" placeholder="0.00" id="request-price-${req.request_id}">
            </div>

            <div class="input-group">
                <label for="request-start-${req.request_id}">Start:</label>
                <input type="datetime-local" id="request-start-${req.request_id}">
            </div>

            <div class="input-group">
                <label for="request-end-${req.request_id}">End:</label>
                <input type="datetime-local" id="request-end-${req.request_id}">
            </div>
            
            <div class="input-group full-width-input">
                <label for="request-note-${req.request_id}">Note:</label>
                <input type="text" placeholder="Optional note for client" id="request-note-${req.request_id}">
            </div>
        </div>

        <div class="card-actions action-group">
            <button class="action-btn secondary-btn reject-request-btn">Reject</button>
            <button class="action-btn primary-btn submit-quote-btn">Submit Quote</button>
        </div>
    `;

        div.querySelector('.submit-quote-btn')
        .addEventListener('click', () => submitQuote(req.request_id));

        div.querySelector('.reject-request-btn')
        .addEventListener('click', () => rejectRequest(req.request_id));

        container.appendChild(div);
    });
}

// Allows Anna to view quotes (quoted or countered ones) that can be canceled, rejected, or resubmitted
function renderAnnaQuoteUI(requests) {
    const sectionContainer = document.getElementById('pending-quotes-section');
    const container = document.getElementById('pending-quotes-list');

    if (!requests || requests.length === 0) {
        if (sectionContainer) sectionContainer.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    if (sectionContainer) sectionContainer.style.display = 'block';

    container.innerHTML = '';

    requests.forEach(req => {
        const div = document.createElement('div');
        div.className = 'ui-card dark-card quote-item-card';

        const formattedStart = formatDateTimeLocal(req.scheduled_start);
        const formattedEnd = formatDateTimeLocal(req.scheduled_end);
        const status = req.status.toLowerCase();
        let statusClass = 'status-tag-default';
        let actionButtonsHtml = '';
        
        if (status === 'quoted' || status === 'countered') {
            statusClass = status === 'quoted' ? 'status-tag-quoted' : 'status-tag-countered';
            actionButtonsHtml = `
                <button class="action-btn secondary-btn cancel-quote-btn" data-id="${req.quote_id}">Cancel</button>
                <button class="action-btn secondary-btn reject-quote-btn" data-id="${req.quote_id}">Reject</button>
                <button class="action-btn primary-btn resubmit-quote-btn" data-id="${req.quote_id}">Resubmit Quote</button>
            `;
        } else if (status === 'accepted') {
            statusClass = 'status-tag-accepted';
            actionButtonsHtml = `<button onclick="viewServiceOrder(${req.request_id})" class="action-btn secondary-btn">View Order</button>`
            
            if (req.bill_generated == 1) {
                actionButtonsHtml += `<button class="action-btn secondary-btn" disabled>Bill Generated</button>`;
            } else {
                actionButtonsHtml += `
                    <button class="action-btn secondary-btn cancel-quote-btn" data-id="${req.quote_id}">Cancel</button>
                    <button class="action-btn primary-btn generate-bill-btn" data-id="${req.request_id}">Generate Bill</button>
                `;
            }
        }

        div.innerHTML = `
            <div class="card-header">
                <div class="meta-info">
                    <span class="quote-label">Quote #${req.quote_id}</span>
                    <span class="request-label">Request #${req.request_id} | Client ID: ${req.client_id} | User: ${req.username}</span>

                </div>
                <span class="status-tag ${statusClass}">${req.status}</span>
            </div>
            
            <div class="card-body quote-form-body">
                <div class="input-group">
                    <label for="quote-price-${req.quote_id}">Price ($):</label>
                    <input type="number" value="${req.quote_price}" id="quote-price-${req.quote_id}">
                </div>

                <div class="input-group">
                    <label for="quote-start-${req.quote_id}">Start:</label>
                    <input type="datetime-local" value="${formattedStart}" id="quote-start-${req.quote_id}">
                </div>

                <div class="input-group">
                    <label for="quote-end-${req.quote_id}">End:</label>
                    <input type="datetime-local" value="${formattedEnd}" id="quote-end-${req.quote_id}">
                </div>
                
                <div class="input-group full-width-input">
                    <label for="quote-note-${req.quote_id}">Note:</label>
                    <input type="text" value="${req.note || ''}" id="quote-note-${req.quote_id}">
                </div>
            </div>

            <div class="card-actions action-group">
                ${actionButtonsHtml} 
            </div>
        `;

        const generateBillBtn = div.querySelector('.generate-bill-btn');
        if (generateBillBtn) {
            generateBillBtn.addEventListener('click', function(event) {
                const button = event.currentTarget;
                
                // Disable the button immediately to prevent re-clicks
                button.disabled = true;
                button.textContent = 'Generating...'; 
                
                // Call the bill generation function
                generateServiceBill(req.request_id);
            });
        }
        
        const resubmitBtn = div.querySelector('.resubmit-quote-btn');
        if (resubmitBtn) {
            resubmitBtn.addEventListener('click', () => resubmitQuote(req.quote_id));
        }

        const rejectBtn = div.querySelector('.reject-quote-btn');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => rejectQuote(req.quote_id));
        }

        const cancelBtn = div.querySelector('.cancel-quote-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => annaCancelQuote(req.quote_id));
        }

        container.appendChild(div);
    });
}

// Allows Anna to view all bills (simplified from bill generation logic)
function renderAnnaBillUI(requests) {
    const sectionContainer = document.getElementById('bills-section');
    const container = document.getElementById('bills-list'); 

    if (!requests || requests.length === 0) {
        if (sectionContainer) sectionContainer.style.display = 'none';
        if (container) container.innerHTML = '';
        return;
    }

    if (sectionContainer) sectionContainer.style.display = 'block';
    container.innerHTML = ''; 

    requests.forEach(bill => {
        const due_date = new Date(bill.due_date).toLocaleDateString();
        const amount = Number(bill.bill_amount).toFixed(2);
        const status = bill.bill_status.toLowerCase();
        
        let statusClass = 'status-tag-default';
        let buttonText = 'Revise Bill';
        
        if (status === 'disputed') {
            statusClass = 'status-tag-disputed'; 
            buttonText = 'Resolve Dispute';
        } else if (status === 'unpaid') {
            statusClass = 'status-tag-unpaid'; 
        } else if (status === 'paid') {
            statusClass = 'status-tag-paid'; 
        }

        const showReviseButton = status !== 'paid';
        
        let paymentDateRow = '';
        if (status === 'paid' && bill.payment_date) {
             const paymentDateTime = new Date(bill.payment_date);
             if (!isNaN(paymentDateTime.getTime())) {
                 const paidDate = paymentDateTime.toLocaleDateString();
                 paymentDateRow = `
                     <div class="detail-row paid-date-row">
                         <span>Paid On:</span>
                         <strong class="paid-date">${paidDate}</strong>
                     </div>
                 `;
            }
        }
        
        let actionButtonsHtml = '';
        let billIsGenerated = bill.bill_generated == 1;

        if (billIsGenerated) {
            actionButtonsHtml += `<button class="action-btn secondary-btn view-bill-btn" data-bill-id="${bill.bill_id}">View Bill Details</button>`;
            
            if (showReviseButton) {
                actionButtonsHtml += `
                    <button class="action-btn primary-btn revise-action-btn" data-bill-id="${bill.bill_id}">
                        ${buttonText}
                    </button>
                `;
            }
        } else actionButtonsHtml = `<span>Bill Pending Generation</span>`;

        const billCard = document.createElement('div');
        billCard.className = 'ui-card dark-card bill-item-card'; 

        billCard.innerHTML = `
            <div class="card-header">
                <div class="meta-info">
                    <span class="bill-label">Bill #${bill.bill_id}</span>
                    <span class="request-label">Request #${bill.request_id}</span>
                </div>
                <span class="status-tag ${statusClass}">${bill.bill_status}</span>
            </div>
            
            <div class="card-body">
                <div class="client-info">
                    <strong>Client:</strong> ${bill.first_name} ${bill.last_name}
                </div>
                <div class="financial-details">
                    <div class="detail-row">
                        <span>Amount Due:</span>
                        <strong class="amount-due">$${amount}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Due Date:</span>
                        <span class="due-date">${due_date}</span>
                    </div>
                    
                    ${paymentDateRow} 
                </div> 
                ${bill.note ? `<p class="bill-note">Note: ${bill.note}</p>` : ''}
            </div>

            <div class="card-actions action-group"> 
                ${actionButtonsHtml}
            </div>
        `;

        // Attach event listeners only if the bill exists
        if (billIsGenerated) {
            billCard.querySelector('.view-bill-btn')
            .addEventListener('click', () => viewServiceBill(bill.request_id, bill.bill_id));

            if (showReviseButton) {
                billCard.querySelector('.revise-action-btn')
                .addEventListener('click', () => reviseBill(bill.bill_id));
            }
        }

        container.appendChild(billCard);
    });
}

// Function for Anna to reject a service request
function rejectRequest(requestId) {
    const note = prompt("Please enter a note explaining the request rejection:");

    if (note === null) return;

    if (note.trim().length === 0) {
        alert("Request rejection requires a note.");
        return;
    }

    fetch('/rejectRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            requestId,
            note: note
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Request successfully rejected.');
            loadAnnaDashboardData();
        } else {
            alert("Error rejecting request: " + (data.error || "Unknown error"));
        }
    })
    .catch(err => console.error("Error rejecting request:", err));
}

// Function for Anna to submit a quote
function submitQuote(requestId) {
    const price = document.getElementById(`request-price-${requestId}`).value;
    const start = document.getElementById(`request-start-${requestId}`).value;
    const end = document.getElementById(`request-end-${requestId}`).value;
    const note = document.getElementById(`request-note-${requestId}`).value;

    if (!price || !start || !end) {
        alert("Please enter price, start, and end dates for the quote.");
        return;
    }

    fetch('/addQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            requestId,
            quotePrice: price, 
            scheduledStart: start, 
            scheduledEnd: end, 
            note: note || ''
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Successfully submitted quote");
            loadAnnaDashboardData();
        } else {
            alert("Error submitting quote: " + (data.error || "Unknown error"));
        }
    })
    .catch(err => console.error("Error submitting quote:", err));
}

// Function for Anna to resubmit a quote
function resubmitQuote(quoteId) {
    const priceString = document.getElementById(`quote-price-${quoteId}`).value.trim();
    const newStart = document.getElementById(`quote-start-${quoteId}`).value.trim();
    const newEnd = document.getElementById(`quote-end-${quoteId}`).value.trim();
    const note = document.getElementById(`quote-note-${quoteId}`).value.trim();

    const parsedPrice = parseFloat(priceString);

    if (!priceString || isNaN(parsedPrice) || !newStart || !newEnd) {
        alert("Please enter a valid numeric price, start, and end dates for the quote.");
        return;
    }
    
    if (parsedPrice <= 0) {
        alert("Price must be greater than zero.");
        return;
    }

    fetch('/resubmitQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            quoteId: quoteId,
            newPrice: parsedPrice,
            newStart: newStart,
            newEnd: newEnd,
            note: note
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Quote successfully resubmitted.');
            loadAnnaDashboardData();
        } else {
            alert("Error resubmitting quote: " + (data.error || "Unknown error"));
        }
    })
    .catch(err => console.error("Error resubmitting quote:", err));
}

// Function for Anna to reject a quote
function rejectQuote(quoteId) {
    const note = prompt("Enter a note for this quote rejection:");
    if (note === null) return;

    if (!note.trim()) {
        alert("Please enter a note before rejecting.");
        return;
    }

    fetch('/rejectQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            quoteId,
            note: note
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Quote successfully rejected.');
            loadAnnaDashboardData();
        } else {
            alert("Error rejecting quote: " + (data.error || "Unknown error"));
        }
    })
    .catch(err => console.error("Error rejecting quote:", err));
}

// Function for Anna to cancel a quote
function annaCancelQuote(quoteId) {
    const note = prompt("Enter a note for canceling this quote:");
    if (note === null) return;

    if (!note.trim()) {
        alert("Please enter a note before rejecting.");
        return;
    }

    fetch('/cancelQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            quoteId: quoteId,
            responderType: 'Anna',
            note: note
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Quote successfully cancelled.');
            loadAnnaDashboardData();
        } else {
            alert("Error cancelling quote: " + (data.error || "Unknown error"));
        }
    })
    .catch(err => console.error("Error cancelling quote:", err));
}

// Function for Anna to revise the bill amount and add a note
async function reviseBill(billId) {
    try {
        const response = await fetch(`/getBill/${billId}`);
        const data = await response.json();

        if (!data.success || !data.request || !data.request.bill_id) {
            alert("Could not find bill details. The bill may not exist yet.");
            return;
        }

        const bill = data.request;
        const oldAmount = Number(bill.bill_amount).toFixed(2);
        
        const newAmountInput = prompt(`Enter new bill amount (Current: $${oldAmount}):`, oldAmount);
        if (newAmountInput === null) return;
        
        const newAmount = Number(newAmountInput);
        if (isNaN(newAmount) || newAmount <= 0) {
            alert("Invalid amount entered. Revision cancelled.");
            return; 
        } 
        
        const note = prompt("Enter a note for this revision (e.g., Discount applied):");
        if (note === null) return;

        const res = await fetch('/reviseBill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                billId: bill.bill_id,
                newAmount: newAmount.toFixed(2), 
                note 
            })
        });
        
        const revisionData = await res.json();
        
        if (revisionData.success) {
            alert('Bill revised successfully.');
            loadAnnaDashboardData(); 
        } else {
            alert('Revision error: ' + (revisionData.error || 'Unknown'));
        }

    } catch (err) {
        console.error("Error during bill revision process:", err);
        alert('Failed to initiate or submit revision. Check console for details.');
    }
}

// Function for client to see their rejected requests
function renderClientRejectedRequests(requests) {
    const rejectedRequests = requests.filter(request =>
        request.request_status === 'rejected'
    );

    const container = document.getElementById('client-rejected-requests');
    const sectionContainer = document.getElementById('client-rejected-requests-section');

    if (!container || !sectionContainer) return;

    container.innerHTML = ''; 

    if (rejectedRequests.length === 0) {
        sectionContainer.style.display = 'none';
        return;
    }

    sectionContainer.style.display = 'block';

    rejectedRequests.forEach(request => {
        const item = document.createElement('div');
        item.className = 'ui-card dark-card rejected-card'; 
        
        item.innerHTML = `
            <div class="card-header">
                <div class="meta-info">
                    <span class="request-label">Request #${request.request_id}</span>
                </div>
                <span class="status-tag status-tag-rejected">REJECTED</span>
            </div>
            
            <div class="card-body">
                <div class="financial-details" style="border-top: none; padding-top: 0;"> 
                    <div class="detail-row">
                        <span>Service Address:</span>
                        <span>${request.service_address_street}, ${request.service_address_city}, ${request.service_address_city} ${request.service_address_zip}</span>
                    </div>
                    <div class="detail-row">
                        <span>Service Type:</span>
                        <span>${request.cleaning_type}</span>
                    </div>
                    <div class="detail-row">
                        <span>Rooms:</span>
                        <span>${request.rooms}</span>
                    </div>
                    <div class="detail-row">
                        <span>Preferred Date:</span>
                        <span>${new Date(request.preferred_date).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span>Proposed Budget:</span>
                        <span>$${Number(request.proposed_budget).toFixed(2)}</span>
                    </div>
                </div>
                
                ${request.notes ? `<p class="request-note">Note: ${request.notes}</p>` : ''}
            </div>
        `;
        container.appendChild(item);
    });
}

// Function for client to manage quotes
function renderClientQuotes(requests) {
    // Filter for rejected or canceled quotes
    const activeQuotes = requests.filter(request => 
        request.quote_id && 
        request.quote_status !== 'rejected' && 
        request.quote_status !== 'canceled'
    );

    const container = document.getElementById('client-quotes');
    const sectionContainer = document.getElementById('client-quotes-section');
    
    if (!container || !sectionContainer) return;

    container.innerHTML = '';
    sectionContainer.style.display = activeQuotes.length > 0 ? 'block' : 'none';

    activeQuotes.forEach(request => {
        const isActionNeeded = request.quote_status === 'quoted' || request.quote_status === 'countered';
        const isAccepted = request.quote_status === 'accepted';
        
        const statusClass = isActionNeeded ? 'status-tag-pending' : 'status-tag-paid'; 
        const statusText = isActionNeeded ? request.quote_status.toUpperCase() : 'ACCEPTED';

        let acceptDateRowHtml = '';
        if (isAccepted && request.quote_accept_date) {
            const formattedAcceptDate = new Date(request.quote_accept_date).toLocaleString();
            acceptDateRowHtml = `
                <div class="detail-row accepted-date-row">
                    <span>Accept Date:</span>
                    <span>${formattedAcceptDate}</span>
                </div>
            `;
        }
        
        const item = document.createElement('div');

        item.className = 'ui-card dark-card quote-item-card';
        
        item.innerHTML = `
            <div class="card-header">
                <div class="meta-info">
                    <span class="quote-label">Quote #${request.quote_id}</span>
                    <span class="request-label">Request #${request.request_id}</span>
                </div>
                <span class="status-tag ${statusClass}">${statusText}</span>
            </div>
            
            <div class="card-body">
                <div class="financial-details">
                    <div class="detail-row">
                        <span>Quote Price:</span>
                        <strong class="amount-due">$${Number(request.quote_price).toFixed(2)}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Service Address:</span>
                        <span>${request.service_address_street}, ${request.service_address_city}, ${request.service_address_city} ${request.service_address_zip}</span>
                    </div>
                    <div class="detail-row">
                        <span>Service Type:</span>
                        <span>${request.cleaning_type}</span>
                    </div>
                    <div class="detail-row">
                        <span>Rooms:</span>
                        <span>${request.rooms}</span>
                    </div>
                    <div class="detail-row">
                        <span>Start Time:</span>
                        <span">${new Date(request.scheduled_start).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span>End Time:</span>
                        <span>${new Date(request.scheduled_end).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span>Response Date:</span>
                        <span>${new Date(request.response_date).toLocaleString()}</span>
                    </div>
                    </div>${acceptDateRowHtml}</div>
                </div>
                ${request.quote_note ? `<p class="quote-note"><strong>Note from Anna:</strong> ${request.quote_note}</p>` : ''}
            </div>
            
            <div class="card-actions action-group">
                ${isActionNeeded ? 
                    `<button onclick="acceptQuote(${request.request_id})" class="action-btn primary-btn">Accept</button>
                     <button onclick="counterQuote(${request.quote_id})" class="action-btn secondary-btn">Counter</button>
                     <button onclick="clientCancelQuote(${request.quote_id})" class="action-btn secondary-btn cancel-quote-btn">Cancel</button>`
                    : 
                    `<button onclick="viewServiceOrder(${request.request_id})" class="action-btn secondary-btn">View Order</button>`
                }
            </div>
        `;
        container.appendChild(item);
    });
}

// Function for the client to manage bills
function renderClientBills(requestsData) {
    // Flatten the requests array to get a single array of all bills
    const allBills = requestsData
        .filter(request => request.bills && request.bills.length > 0)
        .flatMap(request => request.bills.map(bill => ({
            ...bill,
            requestId: request.request_id // Attach the parent request ID and name it requestId
        })));

    const container = document.getElementById('client-bills-list');
    const sectionContainer = document.getElementById('client-bills-section');
    
    if (!container || !sectionContainer) return;

    container.innerHTML = '';
    sectionContainer.style.display = allBills.length > 0 ? 'block' : 'none';

    allBills.forEach(bill => {
        const isUnpaid = bill.bill_status === 'Unpaid';
        const isPaid = bill.bill_status === 'Paid';
        
        const statusClass = isUnpaid ? 'status-tag-unpaid' : (isPaid ? 'status-tag-paid' : 'status-tag-disputed');

        let paymentDateRow = '';
        if (bill.bill_status === 'Paid' && bill.payment_date) {
            const paidDate = new Date(bill.payment_date).toLocaleDateString();
            
            paymentDateRow = `
                <div class="detail-row paid-date-row">
                    <span>Paid On:</span>
                    <strong class="paid-date">${paidDate}</strong>
                </div>
            `;
        }

        const item = document.createElement('div');

        item.className = 'ui-card dark-card bill-item-card'; 

        item.innerHTML = `
            <div class="card-header">
                <div class="meta-info">
                    <span class="bill-label">Bill #${bill.bill_id}</span>
                    <span class="request-label">Request #${bill.requestId}</span>
                </div>
                <span class="status-tag ${statusClass}">${bill.bill_status.toUpperCase()}</span>
            </div>
            
            <div class="card-body"> 
                <div class="financial-details">
                    <div class="detail-row">
                        <span>Amount Due:</span>
                        <strong class="amount-due">$${Number(bill.bill_amount).toFixed(2)}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Due Date:</span>
                        <span class="due-date">${new Date(bill.due_date).toLocaleDateString()}</span>
                    </div>
                    ${paymentDateRow}
                </div>
                ${bill.note ? `<p class="bill-note"><strong>Note:</strong> ${bill.note}</p>` : ''}
            </div>

            <div class="card-actions action-group">
                ${isUnpaid ? 
                    `<button onclick="openPayForm(${bill.bill_id})" class="action-btn primary-btn">Pay Now</button>
                     <button onclick="disputeBill(${bill.bill_id})" class="action-btn secondary-btn">Dispute</button>
                     <button class="action-btn secondary-btn view-bill-btn" data-bill-id="${bill.bill_id}" data-request-id="${bill.requestId}">
                        View Service Bill</button>`
                    : 
                    `<button class="action-btn secondary-btn view-bill-btn" data-bill-id="${bill.bill_id}" data-request-id="${bill.requestId}">
                        View Service Bill</button>`
                }
            </div>
        `;
        
        item.querySelector('.view-bill-btn')
            .addEventListener('click', () => viewServiceBill(bill.requestId, bill.bill_id));


        container.appendChild(item);
    });
}

// Function for the client to cancel a quote
function clientCancelQuote(quoteId) {
    const note = prompt("Enter a note for canceling this quote:");
    if (note === null) return;

    const currentUser = localStorage.getItem("loggedInUser");
    if (!currentUser) {
        alert("You must be logged in to pay a bill.");
        return;
    }

    if (!note.trim()) {
        alert("Please enter a note before rejecting.");
        return;
    }

    fetch('/cancelQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            quoteId: quoteId,
            responderType: 'Client',
            note: note
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Quote successfully cancelled.');
            loadClientDashboardData(currentUser);
        } else {
            alert("Error cancelling quote: " + (data.error || "Unknown error"));
        }
    })
    .catch(err => console.error("Error cancelling quote:", err));
}

// Function for the client to accept a quote
function acceptQuote(requestId) {
    const currentUser = localStorage.getItem("loggedInUser");

    fetch('/client/accept-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
             alert('Quote accepted successfully!');
             loadClientDashboardData(currentUser);
        } else {
            console.error('Error accepting quote:', data.error);
            alert('Error accepting quote: ' + (data.error || 'Unknown error.'));
        }
    })
    .catch(err => {
        console.error("Error accepting quote:", err);
        alert('A network error occurred while accepting the quote.');
    });
}

// Function for client to counter a quote with a note
function counterQuote(quoteId) {
    const currentUser = localStorage.getItem("loggedInUser");
    const note = prompt("Please enter a note explaining your counter-offer or request for renegotiation:");
    
    if (note === null) return; // Can exit out of the prompt without receiving another alert

    if (note.trim().length === 0) {
        alert("Bill disputes require a note.");
        return;
    }

    fetch('/counterQuote', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            quoteId: quoteId,
            note: note
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Counter-offer submitted');
            loadClientDashboardData(currentUser);
        } else {
            alert("Error submitting counter-offer: " + (data.error || "Unknown error"));
        }
    })
    .catch(err => console.error("Error submitting counter-offer:", err));
}

// Function for the client to dispute a bill
async function disputeBill(billId) {
    const note = prompt("Please enter a note explaining your bill dispute:");

    if (note === null) return; // Can exit out of the prompt without receiving another alert

    if (note.trim().length === 0) {
        alert("Bill disputes require a note.");
        return;
    }

    const username = localStorage.getItem('loggedInUser');
    if (!username) { alert('Not logged in'); return; }
    
    try {
        const res = await fetch('/client/dispute-bill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billId, note })
        });

        const data = await res.json();
        if (data.success) {
            alert('Dispute submitted.');
            loadClientDashboardData(username);
        } else alert('Dispute error: ' + (data.error || 'Unknown'));

    } catch (err) {
        console.error(err);
        alert('Failed to submit dispute.');
    }
}

// Open a Pay modal/form (Not a real credit card transaction)
function openPayForm(billId) {
  // remove any existing modal
  const existing = document.getElementById('pay-form-modal');
  if (existing) existing.remove();

  const formHTML = `
    <div id="pay-form-modal" style="
      position: fixed; top:0; left:0; width:100%; height:100%;
      background: rgba(0,0,0,0.2); 
      display:flex; align-items:center; justify-content:center; z-index:9999;
    ">
      <div style="
        background: black;
        padding: 18px; 
        border-radius: 8px; 
        min-width: 320px; 
        border: 3px solid #007BFF;
        box-shadow: 0px 0px 15px rgba(0,0,0,0.2);
      ">
        <h3 style="margin-top:0; color:#007BFF; text-align:center;">
          Pay Bill ID: ${billId}
        </h3>

        <div style="text-align:left;">
          <label>Name on Card:</label><br>
          <input type="text" id="pay-name" style="width:100%;"><br><br>

          <label>Card Number:</label><br>
          <input type="text" id="pay-card" maxlength="19" style="width:100%;"><br><br>

          <label>Expiry (MM/YY):</label><br>
          <input type="text" id="pay-exp" maxlength="5" placeholder="MM/YY" style="width:100%;"><br><br>

          <label>CVV:</label><br>
          <input type="text" id="pay-cvv" maxlength="4" style="width:100%;"><br><br>
        </div>

        <div style="text-align:right;">
          <button id="pay-submit-btn">Pay</button>
          <button id="pay-cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHTML);

  document.getElementById('pay-cancel-btn').addEventListener('click', closePayForm);
  document.getElementById('pay-submit-btn').addEventListener('click', () => payBill(billId));
}

function closePayForm() {
  const modal = document.getElementById('pay-form-modal');
  if (modal) modal.remove();
}

// Function for client to pay a bill
async function payBill(billId) {
    const currentUser = localStorage.getItem("loggedInUser");
    if (!currentUser) {
        alert("You must be logged in to pay a bill.");
        return;
    }

    try {
        const res = await fetch('/payBill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billId })
        });
        const data = await res.json();
        
        if (data.success) {
            alert(`Bill #${billId} paid successfully!`);
            closePayForm();
            loadClientDashboardData(currentUser);
        } else {
            alert(`Payment network error: ${data.error || "Unknown error"}`);
        }
    } catch (err) {
        console.error("Payment error:", err);
        alert("An error occurred during payment processing.");
    }
}

async function generateServiceBill(requestId) {
    try {
        const response = await fetch(`http://localhost:5050/generateServiceBill/${requestId}`);
        const data = await response.json();
        
        if (!data.success) {
            alert("Failed to generate service bill: " + (data.error || 'Unknown error'));
        } else { 
            alert(`Generated Bill for Request: ${requestId}`);
            loadAnnaDashboardData(); 
        }
    } catch (err) {
        console.error("Error generating bill:", err);
        alert(`Error generating bill: ${err.message}`);
    }
}

// Function to process a service request order corresponding to a service request
async function viewServiceOrder(requestId) {
  try {
    // Fetch the request details
    const get_service_response = await fetch(`http://localhost:5050/getRequest/${requestId}`);
    const service_request_data = await get_service_response.json();

    if (!service_request_data.success) {
      alert("Failed to load service request details");
      return;
    }

    const service_req = service_request_data.request;

    // Fetch the user's details
    const clientId = service_req.client_id;
    const get_user_response = await fetch(`http://localhost:5050/getUser/${clientId}`);
    const user_data = await get_user_response.json();

    if (!user_data.success) {
      alert("Failed to load user details");
      return;
    }

    const user_req = user_data.request;

    // Fetch the quote details
    const get_quote_response = await fetch(`http://localhost:5050/getQuote/${requestId}`);
    const quote_data = await get_quote_response.json();

    if (!quote_data.success) {
      alert("Failed to load quote details");
      return;
    }

    const quote_req = quote_data.request;

    // Fetch quote history for a request id
    const quoteHistoryRes = await fetch(`http://localhost:5050/getQuoteHistory/${requestId}`);
    const quoteHistoryData = await quoteHistoryRes.json();
    let quoteHistoryHTML = "";
    if (quoteHistoryData.success && quoteHistoryData.history.length > 0)
        quoteHistoryHTML = buildQuoteHistoryHTML(quoteHistoryData.history);

    // Fetch the HTML Service Order template
    const orderTemplateRes = await fetch("service_order.html");
    let orderTemplate = await orderTemplateRes.text();

    // Write order data to the order template
    orderTemplate = orderTemplate
      .replace("{{generated_date}}", new Date().toLocaleDateString())
      .replace("{{request_id}}", service_req.request_id)
      .replace("{{agreement_date}}", new Date(quote_req.quote_accept_date).toLocaleString())
      .replaceAll("{{client_name}}", `${user_req.first_name} ${user_req.last_name}`) // There's 2 instances of {{client_name}}, so replaceAll is needed
      .replace("{{client_address}}", `${user_req.address_street}, ${user_req.address_city}, ${user_req.address_state} ${user_req.address_zip}`)
      .replace("{{client_phone}}", user_req.phone)
      .replace("{{client_email}}", user_req.email)
      .replace("{{service_address}}", `${service_req.service_address_street}, ${service_req.service_address_city}, ${service_req.service_address_state} ${service_req.service_address_zip}`)
      .replace("{{cleaning_type}}", service_req.cleaning_type)
      .replace("{{rooms}}", service_req.rooms)
      .replace("{{preferred_date}}", new Date(service_req.preferred_date).toLocaleString())
      .replace("{{budget}}", `$${Number(service_req.proposed_budget).toFixed(2)}`)
      .replace("{{notes_section}}", service_req.notes ? `<div class="section-title">Notes</div><p>${service_req.notes}</p>` : "")
      .replace("{{photos_section}}", service_req.photo_urls && JSON.parse(service_req.photo_urls).length > 0
        ? `<div class="section-title">Photo URLs</div><ul>${JSON.parse(service_req.photo_urls).map(u=>`<li>${u}</li>`).join('')}</ul>` : "")
      .replace("{{quote_history_section}}", quoteHistoryHTML);
      
    // Open the serivce order in a new tab
    const newTab = window.open("", "_blank");
    newTab.document.write(orderTemplate);
    newTab.document.close();
  } catch (err) {
    alert(`Error loading service request: ${err.message}`);
  }
}

// Function to process a service bill corresponding to a service request
async function viewServiceBill(requestId, billId) {
  try {
    const get_service_response = await fetch(`http://localhost:5050/getRequest/${requestId}`);
    const service_request_data = await get_service_response.json();
    
    if (!service_request_data.success) {
      alert("Failed to load service request details");
      return;
    }

    const service_req = service_request_data.request;

    const clientId = service_req.client_id;
    const get_user_response = await fetch(`http://localhost:5050/getUser/${clientId}`);
    const user_data = await get_user_response.json();

    if (!user_data.success) {
      alert("Failed to load user details");
      return;
    }

    const user_req = user_data.request;

    // Fetch bill data
    const billRes = await fetch(`http://localhost:5050/getBill/${billId}`);
    const billData = await billRes.json();

    if (!billData.success) {
      alert("Failed to load bill details.");
      return;
    }

    const service_bill = billData.request;

    // Fetch Bill History
    const historyRes = await fetch(`http://localhost:5050/getBillHistory/${billId}`);
    const historyData = await historyRes.json();

    let historyHTML = "";
    if (historyData.success && historyData.history.length > 0) historyHTML = buildBillHistoryHTML(historyData.history);

    // Fetch the HTML Service Bill template
    const billTemplateRes = await fetch("service_bill.html");
    let billTemplate = await billTemplateRes.text();

    // Write bill data to the bill template
    billTemplate = billTemplate
      .replace("{{generated_date}}", new Date(service_bill.last_updated).toLocaleString())
      .replace("{{bill_id}}", billId)
      .replace("{{request_id}}", service_bill.request_id)
      .replace("{{bill_status}}", service_bill.bill_status)
      .replace("{{bill_amount}}", `$${Number(service_bill.bill_amount).toFixed(2)}`)
      .replace("{{due_date}}", new Date(service_bill.due_date).toLocaleDateString())
      .replace("{{payment_date}}", new Date (service_bill.payment_date).toLocaleDateString() || "Not Paid")
      .replaceAll("{{client_name}}", `${user_req.first_name} ${user_req.last_name}`)
      .replace("{{client_address}}", `${user_req.address_street}, ${user_req.address_city}, ${user_req.address_state} ${user_req.address_zip}`)
      .replace("{{client_phone}}", user_req.phone)
      .replace("{{client_email}}", user_req.email)
      .replace("{{service_address}}",
        `${service_req.service_address_street}, ${service_req.service_address_city}, ${service_req.service_address_state} ${service_req.service_address_zip}`)
      .replace("{{cleaning_type}}", service_req.cleaning_type)
      .replace("{{rooms}}", service_req.rooms)
      .replace("{{scheduled_date}}", new Date(service_req.preferred_date).toLocaleString())
      .replace("{{proposed_budget}}", `$${Number(service_req.proposed_budget).toFixed(2)}`)
      .replace("{{bill_notes_section}}", service_bill.note ? `<div class="section-title">Bill Notes</div><p>${service_bill.note}</p>` : "")
      .replace("{{bill_history_section}}", historyHTML);

    // Open the service bill in a new tab
    const newTab = window.open("", "_blank");
    newTab.document.write(billTemplate);
    newTab.document.close();

  } catch (err) {
    alert(`Error loading service bill: ${err.message}`);
  }
}

// Converts Quote History rows from the database to usable HTML when viewing a service order
function buildQuoteHistoryHTML(historyEntries) {
    let html = `<div class="section-title">Quote History</div><div class="history-container">`;

    historyEntries.forEach(entry => {
        html += `
            <div class="history-entry">
                <div><strong>Quote Responder: ${entry.responder_type}</strong> – ${new Date(entry.created_at).toLocaleString()}</div>
                <div><strong>Quote Price:</strong> $${Number(entry.quote_price).toFixed(2)}</div>
                <div><strong>Scheduled Start:</strong> ${new Date(entry.scheduled_start).toLocaleString()}</div>
                <div><strong>Scheduled End:</strong> ${new Date(entry.scheduled_end).toLocaleString()}</div>
                <div><strong>Status:</strong> ${entry.status}</div>
                <div><strong>Client Note:</strong> ${entry.note || "—"}</div>
                <div><strong>Anna Note:</strong> ${entry.anna_note || "—"}</div>
            </div>
            <br>
        `;
    });

    html += `</div>`;
    return html;
}

// Converts Bill History rows from the database to usable HTML when viewing a bill
function buildBillHistoryHTML(historyEntries) {
  let html = `<div class="section-title">Bill History</div><div class="history-container">`;

  historyEntries.forEach(entry => {
    html += `
      <div class="history-entry">
        <div><strong>Responder: ${entry.responder_type}</strong> – ${new Date(entry.created_at).toLocaleString()}</div>
        <div><strong>New Amount:</strong> $${Number(entry.bill_amount).toFixed(2)}</div>
        <div><strong>Bill Status:</strong> ${entry.bill_status}</div>
        <div><strong>Note:</strong> ${entry.note || "—"}</div>
      </div>
      <br>
    `;
  });

  html += `</div>`;
  return html;
}