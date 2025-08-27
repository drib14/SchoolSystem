document.addEventListener('DOMContentLoaded', () => {
    // Auth is handled by auth.js
    const tbody = document.getElementById('pending-payments-tbody');
    const declineModal = document.getElementById('decline-modal');
    const declineForm = document.getElementById('decline-form');
    const declineReasonInput = document.getElementById('decline-reason');
    const closeModalBtn = declineModal.querySelector('.close-btn');

    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    const students = JSON.parse(localStorage.getItem('students')) || [];

    let currentPaymentIdToDecline = null;

    function renderPendingPayments() {
        const pendingPayments = payments.filter(p => p.status === 'pending');
        tbody.innerHTML = '';

        if (pendingPayments.length > 0) {
            pendingPayments.forEach(payment => {
                const student = students.find(s => s.id === payment.studentId);
                const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td data-label="Student Name">${studentName}</td>
                    <td data-label="Date Submitted">${new Date(payment.date).toLocaleDateString()}</td>
                    <td data-label="Amount">₱${payment.amount.toFixed(2)}</td>
                    <td data-label="Receipt"><a href="${payment.receiptUrl}" target="_blank">View Receipt</a></td>
                    <td data-label="Actions">
                        <button class="action-btn approve-btn" data-id="${payment.id}">Approve</button>
                        <button class="action-btn deny-btn" data-id="${payment.id}">Decline</button>
                    </td>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending payments to verify.</td></tr>';
        }
    }

    function approvePayment(paymentId) {
        const paymentIndex = payments.findIndex(p => p.id === paymentId);
        if (paymentIndex > -1) {
            payments[paymentIndex].status = 'approved';
            localStorage.setItem('payments', JSON.stringify(payments));
            Toastify({ text: "Payment approved!", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();
            renderPendingPayments();
        }
    }

    function openDeclineModal(paymentId) {
        currentPaymentIdToDecline = paymentId;
        declineModal.style.display = 'block';
    }

    function closeDeclineModal() {
        declineModal.style.display = 'none';
        declineForm.reset();
        currentPaymentIdToDecline = null;
    }

    // --- Event Listeners ---
    tbody.addEventListener('click', (e) => {
        const paymentId = e.target.dataset.id;
        if (!paymentId) return;

        if (e.target.classList.contains('approve-btn')) {
            approvePayment(paymentId);
        } else if (e.target.classList.contains('deny-btn')) {
            openDeclineModal(paymentId);
        }
    });

    closeModalBtn.addEventListener('click', closeDeclineModal);
    window.addEventListener('click', (e) => {
        if (e.target == declineModal) closeDeclineModal();
    });

    declineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const reason = declineReasonInput.value.trim();
        if (!reason || !currentPaymentIdToDecline) return;

        const paymentIndex = payments.findIndex(p => p.id === currentPaymentIdToDecline);
        if (paymentIndex > -1) {
            payments[paymentIndex].status = 'declined';
            payments[paymentIndex].notes = reason;
            localStorage.setItem('payments', JSON.stringify(payments));
            Toastify({ text: "Payment declined and notes added.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)" }).showToast();
            renderPendingPayments();
        }
        closeDeclineModal();
    });

    // --- Initial Load ---
    renderPendingPayments();
});
