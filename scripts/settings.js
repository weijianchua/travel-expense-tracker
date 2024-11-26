document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const colourOptions = document.querySelectorAll(".colour-circle");
    const currencyDropdown = document.getElementById("default-currency");
    const resetDataButton = document.getElementById("reset-data");

    // Load settings from localStorage or set defaults
    const settings = JSON.parse(localStorage.getItem("settings")) || {
        darkMode: false,
        colourStyle: "white",
        defaultCurrency: "SGD"
    };

    // Apply saved settings on page load
    function applySettings() {
        // Apply dark mode
        if (settings.darkMode) {
            document.body.classList.add("dark-mode");
            themeToggle.checked = true;
        } else {
            document.body.classList.remove("dark-mode");
        }

        // Apply light mode colour style
        document.body.classList.add(`light-style-${settings.colourStyle}`);

        // Apply default currency
        currencyDropdown.value = settings.defaultCurrency;
    }

    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem("settings", JSON.stringify(settings));
    }

    // Toggle dark mode
    themeToggle.addEventListener("change", () => {
        settings.darkMode = themeToggle.checked;
        document.body.classList.toggle("dark-mode", settings.darkMode);
        saveSettings();
    });

    // Change colour style
    colourOptions.forEach(option => {
        option.addEventListener("click", () => {
            // Remove previous styles
            document.body.className = settings.darkMode ? "dark-mode" : "";
            // Apply the new colour style
            document.body.classList.add(`light-style-${option.dataset.colour}`);
            settings.colourStyle = option.dataset.colour;
            saveSettings();
        });
    });

    // Change default currency
    currencyDropdown.addEventListener("change", () => {
        settings.defaultCurrency = currencyDropdown.value;
        saveSettings();
        alert(`Default currency changed to ${settings.defaultCurrency}`);
    });

    // Reset all data
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
