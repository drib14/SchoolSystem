document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const loggedInTeacherId = localStorage.getItem('userId'); // Assuming teacher ID is stored in 'userId' after login
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'teacher' || !loggedInTeacherId) {
        window.location.href = 'index.html';
        return;
    }

    // Also need to update the main login script to save teacherId to 'userId'
    // I'll assume that's done for now.

    const myClassesTbody = document.getElementById('my-classes-tbody');
    const allSchedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];

    const mySchedules = allSchedules.filter(s => s.teacherId === loggedInTeacherId);

    function renderMyClasses() {
        myClassesTbody.innerHTML = '';
        if (mySchedules.length === 0) {
            myClassesTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">You are not assigned to any classes.</td></tr>';
        } else {
            mySchedules.forEach(schedule => {
                const subject = allSubjects.find(s => s.code === schedule.subjectCode);
                const subjectName = subject ? subject.name : 'N/A';
                const row = document.createElement('tr');

                // Create a unique ID for the schedule to pass in the URL
                const scheduleId = `${schedule.subjectCode}_${schedule.sectionCode}`;

                row.innerHTML = `
                    <td>${subjectName}</td>
                    <td>${schedule.sectionCode}</td>
                    <td>${schedule.time}</td>
                    <td>${schedule.room}</td>
                    <td class="action-cell">
                        <a href="take-attendance.html?scheduleId=${scheduleId}" class="action-btn approve-btn" style="text-decoration: none;">Attendance</a>
                        <a href="grade-entry.html?scheduleId=${scheduleId}" class="action-btn" style="text-decoration: none; background-color: #ffc107;">Grades</a>
                    </td>
                `;
                myClassesTbody.appendChild(row);
            });
        }
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }

    // Initial Render
    renderMyClasses();
});
