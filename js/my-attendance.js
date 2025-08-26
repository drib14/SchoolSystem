document.addEventListener('DOMContentLoaded', () => {
    // --- Auth Check ---
    const loggedInUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'student' || !loggedInUserId) {
        window.location.href = 'index.html';
        return;
    }

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const currentUser = allStudents.find(s => s.id === loggedInUserId);
    const myPlottedClasses = currentUser.plottedClasses || [];

    // --- DOM Elements ---
    const classCheckInSelect = document.getElementById('class-check-in');
    const checkInBtn = document.getElementById('check-in-btn');
    const attendanceHistoryTbody = document.getElementById('attendance-history-tbody');

    // --- Populate Dropdown ---
    function populateCheckInDropdown() {
        if (myPlottedClasses.length === 0) {
            classCheckInSelect.innerHTML = '<option value="">You have no classes</option>';
            checkInBtn.disabled = true;
        } else {
            myPlottedClasses.forEach(schedule => {
                const subject = allSubjects.find(s => s.code === schedule.subjectCode);
                const scheduleId = `${schedule.subjectCode}_${schedule.sectionCode}`;
                const option = document.createElement('option');
                option.value = scheduleId;
                option.textContent = `${subject ? subject.name : 'N/A'} - Section ${schedule.sectionCode}`;
                classCheckInSelect.appendChild(option);
            });
        }
    }

    // --- Render History ---
    function renderAttendanceHistory() {
        attendanceHistoryTbody.innerHTML = '';
        const myRecords = attendanceRecords.filter(rec => rec.studentId === loggedInUserId).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (myRecords.length === 0) {
            attendanceHistoryTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No attendance records found.</td></tr>';
        } else {
            myRecords.forEach(record => {
                const scheduleId = record.scheduleId;
                const [subjectCode, sectionCode] = scheduleId.split('_');
                const subject = allSubjects.find(s => s.code === subjectCode);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(record.date).toDateString()}</td>
                    <td>${subject ? subject.name : 'Unknown Subject'}</td>
                    <td>${record.status}</td>
                `;
                attendanceHistoryTbody.appendChild(row);
            });
        }
    }

    // --- Check-in Logic ---
    checkInBtn.addEventListener('click', () => {
        const selectedScheduleId = classCheckInSelect.value;
        if (!selectedScheduleId) {
            alert('Please select a class to check in for.');
            return;
        }

        const todayString = new Date().toISOString().split('T')[0];
        const alreadyAttended = attendanceRecords.some(rec => rec.studentId === loggedInUserId && rec.scheduleId === selectedScheduleId && rec.date === todayString);

        if (alreadyAttended) {
            alert('You have already checked in or been marked for this class today.');
            return;
        }

        // Simulate successful biometric scan
        alert('Biometric scan successful! You have been checked in.');

        // Add the new record
        attendanceRecords.push({
            scheduleId: selectedScheduleId,
            studentId: loggedInUserId,
            date: todayString,
            status: 'Present'
        });

        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
        renderAttendanceHistory(); // Refresh the history table
    });

    // --- Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }

    // --- Initial Load ---
    populateCheckInDropdown();
    renderAttendanceHistory();
});
