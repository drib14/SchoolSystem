document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect page and get the logged-in user
    protectPage(['teacher']);
    const loggedInTeacher = getLoggedInUser();
    if (!loggedInTeacher) return;

    // 2. Get DOM elements
    const classesContainer = document.getElementById('classes-container');

    // 3. Fetch all necessary data
    const schedules = getData('schedules') || [];
    const subjects = getData('subjects') || [];
    const enrollments = getData('enrollments') || [];
    const users = getData('users') || [];

    // 4. Create lookup maps for efficiency
    const subjectMap = subjects.reduce((map, sub) => {
        map[sub.id] = sub.name;
        return map;
    }, {});

    const studentMap = users.reduce((map, user) => {
        if (user.role === 'student') {
            map[user.id] = user.name;
        }
        return map;
    }, {});

    // 5. Find schedules for the current teacher
    const mySchedules = schedules.filter(s => s.teacherId === loggedInTeacher.id);

    // 6. Render the classes
    if (mySchedules.length === 0) {
        classesContainer.innerHTML = '<p>You are not assigned to any classes.</p>';
        return;
    }

    mySchedules.forEach(schedule => {
        const classCard = document.createElement('div');
        classCard.className = 'class-card';

        const subjectName = subjectMap[schedule.subjectId] || 'Unknown Subject';
        const scheduleTime = schedule.time; // Assuming 'time' is a string like "MWF 9:00-10:00"

        // Find students enrolled in this specific class schedule
        const enrolledStudents = enrollments
            .filter(e => e.scheduleId === schedule.id)
            .map(e => studentMap[e.studentId] || 'Unknown Student');

        let studentListHtml = '<p>No students enrolled.</p>';
        if (enrolledStudents.length > 0) {
            studentListHtml = '<ul class="student-list">';
            enrolledStudents.forEach(studentName => {
                studentListHtml += `<li>${studentName}</li>`;
            });
            studentListHtml += '</ul>';
        }

        classCard.innerHTML = `
            <h3>${subjectName}</h3>
            <p><strong>Schedule:</strong> ${scheduleTime}</p>
            <h4>Enrolled Students:</h4>
            ${studentListHtml}
        `;

        classesContainer.appendChild(classCard);
    });
});
