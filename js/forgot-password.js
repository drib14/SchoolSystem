document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const userIdInput = document.getElementById('userId');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = userIdInput.value.trim();
        if (!userId) return;

        const students = JSON.parse(localStorage.getItem('students')) || [];
        const teachers = JSON.parse(localStorage.getItem('teachers')) || [];

        const allUsers = [...students, ...teachers];
        const user = allUsers.find(u => u.id === userId);

        if (user) {
            // In a real app, this would be an email. For this system, an alert is consistent.
            alert(`Password for ${user.firstName} ${user.lastName} (ID: ${user.id}) is: ${user.password}`);
        } else {
            Toastify({
                text: "No user found with that ID.",
                duration: 3000,
                className: "toast-error",
                gravity: "top",
                position: "center"
            }).showToast();
        }
    });
});
