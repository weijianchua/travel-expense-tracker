document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("history-list");
    const editTripForm = document.getElementById("edit-trip-form");
    const confirmDeleteButton = document.getElementById("confirm-delete");

    const defaultCurrency = "SGD"; // Replace with user's selected default currency
    const exchangeRates = { USD: 0.74, JPY: 80, SGD: 1 }; // Mock exchange rates

    /**
     * Load trips from localStorage and render them to the DOM.
     */
    function loadTrips() {
        const trips = JSON.parse(localStorage.getItem("trips")) || [];
        historyList.innerHTML = "";

        if (trips.length === 0) {
            historyList.innerHTML = "<p>No past trips found.</p>";
            return;
        }

        trips.forEach((trip) => {
            const tripExpenses = calculateExpenses(trip.expenses, trip.currency);
            const tripItem = document.createElement("div");
            tripItem.className = "trip-item";
            tripItem.dataset.id = trip.id;
            tripItem.innerHTML = `
                <h3>${trip.name} (${trip.year})</h3>
                <p>Total Expenses: ${tripExpenses.totalTripCurrency} ${trip.currency} (${tripExpenses.totalDefaultCurrency} ${defaultCurrency})</p>
                <p>
                    <button class="btn btn-primary open-edit-modal" data-id="${trip.id}">Edit</button>
                    <button class="btn btn-danger open-delete-modal" data-id="${trip.id}">Delete</button>
                </p>
            `;
            historyList.appendChild(tripItem);
        });

        // Attach event listeners for edit and delete buttons after rendering trips
        attachEventListeners();
    }

    /**
     * Calculate total expenses for a trip.
     * @param {Array} expenses - The list of expenses for the trip.
     * @param {string} currency - The currency of the trip.
     * @returns {Object} - Total expenses in trip and default currency.
     */
    function calculateExpenses(expenses, currency) {
        let totalTripCurrency = 0;
        let totalDefaultCurrency = 0;

        expenses.forEach((expense) => {
            totalTripCurrency += expense.amount;
            totalDefaultCurrency += convertCurrency(expense.amount, currency);
        });

        return {
            totalTripCurrency: totalTripCurrency.toFixed(2),
            totalDefaultCurrency: totalDefaultCurrency.toFixed(2),
        };
    }

    /**
     * Convert an amount from trip currency to default currency.
     * @param {number} amount - The amount in the trip's currency.
     * @param {string} currency - The currency of the trip.
     * @returns {number} - The equivalent amount in default currency.
     */
    function convertCurrency(amount, currency) {
        return (amount / exchangeRates[currency]) * exchangeRates[defaultCurrency];
    }

    /**
     * Populate the Edit Trip Modal with data for the selected trip.
     * @param {string} tripId - The ID of the trip to edit.
     */
    function populateEditTripModal(tripId) {
        const trips = JSON.parse(localStorage.getItem("trips")) || [];
        const trip = trips.find((trip) => trip.id === parseInt(tripId));

        if (trip) {
            editTripForm.dataset.id = trip.id;
            document.getElementById("edit-trip-name").value = trip.name;
            document.getElementById("edit-trip-year").value = trip.year;
            document.getElementById("edit-trip-currency").value = trip.currency;
        } else {
            alert("Trip not found.");
        }
    }

    /**
     * Save changes to the trip after editing.
     */
    editTripForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const tripId = parseInt(editTripForm.dataset.id);
        const trips = JSON.parse(localStorage.getItem("trips")) || [];
        const tripIndex = trips.findIndex((trip) => trip.id === tripId);

        if (tripIndex > -1) {
            trips[tripIndex].name = document.getElementById("edit-trip-name").value;
            trips[tripIndex].year = parseInt(document.getElementById("edit-trip-year").value);
            trips[tripIndex].currency = document.getElementById("edit-trip-currency").value;

            localStorage.setItem("trips", JSON.stringify(trips));
            alert("Trip updated successfully!");
            closeAllModals();
            loadTrips();
        } else {
            alert("Error: Trip not found.");
        }
    });

    /**
     * Confirm and delete a trip.
     */
    confirmDeleteButton.addEventListener("click", () => {
        const tripId = parseInt(confirmDeleteButton.dataset.id);
        let trips = JSON.parse(localStorage.getItem("trips")) || [];
        trips = trips.filter((trip) => trip.id !== tripId);

        localStorage.setItem("trips", JSON.stringify(trips));
        alert("Trip deleted successfully!");
        closeAllModals();
        loadTrips();
    });

    /**
     * Attach event listeners for Edit and Delete buttons dynamically.
     */
    function attachEventListeners() {
        const editButtons = document.querySelectorAll(".open-edit-modal");
        const deleteButtons = document.querySelectorAll(".open-delete-modal");

        editButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                const tripId = event.target.dataset.id;
                populateEditTripModal(tripId);
                openModal("#edit-trip-modal");
            });
        });

        deleteButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                const tripId = event.target.dataset.id;
                confirmDeleteButton.dataset.id = tripId;
                openModal("#delete-trip-modal");
            });
        });
    }

    /**
     * Open a modal by ID.
     * @param {string} modalId - The ID of the modal to open.
     */
    function openModal(modalId) {
        const modal = document.querySelector(modalId);
        if (modal) {
            modal.style.display = "block";
            setTimeout(() => {
                modal.classList.add("show");
                document.body.classList.add("modal-open");
            }, 10);
        } else {
            console.error(`Modal with ID "${modalId}" not found.`);
        }
    }

    /**
     * Close all modals.
     */
    function closeAllModals() {
        const modals = document.querySelectorAll(".modal");
        modals.forEach((modal) => {
            modal.classList.remove("show");
            setTimeout(() => {
                modal.style.display = "none";
                document.body.classList.remove("modal-open");
            }, 300);
        });
    }

    // Load trips on page load
    loadTrips();
});
