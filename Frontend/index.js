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

    function renderAnnaQuoteUI(requests) {
      const container = document.getElementById('pending-quotes-list');
      container.innerHTML = '';

      requests.forEach(req => {
          const div = document.createElement('div');
          div.classList.add('pending-request');

          // Build innerHTML WITHOUT inline onclick
          div.innerHTML = `
              <p>Request #${req.request_id} from ${req.username}</p>
              <input type="number" placeholder="Quote Price" id="quote-price-${req.request_id}">
              <input type="datetime-local" id="quote-start-${req.request_id}">
              <input type="datetime-local" id="quote-end-${req.request_id}">
              <input type="text" placeholder="Note" id="quote-note-${req.request_id}">
              <button class="submit-quote-btn">Submit Quote</button>
              <button class="reject-request-btn">Reject</button>
          `;

          // Attach listeners dynamically
          div.querySelector('.submit-quote-btn')
            .addEventListener('click', () => submitQuote(req.request_id));

          div.querySelector('.reject-request-btn')
            .addEventListener('click', () => rejectRequest(req.request_id));

          container.appendChild(div);
      });
    }

    function submitQuote(requestId) {
        const price = document.getElementById(`quote-price-${requestId}`).value;
        const start = document.getElementById(`quote-start-${requestId}`).value;
        const end = document.getElementById(`quote-end-${requestId}`).value;
        const note = document.getElementById(`quote-note-${requestId}`).value;

        // Basic validation
        if (!price || !start || !end) {
            alert("Please enter price, start, and end dates for the quote.");
            return;
        }

        fetch('/addQuote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                requestId, 
                responderId: 1, 
                quotePrice: price, 
                scheduledStart: start, 
                scheduledEnd: end, 
                note: note || '', 
                status: 'quoted' // Mark as handled
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Remove the request from Anna's UI immediately
                const reqDiv = document.getElementById(`quote-price-${requestId}`).closest('.pending-request');
                if (reqDiv) reqDiv.remove();
            } else {
                alert("Error submitting quote: " + (data.error || "Unknown error"));
            }
        })
        .catch(err => console.error("Error submitting quote:", err));
    }

    function rejectRequest(requestId) {
        const note = document.getElementById(`quote-note-${requestId}`).value;

        if (!note.trim()) {
            alert("Please enter a note before rejecting.");
            return;
        }

        fetch('/addQuote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                requestId,
                responderId: 1, 
                quotePrice: null,
                scheduledStart: null,
                scheduledEnd: null,
                note: note,
                status: 'rejected'
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const reqDiv = document
                    .getElementById(`quote-price-${requestId}`)
                    .closest('.pending-request');
                if (reqDiv) reqDiv.remove();
            } else {
                alert("Error rejecting request: " + (data.error || "Unknown error"));
            }
        })
        .catch(err => console.error("Error rejecting request:", err));
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
                address_city, address_state, address_zip, phone, email, card_num, 
                card_month, card_year, card_cvv })
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

    // // Apply dashes to the credit card field based on input length
    document.getElementById('signup-creditcard').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
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
        let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
        if (input.length > 4) input = input.substring(0, 4); // Limit to 4 digits
        e.target.value = input;
    });

    document.getElementById('signup-creditcard-cvv').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
        if (input.length > 4) input = input.substring(0, 4); // Limit to 4 digits 
        e.target.value = input;
    });

    document.getElementById('service-address-zip').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
        if (input.length > 5) input = input.substring(0, 5); // Limit to 5 digits
        e.target.value = input;
    });

    document.getElementById('room-amount').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
        e.target.value = input;
    });

    document.getElementById('proposed-budget').addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
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
        const serviceOrdersList = document.querySelector("#service-orders-list");
        const queriesSection = document.querySelector("#queries-section");
        const queryResults = document.querySelector("#query-results");
        const queryBody = document.querySelector('#query-results tbody');
        const pendingQuotesSection = document.getElementById("pending-quotes-section");
        const billingSection = document.getElementById("billing-section");

        if (currentUser) {
            signupSection.style.display = "none";
            loginSection.style.display = "none";
            profileSection.style.display = "flex";
            profileName.textContent = currentUser;
            logoutBtn.style.display = "none";
            serviceRequest.style.display = "block";
            serviceOrdersList.style.display = "none";
            queriesSection.style.display = "none";
            queryResults.style.display = "none";
            if (queryBody) queryBody.innerHTML = '';
            clientLoadRequests(currentUser); // Load requests (includes quotes + nested bills)
            loadBills(currentUser); 
        } else if (isAnnaUser) {
            signupSection.style.display = "none";
            loginSection.style.display = "none";
            serviceRequest.style.display = "none";
            serviceOrdersList.style.display = "block";
            queriesSection.style.display = 'block';
            document.getElementById("client-requests").innerHTML = "";
            pendingQuotesSection.style.display = "block";
            fetch('/pendingRequests')
            .then(res => res.json())
            .then(data => {
                renderAnnaQuoteUI(data.requests);
            });
            billingSection.style.display = "block";        
        } else {
            signupSection.style.display = "block";
            loginSection.style.display = "none";
            profileSection.style.display = "none";
            serviceRequest.style.display = "none";
            inputFields.forEach(input => input.value = "");
            photoFields.innerHTML = '';
            photoNum = 0;
            addPhotoButton.style.display = 'inline-block';
            serviceOrdersList.style.display = "none";
            queriesSection.style.display = "none";
            queryResults.style.display = "none";
            if (queryBody) queryBody.innerHTML = '';
            document.getElementById("client-requests").innerHTML = "";
            pendingQuotesSection.style.display = "none";
            billingSection.style.display = "none";
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

    // Load a list of service orders for Anna Johnson
    fetch('http://localhost:5050/listServiceOrders')
    .then(response => response.json())
    .then(result => serviceOrdersList(result.data))
    .catch(err => console.error(err));

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

// Most service orders search
const mostServiceOrdersBtn =  document.querySelector('#most-service-orders-btn');
mostServiceOrdersBtn.onclick = function () {
    fetch('http://localhost:5050/mostServiceOrders')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['client_id', 'username', 'first_name', 'last_name', 'total_requests']))
    .catch(err => console.error("Most Service Orders search error:", err));
}

