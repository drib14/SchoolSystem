document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect the page
    protectPage(['admin']);

    // 2. Get DOM elements
    const tableBody = document.getElementById('students-table-body');

    // 3. Load and display students
    loadStudents();

    function loadStudents() {
        const users = getData('users') || [];
        const students = users.filter(user => user.role === 'student');

        // In a later step, we'll also fetch courses and enrollments to display the student's course.
        // For now, we'll leave it blank.

        tableBody.innerHTML = '';

        if (students.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = 'No students found. Approve applicants or use "Add New Student".';
            cell.style.textAlign = 'center';
            return;
        }

        students.forEach(student => {
            const row = tableBody.insertRow();

            const nameCell = row.insertCell();
            nameCell.textContent = student.name;

            const emailCell = row.insertCell();
            emailCell.textContent = student.email;

            const courseCell = row.insertCell();
            courseCell.textContent = 'N/A'; // Placeholder for now

            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <button class="btn btn-sm btn-primary" onclick="editStudent(${student.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
            `;
        });
    }
});

// Placeholder functions for actions
function editStudent(studentId) {
    window.location.href = `/admin/edit-student.html?id=${studentId}`;
}

function deleteStudent(studentId) {
    const confirmed = confirm('WARNING: Deleting a student will permanently remove their record, including any associated grades and enrollments. This action cannot be undone. Are you sure you want to proceed?');

    if (confirmed) {
        // TODO: In a more robust system, we would also delete all dependent data
        // (grades, enrollments, etc.) associated with this studentId.
        // For now, we just remove the user object.

        let users = getData('users') || [];
        const updatedUsers = users.filter(user => user.id !== studentId);
        saveData('users', updatedUsers);
        location.reload();
    }
}
