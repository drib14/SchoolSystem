document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('payroll-settings-form');
    const monthlySalaryInput = document.getElementById('monthlySalary');
    const absenceDeductionInput = document.getElementById('absenceDeduction');
    const lateDeductionInput = document.getElementById('lateDeduction');
    const taxRateInput = document.getElementById('taxRate');
    const paydayInput = document.getElementById('payday');

    // Load existing settings from localStorage and populate the form
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('payrollSettings'));
        if (settings) {
            monthlySalaryInput.value = settings.monthlySalary || '';
            absenceDeductionInput.value = settings.absenceDeduction || '';
            lateDeductionInput.value = settings.lateDeduction || '';
            taxRateInput.value = settings.taxRate || '10';
            paydayInput.value = settings.payday || '5'; // Default to Friday
        }
    }

    // Handle form submission
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const settings = {
            monthlySalary: parseFloat(monthlySalaryInput.value),
            absenceDeduction: parseFloat(absenceDeductionInput.value),
            lateDeduction: parseFloat(lateDeductionInput.value),
            taxRate: parseFloat(taxRateInput.value),
            payday: parseInt(paydayInput.value, 10)
        };

        // Basic validation
        if (isNaN(settings.monthlySalary) || isNaN(settings.absenceDeduction) || isNaN(settings.lateDeduction) || isNaN(settings.taxRate)) {
            Toastify({
                text: "Please ensure all fields have valid numbers.",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)",
                stopOnFocus: true,
            }).showToast();
            return;
        }

        localStorage.setItem('payrollSettings', JSON.stringify(settings));
        Toastify({
            text: "Payroll settings have been saved successfully!",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
            stopOnFocus: true,
        }).showToast();
    });

    // Initial load
    loadSettings();
});