// Accepted quotes in a given month search
const monthQuotesBtn =  document.querySelector('#month-quotes-search-btn');
monthQuotesBtn.onclick = function () {
    const month = document.querySelector('#monthQuotes').value;
    fetch(`http://localhost:5050/monthQuotes?month=${month}`)
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['request_id', 'client_id', 'username', 'quote_accept_date']))
    .catch(err => console.error("Most Service Orders search error:", err));
}

// Largest job, most rooms, search
const largestJobBtn =  document.querySelector('#largest-job-search-btn');
largestJobBtn.onclick = function () {
    fetch('http://localhost:5050/largestJob')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['request_id', 'client_id', 'username', 'rooms']))
    .catch(err => console.error("Most Service Orders search error:", err));
}

// Bad clients search
const badClientsBtn =  document.querySelector('#bad-clients-search-btn');
badClientsBtn.onclick = function () {
    fetch('http://localhost:5050/badClients')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['client_id', 'username', 'first_name', 'last_name']))
    .catch(err => console.error("Most Service Orders search error:", err));
}

// Uncommitted Clients search
const uncommittedClientsBtn = document.querySelector('#uncommitted-clients-btn');
uncommittedClientsBtn.onclick = function () {
    fetch('http://localhost:5050/uncommittedClients')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['user_id', 'first_name', 'last_name', 'email', 'request_count']))
    .catch(err => console.error("Uncommitted Clients search error:", err));
}

// Prospective Clients search
const prospectiveClientsBtn = document.querySelector('#prospective-clients-btn');
prospectiveClientsBtn.onclick = function () {
    fetch('http://localhost:5050/prospectiveClients')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['user_id', 'first_name', 'last_name', 'email']))
    .catch(err => console.error("Prospective Clients search error:", err));
}

