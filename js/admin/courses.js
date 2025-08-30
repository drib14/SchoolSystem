document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect the page
    protectPage(['admin']);

    // 2. Get DOM elements
    const tableBody = document.getElementById('courses-table-body');

    // 3. Load and display courses
    loadCourses();

    function loadCourses() {
        const courses = getData('courses') || [];

        // Clear existing table rows
        tableBody.innerHTML = '';

        if (courses.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 3; // Span across all columns
            cell.textContent = 'No courses found. Click "Add New Course" to begin.';
            cell.style.textAlign = 'center';
            return;
        }

        courses.forEach(course => {
            const row = tableBody.insertRow();

            const nameCell = row.insertCell();
            nameCell.textContent = course.name;

            const descCell = row.insertCell();
            descCell.textContent = course.description;

            const actionsCell = row.insertCell();
            // Add placeholder buttons. Functionality will be added in a later step.
            actionsCell.innerHTML = `
                <button class="btn btn-sm btn-primary" onclick="editCourse(${course.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCourse(${course.id})">Delete</button>
            `;
        });
    }
});

// Placeholder functions for actions. These will be implemented fully later.
function editCourse(courseId) {
    window.location.href = `/admin/edit-course.html?id=${courseId}`;
}

function deleteCourse(courseId) {
    // Confirm with the user
    const confirmed = confirm('Are you sure you want to delete this course?');

    if (confirmed) {
        let courses = getData('courses') || [];
        let subjects = getData('subjects') || [];

        // Check for dependencies: are there any subjects assigned to this course?
        const hasSubjects = subjects.some(subject => subject.courseId === courseId);

        if (hasSubjects) {
            alert('Error: Cannot delete this course because subjects are assigned to it. Please delete or reassign the subjects first.');
            return;
        }

        // Filter out the course to be deleted
        const updatedCourses = courses.filter(course => course.id !== courseId);

        // Save the updated array
        saveData('courses', updatedCourses);

        // Refresh the page to show the updated list
        location.reload();
    }
}
