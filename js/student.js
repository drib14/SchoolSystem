document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const gpaSummaryEl = document.getElementById('gpa-summary');
    const attendanceSummaryEl = document.getElementById('attendance-summary');
    const scheduleTodayListEl = document.getElementById('schedule-today-list');
    const tuitionBalanceEl = document.getElementById('tuition-balance');

    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const tuitionSettings = JSON.parse(localStorage.getItem('tuitionSettings')) || { pricePerUnit: 0, fees: [] };
    const allPayments = JSON.parse(localStorage.getItem('payments')) || [];
    const currentUser = allStudents.find(s => s.id === userId);

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
        if (myAttendanceRecords.length === 0) { attendanceSummaryEl.textContent = '100%'; return; }
        const presentCount = myAttendanceRecords.filter(rec => rec.status === 'Present').length;
        const percentage = (presentCount / myAttendanceRecords.length) * 100;
        attendanceSummaryEl.textContent = `${percentage.toFixed(1)}%`;
    }

    function renderTodaysSchedule() {
        const myPlottedClasses = currentUser.plottedClasses || [];
        const today = new Date().toLocaleString('en-us', {  weekday: 'short' });
        const todaysClasses = myPlottedClasses.filter(schedule => schedule.time.includes(today));
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
        const myVerifiedPayments = allPayments.filter(p => p.studentId === userId && p.status === 'verified').reduce((sum, p) => sum + p.amount, 0);
        let totalUnits = 0;
        if (currentUser.plottedClasses && currentUser.plottedClasses.length > 0) {
            totalUnits = currentUser.plottedClasses.reduce((sum, pc) => {
                const subject = allSubjects.find(s => s.code === pc.subjectCode);
                return sum + (subject ? parseFloat(subject.units) || 0 : 0);
            }, 0);
        }
        const baseTuition = totalUnits * (tuitionSettings.pricePerUnit || 0);
        const miscFees = (tuitionSettings.fees || []).reduce((sum, fee) => sum + fee.amount, 0);
        const totalTuition = baseTuition + miscFees;
        const balance = totalTuition - myVerifiedPayments;
        tuitionBalanceEl.textContent = `₱ ${balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    calculateGpa();
    calculateAttendance();
    renderTodaysSchedule();
    calculateTuition();
});
