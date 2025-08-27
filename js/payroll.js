document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const payrollTbody = document.getElementById('payroll-tbody');
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];
    const hourlyRate = parseFloat(localStorage.getItem('teacherHourlyRate')) || 0;
    const payrollComponents = JSON.parse(localStorage.getItem('payrollComponents')) || [];

    // Modal Elements
    const modal = document.getElementById('payroll-breakdown-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    function renderPayrollTable() {
        payrollTbody.innerHTML = '';
        const approvedTeachers = allTeachers.filter(t => t.status === 'approved');

        if (approvedTeachers.length === 0) {
            payrollTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No approved teachers found.</td></tr>';
            return;
        }

        if (hourlyRate === 0) {
            // ... (warning message logic remains the same) ...
        }

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        approvedTeachers.forEach(teacher => {
            const monthlyRecords = attendanceRecords.filter(rec => {
                const recDate = new Date(rec.date);
                return rec.teacherId === teacher.id && recDate.getMonth() === currentMonth && recDate.getFullYear() === currentYear;
            });

            let totalHours = 0;
            monthlyRecords.forEach(rec => {
                if (rec.checkIn && rec.checkOut) {
                    totalHours += (new Date(rec.checkOut) - new Date(rec.checkIn)) / 1000 / 60 / 60;
                }
            });

            const grossSalary = totalHours * hourlyRate;
            const totalAllowances = payrollComponents.filter(c => c.type === 'allowance').reduce((sum, c) => sum + c.amount, 0);
            const totalDeductions = payrollComponents.filter(c => c.type === 'deduction').reduce((sum, c) => sum + c.amount, 0);
            const netSalary = grossSalary + totalAllowances - totalDeductions;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Teacher ID">${teacher.id}</td>
                <td data-label="Name">${teacher.firstName} ${teacher.lastName}</td>
                <td data-label="Total Hours">${totalHours.toFixed(2)}</td>
                <td data-label="Net Salary">₱ ${netSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td data-label="Actions">
                    <button class="action-btn view-breakdown-btn" data-id="${teacher.id}" style="background-color: #17a2b8;">View Breakdown</button>
                </td>
            `;
            payrollTbody.appendChild(row);
        });
    }

    function openBreakdownModal(teacherId) {
        const teacher = allTeachers.find(t => t.id === teacherId);
        if (!teacher) return;

        modalTitle.textContent = `Payroll Breakdown for ${teacher.firstName} ${teacher.lastName}`;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRecords = attendanceRecords.filter(rec => {
            const recDate = new Date(rec.date);
            return rec.teacherId === teacher.id && recDate.getMonth() === currentMonth && recDate.getFullYear() === currentYear;
        });

        let totalHours = 0;
        monthlyRecords.forEach(rec => {
            if (rec.checkIn && rec.checkOut) {
                totalHours += (new Date(rec.checkOut) - new Date(rec.checkIn)) / 1000 / 60 / 60;
            }
        });

        const grossSalary = totalHours * hourlyRate;

        let breakdownHtml = '<ul>';
        breakdownHtml += `<li><span>Gross Salary (${totalHours.toFixed(2)} hours @ ₱${hourlyRate}/hour)</span><span>₱ ${grossSalary.toLocaleString()}</span></li>`;
        breakdownHtml += '<li style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;"><strong>Allowances</strong></li>';

        let totalAllowances = 0;
        payrollComponents.filter(c => c.type === 'allowance').forEach(allowance => {
            breakdownHtml += `<li><span>${allowance.name}</span><span>+ ₱ ${allowance.amount.toLocaleString()}</span></li>`;
            totalAllowances += allowance.amount;
        });

        breakdownHtml += '<li style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;"><strong>Deductions</strong></li>';

        let totalDeductions = 0;
        payrollComponents.filter(c => c.type === 'deduction').forEach(deduction => {
            breakdownHtml += `<li><span>${deduction.name}</span><span>- ₱ ${deduction.amount.toLocaleString()}</span></li>`;
            totalDeductions += deduction.amount;
        });

        const netSalary = grossSalary + totalAllowances - totalDeductions;
        breakdownHtml += `<li style="font-weight: bold; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px;"><span>NET SALARY</span><span>₱ ${netSalary.toLocaleString()}</span></li>`;
        breakdownHtml += '</ul>';

        modalBody.innerHTML = breakdownHtml;
        modal.style.display = 'block';
    }

    function closeBreakdownModal() {
        modal.style.display = 'none';
    }

    // --- Event Listeners ---
    payrollTbody.addEventListener('click', (e) => {
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
    renderPayrollTable();
});
