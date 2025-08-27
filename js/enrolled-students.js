document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userRole') !== 'admin') {
        console.error("Access denied. Page requires admin role.");
        return;
    }

    const tbody = document.getElementById('enrolled-students-tbody');
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const enrolled = allStudents.filter(s => s.status === 'enrolled');

    if (enrolled.length > 0) {
        tbody.innerHTML = ''; // Clear existing content
        enrolled.forEach(s => {
            const row = tbody.insertRow();
            const photoHtml = s.photoUrl
                ? `<img src="${s.photoUrl}" alt="Profile" class="table-photo">`
                : '<i class="fas fa-user-circle" style="font-size: 2rem; color: #ccc;"></i>';

            row.innerHTML = `
                <td data-label="Photo" style="width: 60px; text-align: center;">${photoHtml}</td>
                <td data-label="ID">${s.id}</td>
                <td data-label="Name">${s.firstName} ${s.lastName}</td>
                <td data-label="Email">${s.email}</td>
                <td data-label="Course">${s.course ? s.course.name : 'N/A'}</td>
                <td data-label="Actions">
                    <button class="action-btn deny-btn deactivate-btn" data-id="${s.id}">Deactivate</button>
                </td>
            `;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No enrolled students found.</td></tr>';
    }

    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('deactivate-btn')) {
            const studentId = e.target.dataset.id;
            if (confirm(`Are you sure you want to deactivate student ${studentId}? They will not be able to log in.`)) {
                const studentIndex = allStudents.findIndex(s => s.id === studentId);
                if (studentIndex > -1) {
                    allStudents[studentIndex].status = 'inactive';
                    localStorage.setItem('students', JSON.stringify(allStudents));
                    // Re-render the table
                    const updatedEnrolled = allStudents.filter(s => s.status === 'enrolled');
                    // This is a bit clumsy, should refactor render logic
                    window.location.reload(); // Simple solution for now
                }
            }
        }
    });
});
