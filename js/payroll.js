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

    function renderPayrollTable() {
        payrollTbody.innerHTML = '';
        const approvedTeachers = allTeachers.filter(t => t.status === 'approved');

        if (approvedTeachers.length === 0) {
            payrollTbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No approved teachers found.</td></tr>';
            return;
        }

        if (hourlyRate === 0) {
            const header = document.querySelector('.header');
            if (!header.querySelector('.warning-message')) {
                const warning = document.createElement('p');
                warning.style.color = 'red';
                warning.style.fontWeight = 'bold';
                warning.textContent = 'Warning: Hourly rate is not set. Please set it in Payroll Settings.';
                warning.className = 'warning-message';
                header.appendChild(warning);
            }
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
                    const hours = (new Date(rec.checkOut) - new Date(rec.checkIn)) / 1000 / 60 / 60;
                    totalHours += hours;
                }
            });

            const grossSalary = totalHours * hourlyRate;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${teacher.id}</td>
                <td>${teacher.firstName} ${teacher.lastName}</td>
                <td>${totalHours.toFixed(2)}</td>
                <td>₱ ${grossSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            `;
            payrollTbody.appendChild(row);
        });
    }

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
