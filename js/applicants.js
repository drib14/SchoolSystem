document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const applicantsTbody = document.getElementById('applicants-tbody');
    let allStudents = JSON.parse(localStorage.getItem('students')) || [];

    // Modal Elements
    const modal = document.getElementById('requirements-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    function renderTable() {
        const pendingApplicants = allStudents.filter(student => student.status === 'pending');
        applicantsTbody.innerHTML = '';

        if (pendingApplicants.length === 0) {
            applicantsTbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No pending applicants found.</td></tr>';
        } else {
            pendingApplicants.forEach(applicant => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="ID">${applicant.id}</td>
                    <td data-label="Name">${applicant.firstName} ${applicant.lastName}</td>
                    <td data-label="Email">${applicant.email}</td>
                    <td data-label="Course">${applicant.course ? `${applicant.course.name} (${applicant.course.code})` : 'N/A'}</td>
                    <td data-label="Status"><span class="status-pending">${applicant.status}</span></td>
                    <td data-label="Actions">
                        <button class="action-btn view-req-btn" data-id="${applicant.id}" style="background-color: #17a2b8;">Requirements</button>
                        <button class="action-btn approve-btn" data-id="${applicant.id}">Approve</button>
                        <button class="action-btn deny-btn" data-id="${applicant.id}">Deny</button>
                    </td>
                `;
                applicantsTbody.appendChild(row);
            });
        }
    }

    function openRequirementsModal(applicantId) {
        const applicant = allStudents.find(s => s.id === applicantId);
        if (!applicant) return;

        modalTitle.textContent = `Manage Requirements for ${applicant.firstName} ${applicant.lastName}`;

        let checklistHtml = '<ul>';
        if (applicant.requirements && applicant.requirements.length > 0) {
            applicant.requirements.forEach(req => {
                checklistHtml += `
                    <li>
                        <label>
                            <input type="checkbox" data-applicant-id="${applicantId}" data-req-id="${req.id}" ${req.status === 'Submitted' ? 'checked' : ''}>
                            ${req.name}
                        </label>
                        <span>${req.status}</span>
                    </li>
                `;
            });
        } else {
            checklistHtml += '<li>No requirements defined for this applicant.</li>';
        }
        checklistHtml += '</ul>';

        modalBody.innerHTML = checklistHtml;
        modal.style.display = 'block';
    }

    function closeRequirementsModal() {
        modal.style.display = 'none';
    }

    // --- Event Listeners ---
    applicantsTbody.addEventListener('click', (e) => {
        const target = e.target;
        const applicantId = target.dataset.id;
        if (!applicantId) return;

        if (target.classList.contains('view-req-btn')) {
            openRequirementsModal(applicantId);
        } else if (target.classList.contains('approve-btn')) {
            const studentIndex = allStudents.findIndex(s => s.id === applicantId);
            if (studentIndex > -1) {
                allStudents[studentIndex].status = 'enrolled';
                localStorage.setItem('students', JSON.stringify(allStudents));
                Toastify({ text: `Applicant ${applicantId} has been approved.`, duration: 3000, className: "toast-success", gravity: "top", position: "right" }).showToast();

                // Create a notification for the student
                createNotification(applicantId, "Congratulations! Your application has been approved.", "student.html");

                renderTable();
            }
        } else if (target.classList.contains('deny-btn')) {
            allStudents = allStudents.filter(s => s.id !== applicantId);
            localStorage.setItem('students', JSON.stringify(allStudents));
            Toastify({ text: `Applicant ${applicantId} has been denied and removed.`, duration: 3000, className: "toast-info", gravity: "top", position: "right" }).showToast();
            renderTable();
        }
    });

    closeBtn.addEventListener('click', closeRequirementsModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeRequirementsModal();
        }
    });

    modalBody.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const applicantId = e.target.dataset.applicantId;
            const reqId = parseInt(e.target.dataset.reqId, 10);
            const isChecked = e.target.checked;

            const studentIndex = allStudents.findIndex(s => s.id === applicantId);
            if (studentIndex > -1) {
                const reqIndex = allStudents[studentIndex].requirements.findIndex(r => r.id === reqId);
                if (reqIndex > -1) {
                    const newStatus = isChecked ? 'Submitted' : 'Pending';
                    allStudents[studentIndex].requirements[reqIndex].status = newStatus;
                    localStorage.setItem('students', JSON.stringify(allStudents));

                    const statusSpan = e.target.closest('li').querySelector('span');
                    statusSpan.textContent = newStatus;
                }
            }
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
