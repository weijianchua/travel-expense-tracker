document.addEventListener("DOMContentLoaded", () => {
    const settings = JSON.parse(localStorage.getItem("settings")) || {
        darkMode: false,
        colourStyle: "white",
        defaultCurrency: "SGD"
    };

    // Apply theme settings
    function applyTheme() {
        if (settings.darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }

        // Apply colour style for light mode
        document.body.className = settings.darkMode ? "dark-mode" : "";
        document.body.classList.add(`light-style-${settings.colourStyle}`);
    }

    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem("settings", JSON.stringify(settings));
    }

    // Navigation logic for footer buttons
    const homeButton = document.querySelector("nav a[aria-label='Home']");
    if (homeButton) {
        homeButton.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "index.html";
        });
    }

    // Utility function to format numbers with currency
    function formatCurrency(amount, currency) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency
        }).format(amount);
    }

    // Global event listener for modals (if applicable across pages)
    const closeModalButtons = document.querySelectorAll(".modal-close");
    closeModalButtons.forEach((button) => {
        button.addEventListener("click", () => {
            closeAllModals();
        });
    });

    // Close all modals utility
    function closeAllModals() {
        const modals = document.querySelectorAll(".modal");
        modals.forEach((modal) => {
            modal.classList.remove("show");
            setTimeout(() => {
                modal.style.display = "none";
            }, 300); // Matches CSS transition
        });
        document.body.classList.remove("modal-open");
    }

    // Weather functionality
    const locationElement = document.getElementById("location");
    const temperatureElement = document.getElementById("temperature");
    const weatherDescriptionElement = document.getElementById("weather-description");
    const weatherIconElement = document.getElementById("weather-icon");

    const apiKey = "d4dcad374a4e5ca78c0ab88919bb926b"; // Replace with your OpenWeatherMap API key
    const apiBaseUrl = "https://api.openweathermap.org/data/2.5/weather";

    /**
     * Fetch weather data based on coordinates
     * @param {number} latitude
     * @param {number} longitude
     */
    function fetchWeatherData(latitude, longitude) {
        const url = `${apiBaseUrl}?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch weather data");
                }
                return response.json();
            })
            .then((data) => {
                updateWeatherWidget(data);
            })
            .catch((error) => {
                locationElement.textContent = "Unable to fetch weather data";
                console.error(error);
            });
    }

    /**
     * Update the weather widget with data
     * @param {object} data - Weather data from API
     */
    function updateWeatherWidget(data) {
        const locationName = data.name;
        const temperature = data.main.temp;
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;

        locationElement.textContent = locationName;
        temperatureElement.textContent = `${temperature}°C`;
        weatherDescriptionElement.textContent = description.charAt(0).toUpperCase() + description.slice(1);
        weatherIconElement.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />`;
    }

    /**
     * Get user's current location or use saved location
     */
    function getUserLocation() {
        const savedLocation = JSON.parse(localStorage.getItem("userLocation"));

        if (savedLocation) {
            console.log("Using saved location:", savedLocation);
            fetchWeatherData(savedLocation.latitude, savedLocation.longitude);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("Saving new location:", { latitude, longitude });
                    saveLocation(latitude, longitude);
                    fetchWeatherData(latitude, longitude);
                },
                (error) => {
                    locationElement.textContent = "Location access denied";
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            locationElement.textContent = "Geolocation not supported by this browser";
        }
    }

    /**
     * Save the user's location to localStorage
     * @param {number} latitude
     * @param {number} longitude
     */
    function saveLocation(latitude, longitude) {
        localStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));
    }

    /**
     * Handle manual location input
     */
    function handleManualLocationInput() {
        const latitudeInput = document.getElementById("manual-latitude");
        const longitudeInput = document.getElementById("manual-longitude");

        const latitude = parseFloat(latitudeInput.value);
        const longitude = parseFloat(longitudeInput.value);

        if (!isNaN(latitude) && !isNaN(longitude)) {
            saveLocation(latitude, longitude);
            fetchWeatherData(latitude, longitude);
        } else {
            alert("Please enter valid latitude and longitude values.");
        }
    }

    // Add event listener for the refresh location button
    const refreshLocationButton = document.getElementById("refresh-location");
    if (refreshLocationButton) {
        refreshLocationButton.addEventListener("click", () => {
            localStorage.removeItem("userLocation");
            getUserLocation();
        });
    }

    // Add event listener for the manual location form
    const manualLocationForm = document.getElementById("manual-location-form");
    if (manualLocationForm) {
        manualLocationForm.addEventListener("submit", (event) => {
            event.preventDefault();
            handleManualLocationInput();
        });
    }

    // Fetch weather data on page load
    getUserLocation();

    // Apply theme settings on page load
    applyTheme();

    // Export global functions (optional, for use in other scripts)
    window.app = {
        settings,
        applyTheme,
        saveSettings,
        formatCurrency,
        saveLocation
    };
});
