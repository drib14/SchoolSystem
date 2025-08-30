document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect page
    protectPage(['admin']);

    // 2. Get DOM elements
    const form = document.getElementById('add-teacher-form');

    // 3. Add form submission event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 4. Get form values
        const name = document.getElementById('teacher-name').value.trim();
        const email = document.getElementById('teacher-email').value.trim();
        const username = document.getElementById('teacher-username').value.trim();
        const password = document.getElementById('teacher-password').value.trim();

        // 5. Validate input
        if (!name || !email || !username || !password) {
            alert('All fields are required.');
            return;
        }

        const users = getData('users') || [];
        const usernameExists = users.some(user => user.username === username);
        if (usernameExists) {
            alert('Username already exists. Please choose another one.');
            return;
        }

        // 6. Create new user object with role 'teacher'
        const newTeacher = {
            id: Date.now(),
            name: name,
            email: email,
            username: username,
            password: password,
            role: 'teacher',
            profilePic: ''
        };

        // 7. Add to localStorage
        try {
            users.push(newTeacher);
            saveData('users', users);

            // 8. Redirect on success
            alert('Teacher added successfully!');
            window.location.href = '/admin/teachers.html';

        } catch (error) {
            console.error('Error saving teacher:', error);
            alert('Failed to save teacher. Please check the console for errors.');
        }
    });
});
