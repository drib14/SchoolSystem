document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    if (!userRole || !userId) return;

    const requirementsListDiv = document.getElementById('requirements-list');
    const requirementsForm = document.getElementById('requirements-form');

    const storageKey = userRole === 'teacher' ? 'teachers' : 'students';
    let allUsers = JSON.parse(localStorage.getItem(storageKey)) || [];
    const userIndex = allUsers.findIndex(u => u.id === userId);
    let currentUser = userIndex > -1 ? allUsers[userIndex] : null;

    if (!currentUser || !currentUser.requirements) {
        requirementsListDiv.innerHTML = '<p>No requirements found for your account.</p>';
        requirementsForm.querySelector('button').style.display = 'none';
        return;
    }

    const pendingRequirements = currentUser.requirements.filter(req => req.status === 'Pending');

    function renderRequirements() {
        if (pendingRequirements.length === 0) {
            requirementsListDiv.innerHTML = '<p>You have no pending requirements to submit.</p>';
            requirementsForm.querySelector('button').style.display = 'none';
            return;
        }

        requirementsListDiv.innerHTML = pendingRequirements.map(req => `
            <div class="form-group requirement-item">
                <label for="req-${req.id}">${req.name}</label>
                <input type="file" id="req-${req.id}" data-req-id="${req.id}" class="requirement-upload">
                <span class="file-name-preview">No file chosen</span>
            </div>
        `).join('');
    }

    requirementsListDiv.addEventListener('change', (e) => {
        if (e.target.classList.contains('requirement-upload')) {
            const previewSpan = e.target.nextElementSibling;
            if (e.target.files.length > 0) {
                previewSpan.textContent = e.target.files[0].name;
            } else {
                previewSpan.textContent = 'No file chosen';
            }
        }
    });

    requirementsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = requirementsListDiv.querySelectorAll('.requirement-upload');
        let filesToProcess = 0;
        let filesProcessed = 0;

        inputs.forEach(input => {
            if (input.files.length > 0) {
                filesToProcess++;
                const file = input.files[0];
                const reqId = parseInt(input.dataset.reqId, 10);

                const reader = new FileReader();
                reader.onload = (event) => {
                    // Find the requirement in the user's data and update it
                    const requirement = currentUser.requirements.find(r => r.id === reqId);
                    if (requirement) {
                        requirement.fileData = event.target.result; // The Base64 string
                        requirement.fileName = file.name;
                        requirement.status = 'Submitted';
                    }

                    filesProcessed++;
                    if (filesProcessed === filesToProcess) {
                        // All files are read, now save the user data
                        allUsers[userIndex] = currentUser;
                        localStorage.setItem(storageKey, JSON.stringify(allUsers));
                        Toastify({ text: "Requirements submitted successfully!", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();
                        setTimeout(() => window.location.href = `${userRole}.html`, 3000);
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        if (filesToProcess === 0) {
            Toastify({ text: "Please select at least one file to submit.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)" }).showToast();
        }
    });

    renderRequirements();
});