// Overdue Bills search
const overdueBillsBtn = document.querySelector('#overdue-bills-btn');
overdueBillsBtn.onclick = function () {
    fetch('http://localhost:5050/overdueBills')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['bill_id', 'request_id', 'client_id', 'bill_amount', 'status', 'due_date', 'payment_date', 'note']))
    .catch(err => console.error("Overdue Bills search error:", err));
}

// Good Clients search
const goodClientsBtn = document.querySelector('#good-clients-btn');
goodClientsBtn.onclick = function () {
    fetch('http://localhost:5050/goodClients')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['user_id', 'first_name', 'last_name', 'email']))
    .catch(err => console.error("Good Clients search error:", err));
}

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
        queryTableBody.innerHTML = "<h2>No results for the query</h2>";
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

// Function for showing a list of service requests to Anna Johnson
function serviceOrdersList(data) {
    const tableBody = document.querySelector('#service-orders-list tbody');

    if (!data || data.length === 0) {
        tableBody.innerHTML = "<tr><td class='no-data' colspan='7'>No Service Order Requests</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach(({ request_id, client_id, service_address_street, service_address_city,
        service_address_state, service_address_zip, cleaning_type, rooms, preferred_date, 
        proposed_budget, request_date, order_generated, bill_generated}) => {
        tableHtml += "<tr>";
        tableHtml += `<td>${request_id}</td>`;
        tableHtml += `<td>${client_id}</td>`;
        tableHtml += `<td>${service_address_street}</td>`;
        tableHtml += `<td>${service_address_city}</td>`;
        tableHtml += `<td>${service_address_state}</td>`;
        tableHtml += `<td>${service_address_zip}</td>`;
        tableHtml += `<td>${cleaning_type}</td>`;
        tableHtml += `<td>${rooms}</td>`;
        tableHtml += `<td>${new Date(preferred_date).toLocaleString()}</td>`;
        tableHtml += `<td>${proposed_budget}</td>`;
        tableHtml += `<td>${new Date(request_date).toLocaleDateString()}</td>`;
        // Show the generate order button if an order hasn't been generated by Anna Johnson, otherwise hide the button
        tableHtml += `<td>${order_generated == 0 ? `<button class="generate-order-btn" data-id="${request_id}">Generate Order</button>` : `<button class="generate-order-btn" disabled>Order Generated</button>`}<td>`;
        // Show the generate bill button if an bill hasn't been generated by Anna Johnson, otherwise hide the button
        tableHtml += `<td>${bill_generated == 0 ? `<button class="generate-bill-btn" data-id="${request_id}">Generate Bill</button>` : `<button class="generate-order-btn" disabled>Bill Generated</button>`}<td>`;
        // Show the view order button if an order has been generated by Anna Johnson
        tableHtml += `<td>${order_generated == 1 ? `<button class="view-order-btn" data-id="${request_id}">View Order</button>` : `<span>Service Order is Pending</span>`}</td>`;
        // Show the view bill button if a bill has been generated by Anna Johnson
        tableHtml += `<td>${bill_generated == 1 ? `<button class="view-bill-btn" data-id="${request_id}">View Bill</button>` : `<span>Service Bill is Pending</span>`}</td>`;
        tableHtml += "</tr>";
    });

    tableBody.innerHTML = tableHtml;

    // Attach event listeners to the generate order buttons
    document.querySelectorAll('.generate-order-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const requestId = e.target.dataset.id;
            try {
            const response = await fetch(`http://localhost:5050/generateServiceOrder/${requestId}`);
            const data = await response.json();
                if (!data.success) {
                    alert("Failed to load service request details");
                    return;
                } else {
                    alert(`Generated Order for Request: ${requestId}`);
                    // Refresh the service orders list so the "View Bill" button appears
                    fetch('http://localhost:5050/listServiceOrders')
                    .then(response => response.json())
                    .then(result => serviceOrdersList(result.data))
                    .catch(err => console.error(err));
                }
            } catch (err) {
                alert(`Error loading service request: ${err.message}`);
            }
        });
    });

    // Attach event listeners to the generate bill buttons
    document.querySelectorAll('.generate-bill-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const requestId = e.target.dataset.id;
            try {
            const response = await fetch(`http://localhost:5050/generateServiceBill/${requestId}`);
            const data = await response.json();
                if (!data.success) {
                    alert("Failed to load service request details");
                    return;
                } else { 
                    alert(`Generated Bill for Request: ${requestId}`);
                    // Refresh the service orders list so the "View Bill" button appears
                    fetch('http://localhost:5050/listServiceOrders')
                    .then(response => response.json())
                    .then(result => serviceOrdersList(result.data))
                    .catch(err => console.error(err));
                }
            } catch (err) {
                alert(`Error loading service request: ${err.message}`);
            }
        });
    });

    // Attach event listeners to the view order buttons
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const requestId = e.target.dataset.id;
            await viewServiceOrder(requestId);
        });
    });

    // Attach event listeners to the view bill buttons
    document.querySelectorAll('.view-bill-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const requestId = e.target.dataset.id;
            await viewServiceBill(requestId);
        });
    });
}

