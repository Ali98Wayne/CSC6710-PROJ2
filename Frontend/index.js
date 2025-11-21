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
    fetch('/addQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            requestId, 
            responderId: 1, 
            quotePrice: 0, // Avoid NULL errors
            scheduledStart: new Date().toISOString(), // Avoid NULL errors
            scheduledEnd: new Date().toISOString(), // Avoid NULL errors
            note: 'Rejected', 
            status: 'rejected' // Mark as handled
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Remove the request from Anna's UI immediately
            const reqDiv = document.getElementById(`quote-price-${requestId}`).closest('.pending-request');
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

    // Show/hide the profile section based on user login status, hide logout button by default, only show the queries section for Anna Johnson
    function updateUI() {
        const currentUser = localStorage.getItem("loggedInUser");
        const profileSection = document.querySelector("#profile-section");
        const profileName = document.querySelector("#profile-name");
        const serviceRequest = document.querySelector("#service-request");
        const serviceOrdersList = document.querySelector("#service-orders-list");
        const queriesSection = document.querySelector("#queries-section");
        const queryResults = document.querySelector("#query-results");
        const queryBody = document.querySelector('#query-results tbody');

        if (currentUser) {
            signupSection.style.display = "none"; // Hide Sign Up section when logged in
            loginSection.style.display = "none"; // Hide Login section when logged in
            profileSection.style.display = "flex"; // Show the profile section (with a flex display style)
            profileName.textContent = currentUser; // Set the profile name in the profile section to the logged in username
            logoutBtn.style.display = "none"; // Hide the logout button by default when logged in
            serviceRequest.style.display = "block"; // Show the service request when logged in
            serviceOrdersList.style.display = "none" // Hide the service orders list
            clientLoadRequests(currentUser); // Let the logged in user view their service order & bill if Anna generated them
            queriesSection.style.display = "none"; // Show the queries section
            queryResults.style.display = "none"; // Hide the query results table, until a query is made
            if (queryBody) queryBody.innerHTML = ''; // Clear the query results table on login
        } else if (isAnnaUser) {
            signupSection.style.display = "none"; // Hide Sign Up section if Anna Johnson is the DB user
            loginSection.style.display = "none"; // Hide Login section if Anna Johnson is the DB user
            serviceRequest.style.display = "none" // Hide the service request if Anna Johnson is the DB user
            serviceOrdersList.style.display = "block" // Show the service orders list if Anna Johnson is the DB user
            queriesSection.style.display = 'block'; // Show the queries section if Anna Johnson is the DB user
            document.getElementById("client-requests").innerHTML = ""; // Clear the client requests HTML
            const pendingQuotesSection = document.getElementById("pending-quotes-section");
            pendingQuotesSection.style.display = "block";
            fetch('/pendingRequests')  // <-- backend endpoint you created
            .then(res => res.json())
            .then(data => {
                renderAnnaQuoteUI(data.requests); // render the inputs/buttons
            });
        }
        else {
            signupSection.style.display = "block"; // Hide Sign Up section when not logged in by default
            loginSection.style.display = "none"; // Show Login section when not logged in by default
            profileSection.style.display = "none"; // Hide the profile section
            serviceRequest.style.display = "none" // Hide the service request when not logged in
            inputFields.forEach(input => input.value = ""); // Clear all input fields when not logged in
            photoFields.innerHTML = ''; // Remove all added photo fields
            photoNum = 0; // Reset counter
            addPhotoButton.style.display = 'inline-block'; // Show the Add Photo button again
            serviceOrdersList.style.display = "none" // Hide the service orders list
            queriesSection.style.display = "none"; // Hide the queries section
            queryResults.style.display = "none"; // Hide the query results table
            if (queryBody) queryBody.innerHTML = ''; // Clear the query results table on sign out
            document.getElementById("client-requests").innerHTML = ""; // Clear the client requests HTML
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
        tableHtml += `<td><button class="generate-order-btn" data-id="${request_id}">Generate Order</button></td>`;
        tableHtml += `<td><button class="generate-bill-btn" data-id="${request_id}">Generate Bill</button></td>`;
        // Show the view order button if an order has been generated by Anna Johnson
        tableHtml += `<td>${order_generated == 1 ? `<button class="view-order-btn" data-id="${request_id}">View Order</button>` : `<span>Service Order for Request: ${request_id} is Pending</span>`}</td>`;
        // Show the view bill button if a bill has been generated by Anna Johnson
        tableHtml += `<td>${bill_generated == 1 ? `<button class="view-bill-btn" data-id="${request_id}">View Bill</button>` : `<span>Service Bill for Request: ${request_id} is Pending</span>`}</td>`;
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
  fetch(`/clientLoadRequests/${username}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        console.error(data.error);
        return;
      }

      let innerHTML = "";

      data.requests.forEach(req => {
        innerHTML += `<div class="client-request" style="margin-bottom:15px;">`;
        innerHTML += `<strong>Request ID:</strong> ${req.request_id} | <strong>Service Address:</strong> ${req.service_address_street}, ${req.service_address_city}, ${req.service_address_state} ${req.service_address_zip}<br>`;
        innerHTML += `<strong>Cleaning Type:</strong> ${req.cleaning_type} | <strong>Rooms:</strong> ${req.rooms} | <strong>Proposed Budget:</strong> $${req.proposed_budget}<br>`;

        if (!req.quote_status) {
          innerHTML += `<span style="color:orange;">No quote yet. Waiting for Anna...</span>`;
        } else if (req.quote_status === "rejected") {
          innerHTML += `<span style="color:red;">Quote rejected by Anna</span><br>`;
          innerHTML += `<button onclick="resubmitRequest(${req.request_id})">Resubmit</button>`; // ← NEW
        } else if (req.quote_status === "quoted") {
          innerHTML += `<span style="color:blue;">Quoted Price: $${req.quote_price} | Note: ${req.quote_note}</span><br>`;
          innerHTML += `<button onclick="acceptQuote(${req.request_id})">Accept</button> `;
          innerHTML += `<button onclick="counterQuote(${req.request_id})">Counter / Negotiate</button>`;
        } else if (req.quote_status === "accepted") {
          innerHTML += `<span style="color:green;">Quote accepted ✅</span>`;
        }

        innerHTML += `</div>`;
      });

      document.getElementById("client-requests").innerHTML = innerHTML;
    })
    .catch(err => console.error(err));
}

// Accept the latest quote
function acceptQuote(requestId) {
  fetch('/updateQuote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, status: 'accepted' })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(`Quote for Request #${requestId} accepted!`);
      clientLoadRequests(localStorage.getItem("loggedInUser"));
    } else {
      alert("Error: " + (data.error || "Unknown error"));
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

function resubmitRequest(requestId) {
  fetch(`/getRequest/${requestId}`) // fetch the rejected request data
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
      document.querySelector('#proposed-budget').value = req.proposed_budget;
      document.querySelector('#notes').value = req.notes || '';

      // Prefill photos if any
      const photoFields = document.getElementById('photo-fields');
      photoFields.innerHTML = '';
      let photoNum = 0;
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
          photoNum++;
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