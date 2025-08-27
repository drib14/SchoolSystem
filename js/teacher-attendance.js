document.addEventListener('DOMContentLoaded', () => {
    console.log("Teacher Attendance Script Loaded.");

    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    const loggedInTeacherId = localStorage.getItem('userId');
    const todayString = new Date().toISOString().split('T')[0];

    if (!checkInBtn || !checkOutBtn) {
        console.error("Check-in or Check-out button not found.");
        return;
    }

    if (!loggedInTeacherId) {
        console.error("Teacher ID not found in localStorage.");
        return;
    }

    // Bare-bones Check-in
    checkInBtn.addEventListener('click', () => {
        console.log("Check-in button clicked.");
        let attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];
        const todaysRecord = attendanceRecords.find(rec => rec.teacherId === loggedInTeacherId && rec.date === todayString);

        if (todaysRecord) {
            Toastify({ text: "Already checked in today.", duration: 3000 }).showToast();
            return;
        }

        attendanceRecords.push({
            teacherId: loggedInTeacherId,
            date: todayString,
            checkIn: new Date().toISOString(),
            checkOut: null
        });
        localStorage.setItem('teacherAttendanceRecords', JSON.stringify(attendanceRecords));
        Toastify({ text: "Checked In.", duration: 3000, backgroundColor: "green" }).showToast();
        // No UI update, to keep it simple. User will have to refresh to see change.
    });

    // Bare-bones Check-out
    checkOutBtn.addEventListener('click', () => {
        console.log("Check-out button clicked.");
        let attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];
        const recordIndex = attendanceRecords.findIndex(rec => rec.teacherId === loggedInTeacherId && rec.date === todayString);

        if (recordIndex > -1) {
            if (attendanceRecords[recordIndex].checkOut) {
                Toastify({ text: "Already checked out today.", duration: 3000 }).showToast();
                return;
            }
            attendanceRecords[recordIndex].checkOut = new Date().toISOString();
            localStorage.setItem('teacherAttendanceRecords', JSON.stringify(attendanceRecords));
            Toastify({ text: "Checked Out.", duration: 3000, backgroundColor: "green" }).showToast();
        } else {
            Toastify({ text: "Cannot check out before checking in.", duration: 3000 }).showToast();
        }
    });
});
