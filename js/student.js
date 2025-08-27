document.addEventListener('DOMContentLoaded', () => {
    // Auth checks and sidebar population are handled by auth.js
    const loggedInUserId = localStorage.getItem('userId');

    const subjectCountEl = document.getElementById('student-subject-count');
    const gpaEl = document.getElementById('student-gpa');
    const absenceCountEl = document.getElementById('student-absence-count');

    // --- GPA Calculation Helper ---
    function convertToGpa(grade) {
        const g = parseFloat(grade);
        if (isNaN(g)) return 0;
        if (g >= 97) return 4.0;
        if (g >= 93) return 3.7;
        if (g >= 90) return 3.3;
        if (g >= 87) return 3.0;
        if (g >= 83) return 2.7;
        if (g >= 80) return 2.3;
        if (g >= 77) return 2.0;
        if (g >= 73) return 1.7;
        if (g >= 70) return 1.3;
        if (g >= 67) return 1.0;
        return 0;
    }

    // --- Populate Dashboard Cards ---
    function populateDashboard() {
        if (!loggedInUserId) return;

        const allStudents = JSON.parse(localStorage.getItem('students')) || [];
        const gradeRecords = JSON.parse(localStorage.getItem('gradeRecords')) || [];
        const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        const currentUser = allStudents.find(s => s.id === loggedInUserId);

        if (!currentUser) return;

        // 1. Calculate enrolled subjects
        const enrolledSubjectsCount = currentUser.plottedClasses ? currentUser.plottedClasses.length : 0;
        if (subjectCountEl) {
            subjectCountEl.textContent = enrolledSubjectsCount;
        }

        // 2. Calculate Overall GPA
        const myGradeRecords = gradeRecords.filter(rec => rec.studentId === loggedInUserId && rec.calculated && rec.calculated.finalGrade);
        if (myGradeRecords.length > 0) {
            const totalGpaPoints = myGradeRecords.reduce((sum, rec) => sum + convertToGpa(rec.calculated.finalGrade), 0);
            const overallGpa = totalGpaPoints / myGradeRecords.length;
            if (gpaEl) {
                gpaEl.textContent = overallGpa.toFixed(2);
            }
        } else {
             if (gpaEl) {
                gpaEl.textContent = 'N/A';
            }
        }

        // 3. Calculate total absences
        const myAbsences = attendanceRecords.filter(rec => rec.studentId === loggedInUserId && rec.status === 'Absent');
        if (absenceCountEl) {
            absenceCountEl.textContent = myAbsences.length;
        }
    }

    // --- Initial Load ---
    populateDashboard();
});
