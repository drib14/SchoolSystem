// --- Absolute Bare-Bones Script ---

// Get elements directly. Assume DOM is loaded.
const checkInBtn = document.getElementById('check-in-btn');
const checkOutBtn = document.getElementById('check-out-btn');

// Check if buttons exist to prevent errors
if (checkInBtn && checkOutBtn) {

    checkInBtn.addEventListener('click', () => {
        const loggedInTeacherId = localStorage.getItem('userId');
        const todayString = new Date().toISOString().split('T')[0];
        let attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];
        const todaysRecord = attendanceRecords.find(rec => rec.teacherId === loggedInTeacherId && rec.date === todayString);

        if (todaysRecord) {
            // Do nothing, just alert for debugging.
            alert('DEBUG: Already checked in.');
            return;
        }

        attendanceRecords.push({
            teacherId: loggedInTeacherId,
            date: todayString,
            checkIn: new Date().toISOString(),
            checkOut: null
        });
        localStorage.setItem('teacherAttendanceRecords', JSON.stringify(attendanceRecords));
        alert('DEBUG: Check-in successful. Please refresh to see changes.');
    });

    checkOutBtn.addEventListener('click', () => {
        const loggedInTeacherId = localStorage.getItem('userId');
        const todayString = new Date().toISOString().split('T')[0];
        let attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];
        const recordIndex = attendanceRecords.findIndex(rec => rec.teacherId === loggedInTeacherId && rec.date === todayString);

        if (recordIndex > -1) {
            attendanceRecords[recordIndex].checkOut = new Date().toISOString();
            localStorage.setItem('teacherAttendanceRecords', JSON.stringify(attendanceRecords));
            alert('DEBUG: Check-out successful. Please refresh to see changes.');
        } else {
            alert('DEBUG: Cannot check out before checking in.');
        }
    });

} else {
    // If the buttons aren't found, this is the root problem.
    alert('DEBUG: Check-in/out buttons not found on the page.');
}
