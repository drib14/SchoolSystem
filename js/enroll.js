document.addEventListener('DOMContentLoaded', () => {
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-bar .step');
    const enrollForm = document.getElementById('enroll-form');
    const courseSelection = document.getElementById('course-selection');

    let currentStep = 0;
    let applicantData = {};
    const courses = JSON.parse(localStorage.getItem('courses')) || [];

    // --- Populate Courses Dropdown ---
    function populateCourses() {
        if (courses.length === 0) {
            courseSelection.innerHTML = '<option value="">No courses available</option>';
        } else {
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.code;
                option.textContent = `${course.name} (${course.code})`;
                courseSelection.appendChild(option);
            });
        }
    }

    // --- Multi-Step Form Navigation ---
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentFormStep = formSteps[currentStep];
            const inputs = currentFormStep.querySelectorAll('input[required], select[required]');
            let isValid = true;
            inputs.forEach(input => {
                if (!input.value) {
                    isValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = 'var(--border-color)';
                }
            });

            if (isValid) {
                // Save data from current step
                if (currentStep === 0) {
                    applicantData.firstName = document.getElementById('firstName').value;
                    applicantData.lastName = document.getElementById('lastName').value;
                    applicantData.email = document.getElementById('email').value;
                    applicantData.phone = document.getElementById('phone').value;
                } else if (currentStep === 1) {
                    const selectedCourseCode = document.getElementById('course-selection').value;
                    const selectedCourse = courses.find(c => c.code === selectedCourseCode);
                    applicantData.course = selectedCourse;
                }

                // Move to next step
                if (currentStep < formSteps.length - 1) {
                    formSteps[currentStep].classList.remove('active');
                    currentStep++;
                    formSteps[currentStep].classList.add('active');
                    updateProgress();
                }
            } else {
                alert('Please fill out all required fields.');
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 0) {
                formSteps[currentStep].classList.remove('active');
                currentStep--;
                formSteps[currentStep].classList.add('active');
                updateProgress();
            }
        });
    });

    function updateProgress() {
        progressSteps.forEach((step, idx) => {
            if (idx <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
         // Also update the step labels in the progress bar
        const stepLabels = ['Personal Info', 'Course Selection', 'Confirmation'];
        progressSteps.forEach((step, idx) => {
            const p = step.querySelector('p');
            if (p) {
                p.textContent = stepLabels[idx];
            }
        });
    }

    // --- Form Submission ---
    enrollForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Generate ID and Password
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        const students = JSON.parse(localStorage.getItem('students')) || [];
        const sequentialNumber = (students.length + 1).toString().padStart(3, '0');

        const id = `${year}${month}${day}${sequentialNumber}`;
        const password = `${id}${applicantData.lastName.charAt(0).toUpperCase()}`;

        const masterRequirements = JSON.parse(localStorage.getItem('requirements')) || [];
        const applicantRequirements = masterRequirements.map(req => ({
            id: req.id,
            name: req.name,
            status: 'Pending'
        }));

        applicantData.id = id;
        applicantData.password = password;
        applicantData.status = 'pending';
        applicantData.requirements = applicantRequirements;

        // Save to local storage
        students.push(applicantData);
        localStorage.setItem('students', JSON.stringify(students));

        alert(`Application Submitted!\nYour ID is: ${id}\nYour Password is: ${password}\nPlease wait for admin approval.`);

        window.location.href = 'index.html';
    });

    // Initial setup
    populateCourses();
    updateProgress();
});
