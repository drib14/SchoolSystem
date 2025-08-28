document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // --- Rate Form Elements & Logic ---
    const rateForm = document.getElementById('payroll-rate-form');
    const hourlyRateInput = document.getElementById('hourlyRate');

    function loadRate() {
        const currentRate = localStorage.getItem('teacherHourlyRate');
        if (currentRate) {
            hourlyRateInput.value = currentRate;
        }
    }

    rateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newRate = hourlyRateInput.value;
        if (newRate && !isNaN(newRate) && parseFloat(newRate) >= 0) {
            localStorage.setItem('teacherHourlyRate', newRate);
            alert('Hourly rate has been saved successfully.');
        } else {
            alert('Please enter a valid, non-negative number for the rate.');
        }
    });

    // --- Component Form Elements & Logic ---
    const addComponentForm = document.getElementById('add-payroll-component-form');
    const componentsTbody = document.getElementById('payroll-components-tbody');
    let payrollComponents = JSON.parse(localStorage.getItem('payrollComponents')) || [];

    function saveComponents() {
        localStorage.setItem('payrollComponents', JSON.stringify(payrollComponents));
    }

    function renderComponents() {
        componentsTbody.innerHTML = '';
        if (payrollComponents.length === 0) {
            componentsTbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No payroll components defined.</td></tr>';
        } else {
            payrollComponents.forEach((comp, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${comp.name}</td>
                    <td>₱ ${parseFloat(comp.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style="text-transform: capitalize;">${comp.type}</td>
                    <td>
                        <button class="action-btn deny-btn delete-btn" data-index="${index}">Delete</button>
                    </td>
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
            payrollComponents.push(newComponent);
            saveComponents();
            renderComponents();
            addComponentForm.reset();
        } else {
            alert('Please enter a valid name and amount for the component.');
        }
    });

    componentsTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const compIndex = e.target.dataset.index;
            if (confirm('Are you sure you want to delete this component?')) {
                payrollComponents.splice(compIndex, 1);
                saveComponents();
                renderComponents();
            }
        }
    });

    // --- Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }

    // --- Initial Load ---
    loadRate();
    renderComponents();
});
