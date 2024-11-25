document.addEventListener("DOMContentLoaded", () => {
    const trips = JSON.parse(localStorage.getItem("trips")) || [];
    const currentTripId = localStorage.getItem("currentTripId");
    const currentPage = document.body.getAttribute("data-page");

    // Add a "Home" navigation link to all pages
    const homeLink = document.createElement("a");
    homeLink.href = "index.html";
    homeLink.textContent = "Home";
    homeLink.className = "home-link";
    document.body.appendChild(homeLink);

    if (currentPage === "create-trip") {
        handleCreateTripPage();
    } else if (currentPage === "current-trip") {
        handleCurrentTripPage(trips, currentTripId);
    } else if (currentPage === "history") {
        handleHistoryPage(trips);
    }

    // Handle Create Trip Page
    function handleCreateTripPage() {
        const createTripForm = document.getElementById("create-trip-form");
        const yearInput = document.getElementById("trip-year");

        // Set default year to the current year
        yearInput.value = new Date().getFullYear();

        createTripForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("trip-name").value.trim();
            const year = document.getElementById("trip-year").value;
            const currency = document.getElementById("currency").value;

            if (!name) {
                alert("Please enter a valid trip name.");
                return;
            }

            const newTrip = {
                id: Date.now(),
                name,
                year,
                currency,
                createdAt: new Date().toISOString(),
                expenses: [],
            };

            trips.push(newTrip);
            localStorage.setItem("trips", JSON.stringify(trips));
            localStorage.setItem("currentTripId", newTrip.id);

            showNotification("Trip created successfully!");
            setTimeout(() => window.location.href = "current-trip.html", 3000);
        });
    }

    // Handle Current Trip Page
    function handleCurrentTripPage(trips, currentTripId) {
        const currentTripDropdown = document.getElementById("current-trip-dropdown");
        const currentTripDetails = document.getElementById("current-trip-details");
        const expenseList = document.getElementById("expense-items");
        const expenseModal = document.getElementById("expense-modal");
        const addExpenseBtn = document.getElementById("add-expense-btn");
        const closeModalBtn = document.getElementById("close-expense-modal");
        const expenseForm = document.getElementById("expense-form");

        let selectedTrip = trips.find((trip) => trip.id == currentTripId);

        if (!selectedTrip) {
            currentTripDetails.innerHTML = "<p>No trip selected. Please create or select a trip.</p>";
            return;
        }

        // Populate dropdown
        trips.forEach((trip) => {
            const option = document.createElement("option");
            option.value = trip.id;
            option.textContent = `${trip.name} (${trip.year})`;
            if (trip.id == currentTripId) option.selected = true;
            currentTripDropdown.appendChild(option);
        });

        // Display trip details
        const displayTripDetails = (trip) => {
            currentTripDetails.innerHTML = `
                <h2>${trip.name} (${trip.year})</h2>
                <p>Currency: ${trip.currency}</p>
            `;
        };

        displayTripDetails(selectedTrip);

        // Load expenses
        const loadExpenses = () => {
            expenseList.innerHTML = "";
            const expenses = selectedTrip.expenses || [];
            expenses.forEach((expense, index) => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <div>
                        <p><strong>${expense.description}</strong></p>
                        <p>${expense.amount} ${selectedTrip.currency}</p>
                        <p>${expense.alternateAmount ? `${expense.alternateAmount}` : "N/A"}</p>
                        <p>${expense.paymentMethod} - ${expense.category}</p>
                    </div>
                    <div class="action-buttons">
                        <button class="btn edit-expense" data-index="${index}">Edit</button>
                        <button class="btn btn-secondary delete-expense" data-index="${index}">Delete</button>
                    </div>
                `;
                expenseList.appendChild(li);
            });
        };

        loadExpenses();

        // Open modal to add expense
        addExpenseBtn.addEventListener("click", () => {
            expenseModal.classList.add("show");
        });

        // Close modal
        closeModalBtn.addEventListener("click", () => {
            expenseModal.classList.remove("show");
        });

        // Add expense
        expenseForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const description = document.getElementById("expense-description").value.trim();
            const amount = parseFloat(document.getElementById("expense-amount").value);
            const alternateAmount = parseFloat(document.getElementById("alternate-amount").value) || null;
            const paymentMethod = document.getElementById("payment-method").value;
            const category = document.getElementById("expense-category").value;

            if (!description || isNaN(amount)) {
                alert("Please enter valid expense details.");
                return;
            }

            const newExpense = { description, amount, alternateAmount, paymentMethod, category };

            selectedTrip.expenses = selectedTrip.expenses || [];
            selectedTrip.expenses.push(newExpense);

            localStorage.setItem("trips", JSON.stringify(trips));
            loadExpenses();
            expenseForm.reset();
            expenseModal.classList.remove("show");
        });

        // Edit/Delete Expense
        expenseList.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index, 10);

            if (e.target.classList.contains("edit-expense")) {
                const expense = selectedTrip.expenses[index];
                if (expense) {
                    document.getElementById("expense-description").value = expense.description;
                    document.getElementById("expense-amount").value = expense.amount;
                    document.getElementById("alternate-amount").value = expense.alternateAmount || "";
                    document.getElementById("payment-method").value = expense.paymentMethod;
                    document.getElementById("expense-category").value = expense.category;

                    expenseModal.classList.add("show");

                    expenseForm.onsubmit = (e) => {
                        e.preventDefault();
                        expense.description = document.getElementById("expense-description").value.trim();
                        expense.amount = parseFloat(document.getElementById("expense-amount").value);
                        expense.alternateAmount = parseFloat(document.getElementById("alternate-amount").value) || null;
                        expense.paymentMethod = document.getElementById("payment-method").value;
                        expense.category = document.getElementById("expense-category").value;

                        localStorage.setItem("trips", JSON.stringify(trips));
                        loadExpenses();
                        expenseModal.classList.remove("show");
                        expenseForm.onsubmit = null; // Reset the form handler
                    };
                }
            }

            if (e.target.classList.contains("delete-expense")) {
                selectedTrip.expenses.splice(index, 1);
                localStorage.setItem("trips", JSON.stringify(trips));
                loadExpenses();
            }
        });

        // Update selected trip when dropdown changes
        currentTripDropdown.addEventListener("change", (e) => {
            const selectedId = e.target.value;
            localStorage.setItem("currentTripId", selectedId);
            location.reload();
        });
    }

    // Handle History Page
    function handleHistoryPage(trips) {
        const historyContainer = document.getElementById("history-container");

        if (trips.length === 0) {
            historyContainer.innerHTML = "<p>No trips recorded yet.</p>";
            return;
        }

        trips.forEach((trip) => {
            const tripDiv = document.createElement("div");
            tripDiv.classList.add("trip-card");
            tripDiv.innerHTML = `
                <h3>${trip.name} (${trip.year})</h3>
                <p>Currency: ${trip.currency}</p>
                <p>Created At: ${new Date(trip.createdAt).toLocaleString()}</p>
            `;
            historyContainer.appendChild(tripDiv);
        });
    }

    // Show Notification Banner
    function showNotification(message) {
        const banner = document.createElement("div");
        banner.className = "notification-banner";
        banner.textContent = message;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 3000);
    }
});
