document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userRole') !== 'admin') { window.location.href = 'index.html'; return; }
    const tbody = document.getElementById('approved-teachers-tbody');
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const approved = allTeachers.filter(t => t.status === 'approved');
    if(approved.length > 0) {
        approved.forEach(t => {
            const row = tbody.insertRow();
            const photoHtml = t.photoUrl ? `<img src="${t.photoUrl}" width="40" height="40" style="border-radius: 50%; object-fit: cover;">` : '<i class="fas fa-user-circle" style="font-size: 2rem; color: #ccc;"></i>';
            row.innerHTML = `<td data-label="Photo" style="width: 60px;">${photoHtml}</td><td data-label="ID">${t.id}</td><td data-label="Name">${t.firstName} ${t.lastName}</td><td data-label="Email">${t.email}</td><td data-label="Phone">${t.phone}</td>`;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No approved teachers found.</td></tr>';
    }
    // Logout is now handled by auth.js
});
