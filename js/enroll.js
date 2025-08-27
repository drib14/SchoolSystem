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
        if (courses.length === 0) {
            courseSelection.innerHTML = '<option value="">No courses available</option>';
        } else {
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.code;
                option.textContent = course.name;
                courseSelection.appendChild(option);
            });
        }
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep === 0) {
                // Save personal info
                applicantData.firstName = document.getElementById('firstName').value;
                applicantData.lastName = document.getElementById('lastName').value;
                applicantData.email = document.getElementById('email').value;
                applicantData.phone = document.getElementById('phone').value;
            } else if (currentStep === 1) {
                // Save academic info
                const courseCode = courseSelection.value;
                const selectedCourse = courses.find(c => c.code === courseCode);
                applicantData.course = selectedCourse;
                applicantData.academicYear = document.getElementById('academic-year').value;
                applicantData.yearLevel = document.getElementById('year-level').value;
            }
            currentStep++;
            updateFormSteps();
            updateProgress();
        });
    });

    function updateFormSteps() {
        formSteps.forEach((step, idx) => {
            step.classList.toggle('active', idx === currentStep);
        });
    }

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateFormSteps();
            updateProgress();
        });
    });

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
            alert('Please upload all required documents before submitting.');
            return;
        }

        // --- (rest of existing submission logic) ---
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        let lastStudentIdCounter = parseInt(localStorage.getItem('lastStudentIdCounter') || '0');
        lastStudentIdCounter++;
        localStorage.setItem('lastStudentIdCounter', lastStudentIdCounter);

        const sequentialNumber = lastStudentIdCounter.toString().padStart(4, '0');
        const id = `${year}${month}${sequentialNumber}`;
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
        applicantData.requirements = applicantRequirements;

        students.push(applicantData);
        localStorage.setItem('students', JSON.stringify(students));

        // --- Auto Login and Redirect ---
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('userId', id);

        Toastify({
            text: `Application Submitted! You are now being redirected to your dashboard.`,
            duration: 5000,
            gravity: "top",
            position: "center",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
            close: true,
        }).showToast();

        setTimeout(() => { window.location.href = 'student.html'; }, 5000);
    });

    populateCourses();
    photoUpload.addEventListener('change', () => {
        const file = photoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo Preview">`;
                applicantData.photoUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    buildRequirementsList();
    updateProgress();
});
