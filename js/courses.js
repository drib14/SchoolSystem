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

        let pendingActions = JSON.parse(localStorage.getItem('pendingActions')) || [];
        pendingActions.push({
            type: 'newCourse',
            payload: newCourse,
            date: new Date().toISOString()
        });
        localStorage.setItem('pendingActions', JSON.stringify(pendingActions));

        Toastify({ text: "Course submitted for admin approval.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();

        addCourseForm.reset();
    });

    coursesTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const courseIndex = e.target.dataset.index;
            if (confirm(`Are you sure you want to delete the course "${courses[courseIndex].name}"?`)) {
                courses.splice(courseIndex, 1);
                saveCourses();
                renderCourses();
            }
        }
    });

});
