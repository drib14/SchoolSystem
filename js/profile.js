document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    if (!userRole || !userId) {
        window.location.href = 'index.html';
        return;
    }

    const profileView = document.getElementById('profile-view');
    const profileEditForm = document.getElementById('profile-edit-form');

    let allUsers = [];
    const storageKey = userRole === 'student' ? 'students' : 'teachers';
    allUsers = JSON.parse(localStorage.getItem(storageKey)) || [];
    let currentUser = allUsers.find(u => u.id === userId);

    let newPhotoFile = null;

    function renderViewMode() {
        if (!currentUser) {
            profileView.innerHTML = '<p>Could not load profile data.</p>';
            return;
        }

        const photoPreviewHtml = currentUser.photoUrl
            ? `<img src="${currentUser.photoUrl}" alt="Profile Photo" class="user-avatar" style="width: 80px; height: 80px;">`
            : '<i class="fas fa-user-circle" style="font-size: 80px; color: #ccc;"></i>';

        let profileDetails = `
            <div class="card" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h2>My Profile</h2>
                    <button id="edit-profile-btn" class="action-btn">Edit Profile</button>
                </div>
                <hr>
                <div class="photo-upload-container" style="margin-bottom: 30px; text-align: center;">
                    <div class="photo-preview">${photoPreviewHtml}</div>
                </div>
                <p><strong>ID:</strong> ${currentUser.id}</p>
                <p><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Phone:</strong> ${currentUser.phone || 'N/A'}</p>
                <p><strong>Status:</strong> <span style="text-transform: capitalize;">${currentUser.status}</span></p>
                ${userRole === 'student' ? `<p><strong>Course:</strong> ${currentUser.course ? currentUser.course.name : 'N/A'}</p>` : ''}
                ${userRole === 'teacher' ? `<p><strong>Qualifications:</strong> ${currentUser.qualifications || 'N/A'}</p>` : ''}
            </div>
        `;
        profileView.innerHTML = profileDetails;
        profileEditForm.style.display = 'none';
        profileView.style.display = 'block';
    }

    function renderEditMode() {
        if (!currentUser) return;

        profileEditForm.innerHTML = `
            <h2>Edit Profile</h2>
            <hr>
            <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" class="form-control" value="${currentUser.firstName}" required>
            </div>
            <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" class="form-control" value="${currentUser.lastName}" required>
            </div>
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" class="form-control" value="${currentUser.email}" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" class="form-control" value="${currentUser.phone || ''}">
            </div>
            <div class="form-group">
                <label for="photo">Update Profile Photo</label>
                <input type="file" id="photo" class="form-control" accept="image/*">
                <small>Leave blank to keep current photo.</small>
            </div>
            <div class="form-actions" style="margin-top: 20px;">
                <button type="submit" class="action-btn approve-btn">Save Changes</button>
                <button type="button" id="cancel-edit-btn" class="action-btn deny-btn">Cancel</button>
            </div>
        `;
        profileView.style.display = 'none';
        profileEditForm.style.display = 'block';
    }

    profileView.addEventListener('click', (e) => {
        if (e.target.id === 'edit-profile-btn') {
            renderEditMode();
        }
    });

    profileEditForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedUser = {
            ...currentUser,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
        };

        const handlePhoto = (readerEvent) => {
            if (readerEvent) {
                updatedUser.photoUrl = readerEvent.target.result;
            }

            const userIndex = allUsers.findIndex(u => u.id === userId);
            if (userIndex > -1) {
                allUsers[userIndex] = updatedUser;
                localStorage.setItem(storageKey, JSON.stringify(allUsers));
                currentUser = updatedUser;
                newPhotoFile = null;
                Toastify({ text: "Profile updated successfully!", duration: 3000, className: "toast-success" }).showToast();
                renderViewMode();
                 // Force a reload of the auth script's header part if it has already run
                if (window.renderProfileHeader) window.renderProfileHeader();
            } else {
                Toastify({ text: "Error updating profile.", duration: 3000, className: "toast-error" }).showToast();
            }
        };

        if (newPhotoFile) {
            const reader = new FileReader();
            reader.onload = handlePhoto;
            reader.readAsDataURL(newPhotoFile);
        } else {
            handlePhoto(null);
        }
    });

    profileEditForm.addEventListener('click', (e) => {
        if (e.target.id === 'cancel-edit-btn') {
            newPhotoFile = null;
            renderViewMode();
        }
    });

    profileEditForm.addEventListener('change', (e) => {
        if (e.target.id === 'photo' && e.target.files.length > 0) {
            newPhotoFile = e.target.files[0];
        }
    });

    renderViewMode();
});
