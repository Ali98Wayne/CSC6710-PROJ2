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

    function renderAnnaRequestUI(requests) {
      const container = document.getElementById('pending-requests-list');
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

    function renderAnnaQuoteUI(requests) {
      const container = document.getElementById('pending-quotes-list');
      container.innerHTML = '';

      requests.forEach(req => {
          const div = document.createElement('div');
          div.classList.add('pending-quote');

          div.innerHTML = `
              <p>Quote #${req.quote_id} from ${req.username}</p>
              <input type="number" placeholder="Quote Price" id="quote-price-${req.quote_id}">
              <input type="datetime-local" id="quote-start-${req.quote_id}">
              <input type="datetime-local" id="quote-end-${req.quote_id}">
              <input type="text" placeholder="Note" id="quote-note-${req.quote_id}">
              <button class="resubmit-quote-btn">Resubmit Quote</button>
              <button class="reject-quote-btn">Reject</button>
              <button class="cancel-quote-btn">Cancel</button>
          `;

          div.querySelector('.resubmit-quote-btn')
            .addEventListener('click', () => resubmitQuote(req.quote_id));

          div.querySelector('.reject-quote-btn')
            .addEventListener('click', () => rejectQuote(req.quote_id));

          div.querySelector('.cancel-quote-btn')
            .addEventListener('click', () => cancelQuote(req.quote_id));

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

    function resubmitQuote(quoteId) {
        const newPrice = document.getElementById(`quote-price-${quoteId}`).value;
        const newStart = document.getElementById(`quote-start-${quoteId}`).value;
        const newEnd = document.getElementById(`quote-end-${quoteId}`).value;
        const note = document.getElementById(`quote-note-${quoteId}`).value;

        if (!newPrice || !newStart || !newEnd) {
            alert("Please enter price, start, and end dates for the quote.");
            return;
        }

        fetch('/resubmitQuote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              quoteId: quoteId,
              newPrice: newPrice,
              newStart: newStart,
              newEnd: newEnd,
              note: note
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Quote successfully resubmitted. Status reset to pending for client.');
                const reqDiv = document.getElementById(`quote-price-${quoteId}`).closest('.pending-quote');
                if (reqDiv) reqDiv.remove();
            } else {
                alert("Error resubmitting quote: " + (data.error || "Unknown error"));
            }
        })
        .catch(err => console.error("Error resubmitting quote:", err));
    }

    function rejectQuote(quoteId) {
        const note = document.getElementById(`quote-note-${quoteId}`).value;

        if (!note.trim()) {
            alert("Please enter a note before rejecting.");
            return;
        }

        fetch('/rejectQuote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                quoteId,
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
              alert('Quote successfully rejected.');
                const reqDiv = document
                    .getElementById(`quote-price-${quoteId}`)
                    .closest('.pending-quote');
                if (reqDiv) reqDiv.remove();
            } else {
                alert("Error rejecting quote: " + (data.error || "Unknown error"));
            }
        })
        .catch(err => console.error("Error rejecting quote:", err));
    }

  function cancelQuote(quoteId) {
      const note = document.getElementById(`quote-note-${quoteId}`).value;

      if (!note.trim()) {
          alert("Please enter a note explaining the cancellation.");
          return;
      }

      fetch('/cancelQuote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              quoteId: quoteId,
              note: note,
          })
      })
      .then(res => res.json())
      .then(data => {
          if (data.success) {
              alert('Quote successfully cancelled.');
              // Remove the item from Anna's list after submission (if successful)
              const reqDiv = document.getElementById(`quote-price-${quoteId}`).closest('.pending-quote');
              if (reqDiv) reqDiv.remove();
          } else {
              alert("Error cancelling quote: " + (data.error || "Unknown error"));
          }
      })
      .catch(err => console.error("Error cancelling quote:", err));
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
                renderAnnaRequestUI(data.requests);
            });
            fetch('/pendingQuotes')
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
    .then(data => searchResultsTable(data['data'], ['bill_id', 'request_id', 'client_id', 'bill_amount', 'bill_status', 'due_date', 'payment_date', 'note']))
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
// Show the view order button
        tableHtml += `<td>${order_generated == 1 ?
            `<button class="view-order-btn" data-id="${request_id}">View Order</button>` : `<span>Service Order is Pending</span>`}</td>`;

        // Show View Bill AND Revise Bill buttons if generated
        if (bill_generated == 1) {
            tableHtml += `<td>
                <button class="view-bill-btn" data-id="${request_id}">View Bill</button>
                <button class="revise-order-btn" data-id="${request_id}" style="background-color: #ffc107; color: #000; margin-top: 5px;">Revise Bill</button>
            </td>`;
        } else {
            tableHtml += `<td><span>Service Bill is Pending</span></td>`;
        }
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

    // Attach event listeners to the REVISE bill buttons
    document.querySelectorAll('.revise-order-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const requestId = e.target.dataset.id;
            // We need to fetch the bill ID first because this table only has Request ID
            await initiateBillRevision(requestId);
        });
    });
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

    // Fetch the HTML Service Order template
    const orderTemplateRes = await fetch("service_order.html");
    let orderTemplate = await orderTemplateRes.text();

    // Write order data to the order template
    orderTemplate = orderTemplate
      .replace("{{generated_date}}", new Date().toLocaleDateString())
      .replace("{{request_id}}", service_req.request_id)
      .replace("{{agreement_date}}", new Date(service_req.quote_accept_date).toLocaleDateString())
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
      .replace("{{photos_section}}", service_req.photo_urls ? `<div class="section-title">Photo URLs</div><ul>${JSON.parse(service_req.photo_urls).map(u=>`<li>${u}</li>`).join('')}</ul>` : "");

    // Open the serivce order in a new tab
    const newTab = window.open("", "_blank");
    newTab.document.write(orderTemplate);
    newTab.document.close();
  } catch (err) {
    alert(`Error loading service request: ${err.message}`);
  }
}

