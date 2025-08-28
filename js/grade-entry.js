document.addEventListener('DOMContentLoaded', () => {
    // --- Auth & URL Param ---
    const loggedInTeacherId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'teacher' || !loggedInTeacherId) {
        window.location.href = 'index.html';
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const scheduleId = urlParams.get('scheduleId');
    if (!scheduleId) {
        window.location.href = 'my-classes.html';
        return;
    }
    const [subjectCode, sectionCode] = scheduleId.split('_');

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSchedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    let gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];

    const currentSchedule = allSchedules.find(s => s.subjectCode === subjectCode && s.sectionCode === sectionCode);
    const currentSubject = allSubjects.find(s => s.code === subjectCode);

    if (!currentSchedule || !currentSubject) {
        Toastify({ text: 'Could not find class details.', duration: 3000, className: "toast-error", gravity: "top", position: "center" }).showToast();
        return;
    }

    // --- DOM Elements ---
    const header = document.getElementById('grade-entry-header');
    const rosterTbody = document.getElementById('roster-tbody');
    const gradesForm = document.getElementById('grades-form');

    // --- Update Header ---
    header.innerHTML = `<h1>Grade Entry</h1><p>${currentSubject.name} - Section ${currentSchedule.sectionCode}</p>`;

    // --- Find Enrolled Students ---
    const enrolledStudents = allStudents.filter(student =>
        student.plottedClasses && student.plottedClasses.some(plotted =>
            plotted.subjectCode === subjectCode && plotted.sectionCode === sectionCode
        )
    );

    // --- Render Roster and Grade Inputs ---
    function renderRoster() {
        rosterTbody.innerHTML = '';
        if (enrolledStudents.length === 0) {
            rosterTbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No students are enrolled in this class.</td></tr>';
            gradesForm.querySelector('button').style.display = 'none';
        } else {
            enrolledStudents.forEach(student => {
                const existingRecord = gradeRecords.find(rec => rec.scheduleId === scheduleId && rec.studentId === student.id);
                const grades = existingRecord ? existingRecord.grades : { quizzes: '', assignments: '', midterm: '', finalExam: '' };
                const finalGrade = existingRecord ? existingRecord.finalGrade : 'N/A';

                const row = document.createElement('tr');
                row.dataset.studentId = student.id;
                row.innerHTML = `
                    <td>${student.id}</td>
                    <td>${student.firstName} ${student.lastName}</td>
                    <td class="grade-inputs"><input type="number" class="grade-component" name="quizzes" value="${grades.quizzes || ''}" min="0" max="100"></td>
                    <td class="grade-inputs"><input type="number" class="grade-component" name="assignments" value="${grades.assignments || ''}" min="0" max="100"></td>
                    <td class="grade-inputs"><input type="number" class="grade-component" name="midterm" value="${grades.midterm || ''}" min="0" max="100"></td>
                    <td class="grade-inputs"><input type="number" class="grade-component" name="finalExam" value="${grades.finalExam || ''}" min="0" max="100"></td>
                    <td class="grade-inputs"><input type="text" class="final-grade-input" name="finalGrade" value="${finalGrade}" readonly></td>
                `;
                rosterTbody.appendChild(row);
            });
        }
    }

    // --- Form Submission ---
    gradesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rosterRows = rosterTbody.querySelectorAll('tr');

        rosterRows.forEach(row => {
            const studentId = row.dataset.studentId;
            if (!studentId) return;

            const grades = {
                quizzes: row.querySelector('input[name="quizzes"]').value,
                assignments: row.querySelector('input[name="assignments"]').value,
                midterm: row.querySelector('input[name="midterm"]').value,
                finalExam: row.querySelector('input[name="finalExam"]').value
            };

            const gradeValues = Object.values(grades).map(g => parseFloat(g) || 0);
            const finalGrade = gradeValues.reduce((sum, g) => sum + g, 0) / gradeValues.length;

            const recordIndex = gradeRecords.findIndex(rec => rec.scheduleId === scheduleId && rec.studentId === studentId);

            if (recordIndex > -1) {
                gradeRecords[recordIndex].grades = grades;
                gradeRecords[recordIndex].finalGrade = finalGrade.toFixed(2);
            } else {
                gradeRecords.push({
                    scheduleId: scheduleId,
                    studentId: studentId,
                    grades: grades,
                    finalGrade: finalGrade.toFixed(2)
                });
            }
        });

        localStorage.setItem('gradeRecords', JSON.stringify(gradeRecords));
        Toastify({ text: 'All grades have been saved successfully!', duration: 3000, className: "toast-success", gravity: "top", position: "right" }).showToast();

        // Create notifications for each student
        rosterRows.forEach(row => {
            const studentId = row.dataset.studentId;
            if (studentId) {
                createNotification(studentId, `New grades have been posted for ${currentSubject.name}.`, 'my-grades.html');
            }
        });

        renderRoster(); // Re-render to show calculated final grade
    });

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
    renderRoster();
});
