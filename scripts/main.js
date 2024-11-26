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

    // Apply theme settings on page load
    applyTheme();

    // Export global functions (optional, for use in other scripts)
    window.app = {
        settings,
        applyTheme,
        saveSettings,
        formatCurrency
    };
});
