document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    // --- DOM Elements ---
    const gpaSummaryEl = document.getElementById('gpa-summary');
    const attendanceSummaryEl = document.getElementById('attendance-summary');
    const scheduleTodayListEl = document.getElementById('schedule-today-list');
    const tuitionBalanceEl = document.getElementById('tuition-balance');
    const uploadPaymentBtn = document.getElementById('upload-payment-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closeModalBtn = paymentModal.querySelector('.close-btn');
    const paymentForm = document.getElementById('payment-form');

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const currentUser = allStudents.find(s => s.id === userId);
    const tuitionSettings = JSON.parse(localStorage.getItem('tuitionSettings')) || { pricePerUnit: 0, fees: [] };
    const myPayments = JSON.parse(localStorage.getItem('payments')) || [];

    if (!currentUser) {
        document.getElementById('dashboard-content').innerHTML = '<p>Could not load student data.</p>';
        return;
    }

    function calculateGpa() {
        const myGradeRecords = gradeRecords.filter(rec => rec.studentId === userId && rec.finalGrade);
        if (myGradeRecords.length === 0) { gpaSummaryEl.textContent = 'N/A'; return; }
        const toGpaPoint = (grade) => {
            if (grade >= 97) return 4.0; if (grade >= 93) return 3.7; if (grade >= 90) return 3.3;
            if (grade >= 87) return 3.0; if (grade >= 83) return 2.7; if (grade >= 80) return 2.3;
            if (grade >= 77) return 2.0; if (grade >= 73) return 1.7; if (grade >= 70) return 1.3;
            if (grade >= 67) return 1.0; return 0.0;
        };
        const totalGpaPoints = myGradeRecords.reduce((sum, rec) => sum + toGpaPoint(rec.finalGrade), 0);
        const gpa = totalGpaPoints / myGradeRecords.length;
        gpaSummaryEl.textContent = gpa.toFixed(2);
    }

    function calculateAttendance() {
        const myAttendanceRecords = attendanceRecords.filter(rec => rec.studentId === userId);
        if (myAttendanceRecords.length === 0) { attendanceSummaryEl.textContent = 'N/A'; return; }
        const presentCount = myAttendanceRecords.filter(rec => rec.status === 'Present').length;
        const percentage = (presentCount / myAttendanceRecords.length) * 100;
        attendanceSummaryEl.textContent = `${percentage.toFixed(1)}%`;
    }

    function renderTodaysSchedule() {
        const myPlottedClasses = currentUser.plottedClasses || [];
        const today = new Date();
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
        const todaysClasses = myPlottedClasses.filter(schedule => schedule.time.toLowerCase().includes(dayOfWeek.toLowerCase()));
        scheduleTodayListEl.innerHTML = '';
        if (todaysClasses.length === 0) {
            scheduleTodayListEl.innerHTML = '<li style="padding: 10px; text-align: center;">No classes scheduled for today.</li>';
            return;
        }
        todaysClasses.forEach(schedule => {
            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            const li = document.createElement('li');
            li.style.cssText = 'border-bottom: 1px solid #eee; padding: 10px;';
            li.innerHTML = `<strong>${subject ? subject.name : 'Unknown'}</strong> - ${schedule.time}`;
            scheduleTodayListEl.appendChild(li);
        });
    }

    function calculateTuition() {
        const myVerifiedPayments = myPayments.filter(p => p.studentId === userId && p.status === 'verified').reduce((sum, p) => sum + p.amount, 0);
        let totalUnits = 0;
        if (currentUser.plottedClasses && currentUser.plottedClasses.length > 0) {
            totalUnits = currentUser.plottedClasses.reduce((sum, pc) => sum + (allSubjects.find(s => s.code === pc.subjectCode)?.units || 0), 0);
        }
        const baseTuition = totalUnits * (tuitionSettings.pricePerUnit || 0);
        const miscFees = (tuitionSettings.fees || []).reduce((sum, fee) => sum + fee.amount, 0);
        const totalTuition = baseTuition + miscFees;
        const balance = totalTuition - myVerifiedPayments;
        tuitionBalanceEl.textContent = `₱ ${balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    uploadPaymentBtn.addEventListener('click', () => paymentModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => paymentModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === paymentModal) paymentModal.style.display = 'none'; });

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const receiptFile = document.getElementById('receiptUpload').files[0];
        if (!receiptFile || isNaN(amount) || amount <= 0) {
            Toastify({ text: "Please enter a valid amount and upload a receipt.", duration: 3000, className: "toast-error" }).showToast();
            return;
        }
        const newPayment = { id: `pay_${Date.now()}`, studentId: userId, amount: amount, receiptFilename: receiptFile.name, date: new Date().toISOString(), status: 'pending' };
        const allPayments = JSON.parse(localStorage.getItem('payments')) || [];
        allPayments.push(newPayment);
        localStorage.setItem('payments', JSON.stringify(allPayments));
        Toastify({ text: "Payment submitted for verification!", duration: 3000, className: "toast-success" }).showToast();
        paymentModal.style.display = 'none';
        paymentForm.reset();
    });

    calculateGpa();
    calculateAttendance();
    renderTodaysSchedule();
    calculateTuition();
});
