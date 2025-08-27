document.addEventListener('DOMContentLoaded', () => {
    // This will be handled by auth.js, but we repeat it here for safety
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'teacher') {
        // window.location.href = 'index.html'; // auth.js will handle this
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const scheduleId = urlParams.get('scheduleId');
    if (!scheduleId) {
        // window.location.href = 'my-classes.html'; // or show an error
        return;
    }
    const [subjectCode, sectionCode] = scheduleId.split('_');

    // --- Grade Weight Configuration ---
    const WEIGHTS = {
        midterm: {
            quizzes: 0.3,
            assignments: 0.3,
            midtermExam: 0.4
        },
        final: {
            midtermGrade: 0.5,
            finalExam: 0.5
        }
    };

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSchedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    let gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];

    const currentSchedule = allSchedules.find(s => s.subjectCode === subjectCode && s.sectionCode === sectionCode);
    const currentSubject = allSubjects.find(s => s.code === subjectCode);

    if (!currentSchedule || !currentSubject) {
        Toastify({
            text: "Error: Could not find class details.",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)",
            stopOnFocus: true,
        }).showToast();
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
            rosterTbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No students are enrolled in this class.</td></tr>';
            gradesForm.querySelector('button').style.display = 'none';
        } else {
            enrolledStudents.forEach(student => {
                const existingRecord = gradeRecords.find(rec => rec.scheduleId === scheduleId && rec.studentId === student.id);
                const grades = existingRecord ? existingRecord.grades : { quizzes: '', assignments: '', midtermExam: '', finalExam: '' };
                const calculatedGrades = existingRecord ? existingRecord.calculated : { midtermGrade: 'N/A', finalGrade: 'N/A' };

                const row = document.createElement('tr');
                row.dataset.studentId = student.id;
                row.innerHTML = `
                    <td>${student.id}</td>
                    <td>${student.firstName} ${student.lastName}</td>
                    <td class="grade-inputs"><input type="number" name="quizzes" value="${grades.quizzes || ''}" min="0" max="100"></td>
                    <td class="grade-inputs"><input type="number" name="assignments" value="${grades.assignments || ''}" min="0" max="100"></td>
                    <td class="grade-inputs"><input type="number" name="midtermExam" value="${grades.midtermExam || ''}" min="0" max="100"></td>
                    <td class="grade-inputs"><input type="text" name="midtermGrade" value="${calculatedGrades.midtermGrade}" readonly class="final-grade-input"></td>
                    <td class="grade-inputs"><input type="number" name="finalExam" value="${grades.finalExam || ''}" min="0" max="100"></td>
                    <td class="grade-inputs"><input type="text" name="finalGrade" value="${calculatedGrades.finalGrade}" readonly class="final-grade-input"></td>
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

            // Get raw scores from inputs
            const rawScores = {
                quizzes: parseFloat(row.querySelector('input[name="quizzes"]').value) || 0,
                assignments: parseFloat(row.querySelector('input[name="assignments"]').value) || 0,
                midtermExam: parseFloat(row.querySelector('input[name="midtermExam"]').value) || 0,
                finalExam: parseFloat(row.querySelector('input[name="finalExam"]').value) || 0
            };

            // Calculate midterm grade
            const midtermGrade = (rawScores.quizzes * WEIGHTS.midterm.quizzes) +
                                 (rawScores.assignments * WEIGHTS.midterm.assignments) +
                                 (rawScores.midtermExam * WEIGHTS.midterm.midtermExam);

            // Calculate final grade
            const finalGrade = (midtermGrade * WEIGHTS.final.midtermGrade) +
                               (rawScores.finalExam * WEIGHTS.final.finalExam);

            // Find existing record or create a new one
            const recordIndex = gradeRecords.findIndex(rec => rec.scheduleId === scheduleId && rec.studentId === studentId);

            const record = {
                scheduleId: scheduleId,
                studentId: studentId,
                grades: { // Store raw input values
                    quizzes: row.querySelector('input[name="quizzes"]').value,
                    assignments: row.querySelector('input[name="assignments"]').value,
                    midtermExam: row.querySelector('input[name="midtermExam"]').value,
                    finalExam: row.querySelector('input[name="finalExam"]').value
                },
                calculated: {
                    midtermGrade: midtermGrade.toFixed(2),
                    finalGrade: finalGrade.toFixed(2)
                }
            };

            if (recordIndex > -1) {
                gradeRecords[recordIndex] = record;
            } else {
                gradeRecords.push(record);
            }
        });

        localStorage.setItem('gradeRecords', JSON.stringify(gradeRecords));
        Toastify({
            text: "All grades have been saved and calculated successfully!",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
            stopOnFocus: true,
        }).showToast();
        renderRoster(); // Re-render to show calculated grades
    });

    // --- Initial Load ---
    renderRoster();
});
