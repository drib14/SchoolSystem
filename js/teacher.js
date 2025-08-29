document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (userRole !== 'teacher' || !userId) {
        window.location.href = 'index.html';
        return;
    }

    // --- DOM Elements ---
    const classCountEl = document.getElementById('class-count');
    const attendanceOverviewEl = document.getElementById('attendance-overview');
    const todoListEl = document.getElementById('todo-list');
    const headerEl = document.querySelector('.header h1');

    // --- Data Loading ---
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const allSchedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];
    const currentUser = allTeachers.find(t => t.id === userId);

    if (!currentUser) {
        document.getElementById('dashboard-content').innerHTML = '<p>Could not load teacher data.</p>';
        return;
    }

    if (headerEl) {
        headerEl.textContent = `Welcome, ${currentUser.firstName}!`;
    }
    const mySchedules = allSchedules.filter(s => s.teacherId === userId);

    // --- Class Count ---
    classCountEl.textContent = mySchedules.length;

    // --- Attendance Overview ---
    function calculateAttendanceOverview() {
        const myScheduleIds = mySchedules.map(s => `${s.subjectCode}_${s.sectionCode}`);
        const relevantRecords = attendanceRecords.filter(rec => myScheduleIds.includes(rec.scheduleId));
        if (relevantRecords.length === 0) {
            attendanceOverviewEl.textContent = 'N/A';
            return;
        }
        const presentCount = relevantRecords.filter(rec => rec.status === 'Present').length;
        const percentage = (presentCount / relevantRecords.length) * 100;
        attendanceOverviewEl.textContent = `${percentage.toFixed(1)}%`;
    }

    // --- To-Do List ---
    function generateTodoList() {
        todoListEl.innerHTML = '';
        let todosFound = false;

        mySchedules.forEach(schedule => {
            const scheduleId = `${schedule.subjectCode}_${schedule.sectionCode}`;
            const studentsInClass = allStudents.filter(student =>
                student.plottedClasses && student.plottedClasses.some(plotted =>
                    `${plotted.subjectCode}_${plotted.sectionCode}` === scheduleId
                )
            );

            if (studentsInClass.length === 0) return;

            const gradedStudents = gradeRecords.filter(rec => rec.scheduleId === scheduleId && rec.finalGrade).map(rec => rec.studentId);
            const ungradedStudentCount = studentsInClass.filter(s => !gradedStudents.includes(s.id)).length;

            if (ungradedStudentCount > 0) {
                todosFound = true;
                const subject = allSubjects.find(s => s.code === schedule.subjectCode);
                const li = document.createElement('li');
                li.style.borderBottom = '1px solid #eee';
                li.style.padding = '10px';
                li.innerHTML = `
                    <a href="grade-entry.html?scheduleId=${scheduleId}" style="text-decoration: none; color: inherit;">
                        <strong>Enter Grades:</strong> ${ungradedStudentCount} student(s) in <strong>${subject.name} - Section ${schedule.sectionCode}</strong> need final grades.
                    </a>
                `;
                todoListEl.appendChild(li);
            }
        });

        if (!todosFound) {
            todoListEl.innerHTML = '<li style="padding: 10px; text-align: center;">No actions required at this time.</li>';
        }
    }

    // --- Initial Load ---
    calculateAttendanceOverview();
    generateTodoList();
});
