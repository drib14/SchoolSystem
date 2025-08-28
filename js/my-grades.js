document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'student' || !loggedInUserId) {
        // This check is redundant if auth.js is loaded first, but good for safety
        // window.location.href = 'index.html';
        return;
    }

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];
    const currentUser = allStudents.find(s => s.id === loggedInUserId);
    const myPlottedClasses = currentUser ? currentUser.plottedClasses || [] : [];

    // --- DOM Elements ---
    const gradesContent = document.getElementById('grades-content');

    function renderGrades() {
        gradesContent.innerHTML = '';
        if (myPlottedClasses.length === 0) {
            gradesContent.innerHTML = '<div class="content"><p>You are not enrolled in any classes.</p></div>';
            return;
        }

        myPlottedClasses.forEach(schedule => {
            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            const scheduleId = `${schedule.subjectCode}_${schedule.sectionCode}`;
            const record = gradeRecords.find(rec => rec.studentId === loggedInUserId && rec.scheduleId === scheduleId);

            const container = document.createElement('div');
            container.className = 'content'; // Use the standard content box style
            container.style.marginBottom = '20px';

            const subjectName = subject ? subject.name : 'Unknown Subject';
            let tableHtml;

            container.innerHTML = `<h2>${subjectName}</h2>`;

            if (record && record.grades && record.calculated) {
                tableHtml = `
                    <table class="applicants-table">
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Quizzes</td><td>${record.grades.quizzes || 'N/A'}</td></tr>
                            <tr><td>Assignments</td><td>${record.grades.assignments || 'N/A'}</td></tr>
                            <tr><td>Midterm Exam</td><td>${record.grades.midtermExam || 'N/A'}</td></tr>
                            <tr class="summary-row"><td><strong>Midterm Grade</strong></td><td><strong>${record.calculated.midtermGrade || 'N/A'}</strong></td></tr>
                            <tr><td>Final Exam</td><td>${record.grades.finalExam || 'N/A'}</td></tr>
                            <tr class="summary-row"><td><strong>Final Grade</strong></td><td><strong>${record.calculated.finalGrade || 'N/A'}</strong></td></tr>
                        </tbody>
                    </table>
                `;
            } else {
                tableHtml = '<p>Grades have not been posted for this class yet.</p>';
            }

            container.innerHTML += tableHtml;
            gradesContent.appendChild(container);
        });
    }

    // Add some basic styling for the summary rows
    const style = document.createElement('style');
    style.innerHTML = `
        .summary-row {
            font-weight: bold;
            background-color: #f8f9fa;
        }
    `;
    document.head.appendChild(style);

    function renderGradesChart() {
        const myGradeRecords = gradeRecords.filter(rec => rec.studentId === loggedInUserId && rec.calculated && rec.calculated.finalGrade);

        if (myGradeRecords.length === 0) return;

        const labels = myGradeRecords.map(rec => {
            const subject = allSubjects.find(s => s.code === rec.scheduleId.split('_')[0]);
            return subject ? subject.name : 'Unknown';
        });
        const data = myGradeRecords.map(rec => parseFloat(rec.calculated.finalGrade));

        const chartCanvas = document.getElementById('grades-chart');
        new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Final Grade',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // --- Initial Load ---
    renderGrades();
    renderGradesChart();
});
