document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const addRequirementForm = document.getElementById('add-requirement-form');
    const requirementsTbody = document.getElementById('requirements-tbody');
    let requirements = JSON.parse(localStorage.getItem('requirements')) || [];

    // --- Pre-populate default requirements on first load ---
    function initializeDefaultRequirements() {
        if (localStorage.getItem('requirementsInitialized')) {
            return;
        }
        const defaultStudentReqs = [
            { id: Date.now() + 1, name: 'Birth Certificate (PSA)', type: 'Student' },
            { id: Date.now() + 2, name: 'Form 137 / Transcript of Records', type: 'Student' },
            { id: Date.now() + 3, name: '2x2 Photo ID', type: 'Student' }
        ];
        const defaultTeacherReqs = [
            { id: Date.now() + 4, name: 'Resume / Curriculum Vitae', type: 'Teacher' },
            { id: Date.now() + 5, name: 'Diploma / Transcript of Records', type: 'Teacher' },
            { id: Date.now() + 6, name: 'PRC License (if applicable)', type: 'Teacher' }
        ];
        requirements = [...defaultStudentReqs, ...defaultTeacherReqs];
        saveRequirements();
        localStorage.setItem('requirementsInitialized', 'true');
    }

    function saveRequirements() {
        localStorage.setItem('requirements', JSON.stringify(requirements));
    }

    function renderRequirements() {
        requirementsTbody.innerHTML = '';
        if (requirements.length === 0) {
            requirementsTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No requirements defined.</td></tr>';
        } else {
            requirements.forEach((req, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="Requirement Name">${req.name}</td>
                    <td data-label="Type">${req.type}</td>
                    <td data-label="Actions">
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
        const requirementTypeInput = document.getElementById('requirementType');
        const newRequirementName = requirementNameInput.value.trim();
        const newRequirementType = requirementTypeInput.value;

        if (newRequirementName) {
            if (requirements.some(r => r.name.toLowerCase() === newRequirementName.toLowerCase())) {
            Toastify({ text: 'This requirement already exists.', duration: 3000, className: "toast-warning" }).showToast();
                return;
            }
            requirements.push({ id: Date.now(), name: newRequirementName, type: newRequirementType });
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

    // Initial Load
    initializeDefaultRequirements();
    renderRequirements();
});
