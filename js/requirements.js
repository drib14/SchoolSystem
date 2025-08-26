document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const addRequirementForm = document.getElementById('add-requirement-form');
    const requirementsTbody = document.getElementById('requirements-tbody');

    let requirements = JSON.parse(localStorage.getItem('requirements')) || [];

    function saveRequirements() {
        localStorage.setItem('requirements', JSON.stringify(requirements));
    }

    function renderRequirements() {
        requirementsTbody.innerHTML = '';
        if (requirements.length === 0) {
            requirementsTbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">No requirements defined.</td></tr>';
        } else {
            requirements.forEach((req, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${req.name}</td>
                    <td>
                        <button class="action-btn deny-btn delete-btn" data-index="${index}">Delete</button>
                    </td>
                `;
                requirementsTbody.appendChild(row);
            });
        }
    }

    addRequirementForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const requirementNameInput = document.getElementById('requirementName');
        const newRequirementName = requirementNameInput.value.trim();

        if (newRequirementName) {
            // Check for duplicates
            if (requirements.some(r => r.name.toLowerCase() === newRequirementName.toLowerCase())) {
                alert('This requirement already exists.');
                return;
            }
            requirements.push({ id: Date.now(), name: newRequirementName }); // Use timestamp for a unique ID
            saveRequirements();
            renderRequirements();
            addRequirementForm.reset();
        }
    });

    requirementsTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const reqIndex = e.target.dataset.index;
            if (confirm(`Are you sure you want to delete this requirement?`)) {
                requirements.splice(reqIndex, 1);
                saveRequirements();
                renderRequirements();
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

    // Initial render
    renderRequirements();
});
