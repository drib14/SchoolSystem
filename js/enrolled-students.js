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
            `;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No enrolled students found.</td></tr>';
    }
});
