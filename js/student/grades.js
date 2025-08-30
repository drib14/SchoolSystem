document.addEventListener('DOMContentLoaded', () => {
    // 1. Protection and User Info
    protectPage(['student']);
    const loggedInStudent = getLoggedInUser();
    if (!loggedInStudent) return;

    // 2. DOM Elements
    const tableBody = document.getElementById('grades-table-body');

    // 3. Data Fetching
    const grades = getData('grades') || [];
    const schedules = getData('schedules') || [];
    const subjects = getData('subjects') || [];

    // 4. Create lookup maps
    const scheduleMap = schedules.reduce((map, sched) => { map[sched.id] = sched; return map; }, {});
    const subjectMap = subjects.reduce((map, sub) => { map[sub.id] = sub.name; return map; }, {});

    // 5. Logic
    const myGrades = grades.filter(g => g.studentId === loggedInStudent.id);

    if (myGrades.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No grades have been recorded for you yet.</td></tr>';
        return;
    }

    myGrades.forEach(grade => {
        const schedule = scheduleMap[grade.scheduleId];
        if (!schedule) return; // Should not happen in normal flow

        const subjectName = subjectMap[schedule.subjectId] || 'Unknown Subject';
        const midtermGrade = grade.midterm || 'N/A';
        const finalGrade = grade.final || 'N/A';
        const overallGrade = calculateOverall(grade.midterm, grade.final);

        const row = tableBody.insertRow();
        row.insertCell().textContent = subjectName;
        row.insertCell().textContent = midtermGrade;
        row.insertCell().textContent = finalGrade;
        row.insertCell().textContent = overallGrade;
    });

    function calculateOverall(midterm = 0, final = 0) {
        if (!midterm && !final) return 'N/A';
        return ((midterm || 0) * 0.4 + (final || 0) * 0.6).toFixed(2);
    }
});
