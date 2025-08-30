document.addEventListener('DOMContentLoaded', () => {
    // --- Auth Check ---
    const loggedInUserId = localStorage.getItem('userId');
    if (!loggedInUserId) {
        document.body.innerHTML = '<h1>Access Denied. Please log in.</h1>';
        return;
    }

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const currentUser = allStudents.find(s => s.id === loggedInUserId);

    if (!currentUser) {
        document.body.innerHTML = '<h1>Could not find student data.</h1>';
        return;
    }

    // --- DOM Elements ---
    const studentInfoContainer = document.getElementById('student-info-container');
    const studyLoadTbody = document.getElementById('study-load-tbody');

    // --- Populate Student Info ---
    studentInfoContainer.innerHTML = `
        <div class="student-info-grid">
            <div><strong>Student Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</div>
            <div><strong>Course:</strong> ${currentUser.course.name}</div>
            <div><strong>Student ID:</strong> ${currentUser.id}</div>
        </div>
    `;

    // --- Populate Schedule Table ---
    const plottedClasses = currentUser.plottedClasses || [];
    let totalUnits = 0;

    if (plottedClasses.length > 0) {
        plottedClasses.forEach(schedule => {
            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            const teacher = allTeachers.find(t => t.id === schedule.teacherId);
            const row = document.createElement('tr');

            const units = subject ? parseFloat(subject.units) : 0;
            totalUnits += units;

            row.innerHTML = `
                <td>${schedule.subjectCode}</td>
                <td>${subject ? subject.name : 'N/A'}</td>
                <td>${units > 0 ? units : 'N/A'}</td>
                <td>${schedule.time}</td>
                <td>${schedule.room}</td>
                <td>${teacher ? `${teacher.firstName} ${teacher.lastName}` : 'TBA'}</td>
            `;
            studyLoadTbody.appendChild(row);
        });
    }

    // --- Add Total Units Row ---
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = 'bold';
    totalRow.style.backgroundColor = '#f2f2f2';
    totalRow.innerHTML = `
        <td colspan="2" style="text-align: right;">Total Units:</td>
        <td>${totalUnits}</td>
        <td colspan="3"></td>
    `;
    studyLoadTbody.appendChild(totalRow);

    // --- Trigger Print Dialog ---
    // Use a timeout to ensure content is rendered before printing
    setTimeout(() => {
        window.print();
    }, 500);
});
