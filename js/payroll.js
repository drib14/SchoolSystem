document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // --- Data Loading ---
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];
    const payrollSettings = JSON.parse(localStorage.getItem('payrollSettings')) || {
        deductionPerAbsence: 0,
        workingDays: [1, 2, 3, 4, 5], // Mon-Fri
        components: []
    };

    // --- DOM Elements ---
    const payrollTbody = document.getElementById('payroll-tbody');
    const modal = document.getElementById('payroll-breakdown-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = modal.querySelector('.close-btn');

    function getWorkDaysInMonth(year, month, workingDays) {
        const date = new Date(year, month, 1);
        let workDays = 0;
        while (date.getMonth() === month) {
            if (workingDays.includes(date.getDay())) {
                workDays++;
            }
            date.setDate(date.getDate() + 1);
        }
        return workDays;
    }

    function renderPayrollTable() {
        payrollTbody.innerHTML = '';
        const approvedTeachers = allTeachers.filter(t => t.status === 'approved');

        if (approvedTeachers.length === 0) {
            payrollTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No approved teachers found.</td></tr>';
            return;
        }

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const totalWorkDays = getWorkDaysInMonth(currentYear, currentMonth, payrollSettings.workingDays);

        approvedTeachers.forEach(teacher => {
            const baseSalary = teacher.monthlySalary || 0;
            const teacherRecords = attendanceRecords.filter(rec => {
                const recDate = new Date(rec.date);
                return rec.teacherId === teacher.id && recDate.getMonth() === currentMonth && recDate.getFullYear() === currentYear;
            });

            const daysPresent = new Set(teacherRecords.map(rec => rec.date)).size;
            const absences = totalWorkDays - daysPresent;
            const absenceDeductions = absences * payrollSettings.deductionPerAbsence;

            const totalAllowances = payrollSettings.components.filter(c => c.type === 'allowance').reduce((sum, c) => sum + c.amount, 0);
            const totalDeductions = payrollSettings.components.filter(c => c.type === 'deduction').reduce((sum, c) => sum + c.amount, 0);

            const netSalary = baseSalary - absenceDeductions + totalAllowances - totalDeductions;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Teacher ID">${teacher.id}</td>
                <td data-label="Name">${teacher.firstName} ${teacher.lastName}</td>
                <td data-label="Absences">${absences > 0 ? absences : 0}</td>
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

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const totalWorkDays = getWorkDaysInMonth(currentYear, currentMonth, payrollSettings.workingDays);
        const teacherRecords = attendanceRecords.filter(rec => rec.teacherId === teacher.id && new Date(rec.date).getMonth() === currentMonth && new Date(rec.date).getFullYear() === currentYear);
        const daysPresent = new Set(teacherRecords.map(rec => rec.date)).size;
        const absences = totalWorkDays - daysPresent;
        const absenceDeductions = absences * payrollSettings.deductionPerAbsence;
        const baseSalary = teacher.monthlySalary || 0;

        let breakdownHtml = '<ul>';
        breakdownHtml += `<li><span>Base Monthly Salary</span><span>₱ ${baseSalary.toLocaleString()}</span></li>`;
        breakdownHtml += `<li style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;"><strong>Allowances</strong></li>`;

        let totalAllowances = 0;
        payrollSettings.components.filter(c => c.type === 'allowance').forEach(allowance => {
            breakdownHtml += `<li><span>${allowance.name}</span><span>+ ₱ ${allowance.amount.toLocaleString()}</span></li>`;
            totalAllowances += allowance.amount;
        });

        breakdownHtml += '<li style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;"><strong>Deductions</strong></li>';
        breakdownHtml += `<li><span>Absences (${absences > 0 ? absences : 0} days)</span><span>- ₱ ${absenceDeductions.toLocaleString()}</span></li>`;

        let totalDeductions = absenceDeductions;
        payrollSettings.components.filter(c => c.type === 'deduction').forEach(deduction => {
            breakdownHtml += `<li><span>${deduction.name}</span><span>- ₱ ${deduction.amount.toLocaleString()}</span></li>`;
            totalDeductions += deduction.amount;
        });

        const netSalary = baseSalary + totalAllowances - totalDeductions;
        breakdownHtml += `<li style="font-weight: bold; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px;"><span>NET SALARY</span><span>₱ ${netSalary.toLocaleString()}</span></li>`;
        breakdownHtml += '</ul>';

        modalBody.innerHTML = breakdownHtml;
        modal.style.display = 'block';
    }

    function closeBreakdownModal() { modal.style.display = 'none'; }

    payrollTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-breakdown-btn')) {
            openBreakdownModal(e.target.dataset.id);
        }
    });

    closeBtn.addEventListener('click', closeBreakdownModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) closeBreakdownModal();
    });

    renderPayrollTable();
});
