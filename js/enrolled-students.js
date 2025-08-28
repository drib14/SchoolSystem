document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userRole') !== 'admin') { window.location.href = 'index.html'; return; }
    const tbody = document.getElementById('enrolled-students-tbody');
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const enrolled = allStudents.filter(s => s.status === 'enrolled');
    if(enrolled.length > 0) {
        enrolled.forEach(s => {
            const row = tbody.insertRow();
            const photoHtml = s.photoUrl ? `<img src="${s.photoUrl}" width="40" height="40" style="border-radius: 50%; object-fit: cover;">` : '<i class="fas fa-user-circle" style="font-size: 2rem; color: #ccc;"></i>';
            row.innerHTML = `<td data-label="Photo" style="width: 60px;">${photoHtml}</td><td data-label="ID">${s.id}</td><td data-label="Name">${s.firstName} ${s.lastName}</td><td data-label="Course">${s.course.name}</td><td data-label="Email">${s.email}</td>`;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No enrolled students found.</td></tr>';
    }
    // Logout is now handled by auth.js
});
