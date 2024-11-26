document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("new-trip-form");
    const tripYearInput = document.getElementById("trip-year");

    // Set default year to the current year
    tripYearInput.value = new Date().getFullYear();

    // Fetch existing trips from localStorage
    function fetchTrips() {
        return JSON.parse(localStorage.getItem("trips")) || [];
    }

    // Save trips to localStorage
    function saveTrips(trips) {
        localStorage.setItem("trips", JSON.stringify(trips));
    }

    // Handle form submission for creating a trip
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Get form values
        const tripName = document.getElementById("trip-name").value.trim();
        const tripYear = parseInt(document.getElementById("trip-year").value);
        const tripCurrency = document.getElementById("trip-currency").value;

        // Validate form values
        if (!tripName || isNaN(tripYear)) {
            alert("Please fill out all fields correctly.");
            return;
        }

        // Create new trip object
        const newTrip = {
            id: Date.now(), // Unique ID based on timestamp
            name: tripName,
            year: tripYear,
            currency: tripCurrency,
            expenses: [] // Empty array for new trips
        };

        // Fetch existing trips and add the new trip
        const trips = fetchTrips();
        trips.push(newTrip);
        saveTrips(trips);

        // Redirect to the Current Trip page
        alert("Trip created successfully!");
        window.location.href = "current-trip.html";
    });
});
