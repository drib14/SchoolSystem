document.addEventListener('DOMContentLoaded', () => {
    protectPage(['admin']);

    const tableBody = document.getElementById('departments-table-body');
    tableBody.innerHTML = ''; // Clear any static content

    const departments = getData('departments') || [];

    if (departments.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = 'No departments found. Add functionality is not yet implemented.';
        cell.style.textAlign = 'center';
    } else {
        // This part will run if/when data is ever added manually or by future features
        departments.forEach(dept => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = dept.name;
            row.insertCell().innerHTML = `<button class="btn btn-sm" disabled>Actions</button>`;
        });
    }
});
