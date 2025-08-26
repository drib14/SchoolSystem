document.addEventListener('DOMContentLoaded', () => {
    // Basic auth check
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const applicantsTbody = document.getElementById('applicants-tbody');
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];

    // Filter for pending applicants
    const pendingApplicants = allStudents.filter(student => student.status === 'pending');

    if (pendingApplicants.length === 0) {
        applicantsTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No pending applicants found.</td></tr>';
    } else {
        pendingApplicants.forEach(applicant => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${applicant.id}</td>
                <td>${applicant.firstName} ${applicant.lastName}</td>
                <td>${applicant.email}</td>
                <td>${applicant.course ? `${applicant.course.name} (${applicant.course.code})` : 'N/A'}</td>
                <td><span class="status-pending">${applicant.status}</span></td>
                <td>
                    <button class="action-btn approve-btn" data-id="${applicant.id}">Approve</button>
                    <button class="action-btn deny-btn" data-id="${applicant.id}">Deny</button>
                </td>
            `;
            applicantsTbody.appendChild(row);
        });
    }

    // Add event listeners for approve/deny buttons
    applicantsTbody.addEventListener('click', (e) => {
        const target = e.target;
        const applicantId = target.dataset.id;

        if (!applicantId) return;

        let students = JSON.parse(localStorage.getItem('students')) || [];

        if (target.classList.contains('approve-btn')) {
            const studentIndex = students.findIndex(s => s.id === applicantId);
            if (studentIndex > -1) {
                students[studentIndex].status = 'enrolled';
                localStorage.setItem('students', JSON.stringify(students));
                alert(`Applicant ${applicantId} has been approved.`);
                window.location.reload();
            }
        }

        if (target.classList.contains('deny-btn')) {
            students = students.filter(s => s.id !== applicantId);
            localStorage.setItem('students', JSON.stringify(students));
            alert(`Applicant ${applicantId} has been denied and removed.`);
            window.location.reload();
        }
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }
});
