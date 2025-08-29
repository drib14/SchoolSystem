document.addEventListener('DOMContentLoaded', () => {
    // --- Auth Check ---
    const loggedInUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'student' || !loggedInUserId) {
        // This page should not be accessible otherwise, but as a fallback:
        document.body.innerHTML = 'You do not have permission to view this page.';
        return;
    }

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const currentUser = allStudents.find(s => s.id === loggedInUserId);

    if (!currentUser) {
        document.body.innerHTML = 'Could not load student data.';
        return;
    }

    // --- DOM Elements ---
    const studentInfoContainer = document.getElementById('student-info-container');
    const studyLoadTbody = document.getElementById('study-load-tbody');

    // --- Render Student Info ---
    studentInfoContainer.innerHTML = `
        <div class="student-info-grid">
            <div><strong>Student Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</div>
            <div><strong>Student ID:</strong> ${currentUser.id}</div>
            <div><strong>Course:</strong> ${currentUser.course ? currentUser.course.name : 'N/A'}</div>
            <div><strong>Year Level:</strong> ${currentUser.yearLevel || 'N/A'}</div>
        </div>
    `;

    // --- Render Table ---
    const myPlottedClasses = currentUser.plottedClasses || [];
    let totalUnits = 0;

    if (myPlottedClasses.length > 0) {
        myPlottedClasses.forEach(schedule => {
            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            const teacher = allTeachers.find(t => t.id === schedule.teacherId);
            const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
            const subjectUnits = subject ? parseFloat(subject.units) || 0 : 0;
            totalUnits += subjectUnits;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${schedule.subjectCode}</td>
                <td>${subject ? subject.name : 'N/A'}</td>
                <td>${subjectUnits}</td>
                <td>${schedule.time}</td>
                <td>${schedule.room}</td>
                <td>${teacherName}</td>
            `;
            studyLoadTbody.appendChild(row);
        });
    }

    // --- Add Total Units Row ---
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = 'bold';
    totalRow.innerHTML = `
        <td colspan="2" style="text-align: right;">Total Units:</td>
        <td>${totalUnits}</td>
        <td colspan="3"></td>
    `;
    studyLoadTbody.appendChild(totalRow);

    // --- Trigger Print ---
    // Use a timeout to ensure all content is rendered before printing
    setTimeout(() => {
        window.print();
    }, 500);
});
