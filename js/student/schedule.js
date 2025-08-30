document.addEventListener('DOMContentLoaded', () => {
    // 1. Protection and User Info
    protectPage(['student']);
    const loggedInStudent = getLoggedInUser();
    if (!loggedInStudent) return;

    // 2. DOM Elements
    const tableBody = document.getElementById('schedule-table-body');

    // 3. Data Fetching
    const enrollments = getData('enrollments') || [];
    const schedules = getData('schedules') || [];
    const subjects = getData('subjects') || [];
    const users = getData('users') || [];

    // 4. Create lookup maps for efficiency
    const subjectMap = subjects.reduce((map, sub) => { map[sub.id] = sub.name; return map; }, {});
    const teacherMap = users.reduce((map, user) => { if (user.role === 'teacher') { map[user.id] = user.name; } return map; }, {});
    const scheduleMap = schedules.reduce((map, sched) => { map[sched.id] = sched; return map; }, {});

    // 5. Logic
    const myEnrollments = enrollments.filter(e => e.studentId === loggedInStudent.id);

    if (myEnrollments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3">You are not enrolled in any classes.</td></tr>';
        return;
    }

    myEnrollments.forEach(enrollment => {
        const schedule = scheduleMap[enrollment.scheduleId];
        if (!schedule) return; // Skip if schedule not found

        const subjectName = subjectMap[schedule.subjectId] || 'Unknown Subject';
        const teacherName = teacherMap[schedule.teacherId] || 'Unknown Teacher';
        const scheduleTime = schedule.time;

        const row = tableBody.insertRow();
        row.insertCell().textContent = subjectName;
        row.insertCell().textContent = teacherName;
        row.insertCell().textContent = scheduleTime;
    });
});
