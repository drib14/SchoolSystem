document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('payroll-settings-form');
    const monthlySalaryInput = document.getElementById('monthlySalary');
    const absenceDeductionInput = document.getElementById('absenceDeduction');
    const lateDeductionInput = document.getElementById('lateDeduction');
    const paydayInput = document.getElementById('payday');

    // Load existing settings from localStorage and populate the form
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('payrollSettings'));
        if (settings) {
            monthlySalaryInput.value = settings.monthlySalary || '';
            absenceDeductionInput.value = settings.absenceDeduction || '';
            lateDeductionInput.value = settings.lateDeduction || '';
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
            payday: parseInt(paydayInput.value, 10)
        };

        // Basic validation
        if (isNaN(settings.monthlySalary) || isNaN(settings.absenceDeduction) || isNaN(settings.lateDeduction)) {
            alert('Please ensure all fields have valid numbers.');
            return;
        }

        localStorage.setItem('payrollSettings', JSON.stringify(settings));
        alert('Payroll settings have been saved successfully!');
    });

    // Initial load
    loadSettings();
});
