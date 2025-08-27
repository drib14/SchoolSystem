document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (!userRole || !userId || userRole === 'admin') {
        // Redirect if not logged in or if admin, as admin doesn't have a profile page
        // A more robust solution would show a message, but this works for now.
        // window.location.href = 'index.html';
        // For now, let's just disable the form if admin
        if(userRole === 'admin') {
            const form = document.getElementById('profile-form');
            if(form) form.style.display = 'none';
            return;
        }
    }

    const profileForm = document.getElementById('profile-form');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const photoUploadInput = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview');

    const storageKey = userRole === 'teacher' ? 'teachers' : 'students';
    let allUsers = JSON.parse(localStorage.getItem(storageKey)) || [];
    let currentUser = allUsers.find(u => u.id === userId);

    if (currentUser) {
        // Populate the form with existing data
        firstNameInput.value = currentUser.firstName || '';
        lastNameInput.value = currentUser.lastName || '';
        emailInput.value = currentUser.email || '';
        phoneInput.value = currentUser.phone || '';
        if (currentUser.photoUrl) {
            photoPreview.src = currentUser.photoUrl;
        } else {
            // Placeholder if no photo exists
            photoPreview.src = 'https://via.placeholder.com/150';
        }
    }

    // Handle photo preview
    photoUploadInput.addEventListener('change', () => {
        if (photoUploadInput.files && photoUploadInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
            };
            reader.readAsDataURL(photoUploadInput.files[0]);
        }
    });

    // Handle form submission
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Update user data
        const updatedUser = {
            ...currentUser,
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            photoUrl: photoPreview.src // This will be the new base64 URL
        };

        // Find the user in the array and update them
        const userIndex = allUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            allUsers[userIndex] = updatedUser;
            localStorage.setItem(storageKey, JSON.stringify(allUsers));

            // Give feedback and refresh to see changes reflected in the sidebar
            Toastify({
                text: "Profile updated successfully!",
                duration: 2000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                stopOnFocus: true,
            }).showToast();
            setTimeout(() => window.location.reload(), 2000);
        } else {
            Toastify({
                text: "Error updating profile.",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)",
                stopOnFocus: true,
            }).showToast();
        }
    });
});