// Function to process a service request order corresponding to a service request
async function viewServiceOrder(requestId) {
  try {
    // Fetch the request details
    const response = await fetch(`http://localhost:5050/getRequest/${requestId}`);
    const data = await response.json();

    if (!data.success) {
      alert("Failed to load service request details");
      return;
    }

    const req = data.request;

    // Open a blank new tab
    const newTab = window.open("", "_blank");
    const doc = newTab.document;
    doc.open();

    // Write dynamic HTML into the new tab
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Service Bill - Request #${req.request_id}</title>
        <style>
          body {
            background-color: #000;
            color: #f0f0f0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            padding: 40px 0;
          }

          main {
            padding: 40px 50px;
            width: 90%;
            max-width: 800px;
          }

          h1, h2 {
            color: #00bfff;
            margin-bottom: 20px;
          }

          button {
            margin-top: 20px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background-color: #00bfff;
            color: #000;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          button:hover {
            background-color: #0099cc;
            box-shadow: 0 0 15px #00bfff;
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Service Agreement</h1>
          <h2>Request #${req.request_id}</h2>
            <p><strong>Client ID:</strong> ${req.client_id}</p>
            <p><strong>Service Address:</strong> ${req.service_address_street}, ${req.service_address_city}, ${req.service_address_state}, ${req.service_address_zip}</p>
            <p><strong>Cleaning Type:</strong> ${req.cleaning_type}</p>
            <p><strong>Rooms:</strong> ${req.rooms}</p>
            <p><strong>Preferred Date:</strong> ${new Date(req.preferred_date).toLocaleString()}</p>
            <p><strong>Proposed Budget:</strong> $${req.proposed_budget.toFixed(2)}</p>
            <p><strong>Request Date:</strong> ${new Date(req.request_date).toLocaleDateString()}</p>
            ${req.notes ? `<p><strong>Notes:</strong> ${req.notes}</p>` : ""}
            ${req.photo_urls ? `<p><strong>Photo URLS: </strong> ${req.photo_urls}</p>` : ""}
          <p style="margin-top:25px;">By proceeding, the customer agrees to the terms of this service agreement.</p>
          <button onclick="window.print()">Print Agreement</button>
        </main>
      </body>
      </html>
    `;
    doc.write(html);
    doc.close();

  } catch (err) {
    alert(`Error loading service request: ${err.message}`);
  }
}

// Function to process a service bill corresponding to a service request
async function viewServiceBill(requestId) {
  try {
    const response = await fetch(`http://localhost:5050/getRequest/${requestId}`);
    const data = await response.json();

    if (!data.success) {
      alert("Failed to load service request details");
      return;
    }

    const req = data.request;

    const newTab = window.open("", "_blank");
    const doc = newTab.document;
    doc.open();

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Service Bill - Request #${req.request_id}</title>
        <style>
          body {
            background-color: #000;
            color: #f0f0f0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            padding: 40px 0;
          }

          main {
            padding: 40px 50px;
            width: 90%;
            max-width: 800px;
          }

          h1, h2 {
            color: #00bfff;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Service Bill</h1>
        <div class="bill-container">
          <p><strong>Request ID:</strong> ${req.request_id}</p>
          <p><strong>Client ID:</strong> ${req.client_id}</p>
          <p><strong>Service Address:</strong> ${req.service_address_street}, ${req.service_address_city}, ${req.service_address_state}, ${req.service_address_zip}</p>
          <p><strong>Cleaning Type:</strong> ${req.cleaning_type}</p>
          <p><strong>Rooms:</strong> ${req.rooms}</p>
          <p><strong>Preferred Date:</strong> ${new Date(req.preferred_date).toLocaleString()}</p>
          <p><strong>Proposed Budget:</strong> $${req.proposed_budget.toFixed(2)}</p>
          <p><strong>Request Date:</strong> ${new Date(req.request_date).toLocaleDateString()}</p>
          ${req.notes ? `<p><strong>Notes:</strong> ${req.notes}</p>` : ""}
        </div>
      </body>
      </html>
    `;
    doc.write(html);
    doc.close();

  } catch (err) {
    alert(`Error loading service bill: ${err.message}`);
  }
}

// Function to show the logged in user (client) their service request order & bill if Anna Johnson generated them
// Load a list of service requests for the logged-in client
function clientLoadRequests(username) {
  // fetch server endpoint that returns requests (with nested bills)
  fetch(`/clientLoadRequests/${username}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        console.error(data.error);
        return;
      }

      window.clientRequests = data.requests; // keep for other uses

      let innerHTML = "";

      data.requests.forEach(req => {
        innerHTML += `<div class="client-request" id="client-request-${req.request_id}" style="
          margin: 20px auto;
          padding: 15px;
          border: 2px solid #007BFF;
          border-radius: 6px;
          max-width: 600px;
          text-align: center;
          background: transparent;
        ">`;

        innerHTML += `<strong>Request #${req.request_id} from ${req.username || 'undefined'}</strong><br>`;
        innerHTML += `<div><strong>Quote Price</strong><br>
                      ${req.quote_price ? `$${Number(req.quote_price).toFixed(2)}` : 'No quote yet.'}<br>
                      ${req.scheduled_start ? new Date(req.scheduled_start).toLocaleString() : '--:-- --'}<br>
                      ${req.scheduled_end ? new Date(req.scheduled_end).toLocaleString() : '--:-- --'}<br>
                      <strong>Note</strong><br>${req.quote_note || ''}</div>`;

        const acceptedRequests = JSON.parse(localStorage.getItem('acceptedRequests') || '[]');

        if (acceptedRequests.includes(req.request_id)) {
            // Already accepted
            innerHTML += `<div class="client-quote-buttons" style="margin-top:8px;">
                              <div style="color:green; font-weight:bold;">Accepted!</div>
                          </div>`;
        } else if (req.quote_status !== 'rejected' && req.quote_price) {
            innerHTML += `<div class="client-quote-buttons" style="margin-top:8px;">
                              <button onclick="acceptQuote(${req.request_id})">Accept</button> 
                              <button onclick="resubmitRequest(${req.request_id}, ${req.quote_price})">Dispute</button>
                          </div>`;
        } else if (req.quote_status === 'accepted') {
            innerHTML += `<div style="color:green; margin-top:8px;">Quote accepted ✅</div>`;
        } else if (req.quote_status === 'rejected') {
            innerHTML += `<div style="color:red; margin-top:8px;">Quote rejected by Anna</div>`;
            innerHTML += `<button onclick="resubmitRequest(${req.request_id})">Resubmit Request</button>`;
        }

        innerHTML += `<div style="margin-top:10px;">`;
        if (req.order_generated) {
          innerHTML += `<button onclick="viewServiceOrder(${req.request_id})">View Service Agreement</button>`;
        } else {
          innerHTML += `<span>Service Order is Pending</span>`;
        }
        innerHTML += `</div>`;

        if (req.bills && req.bills.length > 0) {
          innerHTML += `<div style="margin-top:12px;"><strong>Bills:</strong></div>`;
          req.bills.forEach(bill => {
            const color = (bill.bill_status && bill.bill_status.toLowerCase() === "paid") ? "green" : "red";
            let due = bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A';

            innerHTML += `
              <div class="bill-section-${bill.bill_id}-${req.request_id}" 
                  style="margin-top:12px; padding: 12px; border: 2px solid #007BFF; border-radius: 6px; 
                          max-width: 500px; margin-left:auto; margin-right:auto; background: transparent;">
                
                <div style="font-weight:bold; color:${color};">
                  Amount: $${Number(bill.bill_amount).toFixed(2)} | Status: ${bill.bill_status || 'Undefined'} | Due: ${due}
                </div>
                
                <div id="bill-actions-${bill.bill_id}" style="margin-top:10px;">
                  ${
                    bill.bill_status && bill.bill_status.toLowerCase() === "paid"
                      ? `<div style="color:green; margin-top:6px;">Payment submitted successfully.</div>`
                      : `
                        <div class="bill-buttons" style="margin-top:6px;">
                          <button onclick="openPayForm(${bill.bill_id}, ${req.request_id})">Pay</button>
                          <button onclick="resubmitRequest(${req.request_id})">Dispute</button>
                        <div id="pay-form-${bill.bill_id}" style="margin-top:10px;"></div>
                      `
                  }
                </div>
              </div>
            `;
          });
        }
        innerHTML += `</div>`; // close client-request box
      });
      document.getElementById("client-requests").innerHTML = innerHTML;
    })
    .catch(err => console.error(err));
}

