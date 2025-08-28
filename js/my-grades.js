document.addEventListener('DOMContentLoaded', () => {
    // --- Auth Check ---
    const loggedInUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'student' || !loggedInUserId) {
        window.location.href = 'index.html';
        return;
    }

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];
    const currentUser = allStudents.find(s => s.id === loggedInUserId);
    const myPlottedClasses = currentUser.plottedClasses || [];

    // --- DOM Elements ---
    const gradesContent = document.getElementById('grades-content');

    function renderGrades() {
        gradesContent.innerHTML = '';
        if (myPlottedClasses.length === 0) {
            gradesContent.innerHTML = '<p>You are not enrolled in any classes.</p>';
            return;
        }

        myPlottedClasses.forEach(schedule => {
            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            const scheduleId = `${schedule.subjectCode}_${schedule.sectionCode}`;
            const record = gradeRecords.find(rec => rec.studentId === loggedInUserId && rec.scheduleId === scheduleId);

            const container = document.createElement('div');
            container.className = 'course-list-container';
            container.style.marginBottom = '20px';

            let tableHtml;
            const subjectName = subject ? subject.name : 'Unknown Subject';

            container.innerHTML = `<h3>${subjectName}</h3>`;

            if (record && record.grades) {
                tableHtml = `
                    <table class="applicants-table">
                        <tbody>
                            <tr><td>Quizzes</td><td>${record.grades.quizzes || 'N/A'}</td></tr>
                            <tr><td>Assignments</td><td>${record.grades.assignments || 'N/A'}</td></tr>
                            <tr><td>Midterm Exam</td><td>${record.grades.midterm || 'N/A'}</td></tr>
                            <tr><td>Final Exam</td><td>${record.grades.finalExam || 'N/A'}</td></tr>
                            <tr style="font-weight: bold; background-color: #f8f9fa;"><td>Final Grade</td><td>${record.finalGrade || 'N/A'}</td></tr>
                        </tbody>
                    </table>
                `;
            } else {
                tableHtml = `
                    <table class="applicants-table">
                        <tbody>
                            <tr><td>Grades not yet posted.</td></tr>
                        </tbody>
                    </table>
                `;
            }

            container.innerHTML += tableHtml;
            gradesContent.appendChild(container);
        });
    }

    // --- Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }

    // --- Initial Load ---
    renderGrades();
});
