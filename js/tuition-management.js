document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const tuitionTbody = document.getElementById('tuition-tbody');
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const tuitionRate = parseFloat(localStorage.getItem('tuitionRate')) || 0;

    function renderTuitionTable() {
        tuitionTbody.innerHTML = '';
        const enrolledStudents = allStudents.filter(s => s.status === 'enrolled');

        if (enrolledStudents.length === 0) {
            tuitionTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No enrolled students found.</td></tr>';
            return;
        }

        if (tuitionRate === 0) {
            const header = document.querySelector('.header');
            if (!header.querySelector('.warning-message')) {
                 const warning = document.createElement('p');
                 warning.style.color = 'red';
                 warning.style.fontWeight = 'bold';
                 warning.textContent = 'Warning: Tuition rate is not set. Please set it in Tuition Settings.';
                 warning.className = 'warning-message';
                 header.appendChild(warning);
            }
        }

        enrolledStudents.forEach(student => {
            const plottedClasses = student.plottedClasses || [];
            let totalUnits = 0;

            plottedClasses.forEach(schedule => {
                const subject = allSubjects.find(s => s.code === schedule.subjectCode);
                if (subject) {
                    totalUnits += parseFloat(subject.units) || 0;
                }
            });

            const totalTuition = totalUnits * tuitionRate;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.course ? student.course.name : 'N/A'}</td>
                <td>${totalUnits}</td>
                <td>₱ ${totalTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            `;
            tuitionTbody.appendChild(row);
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }

    // Initial Render
    renderTuitionTable();
});