// open a simple Pay modal/form (no real transaction) — keeps comments and is purely front-end for project
function openPayForm(billId, requestId) {
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
  document.getElementById('pay-submit-btn').addEventListener('click', () => submitPay(billId, requestId));
}

function closePayForm() {
  const modal = document.getElementById('pay-form-modal');
  if (modal) modal.remove();
}

// Simulated payment submission — purely front end for the project (keeps original logic/comments)
async function submitPay(billId, requestId) {
  const name = document.getElementById('pay-name').value.trim();
  const card = document.getElementById('pay-card').value.trim();
  const exp = document.getElementById('pay-exp').value.trim();
  const cvv = document.getElementById('pay-cvv').value.trim();

  if (!name || !card || !exp || !cvv) {
    alert("Please fill out all payment fields.");
    return;
  }

  // close the popup
  closePayForm();

  // find the bill container
  const billSection = document.querySelector(`.bill-section-${billId}-${requestId}`);
  if (!billSection) return;

  // update the bill UI to "paid"
  billSection.innerHTML = `
    <div style="
      margin-top:10px;
      padding:12px;
      border:2px solid #007BFF;
      border-radius:6px;
      background: transparent;
      color: green;
      font-weight: bold;
      text-align:center;
    ">
      Payment Submitted Successfully ✅<br><br>
      Name: ${name}<br>
      Card Ending: **** ${card.slice(-4)}<br>
      Thank you for your payment!
    </div>
  `;

  // optionally refresh UI (this does NOT reload payment state)

}

