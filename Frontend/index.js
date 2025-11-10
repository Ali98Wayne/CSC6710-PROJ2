document.addEventListener("DOMContentLoaded", function() {
    const inputFields = document.querySelectorAll("input");
    inputFields.forEach(input => input.value = ""); // Clear all input fields on page reload
    document.getElementById('signup-creditcard-month').selectedIndex = 0; // Set the default month to January on page reload
    document.getElementById('signup-address-state').selectedIndex = 0; // Set the default month to January on page reload

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

        if (!first_name || !last_name || !address || !address_city || !address_state || !address_zip || !phone || !email || !card_num || !card_month || 
            !card_year || !card_cvv || !username || !password) {
            alert("Please fill out all fields.");
            return;
        }

        fetch("http://localhost:5050/addUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, first_name, last_name, address, address_city, address_state, address_zip, phone, 
                email, card_num, card_month, card_year, card_cvv })
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
                document.querySelector("#signup-creditcard-month").value = "";
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

    // Show/hide the profile section based on user login status, hide logout button by default
    function updateUI() {
        const currentUser = localStorage.getItem("loggedInUser");
        const authSection = document.querySelector("#auth-section");
        const profileSection = document.querySelector("#profile-section");
        const profileName = document.querySelector("#profile-name");
        const serviceRequest = document.querySelector("#service-request");

        if (currentUser) {
            authSection.style.display = "none"; // Hide Sign Up & Login sections when logged in
            profileSection.style.display = "flex"; // Show the profile section (with a flex display style)
            profileName.textContent = currentUser; // Set the profile name in the profile section to the logged in username
            logoutBtn.style.display = "none"; // Hide the logout button by default when logged in
            serviceRequest.style.display = "block"; // Show the service request when logged in
        } else {
            authSection.style.display = "block"; // Show Sign Up & Login section when not logged in
            profileSection.style.display = "none"; // Hide the profile section
            serviceRequest.style.display = "none" // Hide the service request when not logged in
            inputFields.forEach(input => input.value = ""); // Clear all input fields when not logged in
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

    const addPhotoButton = document.getElementById('add-photo-button');
    const photoFields = document.getElementById('photo-fields');
    let photoNum = 0;
    const photosMax = 5;

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
        const photo_urls = Array.from(document.querySelectorAll('.photo-field input')).map(inp => inp.value.trim())

        if (!requestAddress || !requestAddressCity || !requestAddressState || !requestAddressZip || 
            !requestCleaningType || !requestRoomAmount || !requestDateTime || !requestBudget) {
            alert("Please fill out all fields.");
            return;
        }

        fetch("http://localhost:5050/addServiceRequest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, requestAddress, requestAddressCity, requestAddressState, requestAddressZip, requestCleaningType,
                requestRoomAmount, requestDateTime, requestBudget, requestNotes, photo_urls : photo_urls ? JSON.stringify(photo_urls) : null})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Service Request Sent!");
                document.querySelector("#service-address").value = "";
                document.querySelector("#service-address-city").value = "";
                document.querySelector("#service-address-state").value = "";
                document.querySelector("#service-address-zip").value = "";
                document.querySelector("#room-amount").value = "";
                document.querySelector("#preferred-date-time").value = "";
                document.querySelector("#proposed-budget").value = "";
                document.querySelector("#notes").value = "";
            } else alert("Error: " + (data.error || "Unknown error"));
        })
        .catch(err => console.error("Request Service Error:", err));
    });
});