document.addEventListener('DOMContentLoaded', () => {
    // Auth is handled by auth.js
    const settingsForm = document.getElementById('tuition-settings-form');
    const pricePerSubjectInput = document.getElementById('pricePerSubject');

    // Load existing settings from localStorage and populate the form
    function loadTuitionSettings() {
        const settings = JSON.parse(localStorage.getItem('tuitionSettings'));
        if (settings && settings.pricePerSubject) {
            pricePerSubjectInput.value = settings.pricePerSubject;
        }
    }

    // Handle form submission
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const price = parseFloat(pricePerSubjectInput.value);

        if (isNaN(price) || price < 0) {
            Toastify({
                text: "Please enter a valid, non-negative price.",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)",
            }).showToast();
            return;
        }

        const settings = {
            pricePerSubject: price
        };

        localStorage.setItem('tuitionSettings', JSON.stringify(settings));

        Toastify({
            text: "Tuition setting has been saved successfully!",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();
    });

    // Initial load
    loadTuitionSettings();
});
