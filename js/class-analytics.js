document.addEventListener('DOMContentLoaded', () => {
    const loggedInTeacherId = localStorage.getItem('userId');
    if (localStorage.getItem('userRole') !== 'teacher' || !loggedInTeacherId) return;

    const classSelect = document.getElementById('class-select');
    const analyticsContainer = document.getElementById('analytics-container');
    const avgGradeEl = document.getElementById('avg-grade');
    const highGradeEl = document.getElementById('high-grade');
    const lowGradeEl = document.getElementById('low-grade');
    const chartCanvas = document.getElementById('grade-distribution-chart');
    let gradeChart = null;

    const allSchedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];

    // --- Populate Class Dropdown ---
    function populateClasses() {
        const mySchedules = allSchedules.filter(s => s.teacherId === loggedInTeacherId);
        if (mySchedules.length === 0) {
            classSelect.innerHTML = '<option value="">You have no classes</option>';
        } else {
            mySchedules.forEach(schedule => {
                const subject = allSubjects.find(s => s.code === schedule.subjectCode);
                const option = document.createElement('option');
                option.value = `${schedule.subjectCode}_${schedule.sectionCode}`;
                option.textContent = `${subject ? subject.name : 'N/A'} - Section ${schedule.sectionCode}`;
                classSelect.appendChild(option);
            });
        }
    }

    // --- Analytics Logic ---
    function showAnalyticsForClass(scheduleId) {
        const studentsInClass = allStudents.filter(student =>
            student.plottedClasses && student.plottedClasses.some(pc => `${pc.subjectCode}_${pc.sectionCode}` === scheduleId)
        );
        const studentIdsInClass = studentsInClass.map(s => s.id);

        const gradesForClass = gradeRecords
            .filter(rec => rec.scheduleId === scheduleId && studentIdsInClass.includes(rec.studentId) && rec.calculated && rec.calculated.finalGrade)
            .map(rec => parseFloat(rec.calculated.finalGrade));

        if (gradesForClass.length === 0) {
            analyticsContainer.style.display = 'none';
            Toastify({ text: "No final grades posted for this class yet.", duration: 3000 }).showToast();
            return;
        }

        // Calculate stats
        const sum = gradesForClass.reduce((a, b) => a + b, 0);
        avgGradeEl.textContent = (sum / gradesForClass.length).toFixed(2);
        highGradeEl.textContent = Math.max(...gradesForClass).toFixed(2);
        lowGradeEl.textContent = Math.min(...gradesForClass).toFixed(2);

        // Calculate grade distribution
        const distribution = { '90-100': 0, '80-89': 0, '70-79': 0, 'Below 70': 0 };
        gradesForClass.forEach(grade => {
            if (grade >= 90) distribution['90-100']++;
            else if (grade >= 80) distribution['80-89']++;
            else if (grade >= 70) distribution['70-79']++;
            else distribution['Below 70']++;
        });

        // Render chart
        if (gradeChart) gradeChart.destroy();
        gradeChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(distribution),
                datasets: [{
                    label: 'Number of Students',
                    data: Object.values(distribution),
                    backgroundColor: ['#28a745', '#007bff', '#ffc107', '#dc3545']
                }]
            },
            options: {
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });

        analyticsContainer.style.display = 'block';
    }

    // --- Event Listener ---
    classSelect.addEventListener('change', () => {
        const selectedClass = classSelect.value;
        if (selectedClass) {
            showAnalyticsForClass(selectedClass);
        } else {
            analyticsContainer.style.display = 'none';
        }
    });

    // --- Initial Load ---
    populateClasses();
});
