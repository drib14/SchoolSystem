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
        alert('Could not find class details.');
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
        const WEIGHTS = { midterm: { quizzes: 0.3, assignments: 0.3, midtermExam: 0.4 }, final: { midtermGrade: 0.5, finalExam: 0.5 } };

        rosterRows.forEach(row => {
            const studentId = row.dataset.studentId;
            if (!studentId) return;

            const rawScores = {
                quizzes: parseFloat(row.querySelector('input[name="quizzes"]').value) || 0,
                assignments: parseFloat(row.querySelector('input[name="assignments"]').value) || 0,
                midtermExam: parseFloat(row.querySelector('input[name="midtermExam"]').value) || 0,
                finalExam: parseFloat(row.querySelector('input[name="finalExam"]').value) || 0
            };

            const midtermGrade = (rawScores.quizzes * WEIGHTS.midterm.quizzes) + (rawScores.assignments * WEIGHTS.midterm.assignments) + (rawScores.midtermExam * WEIGHTS.midterm.midtermExam);
            const finalGrade = (midtermGrade * WEIGHTS.final.midtermGrade) + (rawScores.finalExam * WEIGHTS.final.finalExam);

            const recordIndex = gradeRecords.findIndex(rec => rec.scheduleId === scheduleId && rec.studentId === studentId);
            const record = {
                scheduleId: scheduleId, studentId: studentId,
                grades: { quizzes: rawScores.quizzes, assignments: rawScores.assignments, midtermExam: rawScores.midtermExam, finalExam: rawScores.finalExam },
                calculated: { midtermGrade: midtermGrade.toFixed(2), finalGrade: finalGrade.toFixed(2) }
            };

            if (recordIndex > -1) gradeRecords[recordIndex] = record;
            else gradeRecords.push(record);
        });

        localStorage.setItem('gradeRecords', JSON.stringify(gradeRecords));
        Toastify({ text: "All grades have been saved and calculated successfully!", duration: 3000 }).showToast();

        let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        rosterRows.forEach(row => {
            const studentId = row.dataset.studentId;
            if (!studentId) return;
            notifications.push({
                id: Date.now() + Math.random(),
                userId: studentId,
                message: `New grades have been posted for ${currentSubject.name}.`,
                link: "my-grades.html",
                isRead: false,
                timestamp: new Date().toISOString()
            });
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));

        renderRoster();
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
