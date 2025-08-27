document.addEventListener('DOMContentLoaded', () => {
    // --- Config ---
    const LATE_THRESHOLD_HOUR = 8; // 8:00 AM
    const WORKING_DAYS_IN_MONTH = 22; // Assumed for daily rate calculation

    // --- DOM Elements ---
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
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

    // --- Payroll Calculation Logic ---
    calculateBtn.addEventListener('click', () => {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (!startDateInput.value || !endDateInput.value || startDate > endDate) {
            Toastify({ text: "Please select a valid start and end date.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)" }).showToast();
            return;
        }

        payrollTbody.innerHTML = '';

        allTeachers.forEach(teacher => {
            if (teacher.status !== 'approved') return; // Only calculate for approved teachers

            let daysWorked = 0;
            let absences = 0;
            let lates = 0;

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                // dayOfWeek: Sunday=0, Monday=1, ..., Saturday=6
                const dayOfWeek = d.getDay();
                // teacher.dayOff is stored as 0-5 (Mon-Sat). We convert Sunday (0) to 6 for our logic.
                const teacherDayOff = teacher.dayOff !== undefined ? teacher.dayOff + 1 : -1; // Now 1-6 for Mon-Sat

                // Check if it's a working day (Mon-Sat) and not the teacher's day off
                if (dayOfWeek >= 1 && dayOfWeek <= 6 && dayOfWeek !== teacherDayOff) {
                    const dateString = d.toISOString().split('T')[0];
                    const record = attendanceRecords.find(r => r.teacherId === teacher.id && r.date === dateString);

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

            const dailyRate = settings.monthlySalary / WORKING_DAYS_IN_MONTH;
            const grossPay = daysWorked * dailyRate;
            const absenceDeductions = absences * settings.absenceDeduction;
            const lateDeductions = lates * settings.lateDeduction;
            const totalDeductions = absenceDeductions + lateDeductions;
            const netPay = grossPay - totalDeductions;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Teacher Name">${teacher.firstName} ${teacher.lastName}</td>
                <td data-label="Pay Period">${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</td>
                <td data-label="Days Worked">${daysWorked}</td>
                <td data-label="Absences">${absences}</td>
                <td data-label="Lates">${lates}</td>
                <td data-label="Gross Pay">₱${grossPay.toFixed(2)}</td>
                <td data-label="Deductions">₱${totalDeductions.toFixed(2)}</td>
                <td data-label="Net Pay"><strong>₱${netPay.toFixed(2)}</strong></td>
            `;
            payrollTbody.appendChild(row);
        });

        resultsContainer.style.display = 'block';
    });

    // --- Announcement Logic ---
    announceBtn.addEventListener('click', () => {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        if (!startDateInput.value || !endDateInput.value || startDate > endDate) {
             Toastify({ text: "Please calculate payroll for a valid date range before announcing.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)" }).showToast();
            return;
        }

        const periodLabel = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        let announcements = JSON.parse(localStorage.getItem('announcements')) || [];

        const newAnnouncement = {
            id: `ann-${Date.now()}`,
            date: new Date().toISOString(),
            title: 'Payroll Distribution',
            message: `Payroll for the period ${periodLabel} has been distributed. Please check your accounts.`
        };

        announcements.unshift(newAnnouncement);
        announcements = announcements.slice(0, 5);
        localStorage.setItem('announcements', JSON.stringify(announcements));

        Toastify({ text: "Payroll announcement has been posted for all teachers.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();
    });
});
