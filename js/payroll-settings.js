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

    // --- Data ---
    let payrollSettings = JSON.parse(localStorage.getItem('payrollSettings')) || {
        deductionPerAbsence: 0,
        workingDays: [1, 2, 3, 4, 5], // Mon-Fri default
        components: []
    };

    function saveSettings() {
        localStorage.setItem('payrollSettings', JSON.stringify(payrollSettings));
    }

    // --- Salary Settings Logic ---
    function loadSalarySettings() {
        deductionInput.value = payrollSettings.deductionPerAbsence || 0;
    }

    salaryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newDeduction = parseFloat(deductionInput.value);
        if (!isNaN(newDeduction) && newDeduction >= 0) {
            payrollSettings.deductionPerAbsence = newDeduction;
            saveSettings();
            Toastify({ text: 'Salary settings saved.', duration: 3000, className: "toast-success" }).showToast();
        } else {
            Toastify({ text: 'Please enter a valid, non-negative number.', duration: 3000, className: "toast-warning" }).showToast();
        }
    });

    // --- Working Days Logic ---
    function buildWorkingDaysChecklist() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        workingDaysChecklist.innerHTML = '';
        days.forEach((day, index) => {
            const isChecked = payrollSettings.workingDays.includes(index);
            workingDaysChecklist.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${index}" id="day-${index}" ${isChecked ? 'checked' : ''}>
                    <label class="form-check-label" for="day-${index}">${day}</label>
                </div>
            `;
        });
    }

    workingDaysForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedDays = [];
        workingDaysChecklist.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            selectedDays.push(parseInt(checkbox.value, 10));
        });
        payrollSettings.workingDays = selectedDays;
        saveSettings();
        Toastify({ text: 'Working days saved.', duration: 3000, className: "toast-success" }).showToast();
    });

    // --- Components Logic (largely unchanged) ---
    function renderComponents() {
        componentsTbody.innerHTML = '';
        if (!payrollSettings.components || payrollSettings.components.length === 0) {
            componentsTbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No payroll components defined.</td></tr>';
        } else {
            payrollSettings.components.forEach((comp, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${comp.name}</td>
                    <td>₱ ${parseFloat(comp.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style="text-transform: capitalize;">${comp.type}</td>
                    <td><button class="action-btn deny-btn delete-btn" data-index="${index}">Delete</button></td>
                `;
                componentsTbody.appendChild(row);
            });
        }
    }

    addComponentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newComponent = {
            id: Date.now(),
            name: document.getElementById('componentName').value.trim(),
            amount: parseFloat(document.getElementById('componentAmount').value),
            type: document.getElementById('componentType').value
        };

        if (newComponent.name && !isNaN(newComponent.amount)) {
            payrollSettings.components.push(newComponent);
            saveSettings();
            renderComponents();
            addComponentForm.reset();
            Toastify({ text: 'Component added successfully.', duration: 3000, className: "toast-success" }).showToast();
        } else {
            Toastify({ text: 'Please enter a valid name and amount.', duration: 3000, className: "toast-warning" }).showToast();
        }
    });

    componentsTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const compIndex = e.target.dataset.index;
            if (confirm('Are you sure you want to delete this component?')) {
                payrollSettings.components.splice(compIndex, 1);
                saveSettings();
                renderComponents();
            }
        }
    });

    // --- Initial Load ---
    loadSalarySettings();
    buildWorkingDaysChecklist();
    renderComponents();
});
