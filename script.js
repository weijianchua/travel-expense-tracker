document.addEventListener("DOMContentLoaded", () => {
    const trips = JSON.parse(localStorage.getItem("trips")) || [];
    const currentTripId = localStorage.getItem("currentTripId");
    const currentPage = document.body.getAttribute("data-page");
    const defaultCurrency = localStorage.getItem("defaultCurrency") || "SGD";

    // Add "Home" navigation link to all pages
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
    } else if (currentPage === "settings") {
        handleSettingsPage();
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

            // Create new trip object
            const newTrip = {
                id: Date.now(),
                name,
                year,
                currency,
                createdAt: new Date().toISOString(),
                expenses: [],
            };

            // Add the new trip
            trips.push(newTrip);

            // Save updated trips to localStorage
            localStorage.setItem("trips", JSON.stringify(trips));

            // Update current trip ID
            localStorage.setItem("currentTripId", newTrip.id);

            // Redirect to the current trip page
            window.location.href = "current-trip.html";
        });
    }

    // Handle Current Trip Page
    function handleCurrentTripPage(trips, currentTripId) {
        const currentTripDropdown = document.getElementById("current-trip-dropdown");
        const currentTripDetails = document.getElementById("current-trip-details");
        const expenseList = document.getElementById("expense-items");
        const totalSpent = document.getElementById("total-spent");
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

        currentTripDropdown.addEventListener("change", (e) => {
            const selectedId = e.target.value;
            localStorage.setItem("currentTripId", selectedId);
            location.reload();
        });

        // Display trip details
        const displayTripDetails = (trip) => {
            currentTripDetails.innerHTML = `
                <h2>${trip.name} (${trip.year})</h2>
                <p>Currency: ${trip.currency}</p>
            `;
        };

        displayTripDetails(selectedTrip);

        // Load expenses for the selected trip
        const loadExpenses = () => {
            expenseList.innerHTML = "";
            let total = 0;
            const expensesByDate = selectedTrip.expenses.reduce((group, expense) => {
                const date = expense.date || "Unknown Date";
                group[date] = group[date] || [];
                group[date].push(expense);
                total += expense.amount;
                return group;
            }, {});

            totalSpent.textContent = `Total Spent: ${total.toFixed(2)} ${selectedTrip.currency}`;

            Object.keys(expensesByDate).forEach((date) => {
                const dateHeader = document.createElement("h3");
                dateHeader.textContent = date;
                expenseList.appendChild(dateHeader);

                expensesByDate[date].forEach((expense, index) => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        <div>
                            <p><strong>${expense.description}</strong></p>
                            <p>${expense.amount.toFixed(2)} ${selectedTrip.currency} (${defaultCurrency})</p>
                            <p>${expense.paymentMethod} - ${expense.category}</p>
                        </div>
                        <div class="action-buttons">
                            <button class="btn edit-expense" data-index="${index}" data-date="${date}">Edit</button>
                            <button class="btn btn-secondary delete-expense" data-index="${index}" data-date="${date}">Delete</button>
                        </div>
                    `;
                    expenseList.appendChild(li);
                });
            });
        };

        loadExpenses();

        // Add expense modal handling
        addExpenseBtn.addEventListener("click", () => {
            expenseModal.classList.add("show");
        });

        closeModalBtn.addEventListener("click", () => {
            expenseModal.classList.remove("show");
        });

        expenseForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const description = document.getElementById("expense-description").value.trim();
            const amount = parseFloat(document.getElementById("expense-amount").value);
            const date = document.getElementById("expense-date").value;
            const paymentMethod = document.getElementById("payment-method").value;
            const category = document.getElementById("expense-category").value;

            if (!description || isNaN(amount) || !date) {
                alert("Please enter valid expense details.");
                return;
            }

            const newExpense = { description, amount, date, paymentMethod, category };

            selectedTrip.expenses.push(newExpense);
            localStorage.setItem("trips", JSON.stringify(trips));
            loadExpenses();
            expenseModal.classList.remove("show");
            expenseForm.reset();
        });

        // Edit/Delete Expense
        expenseList.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            const date = e.target.dataset.date;

            if (e.target.classList.contains("edit-expense")) {
                const expense = selectedTrip.expenses.filter((exp) => exp.date === date)[index];
                if (expense) {
                    document.getElementById("expense-description").value = expense.description;
                    document.getElementById("expense-amount").value = expense.amount;
                    document.getElementById("expense-date").value = expense.date;
                    document.getElementById("payment-method").value = expense.paymentMethod;
                    document.getElementById("expense-category").value = expense.category;

                    expenseModal.classList.add("show");

                    expenseForm.onsubmit = (e) => {
                        e.preventDefault();
                        expense.description = document.getElementById("expense-description").value.trim();
                        expense.amount = parseFloat(document.getElementById("expense-amount").value);
                        expense.date = document.getElementById("expense-date").value;
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
                selectedTrip.expenses = selectedTrip.expenses.filter((exp, i) => !(exp.date === date && i === index));
                localStorage.setItem("trips", JSON.stringify(trips));
                loadExpenses();
            }
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
            const totalExpense = trip.expenses.reduce((total, expense) => total + expense.amount, 0);

            const tripCard = document.createElement("div");
            tripCard.classList.add("trip-card");
            tripCard.innerHTML = `
                <h3>${trip.name} (${trip.year})</h3>
                <p>Currency: <strong>${trip.currency}</strong></p>
                <p>Total Expenses: <span class="total-expenses">${totalExpense.toFixed(2)} ${trip.currency}</span></p>
                <p>In Default Currency: <span class="total-expenses">${(totalExpense * currencyConversionRate(trip.currency, defaultCurrency)).toFixed(2)} ${defaultCurrency}</span></p>
                <p>Created At: ${new Date(trip.createdAt).toLocaleString()}</p>
            `;
            historyContainer.appendChild(tripCard);
        });
    }

    // Mocked currency conversion rate function
    function currencyConversionRate(fromCurrency, toCurrency) {
        const rates = {
            "SGD": 1,
            "USD": 0.74,
            "EUR": 0.69,
            "JPY": 80,
        };

        return rates[toCurrency] / rates[fromCurrency];
    }

    // Handle Settings Page
    function handleSettingsPage() {
        const themeToggle = document.getElementById("theme-toggle");
        const currencySelect = document.getElementById("default-currency");

        // Set initial theme and currency
        themeToggle.checked = document.body.classList.contains("dark-mode");
        currencySelect.value = defaultCurrency;

        themeToggle.addEventListener("change", () => {
            if (themeToggle.checked) {
                document.body.classList.add("dark-mode");
            } else {
                document.body.classList.remove("dark-mode");
            }
        });

        currencySelect.addEventListener("change", () => {
            const selectedCurrency = currencySelect.value;
            localStorage.setItem("defaultCurrency", selectedCurrency);
        });
    }
});
