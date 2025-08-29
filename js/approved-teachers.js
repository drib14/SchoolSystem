document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userRole') !== 'admin') { window.location.href = 'index.html'; return; }

    const tbody = document.getElementById('approved-teachers-tbody');
    const modal = document.getElementById('edit-salary-modal');
    const closeBtn = modal.querySelector('.close-btn');
    const salaryForm = document.getElementById('edit-salary-form');
    const teacherIdInput = document.getElementById('teacherId-salary');
    const monthlySalaryInput = document.getElementById('monthlySalary');

    let allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];

    function renderTable() {
        tbody.innerHTML = '';
        const approved = allTeachers.filter(t => t.status === 'approved');
        if(approved.length > 0) {
            approved.forEach(t => {
                const row = tbody.insertRow();
                const photoHtml = t.photoUrl ? `<img src="${t.photoUrl}" alt="Profile" class="user-avatar">` : '<i class="fas fa-user-circle user-avatar-icon"></i>';
                const salary = t.monthlySalary ? `₱ ${t.monthlySalary.toLocaleString()}` : 'Not Set';
                row.innerHTML = `
                    <td data-label="Photo" style="width: 60px;">${photoHtml}</td>
                    <td data-label="ID">${t.id}</td>
                    <td data-label="Name">${t.firstName} ${t.lastName}</td>
                    <td data-label="Email">${t.email}</td>
                    <td data-label="Monthly Salary">${salary}</td>
                    <td data-label="Actions"><button class="action-btn edit-salary-btn" data-id="${t.id}">Edit Salary</button></td>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No approved teachers found.</td></tr>';
        }
    }

    function openSalaryModal(teacherId) {
        const teacher = allTeachers.find(t => t.id === teacherId);
        if (teacher) {
            teacherIdInput.value = teacher.id;
            monthlySalaryInput.value = teacher.monthlySalary || '';
            modal.style.display = 'block';
        }
    }

    function closeSalaryModal() {
        modal.style.display = 'none';
    }

    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-salary-btn')) {
            openSalaryModal(e.target.dataset.id);
        }
    });

    closeBtn.addEventListener('click', closeSalaryModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeSalaryModal();
        }
    });

    salaryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const teacherId = teacherIdInput.value;
        const newSalary = parseFloat(monthlySalaryInput.value);

        if (isNaN(newSalary) || newSalary < 0) {
            Toastify({ text: "Please enter a valid, non-negative salary.", duration: 3000, className: "toast-error" }).showToast();
            return;
        }

        const teacherIndex = allTeachers.findIndex(t => t.id === teacherId);
        if (teacherIndex > -1) {
            allTeachers[teacherIndex].monthlySalary = newSalary;
            localStorage.setItem('teachers', JSON.stringify(allTeachers));
            Toastify({ text: "Salary updated successfully!", duration: 3000, className: "toast-success" }).showToast();
            closeSalaryModal();
            renderTable();
        }
    });

    renderTable();
});
