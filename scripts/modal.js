document.addEventListener("DOMContentLoaded", () => {
    const modals = document.querySelectorAll(".modal");
    const closeModalButtons = document.querySelectorAll(".modal-close");
    const body = document.body;

    /**
     * Open a modal by ID
     * @param {string} modalId - The ID of the modal to open
     */
    function openModal(modalId) {
        const modal = document.querySelector(modalId);
        if (modal) {
            modal.style.display = "block";
            setTimeout(() => {
                modal.classList.add("show");
                body.classList.add("modal-open");
            }, 10);
        } else {
            console.error(`Modal with ID "${modalId}" not found.`);
        }
    }

    /**
     * Close all modals
     */
    function closeAllModals() {
        modals.forEach(modal => {
            modal.classList.remove("show");
            setTimeout(() => {
                modal.style.display = "none";
                body.classList.remove("modal-open");
            }, 300);
        });
    }

    /**
     * Close modal when clicking outside the content
     */
    modals.forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeAllModals();
            }
        });
    });

    /**
     * Add event listeners to close buttons
     */
    closeModalButtons.forEach(button => {
        button.addEventListener("click", closeAllModals);
    });

    // Login Modal
    const loginForm = document.getElementById("login-form");
    const loginModal = document.getElementById("login-modal");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            // Fetch input values
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            // Simulated user data (for demonstration purposes)
            const users = JSON.parse(localStorage.getItem("users")) || [
                { email: "test@example.com", password: "password123" }
            ];

            // Check for valid credentials
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                alert("Login successful!");
                closeAllModals();
            } else {
                alert("Invalid email or password. Please try again.");
            }
        });
    }

    // Register Modal (Optional Registration Handling)
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = document.getElementById("register-name").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            // Save new user
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const userExists = users.some(user => user.email === email);

            if (userExists) {
                alert("This email is already registered.");
            } else {
                users.push({ name, email, password });
                localStorage.setItem("users", JSON.stringify(users));
                alert("Registration successful! You can now log in.");
                closeAllModals();
            }
        });
    }

    // Add Expense Modal
    const openAddExpenseModalButton = document.querySelector(".open-add-expense-modal");
    if (openAddExpenseModalButton) {
        openAddExpenseModalButton.addEventListener("click", () => {
            openModal("#expense-modal");
        });
    }

    // Edit Trip Modal
    const openEditTripModalButtons = document.querySelectorAll(".open-edit-modal");
    if (openEditTripModalButtons.length > 0) {
        openEditTripModalButtons.forEach(button => {
            button.addEventListener("click", event => {
                const tripId = event.target.dataset.id;
                populateEditTripModal(tripId);
                openModal("#edit-trip-modal");
            });
        });
    }

    // Populate the Edit Trip Modal
    function populateEditTripModal(tripId) {
        const trips = JSON.parse(localStorage.getItem("trips")) || [];
        const trip = trips.find(trip => trip.id === parseInt(tripId));

        if (trip) {
            document.getElementById("edit-trip-name").value = trip.name;
            document.getElementById("edit-trip-year").value = trip.year;
            document.getElementById("edit-trip-currency").value = trip.currency;
        } else {
            console.error(`Trip with ID "${tripId}" not found.`);
        }
    }

    // Delete Trip Modal
    const openDeleteTripModalButtons = document.querySelectorAll(".open-delete-modal");
    if (openDeleteTripModalButtons.length > 0) {
        openDeleteTripModalButtons.forEach(button => {
            button.addEventListener("click", event => {
                const tripId = event.target.dataset.id;
                document.getElementById("confirm-delete").dataset.id = tripId;
                openModal("#delete-trip-modal");
            });
        });
    }

    // Confirm Delete Trip
    const confirmDeleteButton = document.getElementById("confirm-delete");
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener("click", () => {
            const tripId = confirmDeleteButton.dataset.id;
            deleteTrip(tripId);
            closeAllModals();
        });
    }

    // Delete a trip by ID
    function deleteTrip(tripId) {
        let trips = JSON.parse(localStorage.getItem("trips")) || [];
        trips = trips.filter(trip => trip.id !== parseInt(tripId));
        localStorage.setItem("trips", JSON.stringify(trips));
        alert("Trip deleted successfully!");
        location.reload();
    }
});
