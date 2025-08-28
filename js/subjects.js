document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const addSubjectForm = document.getElementById('add-subject-form');
    const subjectsTbody = document.getElementById('subjects-tbody');
    const courseAssignmentSelect = document.getElementById('course-assignment');

    let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const courses = JSON.parse(localStorage.getItem('courses')) || [];

    // --- Populate Courses Dropdown ---
    function populateCoursesDropdown() {
        if (courses.length === 0) {
            courseAssignmentSelect.innerHTML = '<option value="">Please add a course first</option>';
        } else {
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.code;
                option.textContent = `${course.name} (${course.code})`;
                courseAssignmentSelect.appendChild(option);
            });
        }
    }

    // --- Render Subjects Table ---
    function renderSubjects() {
        subjectsTbody.innerHTML = '';
        if (subjects.length === 0) {
            subjectsTbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No subjects found.</td></tr>';
        } else {
            subjects.forEach((subject, index) => {
                const row = document.createElement('tr');
                const course = courses.find(c => c.code === subject.courseCode);
                const courseName = course ? course.name : 'N/A';

                row.innerHTML = `
                    <td data-label="Code">${subject.code}</td>
                    <td data-label="Name">${subject.name}</td>
                    <td data-label="Units">${subject.units}</td>
                    <td data-label="Year Level">${subject.yearLevel || 'N/A'}</td>
                    <td data-label="Assigned Course">${courseName} (${subject.courseCode})</td>
                    <td data-label="Actions">
                        <button class="action-btn deny-btn delete-btn" data-index="${index}">Delete</button>
                    </td>
                `;
                subjectsTbody.appendChild(row);
            });
        }
    }

    // --- Form Submission ---
    addSubjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newSubject = {
            code: document.getElementById('subjectCode').value,
            name: document.getElementById('subjectName').value,
            units: document.getElementById('subjectUnits').value,
            yearLevel: document.getElementById('yearLevel').value,
            courseCode: courseAssignmentSelect.value
        };

        subjects.push(newSubject);
        localStorage.setItem('subjects', JSON.stringify(subjects));
        renderSubjects();
        addSubjectForm.reset();
    });

    // --- Delete Subject ---
    subjectsTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const subjectIndex = e.target.dataset.index;
            const subjectToDelete = subjects[subjectIndex];

            // Dependency check
            const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
            const isSubjectInUse = schedules.some(schedule => schedule.subjectCode === subjectToDelete.code);

            if (isSubjectInUse) {
                Toastify({ text: `Cannot delete "${subjectToDelete.name}" because it is part of an existing class schedule.`, duration: 3000, className: "toast-error" }).showToast();
                return;
            }

            if (confirm(`Are you sure you want to delete this subject?`)) {
                subjects.splice(subjectIndex, 1);
                localStorage.setItem('subjects', JSON.stringify(subjects));
                renderSubjects();
                Toastify({ text: "Subject deleted successfully.", duration: 3000, className: "toast-success" }).showToast();
            }
        }
    });

    // --- Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }

    // --- Initial Load ---
    populateCoursesDropdown();
    renderSubjects();
});
