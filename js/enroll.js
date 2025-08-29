document.addEventListener('DOMContentLoaded', () => {
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-bar .step');
    const enrollForm = document.getElementById('enroll-form');
    const courseSelection = document.getElementById('course-selection');
    const studentRequirementsList = document.getElementById('student-requirements-list');
    const photoUpload = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview');

    let currentStep = 0;
    let applicantData = {};
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const allRequirements = JSON.parse(localStorage.getItem('requirements')) || [];
    const studentReqs = allRequirements.filter(r => r.type === 'Student');

    function buildRequirementsList() {
        studentRequirementsList.innerHTML = '';
        if (studentReqs.length === 0) {
            studentRequirementsList.innerHTML = '<p>No application requirements defined at this time.</p>';
        } else {
            studentReqs.forEach(req => {
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
                studentRequirementsList.appendChild(reqItem);
            });
        }
    }

    studentRequirementsList.addEventListener('change', (e) => {
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

    function populateCourses() {
        courseSelection.innerHTML = '<option value="">-- Select a Course --</option>';
        if (courses.length === 0) {
            courseSelection.innerHTML = '<option value="" disabled>No courses available</option>';
            // Disable the next button if there are no courses
            document.querySelector('.form-step.active .next-btn').disabled = true;
        } else {
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.code;
                option.textContent = course.name;
                courseSelection.appendChild(option);
            });
        }
    }

    function validateStep(stepIndex) {
        const inputs = formSteps[stepIndex].querySelectorAll('input[required], select[required]');
        for (const input of inputs) {
            if (!input.value.trim()) {
                Toastify({ text: `Please fill out the ${input.name} field.`, duration: 3000, className: "toast-warning" }).showToast();
                return false;
            }
        }
        if(stepIndex === 0) { // Personal Info
             applicantData.firstName = document.getElementById('firstName').value;
             applicantData.lastName = document.getElementById('lastName').value;
             applicantData.email = document.getElementById('email').value;
             applicantData.phone = document.getElementById('phone').value;
        }
        if(stepIndex === 1) { // Course Selection
            const selectedCourseCode = courseSelection.value;
            const course = courses.find(c => c.code === selectedCourseCode);
            applicantData.course = course;
        }
        return true;
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                if (currentStep >= formSteps.length) {
                    currentStep = formSteps.length - 1;
                }
                updateFormSteps();
                updateProgress();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            if (currentStep < 0) {
                currentStep = 0;
            }
            updateFormSteps();
            updateProgress();
        });
    });

    function updateFormSteps() {
        formSteps.forEach((step, idx) => {
            step.style.display = idx === currentStep ? 'block' : 'none';
        });
    }

    function updateProgress() {
        // ... (existing logic, but update labels)
        const stepLabels = ['Personal Info', 'Course Selection', 'Requirements'];
        progressSteps.forEach((step, idx) => {
            const p = step.querySelector('p');
            if (p) {
                p.textContent = stepLabels[idx];
            }
            if (idx <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    enrollForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const uploads = studentRequirementsList.querySelectorAll('.requirement-upload');
        let allFilesChosen = true;
        uploads.forEach(upload => {
            if (upload.files.length === 0) {
                allFilesChosen = false;
            }
        });

        if (!allFilesChosen) {
            Toastify({ text: 'Please upload all required documents before submitting.', duration: 3000, className: "toast-warning", gravity: "top", position: "center" }).showToast();
            return;
        }

        // --- (rest of existing submission logic) ---
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        const students = JSON.parse(localStorage.getItem('students')) || [];
        const sequentialNumber = (students.length + 1).toString().padStart(3, '0');

        const id = `${year}${month}${day}${sequentialNumber}`;
        const password = `${id}${applicantData.lastName.charAt(0).toUpperCase()}`;

        const masterRequirements = allRequirements.filter(r => r.type === 'Student');
        const applicantRequirements = masterRequirements.map(req => ({
            id: req.id,
            name: req.name,
            status: 'Submitted' // Since we checked they were uploaded
        }));

        applicantData.id = id;
        applicantData.password = password;
        applicantData.status = 'pending';
        applicantData.role = 'student'; // Fix: Add role property
        applicantData.requirements = applicantRequirements;

        students.push(applicantData);
        localStorage.setItem('students', JSON.stringify(students));

        Toastify({
            text: `Application Submitted!\nYour ID is: ${id}\nYour Password is: ${password}\nPlease wait for admin approval.`,
            duration: -1,
            close: true,
            gravity: "top",
            position: "center",
            className: "toast-success-long",
            stopOnFocus: true,
        }).showToast();

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    });

    populateCourses();
    photoUpload.addEventListener('change', () => {
        const file = photoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Show a preview, but do not store the large base64 string
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo Preview">`;
            };
            reader.readAsDataURL(file);
            // Instead of the photo content, we could store just the filename for reference
            applicantData.photoFilename = file.name;
        }
    });

    buildRequirementsList();
    updateProgress();
});
