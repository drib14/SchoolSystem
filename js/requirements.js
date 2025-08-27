document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const addReqForm = document.getElementById('add-requirement-form');
    const reqTbody = document.getElementById('requirements-tbody');
    let requirements = JSON.parse(localStorage.getItem('requirements')) || [];

    function saveRequirements() {
        localStorage.setItem('requirements', JSON.stringify(requirements));
    }

    function renderRequirements() {
        reqTbody.innerHTML = '';
        if (requirements.length === 0) {
            reqTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No requirements defined.</td></tr>';
        } else {
            requirements.forEach((req, index) => {
                const row = reqTbody.insertRow();
                row.innerHTML = `
                    <td data-label="Name">${req.name}</td>
                    <td data-label="Type">${req.type}</td>
                    <td data-label="Actions">
                        <button class="action-btn deny-btn delete-btn" data-index="${index}">Delete</button>
                    </td>
                `;
            });
        }
    }

    addReqForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const reqNameInput = document.getElementById('requirementName');
        const reqTypeInput = document.getElementById('requirementType');

        const newRequirement = {
            id: Date.now(), // Simple unique ID
            name: reqNameInput.value.trim(),
            type: reqTypeInput.value
        };

        if (newRequirement.name) {
            requirements.push(newRequirement);
            saveRequirements();
            renderRequirements();
            Toastify({ text: "Requirement added successfully!", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();
            addReqForm.reset();
        } else {
            Toastify({ text: "Please enter a valid requirement name.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)" }).showToast();
        }
    });

    reqTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            if (confirm(`Are you sure you want to delete the requirement "${requirements[index].name}"?`)) {
                requirements.splice(index, 1);
                saveRequirements();
                renderRequirements();
                Toastify({ text: "Requirement deleted.", duration: 3000, gravity: "top", position: "center" }).showToast();
            }
        }
    });

    // Initial Render
    renderRequirements();
});
