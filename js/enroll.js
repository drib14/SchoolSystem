document.addEventListener('DOMContentLoaded', () => {
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-bar .step');
    const enrollForm = document.getElementById('enroll-form');

    let currentStep = 0;
    let applicantData = {};

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Basic validation for current step
            const currentFormStep = formSteps[currentStep];
            const inputs = currentFormStep.querySelectorAll('input[required]');
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
                }
                // Add logic here to save data from other steps in the future

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
    }

    enrollForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // This is a placeholder for final submission.
        // In a real multi-step form, the submit button would be on the last step.
        // For now, let's assume the last step is the confirmation.

        // Generate ID and Password
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        const students = JSON.parse(localStorage.getItem('students')) || [];
        const sequentialNumber = (students.length + 1).toString().padStart(3, '0');

        const id = `${year}${month}${day}${sequentialNumber}`;
        const password = `${id}${applicantData.lastName.charAt(0).toUpperCase()}`;

        applicantData.id = id;
        applicantData.password = password;
        applicantData.status = 'pending';

        // Save to local storage
        students.push(applicantData);
        localStorage.setItem('students', JSON.stringify(students));

        alert(`Application Submitted!\nYour ID is: ${id}\nYour Password is: ${password}\nPlease wait for admin approval.`);

        window.location.href = 'index.html';
    });
});
