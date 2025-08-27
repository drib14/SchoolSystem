document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    // This page is for students only
    if (userRole !== 'student' || !loggedInUserId) {
        document.body.innerHTML = '<h1>Access Denied</h1><p>You must be logged in as a student to view this page.</p>';
        return;
    }

    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const currentUser = allStudents.find(s => s.id === loggedInUserId);

    if (!currentUser) {
        document.body.innerHTML = '<h1>Error</h1><p>Could not find your data.</p>';
        return;
    }

    // Populate Header Info
    document.getElementById('academic-year-span').textContent = currentUser.academicYear || 'N/A';
    document.getElementById('student-name-span').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('student-id-span').textContent = currentUser.id;
    document.getElementById('student-course-span').textContent = currentUser.course ? currentUser.course.name : 'N/A';

    // Populate Table
    const tbody = document.getElementById('study-load-tbody');
    const plottedClasses = currentUser.plottedClasses || [];
    tbody.innerHTML = '';

    if (plottedClasses.length > 0) {
        plottedClasses.forEach(schedule => {
            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            const teacher = allTeachers.find(t => t.id === schedule.teacherId);
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${subject ? subject.name : 'N/A'}</td>
                <td>${schedule.sectionCode}</td>
                <td>${schedule.time}</td>
                <td>${teacher ? `${teacher.firstName} ${teacher.lastName}` : 'TBA'}</td>
            `;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No classes enrolled.</td></tr>';
    }
});
