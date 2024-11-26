document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const colourOptions = document.querySelectorAll(".colour-circle");
    const currencyDropdown = document.getElementById("default-currency");
    const resetDataButton = document.getElementById("reset-data");
    const colourStyleSection = document.getElementById("colour-style-settings");

    // Load settings from localStorage or set defaults
    const settings = JSON.parse(localStorage.getItem("settings")) || {
        darkMode: false,
        colourStyle: "white",
        defaultCurrency: "SGD"
    };

    /**
     * Apply saved settings on page load
     */
    function applySettings() {
        // Apply dark mode
        if (settings.darkMode) {
            document.body.classList.add("dark-mode");
            themeToggle.checked = true;
            colourStyleSection.style.display = "none"; // Hide colour options in dark mode
        } else {
            document.body.classList.remove("dark-mode");
            colourStyleSection.style.display = "flex"; // Show colour options in light mode
        }

        // Apply light mode colour style
        if (!settings.darkMode) {
            document.body.className = `light-style-${settings.colourStyle}`;
        }

        // Apply default currency
        currencyDropdown.value = settings.defaultCurrency;
    }

    /**
     * Save settings to localStorage
     */
    function saveSettings() {
        localStorage.setItem("settings", JSON.stringify(settings));
    }

    /**
     * Toggle dark mode
     */
    themeToggle.addEventListener("change", () => {
        settings.darkMode = themeToggle.checked;

        if (settings.darkMode) {
            document.body.classList.add("dark-mode");
            colourStyleSection.style.display = "none"; // Hide colour options in dark mode
        } else {
            document.body.classList.remove("dark-mode");
            colourStyleSection.style.display = "flex"; // Show colour options in light mode
        }

        saveSettings();
    });

    /**
     * Change light mode colour style
     */
    colourOptions.forEach(option => {
        option.addEventListener("click", () => {
            if (settings.darkMode) return; // Ignore clicks if dark mode is enabled

            // Remove previous styles
            document.body.className = "";
            document.body.classList.add(`light-style-${option.dataset.colour}`);

            settings.colourStyle = option.dataset.colour;
            saveSettings();
        });
    });

    /**
     * Change default currency
     */
    currencyDropdown.addEventListener("change", () => {
        settings.defaultCurrency = currencyDropdown.value;
        saveSettings();
        alert(`Default currency changed to ${settings.defaultCurrency}`);
    });

    /**
     * Reset all data
     */
    resetDataButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
            localStorage.clear();
            alert("All data has been reset.");
            location.reload(); // Refresh the page to reflect reset state
        }
    });

    // Initial application of settings
    applySettings();
});
