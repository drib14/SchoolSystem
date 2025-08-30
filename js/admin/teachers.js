document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect the page
    protectPage(['admin']);

    // 2. Get DOM elements
    const tableBody = document.getElementById('teachers-table-body');

    // 3. Load and display teachers
    loadTeachers();

    function loadTeachers() {
        const users = getData('users') || [];
        const teachers = users.filter(user => user.role === 'teacher');

        tableBody.innerHTML = '';

        if (teachers.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 3;
            cell.textContent = 'No teachers found. Use "Add New Teacher" to create one.';
            cell.style.textAlign = 'center';
            return;
        }

        teachers.forEach(teacher => {
            const row = tableBody.insertRow();

            const nameCell = row.insertCell();
            nameCell.textContent = teacher.name;

            const emailCell = row.insertCell();
            emailCell.textContent = teacher.email;

            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <button class="btn btn-sm btn-primary" onclick="editTeacher(${teacher.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTeacher(${teacher.id})">Delete</button>
            `;
        });
    }
});

// Placeholder functions for actions
function editTeacher(teacherId) {
    window.location.href = `/admin/edit-teacher.html?id=${teacherId}`;
}

function deleteTeacher(teacherId) {
    const confirmed = confirm('WARNING: Deleting a teacher will permanently remove their record. You may need to reassign their classes. This action cannot be undone. Are you sure you want to proceed?');

    if (confirmed) {
        // TODO: Check for dependencies, e.g., if teacher is assigned to any active classes.

        let users = getData('users') || [];
        const updatedUsers = users.filter(user => user.id !== teacherId);
        saveData('users', updatedUsers);
        location.reload();
    }
}
