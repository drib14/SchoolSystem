document.addEventListener('DOMContentLoaded', () => {
    protectPage(['admin']);

    const tableBody = document.getElementById('events-table-body');
    tableBody.innerHTML = ''; // Clear any static content

    const events = getData('events') || [];

    if (events.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.textContent = 'No events found. Add functionality is not yet implemented.';
        cell.style.textAlign = 'center';
    } else {
        events.forEach(event => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = event.name;
            row.insertCell().textContent = new Date(event.date).toLocaleDateString();
            row.insertCell().innerHTML = `<button class="btn btn-sm" disabled>Actions</button>`;
        });
    }
});
