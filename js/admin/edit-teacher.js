document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect page and get DOM elements
    protectPage(['admin']);
    const form = document.getElementById('edit-teacher-form');
    const teacherIdInput = document.getElementById('teacher-id');
    const teacherNameInput = document.getElementById('teacher-name');
    const teacherEmailInput = document.getElementById('teacher-email');

    // 2. Get teacher ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const teacherId = parseInt(urlParams.get('id'));

    if (!teacherId) {
        alert('No teacher ID provided.');
        window.location.href = '/admin/teachers.html';
        return;
    }

    // 3. Load existing data into the form
    let users = getData('users') || [];
    const teacherToEdit = users.find(u => u.id === teacherId && u.role === 'teacher');

    if (!teacherToEdit) {
        alert('Teacher not found.');
        window.location.href = '/admin/teachers.html';
        return;
    }

    teacherIdInput.value = teacherToEdit.id;
    teacherNameInput.value = teacherToEdit.name;
    teacherEmailInput.value = teacherToEdit.email;

    // 4. Add form submission event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedName = teacherNameInput.value.trim();
        const updatedEmail = teacherEmailInput.value.trim();

        if (!updatedName || !updatedEmail) {
            alert('Name and Email are required.');
            return;
        }

        const userIndex = users.findIndex(u => u.id === teacherId);
        if (userIndex > -1) {
            users[userIndex].name = updatedName;
            users[userIndex].email = updatedEmail;

            saveData('users', users);
            alert('Teacher updated successfully!');
            window.location.href = '/admin/teachers.html';
        } else {
            alert('Could not find the teacher to update.');
            window.location.href = '/admin/teachers.html';
        }
    });
});
