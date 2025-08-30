document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect page
    protectPage(['admin']);

    // 2. Get DOM elements
    const form = document.getElementById('add-student-form');

    // 3. Add form submission event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 4. Get form values
        const name = document.getElementById('student-name').value.trim();
        const email = document.getElementById('student-email').value.trim();
        const username = document.getElementById('student-username').value.trim();
        const password = document.getElementById('student-password').value.trim();

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

        // 6. Create new user object
        const newStudent = {
            id: Date.now(),
            name: name,
            email: email,
            username: username,
            password: password, // In a real app, this would be hashed
            role: 'student',
            profilePic: '' // Default empty profile pic
        };

        // 7. Add to localStorage
        try {
            users.push(newStudent);
            saveData('users', users);

            // 8. Redirect on success
            alert('Student added successfully!');
            window.location.href = '/admin/students.html';

        } catch (error) {
            console.error('Error saving student:', error);
            alert('Failed to save student. Please check the console for errors.');
        }
    });
});
