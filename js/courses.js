document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const addCourseForm = document.getElementById('add-course-form');
    const coursesTbody = document.getElementById('courses-tbody');

    let courses = JSON.parse(localStorage.getItem('courses')) || [];

    function saveCourses() {
        localStorage.setItem('courses', JSON.stringify(courses));
    }

    function renderCourses() {
        coursesTbody.innerHTML = '';
        if (courses.length === 0) {
            coursesTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No courses found. Add one above.</td></tr>';
        } else {
            courses.forEach((course, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="Course Name">${course.name}</td>
                    <td data-label="Course Code">${course.code}</td>
                    <td data-label="Actions">
                        <button class="action-btn deny-btn delete-btn" data-index="${index}">Delete</button>
                    </td>
                `;
                coursesTbody.appendChild(row);
            });
        }
    }

    addCourseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const courseNameInput = document.getElementById('courseName');
        const courseCodeInput = document.getElementById('courseCode');

        const newCourse = {
            name: courseNameInput.value,
            code: courseCodeInput.value
        };

        courses.push(newCourse);
        saveCourses();
        renderCourses();
        addCourseForm.reset();
    });

    coursesTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const courseIndex = e.target.dataset.index;
            const courseToDelete = courses[courseIndex];

            // Dependency check
            const students = JSON.parse(localStorage.getItem('students')) || [];
            const isCourseInUse = students.some(student => student.course && student.course.code === courseToDelete.code);

            if (isCourseInUse) {
                Toastify({ text: `Cannot delete "${courseToDelete.name}" because students are enrolled in it.`, duration: 3000, className: "toast-error" }).showToast();
                return;
            }

            if (confirm(`Are you sure you want to delete the course "${courseToDelete.name}"?`)) {
                courses.splice(courseIndex, 1);
                saveCourses();
                renderCourses();
                Toastify({ text: "Course deleted successfully.", duration: 3000, className: "toast-success" }).showToast();
            }
        }
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }

    // Initial render
    renderCourses();
});