// Function to process a service bill corresponding to a service request
async function viewServiceBill(requestId) {
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
    const billRes = await fetch(`http://localhost:5050/getBill/${requestId}`);
    const billData = await billRes.json();

    if (!billData.success) {
      alert("Failed to load bill details.");
      return;
    }

    const service_bill = billData.request;

    // Fetch Bill History
    const historyRes = await fetch(`http://localhost:5050/getBillHistory/${service_bill.bill_id}`);
    const historyData = await historyRes.json();

    let historyHTML = "";
    if (historyData.success && historyData.history.length > 0) historyHTML = buildBillHistoryHTML(historyData.history);

    // Fetch the HTML Service Bill template
    const billTemplateRes = await fetch("service_bill.html");
    let billTemplate = await billTemplateRes.text();

    // Write bill data to the bill template
    billTemplate = billTemplate
      .replace("{{generated_date}}", new Date().toLocaleDateString())
      .replace("{{bill_id}}", service_bill.bill_id)
      .replace("{{request_id}}", service_bill.request_id)
      .replace("{{bill_status}}", service_bill.bill_status)
      .replace("{{bill_amount}}", `$${Number(service_bill.bill_amount).toFixed(2)}`)
      .replace("{{due_date}}", new Date(service_bill.due_date).toLocaleDateString())
      .replace("{{payment_date}}", service_bill.payment_date || "Not Paid")
      .replaceAll("{{client_name}}", `${user_req.first_name} ${user_req.last_name}`)
      .replace("{{client_address}}", `${user_req.address_street}, ${user_req.address_city}, ${user_req.address_state} ${user_req.address_zip}`)
      .replace("{{client_phone}}", user_req.phone)
      .replace("{{client_email}}", user_req.email)
      .replace("{{service_address}}",
        `${service_req.service_address_street}, ${service_req.service_address_city}, ${service_req.service_address_state} ${service_req.service_address_zip}`)
      .replace("{{cleaning_type}}", service_req.cleaning_type)
      .replace("{{rooms}}", service_req.rooms)
      .replace("{{scheduled_date}}", new Date(service_req.preferred_date).toLocaleString())
      .replace("{{agreed_price}}", `$${Number(service_req.proposed_budget).toFixed(2)}`)
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

// Converts Bill History rows from the database to usable HTML when viewing a bill
function buildBillHistoryHTML(historyEntries) {
  let html = `<div class="section-title">Bill History</div><div class="history-container">`;

  historyEntries.forEach(entry => {
    html += `
      <div class="history-entry">
        <div><strong>${entry.responder_type}</strong> – ${new Date(entry.created_at).toLocaleString()}</div>
        <div><strong>New Amount:</strong> $${Number(entry.new_amount).toFixed(2)}</div>
        <div><strong>Note:</strong> ${entry.note || "—"}</div>
      </div>
    `;
  });

  html += `</div>`;
  return html;
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
                              <button onclick="renegotiateQuote(${req.quote_id}, ${req.quote_price})">Renegotiate</button>
                          </div>`;
        } else if (req.quote_status === 'accepted') {
            innerHTML += `<div style="color:green; margin-top:8px;">Quote accepted ✅</div>`;
        } else if (req.quote_status === 'rejected') {
            innerHTML += `<div style="color:red; margin-top:8px;">Quote rejected by Anna</div>`;
            innerHTML += `<button onclick="renegotiateQuote(${req.quote_id})">Renegotiate</button>`;
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
                          <button onclick="disputeBill(${bill.bill_id})">Dispute</button>
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

async function submitPay(billId) {
    const name = document.getElementById('pay-name').value.trim();
    const card = document.getElementById('pay-card').value.trim();
    const exp = document.getElementById('pay-exp').value.trim();
    const cvv = document.getElementById('pay-cvv').value.trim();
    const username = localStorage.getItem('loggedInUser');

    if (!name || !card || !exp || !cvv || !username) {
        alert("Please fill out all payment fields.");
        return;
    }

    closePayForm();

    try {
        const response = await fetch('/client/pay-bill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billId, username })
        });

        const data = await response.json();

        if (data.success) {
            alert("Payment successful! Reloading request list...");
            await clientLoadRequests(username); 
        } else {
            alert('Payment failed: ' + (data.error || 'Unknown error.'));
            await clientLoadRequests(username);
        }
    } catch (error) {
        console.error('Payment network error:', error);
        alert('A network error occurred during payment.');
    }
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

      // Determine buttons based on user type (Anna vs Client)
      let actionButtons = '';
      
      // Clients can Pay or Dispute if unpaid
      if (bill.bill_status !== 'Paid') {
          actionButtons += `<button class="pay-bill-btn" data-id="${bill.bill_id}">Pay</button>`;
          actionButtons += `<button class="dispute-bill-btn" data-id="${bill.bill_id}">Dispute</button>`;
      }
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

  // Attach handlers for Anna's Revise button
  billsList.querySelectorAll('.revise-bill-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const billId = e.target.dataset.id;
        const oldAmount = e.target.dataset.amount;
        await reviseBillUI(billId, oldAmount);
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

function renegotiateQuote(quoteId) {
    const note = prompt("Please enter a note explaining your counteroffer or request for renegotiation:");

    if (!note || note.trim() === "") {
        alert("Renegotiation requires a note.");
        return;
    }

    fetch('/renegotiateQuote', { 
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
            alert('Renegotiation submitted. Status set to "countered."');
        } else {
            alert("Error submitting renegotiation: " + (data.error || "Unknown error"));
        }
    })
    .catch(err => console.error("Error submitting renegotiation:", err));
}

// Function to allow Anna to revise a bill amount and add a note
async function reviseBillUI(billId, oldAmount) {
    const newAmount = prompt(`Enter new bill amount (Current: $${oldAmount}):`, oldAmount);
    // Ensure the new amount is a valid number
    if (newAmount === null || isNaN(Number(newAmount)) || Number(newAmount) <= 0) {
        if (newAmount !== null) alert("Invalid amount entered. Revision cancelled.");
        return; 
    } 

    const note = prompt("Enter a note for this revision (e.g., Discount applied):");
    if (note === null) return; // Cancelled

    try {
        const res = await fetch('/reviseBill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billId, newAmount: Number(newAmount).toFixed(2), note })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert('Bill revised successfully.');
            // Refresh Anna's dashboard view
            fetch('http://localhost:5050/listServiceOrders')
            .then(response => response.json())
            .then(result => serviceOrdersList(result.data))
            .catch(err => console.error(err));
        } else {
            alert('Revision error: ' + (data.error || 'Unknown'));
        }
    } catch (err) {
        console.error(err);
        alert('Failed to submit revision.');
    }
}

// Fetches bill details for a request, then opens the Revision UI
async function initiateBillRevision(requestId) {
    try {
        // Use your existing endpoint to get the bill details
        const response = await fetch(`http://localhost:5050/getBill/${requestId}`);
        const data = await response.json();

        if (!data.success) {
            alert("Could not find bill details. The bill may not exist yet.");
            return;
        }

        const bill = data.request; // Contains bill_id and bill_amount
        
        // Pass bill_id and current amount to the revision prompt
        await reviseBillUI(bill.bill_id, bill.bill_amount);

    } catch (err) {
        console.error("Error fetching bill for revision:", err);
        alert("Failed to initiate revision. Check console for network errors if this persists.");
    }
}