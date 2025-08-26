document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    // Dummy credentials
    const users = {
        admin: 'password123',
        teacher: 'password123',
        student: 'password123'
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (users[username] && users[username] === password) {
            // Store user role in local storage
            localStorage.setItem('userRole', username);

            // Redirect to the appropriate panel
            window.location.href = `${username}.html`;
        } else {
            alert('Invalid username or password');
        }
    });
});
