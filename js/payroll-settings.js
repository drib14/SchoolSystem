document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // --- DOM Elements ---
    const salaryForm = document.getElementById('payroll-salary-form');
    const deductionInput = document.getElementById('deductionPerAbsence');
    const workingDaysForm = document.getElementById('working-days-form');
    const workingDaysChecklist = document.getElementById('working-days-checklist');
    const addComponentForm = document.getElementById('add-payroll-component-form');
    const componentsTbody = document.getElementById('payroll-components-tbody');

    // --- Data Loading ---
    let payrollSettings = JSON.parse(localStorage.getItem('payrollSettings')) || {
        deductionPerAbsence: 0,
        workingDays: [1, 2, 3, 4, 5] // Mon-Fri default
    };
    let payrollComponents = JSON.parse(localStorage.getItem('payrollComponents')) || [];

    // --- Render Functions ---
    function renderSettings() {
        deductionInput.value = payrollSettings.deductionPerAbsence;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        workingDaysChecklist.innerHTML = days.map((day, index) => `
            <label>
                <input type="checkbox" value="${index}" ${payrollSettings.workingDays.includes(index) ? 'checked' : ''}>
                ${day}
            </label>
        `).join('<br>');
    }

    function renderComponents() {
        componentsTbody.innerHTML = '';
        if (payrollComponents.length === 0) {
            componentsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No components added.</td></tr>';
            return;
        }
        payrollComponents.forEach((comp, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Name">${comp.name}</td>
                <td data-label="Amount">₱ ${comp.amount.toLocaleString()}</td>
                <td data-label="Type" style="text-transform: capitalize;">${comp.type}</td>
                <td data-label="Actions"><button class="action-btn deny-btn delete-comp-btn" data-index="${index}">Delete</button></td>
            `;
            componentsTbody.appendChild(row);
        });
    }

    // --- Event Listeners ---
    salaryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        payrollSettings.deductionPerAbsence = parseFloat(deductionInput.value) || 0;
        localStorage.setItem('payrollSettings', JSON.stringify(payrollSettings));
        Toastify({ text: 'Salary settings saved!', duration: 3000, className: 'toast-success' }).showToast();
    });

    workingDaysForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedDays = [];
        workingDaysChecklist.querySelectorAll('input:checked').forEach(input => {
            selectedDays.push(parseInt(input.value));
        });
        payrollSettings.workingDays = selectedDays;
        localStorage.setItem('payrollSettings', JSON.stringify(payrollSettings));
        Toastify({ text: 'Working days saved!', duration: 3000, className: 'toast-success' }).showToast();
    });

    addComponentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('componentName').value;
        const amount = parseFloat(document.getElementById('componentAmount').value);
        const type = document.getElementById('componentType').value;
        if (name && !isNaN(amount)) {
            payrollComponents.push({ name, amount, type });
            localStorage.setItem('payrollComponents', JSON.stringify(payrollComponents));
            renderComponents();
            addComponentForm.reset();
        }
    });

    componentsTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-comp-btn')) {
            const index = e.target.dataset.index;
            payrollComponents.splice(index, 1);
            localStorage.setItem('payrollComponents', JSON.stringify(payrollComponents));
            renderComponents();
        }
    });

    // --- Initial Load ---
    renderSettings();
    renderComponents();
});
