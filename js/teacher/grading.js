document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup and Protection
    protectPage(['teacher']);
    const loggedInTeacher = getLoggedInUser();
    if (!loggedInTeacher) return;

    // 2. DOM Elements
    const classSelect = document.getElementById('class-select');
    const gradesForm = document.getElementById('grades-form');
    const gradesTableBody = document.getElementById('grades-table-body');
    const classTitleDisplay = document.getElementById('class-title-display');

    // 3. Data
    const schedules = getData('schedules') || [];
    const subjects = getData('subjects') || [];
    const enrollments = getData('enrollments') || [];
    const users = getData('users') || [];
    let grades = getData('grades') || [];

    // 4. Initial Population
    populateClassSelector();

    // 5. Event Listeners
    classSelect.addEventListener('change', () => displayGradeTable(classSelect.value));
    gradesForm.addEventListener('submit', handleGradeSave);


    function populateClassSelector() {
        const mySchedules = schedules.filter(s => s.teacherId === loggedInTeacher.id);
        const subjectMap = subjects.reduce((map, sub) => { map[sub.id] = sub.name; return map; }, {});

        mySchedules.forEach(schedule => {
            const subjectName = subjectMap[schedule.subjectId] || 'Unknown Subject';
            const option = new Option(`${subjectName} (${schedule.time})`, schedule.id);
            classSelect.add(option);
        });
    }

    function displayGradeTable(scheduleId) {
        if (!scheduleId) {
            gradesForm.style.display = 'none';
            return;
        }
        scheduleId = parseInt(scheduleId);

        const studentsInClass = enrollments
            .filter(e => e.scheduleId === scheduleId)
            .map(e => users.find(u => u.id === e.studentId && u.role === 'student'))
            .filter(Boolean); // Filter out any undefined users

        gradesTableBody.innerHTML = '';
        if (studentsInClass.length === 0) {
            gradesTableBody.innerHTML = '<tr><td colspan="4">No students enrolled in this class.</td></tr>';
        }

        studentsInClass.forEach(student => {
            const existingGrade = grades.find(g => g.studentId === student.id && g.scheduleId === scheduleId) || {};
            const row = gradesTableBody.insertRow();
            row.dataset.studentId = student.id; // Store studentId on the row

            row.insertCell().textContent = student.name;

            const midtermCell = row.insertCell();
            midtermCell.innerHTML = `<input type="number" class="grade-input" name="midterm" min="0" max="100" value="${existingGrade.midterm || ''}">`;

            const finalCell = row.insertCell();
            finalCell.innerHTML = `<input type="number" class="grade-input" name="final" min="0" max="100" value="${existingGrade.final || ''}">`;

            const overallCell = row.insertCell();
            const overallGrade = calculateOverall(existingGrade.midterm, existingGrade.final);
            overallCell.textContent = overallGrade;
        });

        gradesForm.style.display = 'block';
    }

    function handleGradeSave(event) {
        event.preventDefault();
        const scheduleId = parseInt(classSelect.value);
        if (!scheduleId) return;

        const rows = gradesTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const studentId = parseInt(row.dataset.studentId);
            const midterm = parseInt(row.querySelector('input[name="midterm"]').value) || 0;
            const final = parseInt(row.querySelector('input[name="final"]').value) || 0;

            const gradeIndex = grades.findIndex(g => g.studentId === studentId && g.scheduleId === scheduleId);

            if (gradeIndex > -1) {
                // Update existing grade
                grades[gradeIndex].midterm = midterm;
                grades[gradeIndex].final = final;
            } else {
                // Create new grade record
                grades.push({
                    id: Date.now() + studentId, // simple unique id
                    studentId,
                    scheduleId,
                    midterm,
                    final
                });
            }
        });

        saveData('grades', grades);
        alert('Grades saved successfully!');
        displayGradeTable(scheduleId); // Refresh table to show calculated overall grades
    }

    function calculateOverall(midterm = 0, final = 0) {
        // Assuming 40% midterm, 60% final for calculation
        if (midterm === 0 && final === 0) return 'N/A';
        return (midterm * 0.4 + final * 0.6).toFixed(2);
    }
});
