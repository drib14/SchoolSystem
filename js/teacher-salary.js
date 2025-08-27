document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const loggedInTeacherId = localStorage.getItem('userId');
    if (localStorage.getItem('userRole') !== 'teacher' || !loggedInTeacherId) {
        return;
    }

    const tbody = document.getElementById('salary-history-tbody');

    // --- Data Loading ---
    const settings = JSON.parse(localStorage.getItem('payrollSettings'));
    const attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];

    if (!settings) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Payroll settings have not been configured by the admin yet.</td></tr>';
        return;
    }

    // --- Config ---
    const LATE_THRESHOLD_HOUR = 8;
    const WORKING_DAYS_IN_MONTH = 22;

    // --- Pay Period Generation (same as in payroll.js) ---
    function getPayPeriods() {
        const periods = [];
        const payday = settings.payday;
        let current = new Date();
        for (let i = 0; i < 12; i++) { // Generate 12 recent pay periods for history
            while (current.getDay() !== payday) {
                current.setDate(current.getDate() - 1);
            }
            const endDate = new Date(current);
            const startDate = new Date(current);
            startDate.setDate(startDate.getDate() - 13);
            periods.push({
                label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                startDate,
                endDate
            });
            current.setDate(current.getDate() - 14);
        }
        return periods;
    }

    function calculateAndRenderHistory() {
        const payPeriods = getPayPeriods();
        tbody.innerHTML = '';

        payPeriods.forEach(period => {
            let daysWorked = 0;
            let absences = 0;
            let lates = 0;

            for (let d = new Date(period.startDate); d <= period.endDate; d.setDate(d.getDate() + 1)) {
                if (d.getDay() >= 1 && d.getDay() <= 5) { // Monday to Friday
                    const dateString = d.toISOString().split('T')[0];
                    const record = attendanceRecords.find(r => r.teacherId === loggedInTeacherId && r.date === dateString);
                    if (record && record.checkIn) {
                        daysWorked++;
                        if (new Date(record.checkIn).getHours() >= LATE_THRESHOLD_HOUR) {
                            lates++;
                        }
                    } else {
                        absences++;
                    }
                }
            }

            // Only render a row if there was activity or potential activity
            if (daysWorked > 0 || absences > 0) {
                const dailyRate = settings.monthlySalary / WORKING_DAYS_IN_MONTH;
                const grossPay = daysWorked * dailyRate;
                const absenceDeductions = absences * settings.absenceDeduction;
                const lateDeductions = lates * settings.lateDeduction;
                const totalDeductions = absenceDeductions + lateDeductions;
                const netPay = grossPay - totalDeductions;

                const row = tbody.insertRow();
                row.innerHTML = `
                    <td data-label="Pay Period">${period.label}</td>
                    <td data-label="Days Worked">${daysWorked}</td>
                    <td data-label="Absences">${absences}</td>
                    <td data-label="Lates">${lates}</td>
                    <td data-label="Gross Pay">₱${grossPay.toFixed(2)}</td>
                    <td data-label="Deductions">₱${totalDeductions.toFixed(2)}</td>
                    <td data-label="Net Pay"><strong>₱${netPay.toFixed(2)}</strong></td>
                `;
            }
        });

        if (tbody.innerHTML === '') {
             tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No salary history found.</td></tr>';
        }
    }

    calculateAndRenderHistory();
});
