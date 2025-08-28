document.addEventListener('DOMContentLoaded', () => {
    const roleSelection = document.getElementById('role-selection');
    const loginFormContainer = document.getElementById('login-form-container');
    const loginForm = document.getElementById('login-form');
    const loginTitle = document.getElementById('login-title');
    const loginRoleInput = document.getElementById('login-role');
    const roleButtons = document.querySelectorAll('.role-btn');
    const backBtn = document.getElementById('back-btn');

    // --- Dummy credentials ---
    // Student credentials will be managed dynamically after enrollment.
    const users = {
        admin: { password: 'password123' },
        teacher: { password: 'password123' }
        // student: { password: 'password123' } // This is now removed
    };

    // --- UI Flow ---
    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const role = button.dataset.role;
            loginRoleInput.value = role;
            loginTitle.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;

            roleSelection.style.display = 'none';
            loginFormContainer.style.display = 'block';
        });
    });

    if(backBtn) {
        backBtn.addEventListener('click', () => {
            roleSelection.style.display = 'block';
            loginFormContainer.style.display = 'none';
            loginForm.reset();
        });
    }


    // --- Login Logic ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const role = loginRoleInput.value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        let userIsValid = false;

        if (role === 'student') {
            const enrolledStudents = JSON.parse(localStorage.getItem('students')) || [];
            const student = enrolledStudents.find(s => s.id === username && s.password === password && s.status === 'enrolled');
            if (student) {
                userIsValid = true;
            }
        } else if (role === 'teacher') {
            const approvedTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
            const teacher = approvedTeachers.find(t => t.id === username && t.password === password && t.status === 'approved');
            if (teacher) {
                userIsValid = true;
            }
        } else if (role === 'admin') {
            // Admin login
            if (users[role] && username === role && users[role].password === password) {
                userIsValid = true;
            }
        }

        if (userIsValid) {
            localStorage.setItem('userRole', role);
            localStorage.setItem('userId', username); // Store userId for all roles
            window.location.href = `${role}.html`;
        } else {
            alert('Invalid username or password');
        }
    });
});
