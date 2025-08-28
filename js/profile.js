document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    if (!userRole || !userId) return;

    const profileForm = document.getElementById('profile-form');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const photoUploadInput = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    const changePasswordForm = document.getElementById('change-password-form');

    const storageKey = userRole === 'teacher' ? 'teachers' : 'students';
    let allUsers = JSON.parse(localStorage.getItem(storageKey)) || [];
    let currentUser = allUsers.find(u => u.id === userId);

    if (!currentUser) {
        document.querySelector('.content').innerHTML = '<p>Error: Could not load user data.</p>';
        return;
    }

    // --- Load Profile Info ---
    function loadProfile() {
        firstNameInput.value = currentUser.firstName || '';
        lastNameInput.value = currentUser.lastName || '';
        emailInput.value = currentUser.email || '';
        phoneInput.value = currentUser.phone || '';
        if (currentUser.photoUrl) {
            photoPreview.src = currentUser.photoUrl;
        }
    }

    // --- Event Listeners ---
    photoUploadInput.addEventListener('change', () => {
        if (photoUploadInput.files && photoUploadInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => photoPreview.src = e.target.result;
            reader.readAsDataURL(photoUploadInput.files[0]);
        }
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userIndex = allUsers.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            allUsers[userIndex].firstName = firstNameInput.value;
            allUsers[userIndex].lastName = lastNameInput.value;
            allUsers[userIndex].email = emailInput.value;
            allUsers[userIndex].phone = phoneInput.value;
            allUsers[userIndex].photoUrl = photoPreview.src;
            localStorage.setItem(storageKey, JSON.stringify(allUsers));
            Toastify({ text: "Profile updated successfully!", duration: 2000 }).showToast();
            setTimeout(() => window.location.reload(), 2000);
        }
    });

    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (currentUser.password !== currentPassword) {
            Toastify({ text: "Current password does not match.", duration: 3000, backgroundColor: "#dc3545" }).showToast();
            return;
        }
        if (newPassword !== confirmPassword) {
            Toastify({ text: "New passwords do not match.", duration: 3000, backgroundColor: "#dc3545" }).showToast();
            return;
        }

        const userIndex = allUsers.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            allUsers[userIndex].password = newPassword;
            localStorage.setItem(storageKey, JSON.stringify(allUsers));
            Toastify({ text: "Password changed successfully!", duration: 3000, backgroundColor: "#28a745" }).showToast();
            changePasswordForm.reset();
        }
    });

    // --- Initial Load ---
    loadProfile();
});
