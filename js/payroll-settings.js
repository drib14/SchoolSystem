document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const settingsForm = document.getElementById('payroll-settings-form');
    const hourlyRateInput = document.getElementById('hourlyRate');

    // Load existing settings
    function loadSettings() {
        const currentRate = localStorage.getItem('teacherHourlyRate');
        if (currentRate) {
            hourlyRateInput.value = currentRate;
        }
    }

    // Save settings
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newRate = hourlyRateInput.value;
        if (newRate && !isNaN(newRate) && parseFloat(newRate) >= 0) {
            localStorage.setItem('teacherHourlyRate', newRate);
            alert('Payroll settings have been saved successfully.');
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
