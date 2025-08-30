document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const tbody = document.getElementById('pending-payments-tbody');
    let allPayments = JSON.parse(localStorage.getItem('payments')) || [];
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];

    function renderTable() {
        tbody.innerHTML = '';
        const pendingPayments = allPayments.filter(p => p.status === 'pending');

        if (pendingPayments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No pending payments to verify.</td></tr>';
            return;
        }

        pendingPayments.forEach(payment => {
            const student = allStudents.find(s => s.id === payment.studentId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Date">${new Date(payment.date).toLocaleDateString()}</td>
                <td data-label="Student ID">${payment.studentId}</td>
                <td data-label="Student Name">${student ? `${student.firstName} ${student.lastName}` : 'N/A'}</td>
                <td data-label="Amount Paid">₱ ${payment.amount.toLocaleString()}</td>
                <td data-label="Receipt">${payment.receiptFilename}</td>
                <td data-label="Actions">
                    <button class="action-btn approve-btn verify-btn" data-id="${payment.id}">Verify</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('verify-btn')) {
            const paymentId = e.target.dataset.id;
            const paymentIndex = allPayments.findIndex(p => p.id === paymentId);
            if (paymentIndex > -1) {
                allPayments[paymentIndex].status = 'verified';
                localStorage.setItem('payments', JSON.stringify(allPayments));
                Toastify({ text: "Payment verified successfully!", duration: 3000, className: "toast-success" }).showToast();

                const studentId = allPayments[paymentIndex].studentId;
                createNotification(studentId, `Your payment of ₱${allPayments[paymentIndex].amount.toLocaleString()} has been verified.`, 'student.html');

                renderTable();
            }
        }
    });

    renderTable();
});
