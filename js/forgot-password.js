document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const newPasswordDisplay = document.getElementById('new-password-display');
    const newPasswordField = document.getElementById('new-password');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const email = document.getElementById('email').value;

        let allUsers = [
            ...JSON.parse(localStorage.getItem('students')) || [],
            ...JSON.parse(localStorage.getItem('teachers')) || []
        ];

        const userIndex = allUsers.findIndex(u => u.id === userId && u.email === email);

        if (userIndex > -1) {
            const user = allUsers[userIndex];
            // Generate a new simple temporary password
            const tempPassword = `reset${Math.floor(1000 + Math.random() * 9000)}`;
            user.password = tempPassword;

            // Update the correct storage
            if (user.id.startsWith('T')) {
                let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
                const teacherIndex = teachers.findIndex(t => t.id === userId);
                if (teacherIndex > -1) {
                    teachers[teacherIndex].password = tempPassword;
                    localStorage.setItem('teachers', JSON.stringify(teachers));
                }
            } else {
                let students = JSON.parse(localStorage.getItem('students')) || [];
                const studentIndex = students.findIndex(s => s.id === userId);
                if (studentIndex > -1) {
                    students[studentIndex].password = tempPassword;
                    localStorage.setItem('students', JSON.stringify(students));
                }
            }

            // Display the new password
            form.style.display = 'none';
            newPasswordField.textContent = tempPassword;
            newPasswordDisplay.style.display = 'block';

        } else {
            Toastify({
                text: "User not found. Please check your ID and email.",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)",
            }).showToast();
        }
    });
});
