document.addEventListener('DOMContentLoaded', () => {
    const teacherApplyForm = document.getElementById('teacher-apply-form');
    const teacherRequirementsList = document.getElementById('teacher-requirements-list');
    const photoUpload = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview');

    let photoUrl = null; // To store the base64 string
    const allRequirements = JSON.parse(localStorage.getItem('requirements')) || [];
    const teacherReqs = allRequirements.filter(r => r.type === 'Teacher');

    function buildRequirementsList() {
        teacherRequirementsList.innerHTML = '';
        if (teacherReqs.length === 0) {
            teacherRequirementsList.innerHTML = '<p>No application requirements defined at this time.</p>';
        } else {
            teacherReqs.forEach(req => {
                const reqItem = document.createElement('div');
                reqItem.className = 'requirement-item';
                reqItem.innerHTML = `
                    <span>${req.name}</span>
                    <div>
                        <span class="file-upload-status">No file chosen</span>
                        <label class="upload-label">
                            Choose File
                            <input type="file" class="requirement-upload" data-req-id="${req.id}" required>
                        </label>
                    </div>
                `;
                teacherRequirementsList.appendChild(reqItem);
            });
        }
    }

    teacherRequirementsList.addEventListener('change', (e) => {
        if (e.target.classList.contains('requirement-upload')) {
            const statusEl = e.target.closest('div').querySelector('.file-upload-status');
            if (e.target.files.length > 0) {
                statusEl.textContent = e.target.files[0].name;
                statusEl.classList.add('submitted');
            } else {
                statusEl.textContent = 'No file chosen';
                statusEl.classList.remove('submitted');
            }
        }
    });

    photoUpload.addEventListener('change', () => {
        const file = photoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo Preview">`;
                photoUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    teacherApplyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const uploads = teacherRequirementsList.querySelectorAll('.requirement-upload');
        let allFilesChosen = true;
        uploads.forEach(upload => {
            if (upload.files.length === 0) {
                allFilesChosen = false;
            }
        });

        if (!allFilesChosen) {
            alert('Please upload all required documents before submitting.');
            return;
        }

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;

        // --- Generate Credentials ---
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
        const sequentialNumber = (teachers.length + 1).toString().padStart(3, '0');

        const id = `T${year}${month}${day}${sequentialNumber}`;
        const password = `${id}${lastName.charAt(0).toUpperCase()}`;

        const applicantRequirements = teacherReqs.map(req => ({
            id: req.id,
            name: req.name,
            status: 'Submitted'
        }));

        // --- Create Teacher Object ---
        const newTeacher = {
            id: id,
            password: password,
            firstName: firstName,
            lastName: lastName,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            qualifications: document.getElementById('qualifications').value,
            status: 'pending',
            requirements: applicantRequirements,
            photoUrl: photoUrl
        };

        // --- Save to Local Storage ---
        teachers.push(newTeacher);
        localStorage.setItem('teachers', JSON.stringify(teachers));

        // --- Notify User and Redirect ---
        alert(`Application Submitted!\nYour Teacher ID is: ${id}\nYour Password is: ${password}\nPlease wait for an administrator to review your application.`);

        window.location.href = 'index.html';
    });

    buildRequirementsList();
});
