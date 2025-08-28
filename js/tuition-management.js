document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const tuitionTbody = document.getElementById('tuition-tbody');
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const tuitionRate = parseFloat(localStorage.getItem('tuitionRate')) || 0;
    const feeComponents = JSON.parse(localStorage.getItem('feeComponents')) || [];

    // Modal Elements
    const modal = document.getElementById('tuition-breakdown-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    function renderTuitionTable() {
        tuitionTbody.innerHTML = '';
        const enrolledStudents = allStudents.filter(s => s.status === 'enrolled');

        if (enrolledStudents.length === 0) {
            tuitionTbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No enrolled students found.</td></tr>';
            return;
        }

        if (tuitionRate === 0) {
            // ... (warning message logic remains the same) ...
        }

        enrolledStudents.forEach(student => {
            if (!student.course || !student.course.code) {
                // Handle student with no course, maybe show 0 tuition or a message
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="Student ID">${student.id}</td>
                    <td data-label="Name">${student.firstName} ${student.lastName}</td>
                    <td data-label="Course">N/A</td>
                    <td data-label="Total Units">0</td>
                    <td data-label="Total Tuition">₱ 0.00</td>
                    <td data-label="Actions">N/A</td>
                `;
                tuitionTbody.appendChild(row);
                return;
            }

            const courseSubjects = allSubjects.filter(s => s.courseCode === student.course.code);
            const totalUnits = courseSubjects.reduce((sum, subject) => sum + (parseFloat(subject.units) || 0), 0);

            const tuitionPerUnit = totalUnits * tuitionRate;
            const miscellaneousFeesTotal = feeComponents.reduce((sum, fee) => sum + fee.amount, 0);
            const totalTuition = tuitionPerUnit + miscellaneousFeesTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Student ID">${student.id}</td>
                <td data-label="Name">${student.firstName} ${student.lastName}</td>
                <td data-label="Course">${student.course ? student.course.name : 'N/A'}</td>
                <td data-label="Total Units">${totalUnits}</td>
                <td data-label="Total Tuition">₱ ${totalTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td data-label="Actions">
                    <button class="action-btn view-breakdown-btn" data-id="${student.id}" style="background-color: #17a2b8;">View Breakdown</button>
                </td>
            `;
            tuitionTbody.appendChild(row);
        });
    }

    function openBreakdownModal(studentId) {
        const student = allStudents.find(s => s.id === studentId);
        if (!student) return;

        modalTitle.textContent = `Tuition Breakdown for ${student.firstName} ${student.lastName}`;

        const courseSubjects = allSubjects.filter(s => s.courseCode === student.course.code);
        const totalUnits = courseSubjects.reduce((sum, subject) => sum + (parseFloat(subject.units) || 0), 0);

        const tuitionPerUnit = totalUnits * tuitionRate;
        let breakdownHtml = '<ul>';
        breakdownHtml += `<li><span>Base Tuition ( ${totalUnits} units @ ₱${tuitionRate}/unit )</span><span>₱ ${tuitionPerUnit.toLocaleString()}</span></li>`;

        let miscellaneousFeesTotal = 0;
        feeComponents.forEach(fee => {
            breakdownHtml += `<li><span>${fee.name}</span><span>₱ ${fee.amount.toLocaleString()}</span></li>`;
            miscellaneousFeesTotal += fee.amount;
        });

        const totalTuition = tuitionPerUnit + miscellaneousFeesTotal;
        breakdownHtml += `<li style="font-weight: bold; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px;"><span>TOTAL TUITION</span><span>₱ ${totalTuition.toLocaleString()}</span></li>`;
        breakdownHtml += '</ul>';

        modalBody.innerHTML = breakdownHtml;
        modal.style.display = 'block';
    }

    function closeBreakdownModal() {
        modal.style.display = 'none';
    }

    // --- Event Listeners ---
    tuitionTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-breakdown-btn')) {
            openBreakdownModal(e.target.dataset.id);
        }
    });

    closeBtn.addEventListener('click', closeBreakdownModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeBreakdownModal();
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

    // Initial Render
    renderTuitionTable();
});
