document.addEventListener("DOMContentLoaded", () => {
    const tripDropdown = document.getElementById("trip-dropdown");
    const tripNameElement = document.getElementById("trip-name").querySelector("span");
    const tripYearElement = document.getElementById("trip-year").querySelector("span");
    const tripCurrencyElement = document.getElementById("trip-currency").querySelector("span");
    const totalExpensesElement = document.getElementById("total-expenses").querySelector("span");
    const expensesContainer = document.getElementById("expenses");
    const expenseForm = document.getElementById("expense-form");
    const expenseModal = document.getElementById("expense-modal");

    // Fetch trips from localStorage
    function fetchTrips() {
        return JSON.parse(localStorage.getItem("trips")) || [];
    }

    // Save trips to localStorage
    function saveTrips(trips) {
        localStorage.setItem("trips", JSON.stringify(trips));
    }

    // Populate trip dropdown
    function populateTripDropdown(trips) {
        tripDropdown.innerHTML = ""; // Clear existing options
        trips.forEach(trip => {
            const option = document.createElement("option");
            option.value = trip.id;
            option.textContent = `${trip.name} (${trip.year})`;
            tripDropdown.appendChild(option);
        });
    }

    // Render selected trip details
    function renderTripDetails(trip) {
        if (!trip) return;

        tripNameElement.textContent = trip.name;
        tripYearElement.textContent = trip.year;
        tripCurrencyElement.textContent = trip.currency;
        totalExpensesElement.textContent = calculateTotalExpenses(trip.expenses, trip.currency);
        renderExpenses(trip.expenses, trip.currency);
    }

    // Calculate total expenses for a trip
    function calculateTotalExpenses(expenses, currency) {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        return `${currency} ${total.toFixed(2)}`;
    }

    // Render expenses for the selected trip
    function renderExpenses(expenses, currency) {
        expensesContainer.innerHTML = ""; // Clear previous content
        if (expenses.length === 0) {
            expensesContainer.innerHTML = "<p>No expenses added yet. Start by adding an expense!</p>";
            return;
        }

        expenses.forEach(expense => {
            const expenseElement = document.createElement("div");
            expenseElement.classList.add("expense-item");
            expenseElement.innerHTML = `
                <p>${expense.date} - ${expense.category}</p>
                <p>${expense.description}</p>
                <p>${currency} ${expense.amount.toFixed(2)} (${expense.paymentMethod})</p>
                <button class="btn btn-secondary edit-expense" data-id="${expense.id}">Edit</button>
                <button class="btn btn-primary delete-expense" data-id="${expense.id}">Delete</button>
            `;
            expensesContainer.appendChild(expenseElement);
        });

        attachExpenseEventListeners();
    }

    // Attach event listeners to edit and delete buttons for expenses
    function attachExpenseEventListeners() {
        const editButtons = document.querySelectorAll(".edit-expense");
        const deleteButtons = document.querySelectorAll(".delete-expense");

        editButtons.forEach(button => {
            button.addEventListener("click", () => {
                const expenseId = button.dataset.id;
                populateExpenseForm(expenseId);
                openModal("#expense-modal");
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener("click", () => {
                const expenseId = button.dataset.id;
                deleteExpense(expenseId);
            });
        });
    }

    // Populate the expense form for editing
    function populateExpenseForm(expenseId) {
        const trips = fetchTrips();
        const selectedTripId = parseInt(tripDropdown.value);
        const selectedTrip = trips.find(trip => trip.id === selectedTripId);
        const expense = selectedTrip.expenses.find(exp => exp.id === parseInt(expenseId));

        if (expense) {
            document.getElementById("expense-date").value = expense.date;
            document.getElementById("expense-category").value = expense.category;
            document.getElementById("expense-description").value = expense.description;
            document.getElementById("expense-amount").value = expense.amount;
            document.getElementById("payment-method").value = expense.paymentMethod;
            expenseForm.dataset.id = expense.id; // Store expense ID for editing
        }
    }

    // Handle form submission for adding or editing an expense
    expenseForm.addEventListener("submit", event => {
        event.preventDefault();

        const trips = fetchTrips();
        const selectedTripId = parseInt(tripDropdown.value);
        const selectedTrip = trips.find(trip => trip.id === selectedTripId);

        const expenseId = expenseForm.dataset.id ? parseInt(expenseForm.dataset.id) : Date.now();
        const expense = {
            id: expenseId,
            date: document.getElementById("expense-date").value,
            category: document.getElementById("expense-category").value,
            description: document.getElementById("expense-description").value,
            amount: parseFloat(document.getElementById("expense-amount").value),
            paymentMethod: document.getElementById("payment-method").value
        };

        if (expenseForm.dataset.id) {
            // Edit existing expense
            const expenseIndex = selectedTrip.expenses.findIndex(exp => exp.id === expenseId);
            selectedTrip.expenses[expenseIndex] = expense;
        } else {
            // Add new expense
            selectedTrip.expenses.push(expense);
        }

        saveTrips(trips);
        renderTripDetails(selectedTrip);
        closeAllModals();
        alert("Expense saved successfully!");
        expenseForm.reset();
        delete expenseForm.dataset.id; // Clear stored ID
    });

    // Delete an expense
    function deleteExpense(expenseId) {
        const trips = fetchTrips();
        const selectedTripId = parseInt(tripDropdown.value);
        const selectedTrip = trips.find(trip => trip.id === selectedTripId);

        selectedTrip.expenses = selectedTrip.expenses.filter(exp => exp.id !== parseInt(expenseId));
        saveTrips(trips);
        renderTripDetails(selectedTrip);
        alert("Expense deleted successfully!");
    }

    // Handle trip selection change
    tripDropdown.addEventListener("change", () => {
        const trips = fetchTrips();
        const selectedTripId = parseInt(tripDropdown.value);
        const selectedTrip = trips.find(trip => trip.id === selectedTripId);
        renderTripDetails(selectedTrip);
    });

    // Initialize the page
    const trips = fetchTrips();
    populateTripDropdown(trips);
    if (trips.length > 0) {
        renderTripDetails(trips[0]); // Render the first trip by default
    }
});
