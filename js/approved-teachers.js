document.addEventListener('DOMContentLoaded', () => {
    // Redundant auth check, but safe to keep. auth.js should handle redirection.
    if (localStorage.getItem('userRole') !== 'admin') {
        console.error("Access denied. Page requires admin role.");
        return;
    }

    const tbody = document.getElementById('approved-teachers-tbody');
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const approved = allTeachers.filter(t => t.status === 'approved');

    if (approved.length > 0) {
        tbody.innerHTML = ''; // Clear existing content
        approved.forEach(t => {
            const row = tbody.insertRow();
            const photoHtml = t.photoUrl
                ? `<img src="${t.photoUrl}" alt="Profile" class="table-photo">`
                : '<i class="fas fa-user-circle" style="font-size: 2rem; color: #ccc;"></i>';

            row.innerHTML = `
                <td data-label="Photo" style="width: 60px; text-align: center;">${photoHtml}</td>
                <td data-label="ID">${t.id}</td>
                <td data-label="Name">${t.firstName} ${t.lastName}</td>
                <td data-label="Email">${t.email}</td>
                <td data-label="Phone">${t.phone || 'N/A'}</td>
                <td data-label="Actions">
                    <button class="action-btn deny-btn deactivate-btn" data-id="${t.id}">Deactivate</button>
                </td>
            `;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No approved teachers found.</td></tr>';
    }

    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('deactivate-btn')) {
            const teacherId = e.target.dataset.id;
            if (confirm(`Are you sure you want to deactivate teacher ${teacherId}? They will not be able to log in.`)) {
                const teacherIndex = allTeachers.findIndex(t => t.id === teacherId);
                if (teacherIndex > -1) {
                    allTeachers[teacherIndex].status = 'inactive';
                    localStorage.setItem('teachers', JSON.stringify(allTeachers));
                    window.location.reload();
                }
            }
        }
    });
});

// The .table-photo style is now globally defined in css/panel.css
