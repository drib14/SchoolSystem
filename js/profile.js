document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    // Auth check is now handled by auth.js, but we still need the role and ID here.

    const profileContent = document.getElementById('profile-content');
    let currentUser;

    if (userRole === 'student') {
        const allStudents = JSON.parse(localStorage.getItem('students')) || [];
        currentUser = allStudents.find(s => s.id === userId);
    } else if (userRole === 'teacher') {
        const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
        currentUser = allTeachers.find(t => t.id === userId);
    }

    if (currentUser) {
        const photoPreviewHtml = currentUser.photoUrl
            ? `<img src="${currentUser.photoUrl}" alt="Profile Photo">`
            : '<i class="fas fa-user-circle"></i>';

        let profileDetails = `
            <div class="photo-upload-container" style="margin-bottom: 30px;">
                <div class="photo-preview">${photoPreviewHtml}</div>
            </div>
            <p><strong>ID:</strong> ${currentUser.id}</p>
            <p><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Phone:</strong> ${currentUser.phone}</p>
            <p><strong>Status:</strong> <span style="text-transform: capitalize;">${currentUser.status}</span></p>
        `;

        if (userRole === 'student') {
            profileDetails += `<p><strong>Course:</strong> ${currentUser.course ? currentUser.course.name : 'N/A'}</p>`;
        }

        profileContent.innerHTML = profileDetails;
    } else {
        profileContent.innerHTML = '<p>Could not load profile data.</p>';
    }

    // Logout is now handled by auth.js
});
