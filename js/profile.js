document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup and Protection
    protectPage(['admin', 'teacher', 'student']);
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) return;

    // 2. DOM Elements
    const infoForm = document.getElementById('profile-info-form');
    const passwordForm = document.getElementById('password-change-form');
    const picForm = document.getElementById('profile-pic-form');
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');

    // 3. Populate initial data
    nameInput.value = loggedInUser.name;
    emailInput.value = loggedInUser.email;

    // 4. Event Listeners
    infoForm.addEventListener('submit', handleInfoUpdate);
    passwordForm.addEventListener('submit', handlePasswordChange);
    picForm.addEventListener('submit', handlePicUpdate);


    function handleInfoUpdate(event) {
        event.preventDefault();
        const newName = nameInput.value.trim();
        const newEmail = emailInput.value.trim();
        if (!newName || !newEmail) {
            alert('Name and Email cannot be empty.');
            return;
        }

        updateUser({ name: newName, email: newEmail });
        alert('Information updated successfully!');
        location.reload();
    }

    function handlePasswordChange(event) {
        event.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

        if (currentPassword !== loggedInUser.password) {
            alert('Incorrect current password.');
            return;
        }
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long.');
            return;
        }

        updateUser({ password: newPassword });
        alert('Password changed successfully! You may need to log in again with your new password.');
        logout(); // Force re-login for security
    }

    function handlePicUpdate(event) {
        event.preventDefault();
        const fileInput = document.getElementById('profile-pic-upload');
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            // The result is the Base64 encoded string of the image
            const base64String = reader.result;
            updateUser({ profilePic: base64String });
            alert('Profile picture updated successfully!');
            location.reload();
        };
        reader.readAsDataURL(file);
    }

    /**
     * Helper function to update the user's data in localStorage.
     * @param {object} updates - An object containing the properties to update.
     */
    function updateUser(updates) {
        let users = getData('users');
        const userIndex = users.findIndex(u => u.id === loggedInUser.id);
        if (userIndex > -1) {
            // Update the user object
            users[userIndex] = { ...users[userIndex], ...updates };
            saveData('users', users);
            // Also update the loggedInUser in localStorage to reflect changes immediately
            saveData('loggedInUser', users[userIndex]);
        }
    }
});
