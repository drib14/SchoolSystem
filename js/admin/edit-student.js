document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect page and get DOM elements
    protectPage(['admin']);
    const form = document.getElementById('edit-student-form');
    const studentIdInput = document.getElementById('student-id');
    const studentNameInput = document.getElementById('student-name');
    const studentEmailInput = document.getElementById('student-email');

    // 2. Get student ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = parseInt(urlParams.get('id'));

    if (!studentId) {
        alert('No student ID provided.');
        window.location.href = '/admin/students.html';
        return;
    }

    // 3. Load existing data into the form
    let users = getData('users') || [];
    const studentToEdit = users.find(u => u.id === studentId && u.role === 'student');

    if (!studentToEdit) {
        alert('Student not found.');
        window.location.href = '/admin/students.html';
        return;
    }

    studentIdInput.value = studentToEdit.id;
    studentNameInput.value = studentToEdit.name;
    studentEmailInput.value = studentToEdit.email;

    // 4. Add form submission event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedName = studentNameInput.value.trim();
        const updatedEmail = studentEmailInput.value.trim();

        if (!updatedName || !updatedEmail) {
            alert('Name and Email are required.');
            return;
        }

        const userIndex = users.findIndex(u => u.id === studentId);
        if (userIndex > -1) {
            users[userIndex].name = updatedName;
            users[userIndex].email = updatedEmail;

            saveData('users', users);
            alert('Student updated successfully!');
            window.location.href = '/admin/students.html';
        } else {
            alert('Could not find the student to update.');
            window.location.href = '/admin/students.html';
        }
    });
});