function renderBills(bills) {
  const billsList = document.getElementById('bills-list');
  if (!billsList) return;
  billsList.innerHTML = '';

  if (!bills || bills.length === 0) {
    billsList.innerHTML = '<div>No bills found.</div>';
    return;
  }

  bills.forEach(bill => {
    const div = document.createElement('div');
    div.className = 'bill-item';
    const due = new Date(bill.due_date).toLocaleDateString();
    div.innerHTML = `
      <strong>Bill ID:</strong> ${bill.bill_id} |
      <strong>Amount:</strong> $${Number(bill.bill_amount).toFixed(2)} |
      <strong>Status:</strong> ${bill.status} |
      <strong>Due:</strong> ${due}
      <div style="margin-top:6px;">
        ${bill.status !== 'Paid' ? `<button class="pay-bill-btn" data-id="${bill.bill_id}">Pay</button>` : ''}
        ${bill.status !== 'Paid' ? `<button class="dispute-bill-btn" data-id="${bill.bill_id}">Dispute</button>` : ''}
        <button class="view-bill-btn" data-id="${bill.bill_id}">View</button>
      </div>
    `;
    billsList.appendChild(div);
  });

  // attach handlers
  billsList.querySelectorAll('.pay-bill-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const billId = e.target.dataset.id;
      await payBill(billId);
    });
  });

  billsList.querySelectorAll('.dispute-bill-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const billId = e.target.dataset.id;
      const note = prompt('Enter dispute note:');
      if (note === null) return; // cancelled
      await disputeBill(billId, note);
    });
  });

  billsList.querySelectorAll('.view-bill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const billId = e.target.dataset.id;
      // simple view - open new tab with bill details endpoint if you have one
      // fallback: alert minimal info
      alert('Open the Requests/Bills UI or implement a dedicated view endpoint.');
    });
  });
}

