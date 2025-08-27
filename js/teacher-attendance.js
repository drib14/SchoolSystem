document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const loggedInTeacherId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'teacher' || !loggedInTeacherId) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const statusEl = document.getElementById('current-status');
    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    const historyTbody = document.getElementById('attendance-history-tbody');

    let attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];
    const todayString = new Date().toISOString().split('T')[0];

    function getTodaysRecord() {
        return attendanceRecords.find(rec => rec.teacherId === loggedInTeacherId && rec.date === todayString);
    }

    function updateUI() {
        const todaysRecord = getTodaysRecord();
        if (!todaysRecord) {
            statusEl.textContent = 'Not Checked In';
            checkInBtn.disabled = false;
            checkOutBtn.disabled = true;
        } else if (todaysRecord.checkIn && !todaysRecord.checkOut) {
            statusEl.textContent = `Checked In at ${new Date(todaysRecord.checkIn).toLocaleTimeString()}`;
            checkInBtn.disabled = true;
            checkOutBtn.disabled = false;
        } else if (todaysRecord.checkIn && todaysRecord.checkOut) {
            statusEl.textContent = 'Checked Out for the day';
            checkInBtn.disabled = true;
            checkOutBtn.disabled = true;
        }
        renderHistory();
    }

    function renderHistory() {
        historyTbody.innerHTML = '';
        const myRecords = attendanceRecords.filter(rec => rec.teacherId === loggedInTeacherId).sort((a, b) => new Date(b.date) - new Date(a.date));

        myRecords.forEach(rec => {
            const row = document.createElement('tr');
            let totalHours = 'N/A';
            if (rec.checkIn && rec.checkOut) {
                const hours = (new Date(rec.checkOut) - new Date(rec.checkIn)) / 1000 / 60 / 60;
                totalHours = hours.toFixed(2);
            }
            row.innerHTML = `
                <td data-label="Date">${new Date(rec.date).toDateString()}</td>
                <td data-label="Check-in Time">${rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : 'N/A'}</td>
                <td data-label="Check-out Time">${rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : 'N/A'}</td>
                <td data-label="Total Hours">${totalHours}</td>
            `;
            historyTbody.appendChild(row);
        });
    }

    checkInBtn.addEventListener('click', () => {
        const todaysRecord = getTodaysRecord();
        if (todaysRecord) {
            Toastify({ text: "You have already checked in today.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)" }).showToast();
            return;
        }
        Toastify({ text: "Biometric simulation successful. You are checked in.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();
        attendanceRecords.push({
            teacherId: loggedInTeacherId,
            date: todayString,
            checkIn: new Date().toISOString(),
            checkOut: null
        });
        localStorage.setItem('teacherAttendanceRecords', JSON.stringify(attendanceRecords));
        updateUI();
    });

    checkOutBtn.addEventListener('click', () => {
        const recordIndex = attendanceRecords.findIndex(rec => rec.teacherId === loggedInTeacherId && rec.date === todayString);
        if (recordIndex > -1) {
            Toastify({ text: "Biometric simulation successful. You are checked out.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();
            attendanceRecords[recordIndex].checkOut = new Date().toISOString();
            localStorage.setItem('teacherAttendanceRecords', JSON.stringify(attendanceRecords));
            updateUI();
        } else {
            Toastify({ text: "Error: Could not find your check-in record for today.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)" }).showToast();
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }

    // Initial Load
    updateUI();
});
