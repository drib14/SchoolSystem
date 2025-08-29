document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (userRole !== 'student' || !userId) {
        window.location.href = 'index.html';
        return;
    }

    // --- DOM Elements ---
    const gpaSummaryEl = document.getElementById('gpa-summary');
    const attendanceSummaryEl = document.getElementById('attendance-summary');
    const scheduleTodayListEl = document.getElementById('schedule-today-list');
    const headerEl = document.querySelector('.header h1');

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const currentUser = allStudents.find(s => s.id === userId);

    if (!currentUser) {
        document.getElementById('dashboard-content').innerHTML = '<p>Could not load student data.</p>';
        return;
    }

    // This is now handled by auth.js, but we can personalize it more here.
    if (headerEl) {
        headerEl.textContent = `Welcome, ${currentUser.firstName}!`;
    }


    // --- GPA Calculation ---
    function calculateGpa() {
        const myGradeRecords = gradeRecords.filter(rec => rec.studentId === userId && rec.finalGrade);
        if (myGradeRecords.length === 0) {
            gpaSummaryEl.textContent = 'N/A';
            return;
        }

        const toGpaPoint = (grade) => {
            if (grade >= 97) return 4.0;
            if (grade >= 93) return 3.7;
            if (grade >= 90) return 3.3;
            if (grade >= 87) return 3.0;
            if (grade >= 83) return 2.7;
            if (grade >= 80) return 2.3;
            if (grade >= 77) return 2.0;
            if (grade >= 73) return 1.7;
            if (grade >= 70) return 1.3;
            if (grade >= 67) return 1.0;
            return 0.0;
        };

        const totalGpaPoints = myGradeRecords.reduce((sum, rec) => sum + toGpaPoint(rec.finalGrade), 0);
        const gpa = totalGpaPoints / myGradeRecords.length;
        gpaSummaryEl.textContent = gpa.toFixed(2);
    }

    // --- Attendance Calculation ---
    function calculateAttendance() {
        const myAttendanceRecords = attendanceRecords.filter(rec => rec.studentId === userId);
        if (myAttendanceRecords.length === 0) {
            attendanceSummaryEl.textContent = 'N/A';
            return;
        }
        const presentCount = myAttendanceRecords.filter(rec => rec.status === 'Present').length;
        const percentage = (presentCount / myAttendanceRecords.length) * 100;
        attendanceSummaryEl.textContent = `${percentage.toFixed(1)}%`;
    }

    // --- Today's Schedule ---
    function renderTodaysSchedule() {
        const myPlottedClasses = currentUser.plottedClasses || [];
        const today = new Date();
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];

        const todaysClasses = myPlottedClasses.filter(schedule => {
            const scheduleDay = schedule.time.substring(0, 3).trim();
            return scheduleDay.includes(dayOfWeek);
        });

        scheduleTodayListEl.innerHTML = '';
        if (todaysClasses.length === 0) {
            scheduleTodayListEl.innerHTML = '<li style="padding: 10px; text-align: center;">No classes scheduled for today.</li>';
            return;
        }

        todaysClasses.forEach(schedule => {
            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            const li = document.createElement('li');
            li.style.borderBottom = '1px solid #eee';
            li.style.padding = '10px';
            li.innerHTML = `<strong>${subject ? subject.name : 'Unknown'}</strong> - ${schedule.time}`;
            scheduleTodayListEl.appendChild(li);
        });
    }

    // --- Initial Load ---
    calculateGpa();
    calculateAttendance();
    renderTodaysSchedule();
});