async function loadBills(username) {
  if (!username) return;
  try {
    const res = await fetch(`/clientLoadRequests/${encodeURIComponent(username)}`);
    const data = await res.json();
    if (!data.success) return;
    // collect all bills from all requests into a single array
    const bills = [];
    data.requests.forEach(req => {
      if (req.bills && Array.isArray(req.bills)) {
        req.bills.forEach(b => bills.push(b));
      }
    });
    renderBills(bills);
  } catch (err) {
    console.error('Failed to load bills:', err);
  }
}

async function payBill(billId) {
  const username = localStorage.getItem('loggedInUser');
  if (!username) { alert('Not logged in'); return; }
  try {
    const res = await fetch('/client/pay-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, billId, note: 'Paid via UI' })
    });
    const data = await res.json();
    if (data.success) {
      alert('Payment recorded.');
      loadBills(username);
      clientLoadRequests(username); // refresh both lists
    } else {
      alert('Payment error: ' + (data.error || 'Unknown'));
    }
  } catch (err) {
    console.error(err);
    alert('Payment failed.');
  }
}

async function disputeBill(billId, note) {
  const username = localStorage.getItem('loggedInUser');
  if (!username) { alert('Not logged in'); return; }
  try {
    const res = await fetch('/client/dispute-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, billId, note })
    });
    const data = await res.json();
    if (data.success) {
      alert('Dispute submitted.');
      loadBills(username);
      clientLoadRequests(username); // refresh lists
    } else {
      alert('Dispute error: ' + (data.error || 'Unknown'));
    }
  } catch (err) {
    console.error(err);
    alert('Failed to submit dispute.');
  }
}

// Accept the latest quote
function acceptQuote(requestId) {
    // Store in localStorage that this request was accepted
    const acceptedRequests = JSON.parse(localStorage.getItem('acceptedRequests') || '[]');
    if (!acceptedRequests.includes(requestId)) {
        acceptedRequests.push(requestId);
        localStorage.setItem('acceptedRequests', JSON.stringify(acceptedRequests));
    }

    // Replace buttons with "Accepted!" text
    const requestDiv = document.getElementById(`client-request-${requestId}`);
    const buttonsDiv = requestDiv.querySelector('.client-quote-buttons');
    if (buttonsDiv) {
        // Completely clear buttons and show only Accepted!
        buttonsDiv.innerHTML = `<div style="color:green; font-weight:bold; margin-top:8px;">Accepted!</div>`;
    }

    // Notify server so Anna's dashboard knows this quote was accepted
    fetch('/client/accept-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error updating server:', data.error);
        }
    })
    .catch(err => console.error(err));
}

