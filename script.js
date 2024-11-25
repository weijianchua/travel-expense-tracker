document.addEventListener("DOMContentLoaded", () => {
    // Fallback for localStorage
    const isLocalStorageAvailable = typeof Storage !== "undefined";
    const storage = isLocalStorageAvailable ? localStorage : new Map();

    const getItem = (key) =>
        isLocalStorageAvailable ? storage.getItem(key) : storage.get(key);
    const setItem = (key, value) =>
        isLocalStorageAvailable ? storage.setItem(key, value) : storage.set(key, value);
    const removeItem = (key) =>
        isLocalStorageAvailable ? storage.removeItem(key) : storage.delete(key);

    const trips = JSON.parse(getItem("trips")) || [];
    const currentTripId = getItem("currentTripId");

    const currentPage = document.body.getAttribute("data-page");

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

        // Set default year to current year
        const currentYear = new Date().getFullYear();
        const tripYearInput = document.getElementById("trip-year");
        tripYearInput.value = currentYear;

        createTripForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("trip-name").value;
            const year = document.getElementById("trip-year").value;
            const currency = document.getElementById("currency").value;

            const newTrip = {
                id: Date.now(),
                name,
                year,
                currency,
                createdAt: new Date().toISOString(),
            };

            trips.push(newTrip);
            trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setItem("trips", JSON.stringify(trips));
            setItem("currentTripId", newTrip.id);

            // Show banner notification
            showNotification("Trip created successfully!");

            // Redirect to Current Trip page after 3 seconds
            setTimeout(() => {
                window.location.href = "current-trip.html";
            }, 3000);
        });
    }

    // Show Banner Notification
    function showNotification(message) {
        const banner = document.createElement("div");
        banner.className = "notification-banner";
        banner.textContent = message;
        document.body.appendChild(banner);
        setTimeout(() => {
            banner.remove();
        }, 3000);
    }

    // Handle Current Trip Page
    function handleCurrentTripPage(trips, currentTripId) {
        const currentTripDropdown = document.getElementById("current-trip-dropdown");
        const currentTripDetails = document.getElementById("current-trip-details");

        // Populate dropdown
        trips.forEach((trip) => {
            const option = document.createElement("option");
            option.value = trip.id;
            option.textContent = `${trip.name} (${trip.year})`;
            if (trip.id === parseInt(currentTripId)) option.selected = true;
            currentTripDropdown.appendChild(option);
        });

        const displayCurrentTripDetails = (tripId) => {
            const trip = trips.find((t) => t.id === parseInt(tripId));
            if (trip) {
                currentTripDetails.innerHTML = `
                    <h2>${trip.name} (${trip.year})</h2>
                    <p>Currency: ${trip.currency}</p>
                    <p>Created At: ${new Date(trip.createdAt).toLocaleString()}</p>
                `;
            }
        };

        displayCurrentTripDetails(currentTripId);

        currentTripDropdown.addEventListener("change", (e) => {
            const selectedTripId = e.target.value;
            setItem("currentTripId", selectedTripId);
            displayCurrentTripDetails(selectedTripId);
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
                <button class="edit-btn" data-id="${trip.id}">Edit</button>
                <button class="delete-btn" data-id="${trip.id}">Delete</button>
            `;

            historyContainer.appendChild(tripDiv);
        });

        historyContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("delete-btn")) {
                const tripId = parseInt(e.target.dataset.id);
                const updatedTrips = trips.filter((trip) => trip.id !== tripId);
                setItem("trips", JSON.stringify(updatedTrips));
                if (currentTripId === tripId.toString()) {
                    removeItem("currentTripId");
                }
                alert("Trip deleted successfully!");
                location.reload();
            }

            if (e.target.classList.contains("edit-btn")) {
                const tripId = parseInt(e.target.dataset.id);
                const trip = trips.find((t) => t.id === tripId);
                if (trip) {
                    const newName = prompt("Enter new trip name:", trip.name) || trip.name;
                    const newYear = prompt("Enter new trip year:", trip.year) || trip.year;
                    const newCurrency =
                        prompt("Enter new trip currency:", trip.currency) || trip.currency;

                    trip.name = newName;
                    trip.year = newYear;
                    trip.currency = newCurrency;

                    setItem("trips", JSON.stringify(trips));
                    alert("Trip updated successfully!");
                    location.reload();
                }
            }
        });
    }
});
