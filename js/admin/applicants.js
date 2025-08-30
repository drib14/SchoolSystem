document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect the page
    protectPage(['admin']);

    // 2. Get DOM elements
    const tableBody = document.getElementById('applicants-table-body');

    // 3. Load and display applicants
    loadApplicants();

    function loadApplicants() {
        const applicants = getData('applicants') || [];
        // For this view, we are primarily interested in pending applicants.
        // In a more advanced view, we might have tabs for 'approved' or 'denied'.
        const pendingApplicants = applicants.filter(app => app.status === 'pending');

        tableBody.innerHTML = '';

        if (pendingApplicants.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = 'No pending applicants.';
            cell.style.textAlign = 'center';
            return;
        }

        pendingApplicants.forEach(applicant => {
            const row = tableBody.insertRow();

            const nameCell = row.insertCell();
            nameCell.textContent = applicant.name;

            const emailCell = row.insertCell();
            emailCell.textContent = applicant.email;

            const statusCell = row.insertCell();
            statusCell.textContent = applicant.status;
            // You could add styling based on status here
            statusCell.style.textTransform = 'capitalize';

            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <button class="btn btn-sm btn-success" onclick="approveApplicant(${applicant.id})">Approve</button>
                <button class="btn btn-sm btn-danger" onclick="denyApplicant(${applicant.id})">Deny</button>
            `;
        });
    }
});

function approveApplicant(applicantId) {
    const confirmed = confirm('Are you sure you want to approve this applicant? They will be converted into a student user.');
    if (!confirmed) return;

    let applicants = getData('applicants') || [];
    let users = getData('users') || [];

    const applicantIndex = applicants.findIndex(app => app.id === applicantId);

    if (applicantIndex > -1) {
        const applicant = applicants[applicantIndex];

        // Create a new student user from the applicant's data
        const newStudent = {
            id: applicant.id, // Re-use the ID for simplicity, or generate a new one
            name: applicant.name,
            email: applicant.email,
            username: applicant.email, // Default username to email
            password: 'password', // Default password, user should be forced to change it
            role: 'student',
            profilePic: ''
        };

        // Add to users
        users.push(newStudent);

        // Update applicant status
        applicants[applicantIndex].status = 'approved';

        // Save both arrays
        saveData('users', users);
        saveData('applicants', applicants);

        alert('Applicant approved and new student account created.');
        location.reload();
    } else {
        alert('Error: Applicant not found.');
    }
}

function denyApplicant(applicantId) {
    const confirmed = confirm('Are you sure you want to deny this applicant?');
    if (!confirmed) return;

    let applicants = getData('applicants') || [];
    const applicantIndex = applicants.findIndex(app => app.id === applicantId);

    if (applicantIndex > -1) {
        applicants[applicantIndex].status = 'denied';
        saveData('applicants', applicants);
        alert('Applicant has been denied.');
        location.reload();
    } else {
        alert('Error: Applicant not found.');
    }
}
