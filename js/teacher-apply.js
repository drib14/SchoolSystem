document.addEventListener('DOMContentLoaded', () => {
    const teacherApplyForm = document.getElementById('teacher-apply-form');

    teacherApplyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;

        // --- Generate Credentials ---
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
        const sequentialNumber = (teachers.length + 1).toString().padStart(3, '0');

        const id = `T${year}${month}${day}${sequentialNumber}`; // 'T' for Teacher
        const password = `${id}${lastName.charAt(0).toUpperCase()}`;

        // --- Create Teacher Object ---
        const newTeacher = {
            id: id,
            password: password,
            firstName: firstName,
            lastName: lastName,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            qualifications: document.getElementById('qualifications').value,
            status: 'pending' // 'pending', 'approved', 'denied'
        };

        // --- Save to Local Storage ---
        teachers.push(newTeacher);
        localStorage.setItem('teachers', JSON.stringify(teachers));

        // --- Notify User and Redirect ---
        alert(`Application Submitted!\nYour Teacher ID is: ${id}\nYour Password is: ${password}\nPlease wait for an administrator to review your application.`);

        window.location.href = 'index.html';
    });
});
