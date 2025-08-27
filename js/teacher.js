document.addEventListener('DOMContentLoaded', () => {
    // Auth checks and sidebar population are handled by auth.js
    const loggedInTeacherId = localStorage.getItem('userId');

    const announcementsContainer = document.getElementById('announcements-container');
    const classCountEl = document.getElementById('teacher-class-count');
    const studentCountEl = document.getElementById('teacher-student-count');
    const attendanceStatusEl = document.getElementById('teacher-attendance-status');

    // --- Display Announcements ---
    function displayAnnouncements() {
        const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        if (announcements.length > 0 && announcementsContainer) {
            announcementsContainer.innerHTML = announcements.map(ann => {
                const announcementDate = new Date(ann.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                return `
                    <div class="announcement">
                        <h4><i class="fas fa-bullhorn"></i> ${ann.title}</h4>
                        <p>${ann.message}</p>
                        <p class="announcement-date">Posted on: ${announcementDate}</p>
                    </div>`;
            }).join('');
        }
    }

    // --- Populate Dashboard Cards ---
    function populateDashboard() {
        if (!loggedInTeacherId) return;

        const allSchedules = JSON.parse(localStorage.getItem('schedules')) || [];
        const allStudents = JSON.parse(localStorage.getItem('students')) || [];
        const attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];

        // 1. Calculate class count
        const mySchedules = allSchedules.filter(s => s.teacherId === loggedInTeacherId);
        if (classCountEl) {
            classCountEl.textContent = mySchedules.length;
        }

        // 2. Calculate student count
        const studentIds = new Set();
        mySchedules.forEach(schedule => {
            allStudents.forEach(student => {
                if (student.plottedClasses && student.plottedClasses.some(pc => pc.subjectCode === schedule.subjectCode && pc.sectionCode === schedule.sectionCode)) {
                    studentIds.add(student.id);
                }
            });
        });
        if (studentCountEl) {
            studentCountEl.textContent = studentIds.size;
        }

        // 3. Check today's attendance
        const todayString = new Date().toISOString().split('T')[0];
        const todaysRecord = attendanceRecords.find(rec => rec.teacherId === loggedInTeacherId && rec.date === todayString);
        if (attendanceStatusEl) {
            if (todaysRecord && todaysRecord.checkIn && !todaysRecord.checkOut) {
                attendanceStatusEl.textContent = 'Checked In';
                attendanceStatusEl.style.color = '#28a745';
            } else if (todaysRecord && todaysRecord.checkOut) {
                attendanceStatusEl.textContent = 'Checked Out';
                attendanceStatusEl.style.color = '#dc3545';
            } else {
                attendanceStatusEl.textContent = 'Not Recorded';
            }
        }
    }

    // --- Initial Load ---
    displayAnnouncements();
    populateDashboard();
});
