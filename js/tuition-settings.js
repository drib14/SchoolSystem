document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const settingsForm = document.getElementById('tuition-settings-form');
    const pricePerUnitInput = document.getElementById('pricePerUnit');

    // Load existing settings
    function loadSettings() {
        const currentRate = localStorage.getItem('tuitionRate');
        if (currentRate) {
            pricePerUnitInput.value = currentRate;
        }
    }

    // Save settings
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newRate = pricePerUnitInput.value;
        if (newRate && !isNaN(newRate) && parseFloat(newRate) >= 0) {
            localStorage.setItem('tuitionRate', newRate);
            alert('Tuition settings have been saved successfully.');
        } else {
            alert('Please enter a valid, non-negative number.');
        }
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }

    // Initial Load
    loadSettings();
});
