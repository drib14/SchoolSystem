document.addEventListener('DOMContentLoaded', () => {
    // Auth checks and sidebar population are handled by auth.js
    const loggedInUserId = localStorage.getItem('userId');
    if (!loggedInUserId || localStorage.getItem('userRole') !== 'student') {
        return;
    }

    // --- Dashboard Card Elements ---
    const subjectCountEl = document.getElementById('student-subject-count');
    const gpaEl = document.getElementById('student-gpa');
    const absenceCountEl = document.getElementById('student-absence-count');
    const totalTuitionEl = document.getElementById('student-total-tuition');
    const amountPaidEl = document.getElementById('student-amount-paid');
    const remainingBalanceEl = document.getElementById('student-remaining-balance');
    const paymentHistoryTbody = document.getElementById('payment-history-tbody');

    // --- Modal Elements ---
    const paymentModal = document.getElementById('payment-modal');
    const openModalBtn = document.getElementById('submit-payment-btn');
    const closeModalBtn = paymentModal.querySelector('.close-btn');
    const paymentForm = document.getElementById('payment-form');
    const receiptUploadInput = document.getElementById('receipt-upload');
    const receiptPreview = document.getElementById('receipt-preview');

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const tuitionSettings = JSON.parse(localStorage.getItem('tuitionSettings')) || { pricePerSubject: 0 };
    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    const currentUser = allStudents.find(s => s.id === loggedInUserId);

    if (!currentUser) {
        console.error('Could not find logged in student data.');
        return;
    }

    // --- Handle Pending Status ---
    if (currentUser.status === 'pending') {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="header">
                <h1>Application Pending</h1>
            </div>
            <div class="content">
                <p>Your application is currently under review by an administrator. Your dashboard will become fully accessible once your application is approved.</p>
                <p>Your student ID is: <strong>${currentUser.id}</strong></p>
                <p>Your temporary password is: <strong>${currentUser.password}</strong> (Please change it upon approval).</p>
            </div>
        `;
        return; // Stop further script execution
    }

    // --- Calculation Logic ---
    function calculateAndDisplayDashboard() {
        // 1. Enrolled Subjects Count
        const enrolledSubjectsCount = currentUser.plottedClasses ? currentUser.plottedClasses.length : 0;
        if (subjectCountEl) subjectCountEl.textContent = enrolledSubjectsCount;

        // 2. Overall GPA
        const myGradeRecords = gradeRecords.filter(rec => rec.studentId === loggedInUserId && rec.calculated && rec.calculated.finalGrade);
        if (myGradeRecords.length > 0) {
            const totalGpaPoints = myGradeRecords.reduce((sum, rec) => sum + convertToGpa(rec.calculated.finalGrade), 0);
            if (gpaEl) gpaEl.textContent = (totalGpaPoints / myGradeRecords.length).toFixed(2);
        } else {
            if (gpaEl) gpaEl.textContent = 'N/A';
        }

        // 3. Total Absences
        const myAbsences = attendanceRecords.filter(rec => rec.studentId === loggedInUserId && rec.status === 'Absent');
        if (absenceCountEl) absenceCountEl.textContent = myAbsences.length;

        // 4. Tuition and Payment
        const totalTuition = enrolledSubjectsCount * tuitionSettings.pricePerSubject;
        const amountPaid = payments
            .filter(p => p.studentId === loggedInUserId && p.status === 'approved')
            .reduce((sum, p) => sum + p.amount, 0);
        const remainingBalance = totalTuition - amountPaid;

        if (totalTuitionEl) totalTuitionEl.textContent = `₱${totalTuition.toFixed(2)}`;
        if (amountPaidEl) amountPaidEl.textContent = `₱${amountPaid.toFixed(2)}`;
        if (remainingBalanceEl) remainingBalanceEl.textContent = `₱${remainingBalance.toFixed(2)}`;

        // 5. Payment History
        renderPaymentHistory();
    }

    function renderPaymentHistory() {
        const myPayments = payments.filter(p => p.studentId === loggedInUserId).sort((a,b) => new Date(b.date) - new Date(a.date));
        paymentHistoryTbody.innerHTML = '';
        if (myPayments.length > 0) {
            myPayments.forEach(p => {
                const row = paymentHistoryTbody.insertRow();
                row.innerHTML = `
                    <td data-label="Date">${new Date(p.date).toLocaleDateString()}</td>
                    <td data-label="Amount">₱${p.amount.toFixed(2)}</td>
                    <td data-label="Status"><span class="status-${p.status}">${p.status}</span></td>
                    <td data-label="Notes">${p.notes || ''}</td>
                `;
            });
        } else {
            paymentHistoryTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No payment history found.</td></tr>';
        }
    }

    // --- Modal Logic ---
    openModalBtn.addEventListener('click', () => paymentModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => paymentModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == paymentModal) paymentModal.style.display = 'none';
    });

    receiptUploadInput.addEventListener('change', () => {
        if (receiptUploadInput.files && receiptUploadInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                receiptPreview.src = e.target.result;
                receiptPreview.style.display = 'block';
            };
            reader.readAsDataURL(receiptUploadInput.files[0]);
        }
    });

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const receiptFile = receiptUploadInput.files[0];

        if (isNaN(amount) || amount <= 0 || !receiptFile) {
            Toastify({ text: "Please enter a valid amount and upload a receipt.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)" }).showToast();
            return;
        }

        const newPayment = {
            id: `payment-${Date.now()}`,
            studentId: loggedInUserId,
            amount: amount,
            receiptUrl: receiptPreview.src, // Base64 string from the preview
            date: new Date().toISOString(),
            status: 'pending', // pending, approved, declined
            notes: ''
        };

        payments.push(newPayment);
        localStorage.setItem('payments', JSON.stringify(payments));

        Toastify({ text: "Payment submitted for verification!", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();

        paymentModal.style.display = 'none';
        paymentForm.reset();
        receiptPreview.style.display = 'none';
        calculateAndDisplayDashboard(); // Refresh dashboard and history
    });

    // --- Helper Functions ---
    function convertToGpa(grade) {
        const g = parseFloat(grade);
        if (isNaN(g)) return 0;
        if (g >= 97) return 4.0; if (g >= 93) return 3.7; if (g >= 90) return 3.3;
        if (g >= 87) return 3.0; if (g >= 83) return 2.7; if (g >= 80) return 2.3;
        if (g >= 77) return 2.0; if (g >= 73) return 1.7; if (g >= 70) return 1.3;
        if (g >= 67) return 1.0; return 0;
    }

    // --- Post-Approval Requirements Check ---
    function checkRequirements() {
        const hasPendingRequirements = currentUser.requirements && currentUser.requirements.some(req => req.status === 'Pending');
        if (hasPendingRequirements) {
            const container = document.querySelector('.content'); // The main content box
            if (container) {
                const button = document.createElement('a'); // Use an anchor tag to act as a link
                button.href = 'submit-requirements.html';
                button.className = 'btn';
                button.textContent = 'Submit Missing Requirements';
                button.style.backgroundColor = '#ffc107';
                button.style.color = '#212529';
                button.style.marginTop = '10px';
                container.appendChild(button);
            }
        }
    }

    // --- Initial Load ---
    calculateAndDisplayDashboard();
    checkRequirements();
});
