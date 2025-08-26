document.addEventListener('DOMContentLoaded', () => {
    // --- Auth Check ---
    const loggedInUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'student' || !loggedInUserId) {
        window.location.href = 'index.html';
        return;
    }

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const allSchedules = JSON.parse(localStorage.getItem('schedules')) || [];

    const currentUser = allStudents.find(s => s.id === loggedInUserId);

    if (!currentUser || !currentUser.course) {
        // This can happen if the student's application is still pending
        document.querySelector('.main-content').innerHTML = `
            <div class="header"><h1>Class Enrollment</h1></div>
            <div class="content"><p>Your enrollment is still pending approval. You will be able to enroll in classes once an administrator has approved your application.</p></div>
        `;
        return;
    }

    // --- DOM Elements ---
    const availableClassesTbody = document.getElementById('available-classes-tbody');
    const plottedClassesTbody = document.getElementById('plotted-classes-tbody');

    // --- State ---
    let studentPlottedSchedules = currentUser.plottedClasses || [];

    // --- Rendering Logic ---
    function renderAvailableClasses() {
        availableClassesTbody.innerHTML = '';
        const courseSubjects = allSubjects.filter(s => s.courseCode === currentUser.course.code);
        const courseSubjectCodes = courseSubjects.map(s => s.code);
        const availableSchedules = allSchedules.filter(s => courseSubjectCodes.includes(s.subjectCode));

        if (availableSchedules.length === 0) {
            availableClassesTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No classes available for your course at this time.</td></tr>';
            return;
        }

        availableSchedules.forEach(schedule => {
            // Don't show class if already plotted
            const isPlotted = studentPlottedSchedules.some(p => p.subjectCode === schedule.subjectCode && p.sectionCode === schedule.sectionCode);
            if (isPlotted) return;

            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${subject ? subject.name : 'N/A'}</td>
                <td>${schedule.sectionCode}</td>
                <td>${schedule.time}</td>
                <td>${schedule.teacher}</td>
                <td>
                    <button class="action-btn approve-btn add-btn" data-subject-code="${schedule.subjectCode}" data-section-code="${schedule.sectionCode}">Add</button>
                </td>
            `;
            availableClassesTbody.appendChild(row);
        });
    }

    function renderPlottedClasses() {
        plottedClassesTbody.innerHTML = '';
        if (studentPlottedSchedules.length === 0) {
            plottedClassesTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">You have not selected any classes.</td></tr>';
            return;
        }

        studentPlottedSchedules.forEach(schedule => {
            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${subject ? subject.name : 'N/A'}</td>
                <td>${schedule.sectionCode}</td>
                <td>${schedule.time}</td>
                <td>${schedule.teacher}</td>
                <td>
                    <button class="action-btn deny-btn remove-btn" data-subject-code="${schedule.subjectCode}" data-section-code="${schedule.sectionCode}">Remove</button>
                </td>
            `;
            plottedClassesTbody.appendChild(row);
        });
    }

    // --- Event Handlers ---
    function saveStudentData() {
        const studentIndex = allStudents.findIndex(s => s.id === loggedInUserId);
        if (studentIndex > -1) {
            allStudents[studentIndex].plottedClasses = studentPlottedSchedules;
            localStorage.setItem('students', JSON.stringify(allStudents));
        }
    }

    availableClassesTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-btn')) {
            const subjectCode = e.target.dataset.subjectCode;
            const sectionCode = e.target.dataset.sectionCode;
            const scheduleToAdd = allSchedules.find(s => s.subjectCode === subjectCode && s.sectionCode === sectionCode);

            if (scheduleToAdd) {
                studentPlottedSchedules.push(scheduleToAdd);
                saveStudentData();
                renderAll();
            }
        }
    });

    plottedClassesTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const subjectCode = e.target.dataset.subjectCode;
            const sectionCode = e.target.dataset.sectionCode;
            studentPlottedSchedules = studentPlottedSchedules.filter(s => !(s.subjectCode === subjectCode && s.sectionCode === sectionCode));
            saveStudentData();
            renderAll();
        }
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

    // --- Initial Render ---
    function renderAll() {
        renderAvailableClasses();
        renderPlottedClasses();
    }
    renderAll();
});
