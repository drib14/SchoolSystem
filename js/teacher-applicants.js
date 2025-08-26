document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const teacherApplicantsTbody = document.getElementById('teacher-applicants-tbody');
    let allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];

    function renderTable() {
        // Filter for pending applicants each time we render
        const pendingApplicants = allTeachers.filter(teacher => teacher.status === 'pending');
        teacherApplicantsTbody.innerHTML = '';

        if (pendingApplicants.length === 0) {
            teacherApplicantsTbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No pending teacher applicants found.</td></tr>';
        } else {
            pendingApplicants.forEach(applicant => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${applicant.id}</td>
                    <td>${applicant.firstName} ${applicant.lastName}</td>
                    <td>${applicant.email}</td>
                    <td title="${applicant.qualifications}">${applicant.qualifications.substring(0, 40)}...</td>
                    <td><span class="status-pending">${applicant.status}</span></td>
                    <td>
                        <button class="action-btn approve-btn" data-id="${applicant.id}">Approve</button>
                        <button class="action-btn deny-btn" data-id="${applicant.id}">Deny</button>
                    </td>
                `;
                teacherApplicantsTbody.appendChild(row);
            });
        }
    }

    // Event Delegation for Approve/Deny buttons
    teacherApplicantsTbody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName !== 'BUTTON') return;

        const applicantId = target.dataset.id;
        const teacherIndex = allTeachers.findIndex(t => t.id === applicantId);

        if (teacherIndex === -1) return;

        if (target.classList.contains('approve-btn')) {
            allTeachers[teacherIndex].status = 'approved';
            localStorage.setItem('teachers', JSON.stringify(allTeachers));
            alert(`Teacher applicant ${applicantId} has been approved.`);
            renderTable(); // Re-render to remove the approved applicant from the pending list
        }

        if (target.classList.contains('deny-btn')) {
            // Instead of deleting, let's change status to 'denied'
            allTeachers[teacherIndex].status = 'denied';
            localStorage.setItem('teachers', JSON.stringify(allTeachers));
            alert(`Teacher applicant ${applicantId} has been denied.`);
            renderTable(); // Re-render to remove the denied applicant
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

    renderTable();
});
