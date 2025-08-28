document.addEventListener('DOMContentLoaded', () => {
    const loggedInTeacherId = localStorage.getItem('userId');
    if (localStorage.getItem('userRole') !== 'teacher' || !loggedInTeacherId) return;

    const tbody = document.getElementById('payslips-tbody');
    const settings = JSON.parse(localStorage.getItem('payrollSettings'));
    const attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];
    const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const currentUser = teachers.find(t => t.id === loggedInTeacherId);

    const modal = document.getElementById('payslip-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const payslipDetailContent = document.getElementById('payslip-detail-content');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');

    if (!settings || !currentUser) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Required settings or user data not found.</td></tr>';
        return;
    }

    const LATE_THRESHOLD_HOUR = 8;
    const WORKING_DAYS_IN_MONTH = 22;
    let payPeriods = [];

    function getPayPeriods() {
        const periods = [];
        for (let i = 0; i < 12; i++) {
            let endDate = new Date();
            endDate.setDate(endDate.getDate() - (i * 14));
            let startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 13);
            periods.push({ startDate, endDate });
        }
        return periods;
    }

    function calculatePayslipForPeriod(period) {
        let daysWorked = 0, absences = 0, lates = 0;
        for (let d = new Date(period.startDate); d <= period.endDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            const teacherDayOff = currentUser.dayOff !== undefined ? currentUser.dayOff + 1 : -1;
            if (dayOfWeek >= 1 && dayOfWeek <= 6 && dayOfWeek !== teacherDayOff) {
                const dateString = d.toISOString().split('T')[0];
                const record = attendanceRecords.find(r => r.teacherId === loggedInTeacherId && r.date === dateString);
                if (record && record.checkIn) {
                    daysWorked++;
                    if (new Date(record.checkIn).getHours() >= LATE_THRESHOLD_HOUR) lates++;
                } else {
                    absences++;
                }
            }
        }

        const dailyRate = settings.monthlySalary / WORKING_DAYS_IN_MONTH;
        const grossPay = daysWorked * dailyRate;
        const absenceDeductions = absences * settings.absenceDeduction;
        const lateDeductions = lates * settings.lateDeduction;
        const totalDeductions = absenceDeductions + lateDeductions;
        const taxableIncome = grossPay - totalDeductions;
        const taxAmount = taxableIncome * (settings.taxRate / 100);
        const netPay = taxableIncome - taxAmount;

        return { daysWorked, absences, lates, grossPay, totalDeductions, taxAmount, netPay };
    }

    function renderPayslipsTable() {
        payPeriods = getPayPeriods();
        tbody.innerHTML = '';
        payPeriods.forEach((period, index) => {
            const payslip = calculatePayslipForPeriod(period);
            if (payslip.daysWorked > 0 || payslip.absences > 0) {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td data-label="Pay Period">${period.startDate.toLocaleDateString()} - ${period.endDate.toLocaleDateString()}</td>
                    <td data-label="Net Pay"><strong>₱${payslip.netPay.toFixed(2)}</strong></td>
                    <td data-label="Status"><span class="status-approved">Paid</span></td>
                    <td data-label="Actions">
                        <button class="action-btn view-btn" data-period-index="${index}">View</button>
                    </td>
                `;
            }
        });
        if (tbody.innerHTML === '') {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No payslip history found.</td></tr>';
        }
    }

    function openPayslipModal(periodIndex) {
        const period = payPeriods[periodIndex];
        const payslip = calculatePayslipForPeriod(period);
        const periodLabel = `${period.startDate.toLocaleDateString()} - ${period.endDate.toLocaleDateString()}`;

        payslipDetailContent.innerHTML = `
            <div id="payslip-to-print">
                <h2 style="text-align: center;">Payslip</h2>
                <p><strong>Teacher:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
                <p><strong>Pay Period:</strong> ${periodLabel}</p>
                <hr>
                <h4>Earnings</h4>
                <p>Base Salary (for days worked): ₱${payslip.grossPay.toFixed(2)}</p>
                <hr>
                <h4>Deductions</h4>
                <p>Absences (${payslip.absences} days): -₱${payslip.absenceDeductions.toFixed(2)}</p>
                <p>Lates (${payslip.lates} instances): -₱${payslip.lateDeductions.toFixed(2)}</p>
                <p><strong>Sub-total Deductions:</strong> -₱${payslip.totalDeductions.toFixed(2)}</p>
                <p>Tax (${settings.taxRate}%): -₱${payslip.taxAmount.toFixed(2)}</p>
                <hr>
                <h3 style="text-align: right;">Net Pay: ₱${payslip.netPay.toFixed(2)}</h3>
            </div>
        `;
        modal.style.display = 'block';
    }

    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-btn')) {
            openPayslipModal(e.target.dataset.periodIndex);
        }
    });

    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target == modal) modal.style.display = 'none'; });

    downloadPdfBtn.addEventListener('click', () => {
        const element = document.getElementById('payslip-to-print');
        const opt = {
            margin:       0.5,
            filename:     `payslip_${currentUser.lastName}_${Date.now()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    });

    renderPayslipsTable();
});