// Counter / negotiate quote
function counterQuote(requestId, oldPrice) {
  const newPrice = prompt("Enter your counter price:", oldPrice);
  if (!newPrice) return;
  const note = prompt("Enter your counter / negotiation note:");
  
  fetch('/updateQuote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, quote_price: newPrice, note, status: 'countered' })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(`Counter note submitted for Request #${requestId}`);
      clientLoadRequests(localStorage.getItem("loggedInUser"));
    } else {
      alert("Error: " + (data.error || "Unknown error"));
    }
  })
  .catch(err => console.error(err));
}

function resubmitRequest(requestId, annaQuote = null) {
  fetch(`/getRequest/${requestId}`) // fetch the request data
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert("Error fetching request details: " + (data.error || "Unknown error"));
        return;
      }

      const req = data.request;

      // Prefill the service request form
      document.querySelector('#service-address').value = req.service_address_street;
      document.querySelector('#service-address-city').value = req.service_address_city;
      document.querySelector('#service-address-state').value = req.service_address_state;
      document.querySelector('#service-address-zip').value = req.service_address_zip;
      document.querySelector('#cleaning-type').value = req.cleaning_type;
      document.querySelector('#room-amount').value = req.rooms;
      document.querySelector('#preferred-date-time').value = new Date(req.preferred_date).toISOString().slice(0,16);

      // Use Anna's quote if provided, else original proposed budget
      document.querySelector('#proposed-budget').value = annaQuote ?? req.proposed_budget;
      document.querySelector('#notes').value = req.notes || '';

      // Prefill photos if any
      const photoFields = document.getElementById('photo-fields');
      photoFields.innerHTML = '';
      if (req.photo_urls) {
        const photos = JSON.parse(req.photo_urls);
        photos.forEach((url, idx) => {
          const div = document.createElement('div');
          div.classList.add('photo-field');

          const input = document.createElement('input');
          input.type = 'text';
          input.id = `photo-link${idx+1}`;
          input.value = url;
          input.placeholder = `Photo ${idx+1}`;

          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.textContent = 'Remove';
          removeBtn.addEventListener('click', () => div.remove());

          div.appendChild(input);
          div.appendChild(removeBtn);
          photoFields.appendChild(div);
        });
      }

      // Scroll to the form
      document.querySelector('#service-request').scrollIntoView({ behavior: 'smooth' });

      // Override the submit button for this resubmission
      const submitButton = document.querySelector('#submit-button');
      submitButton.onclick = function() {
        submitResubmittedRequest(requestId);
      };
    })
    .catch(err => console.error(err));
}

function submitResubmittedRequest(requestId) {
  const username = localStorage.getItem("loggedInUser");
  const requestAddress = document.querySelector('#service-address').value.trim();
  const requestAddressCity = document.querySelector('#service-address-city').value.trim();
  const requestAddressState = document.querySelector('#service-address-state').value.trim();
  const requestAddressZip = document.querySelector('#service-address-zip').value.trim();
  const requestCleaningType = document.querySelector('#cleaning-type').value.trim();
  const requestRoomAmount = document.querySelector('#room-amount').value.trim();
  const requestDateTime = document.querySelector('#preferred-date-time').value.trim();
  const requestBudget = document.querySelector('#proposed-budget').value.trim();
  const requestNotes = document.querySelector('#notes')?.value.trim() || null;
  const photo_urls = Array.from(document.querySelectorAll('.photo-field input')).map(inp => inp.value.trim());

  if (!requestAddress || !requestAddressCity || !requestAddressState || !requestAddressZip || 
      !requestCleaningType || !requestRoomAmount || !requestDateTime || !requestBudget) {
    alert("Please fill out all fields.");
    return;
  }

  fetch('/resubmitRequest', { // NEW server endpoint
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestId,
      username,
      requestAddress,
      requestAddressCity,
      requestAddressState,
      requestAddressZip,
      requestCleaningType,
      requestRoomAmount,
      requestDateTime,
      requestBudget,
      requestNotes,
      photo_urls: JSON.stringify(photo_urls)
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(`Request #${requestId} resubmitted successfully!`);
      clientLoadRequests(username); // reload client requests
    } else {
      alert("Error: " + (data.error || "Unknown error"));
    }
  })
  .catch(err => console.error(err));
}