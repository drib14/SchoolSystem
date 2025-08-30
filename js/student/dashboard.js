document.addEventListener('DOMContentLoaded', () => {
    // 1. Protection and User Info
    protectPage(['student']);
    const loggedInStudent = getLoggedInUser();
    if (!loggedInStudent) return;

    // 2. DOM Elements
    const classCountEl = document.getElementById('class-count');
    const overallAverageEl = document.getElementById('overall-average');

    // 3. Data Fetching
    const enrollments = getData('enrollments') || [];
    const grades = getData('grades') || [];

    // 4. Calculations
    // Count enrolled classes
    const myEnrollments = enrollments.filter(e => e.studentId === loggedInStudent.id);
    classCountEl.textContent = myEnrollments.length;

    // Calculate overall average grade
    const myGrades = grades.filter(g => g.studentId === loggedInStudent.id);
    if (myGrades.length > 0) {
        let totalPoints = 0;
        myGrades.forEach(grade => {
            // Using the same 40/60 split as in the grading module
            const overall = (grade.midterm * 0.4) + (grade.final * 0.6);
            totalPoints += overall;
        });
        const average = totalPoints / myGrades.length;
        overallAverageEl.textContent = average.toFixed(2);
    } else {
        overallAverageEl.textContent = 'N/A';
    }
});
