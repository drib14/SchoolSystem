document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // --- Rate Form Elements & Logic ---
    const rateForm = document.getElementById('tuition-rate-form');
    const pricePerUnitInput = document.getElementById('pricePerUnit');

    function loadRate() {
        const currentRate = localStorage.getItem('tuitionRate');
        if (currentRate) {
            pricePerUnitInput.value = currentRate;
        }
    }

    rateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newRate = pricePerUnitInput.value;
        if (newRate && !isNaN(newRate) && parseFloat(newRate) >= 0) {
            localStorage.setItem('tuitionRate', newRate);
            Toastify({ text: 'Tuition rate has been saved successfully.', duration: 3000, className: "toast-success" }).showToast();
        } else {
            Toastify({ text: 'Please enter a valid, non-negative number for the rate.', duration: 3000, className: "toast-warning" }).showToast();
        }
    });

    // --- Fee Form Elements & Logic ---
    const addFeeForm = document.getElementById('add-fee-form');
    const feesTbody = document.getElementById('fees-tbody');
    let feeComponents = JSON.parse(localStorage.getItem('feeComponents')) || [];

    function saveFees() {
        localStorage.setItem('feeComponents', JSON.stringify(feeComponents));
    }

    function renderFees() {
        feesTbody.innerHTML = '';
        if (feeComponents.length === 0) {
            feesTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No miscellaneous fees defined.</td></tr>';
        } else {
            feeComponents.forEach((fee, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fee.name}</td>
                    <td>₱ ${parseFloat(fee.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                        <button class="action-btn deny-btn delete-btn" data-index="${index}">Delete</button>
                    </td>
                `;
                feesTbody.appendChild(row);
            });
        }
    }

    addFeeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feeNameInput = document.getElementById('feeName');
        const feeAmountInput = document.getElementById('feeAmount');
        const newFee = {
            id: Date.now(),
            name: feeNameInput.value.trim(),
            amount: parseFloat(feeAmountInput.value)
        };

        if (newFee.name && !isNaN(newFee.amount) && newFee.amount >= 0) {
            feeComponents.push(newFee);
            saveFees();
            renderFees();
            addFeeForm.reset();
            Toastify({ text: 'Fee added successfully.', duration: 3000, className: "toast-success" }).showToast();
        } else {
            Toastify({ text: 'Please enter a valid name and non-negative amount for the fee.', duration: 3000, className: "toast-warning" }).showToast();
        }
    });

    feesTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const feeIndex = e.target.dataset.index;
            if (confirm('Are you sure you want to delete this fee?')) {
                feeComponents.splice(feeIndex, 1);
                saveFees();
                renderFees();
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
    renderFees();
});
