document.addEventListener('DOMContentLoaded', () => {
    // --- Config ---
    const LATE_THRESHOLD_HOUR = 8; // 8:00 AM
    const WORKING_DAYS_IN_MONTH = 22; // Assumed for daily rate calculation

    // --- DOM Elements ---
    const payPeriodSelect = document.getElementById('pay-period-select');
    const calculateBtn = document.getElementById('calculate-payroll-btn');
    const resultsContainer = document.getElementById('payroll-results-container');
    const payrollTbody = document.getElementById('payroll-tbody');
    const announceBtn = document.getElementById('announce-payroll-btn');

    // --- Data Loading ---
    const settings = JSON.parse(localStorage.getItem('payrollSettings'));
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];

    if (!settings) {
        document.querySelector('.content').innerHTML = `
            <h2>Settings Not Found</h2>
            <p>Please configure the payroll settings before calculating payroll.</p>
            <a href="payroll-settings.html" class="btn btn-primary">Go to Settings</a>
        `;
        return;
    }

    // --- Pay Period Generation ---
    function getPayPeriods() {
        const periods = [];
        const payday = settings.payday; // Day of the week (1=Mon, 5=Fri)
        let current = new Date();

        for (let i = 0; i < 6; i++) { // Generate 6 recent pay periods
            // Go back to the last payday
            while (current.getDay() !== payday) {
                current.setDate(current.getDate() - 1);
            }

            const endDate = new Date(current);
            const startDate = new Date(current);
            startDate.setDate(startDate.getDate() - 13); // 14 days = 2 weeks

            periods.push({
                label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                startDate,
                endDate
            });

            // Move to the day before the start of this period to find the next one
            current.setDate(current.getDate() - 14);
        }
        return periods;
    }

    function populatePayPeriodSelect() {
        const periods = getPayPeriods();
        payPeriodSelect.innerHTML = periods.map(p =>
            `<option value='${JSON.stringify({ start: p.startDate, end: p.endDate })}'>
                ${p.label}
            </option>`
        ).join('');
    }

    // --- Payroll Calculation Logic ---
    calculateBtn.addEventListener('click', () => {
        const selectedPeriod = JSON.parse(payPeriodSelect.value);
        const startDate = new Date(selectedPeriod.start);
        const endDate = new Date(selectedPeriod.end);

        payrollTbody.innerHTML = '';

        allTeachers.forEach(teacher => {
            let daysWorked = 0;
            let absences = 0;
            let lates = 0;

            // Iterate through the pay period
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                // Check only for weekdays (Monday to Friday)
                if (d.getDay() >= 1 && d.getDay() <= 5) {
                    const dateString = d.toISOString().split('T')[0];
                    const record = attendanceRecords.find(r => r.teacherId === teacher.id && r.date === dateString);

                    if (record && record.checkIn) {
                        daysWorked++;
                        const checkInTime = new Date(record.checkIn);
                        if (checkInTime.getHours() >= LATE_THRESHOLD_HOUR) {
                            lates++;
                        }
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
            const netPay = grossPay - totalDeductions;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${teacher.firstName} ${teacher.lastName}</td>
                <td>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</td>
                <td>${daysWorked}</td>
                <td>${absences}</td>
                <td>${lates}</td>
                <td>₱${grossPay.toFixed(2)}</td>
                <td>₱${totalDeductions.toFixed(2)}</td>
                <td><strong>₱${netPay.toFixed(2)}</strong></td>
            `;
            payrollTbody.appendChild(row);
        });

        resultsContainer.style.display = 'block';
    });

    // --- Announcement Logic ---
    announceBtn.addEventListener('click', () => {
        const selectedPeriodLabel = payPeriodSelect.options[payPeriodSelect.selectedIndex].text;
        let announcements = JSON.parse(localStorage.getItem('announcements')) || [];

        const newAnnouncement = {
            id: `ann-${Date.now()}`,
            date: new Date().toISOString(),
            title: 'Payroll Distribution',
            message: `Payroll for the period ${selectedPeriodLabel} has been distributed. Please check your accounts.`
        };

        // Add to the beginning of the array and keep only the last 5
        announcements.unshift(newAnnouncement);
        announcements = announcements.slice(0, 5);

        localStorage.setItem('announcements', JSON.stringify(announcements));
        alert('Payroll announcement has been posted for all teachers.');
    });

    // --- Initial Load ---
    populatePayPeriodSelect();
});
