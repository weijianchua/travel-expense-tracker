document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("history-list");
    const editTripModal = document.getElementById("edit-trip-modal");
    const deleteTripModal = document.getElementById("delete-trip-modal");
    const editTripForm = document.getElementById("edit-trip-form");
    const confirmDeleteButton = document.getElementById("confirm-delete");

    // Fetch trips from localStorage
    function fetchTrips() {
        return JSON.parse(localStorage.getItem("trips")) || [];
    }

    // Save trips to localStorage
    function saveTrips(trips) {
        localStorage.setItem("trips", JSON.stringify(trips));
    }

    // Render trip history
    function renderTrips() {
        const trips = fetchTrips();
        historyList.innerHTML = ""; // Clear existing content

        if (trips.length === 0) {
            historyList.innerHTML = "<p>No trips found. Create a trip to get started!</p>";
            return;
        }

        trips.forEach(trip => {
            const tripElement = document.createElement("div");
            tripElement.classList.add("trip-item");
            tripElement.innerHTML = `
                <h3>${trip.name} (${trip.year})</h3>
                <p>Total Expenses: ${trip.currency} ${calculateTotalExpenses(trip.expenses)}</p>
                <button class="btn btn-secondary open-edit-modal" data-id="${trip.id}">Edit</button>
                <button class="btn btn-primary open-delete-modal" data-id="${trip.id}">Delete</button>
            `;
            historyList.appendChild(tripElement);
        });

        attachModalEvents();
    }

    // Calculate total expenses for a trip
    function calculateTotalExpenses(expenses) {
        return expenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2);
    }

    // Attach events to Edit and Delete buttons
    function attachModalEvents() {
        const editButtons = document.querySelectorAll(".open-edit-modal");
        const deleteButtons = document.querySelectorAll(".open-delete-modal");

        editButtons.forEach(button => {
            button.addEventListener("click", () => {
                const tripId = button.dataset.id;
                populateEditModal(tripId);
                openModal("#edit-trip-modal");
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener("click", () => {
                const tripId = button.dataset.id;
                confirmDeleteButton.dataset.id = tripId; // Pass ID to confirm button
                openModal("#delete-trip-modal");
            });
        });
    }

    // Populate the Edit Trip Modal with trip data
    function populateEditModal(tripId) {
        const trips = fetchTrips();
        const trip = trips.find(trip => trip.id === parseInt(tripId));

        if (trip) {
            document.getElementById("edit-trip-name").value = trip.name;
            document.getElementById("edit-trip-year").value = trip.year;
            document.getElementById("edit-trip-currency").value = trip.currency;
            editTripForm.dataset.id = tripId; // Store the trip ID in the form
        } else {
            console.error(`Trip with ID "${tripId}" not found.`);
        }
    }

    // Handle editing a trip
    editTripForm.addEventListener("submit", event => {
        event.preventDefault();

        const tripId = parseInt(editTripForm.dataset.id);
        const tripName = document.getElementById("edit-trip-name").value.trim();
        const tripYear = parseInt(document.getElementById("edit-trip-year").value);
        const tripCurrency = document.getElementById("edit-trip-currency").value;

        if (!tripName || isNaN(tripYear)) {
            alert("Please fill out all fields correctly.");
            return;
        }

        const trips = fetchTrips();
        const tripIndex = trips.findIndex(trip => trip.id === tripId);

        if (tripIndex !== -1) {
            trips[tripIndex] = {
                ...trips[tripIndex],
                name: tripName,
                year: tripYear,
                currency: tripCurrency
            };
            saveTrips(trips);
            renderTrips();
            closeAllModals();
            alert("Trip updated successfully!");
        } else {
            console.error(`Trip with ID "${tripId}" not found for editing.`);
        }
    });

    // Handle deleting a trip
    confirmDeleteButton.addEventListener("click", () => {
        const tripId = parseInt(confirmDeleteButton.dataset.id);
        const trips = fetchTrips();
        const updatedTrips = trips.filter(trip => trip.id !== tripId);

        saveTrips(updatedTrips);
        renderTrips();
        closeAllModals();
        alert("Trip deleted successfully!");
    });

    // Initialize the page
    renderTrips();
});
