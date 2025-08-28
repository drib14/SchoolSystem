document.addEventListener('DOMContentLoaded', () => {
    // --- Auth & URL Param ---
    const loggedInTeacherId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'teacher' || !loggedInTeacherId) {
        window.location.href = 'index.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const scheduleId = urlParams.get('scheduleId');
    if (!scheduleId) {
        window.location.href = 'my-classes.html';
        return;
    }
    const [subjectCode, sectionCode] = scheduleId.split('_');

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allSchedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

    const currentSchedule = allSchedules.find(s => s.subjectCode === subjectCode && s.sectionCode === sectionCode);
    const currentSubject = allSubjects.find(s => s.code === subjectCode);

    if (!currentSchedule || !currentSubject) {
        Toastify({ text: 'Could not find class details.', duration: 3000, className: "toast-error" }).showToast();
        return;
    }

    // --- DOM Elements ---
    const header = document.getElementById('attendance-header');
    const rosterTbody = document.getElementById('roster-tbody');
    const attendanceForm = document.getElementById('attendance-form');

    // --- Update Header ---
    header.innerHTML = `
        <h1>Take Attendance</h1>
        <p>${currentSubject.name} - Section ${currentSchedule.sectionCode}</p>
        <p><strong>Date: </strong>${new Date().toDateString()}</p>
    `;

    // --- Find Enrolled Students ---
    const enrolledStudents = allStudents.filter(student =>
        student.plottedClasses && student.plottedClasses.some(plotted =>
            plotted.subjectCode === subjectCode && plotted.sectionCode === sectionCode
        )
    );

    // --- Render Roster ---
    const todayString = new Date().toISOString().split('T')[0];
    const attendanceTakenToday = attendanceRecords.some(rec => rec.scheduleId === scheduleId && rec.date === todayString);

    function renderRoster() {
        rosterTbody.innerHTML = '';
        if (enrolledStudents.length === 0) {
            rosterTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No students are enrolled in this class.</td></tr>';
            attendanceForm.querySelector('button').style.display = 'none';
        } else {
            enrolledStudents.forEach(student => {
                const row = document.createElement('tr');
                const existingRecord = attendanceRecords.find(rec => rec.scheduleId === scheduleId && rec.studentId === student.id && rec.date === todayString);
                const status = existingRecord ? existingRecord.status : 'Present'; // Default to Present

                row.innerHTML = `
                    <td data-label="Student ID">${student.id}</td>
                    <td data-label="Student Name">${student.firstName} ${student.lastName}</td>
                    <td data-label="Status">
                        <div class="attendance-status">
                            <label><input type="radio" name="status-${student.id}" value="Present" ${status === 'Present' ? 'checked' : ''} ${attendanceTakenToday ? 'disabled' : ''}> Present</label>
                            <label><input type="radio" name="status-${student.id}" value="Late" ${status === 'Late' ? 'checked' : ''} ${attendanceTakenToday ? 'disabled' : ''}> Late</label>
                            <label><input type="radio" name="status-${student.id}" value="Absent" ${status === 'Absent' ? 'checked' : ''} ${attendanceTakenToday ? 'disabled' : ''}> Absent</label>
                        </div>
                    </td>
                `;
                rosterTbody.appendChild(row);
            });
        }
        if (attendanceTakenToday) {
            const submitButton = attendanceForm.querySelector('button');
            submitButton.textContent = 'Attendance Submitted for Today';
            submitButton.disabled = true;
        }
    }

    // --- Form Submission ---
    attendanceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        enrolledStudents.forEach(student => {
            const status = document.querySelector(`input[name="status-${student.id}"]:checked`).value;
            // Remove any old record for this student, this day, this class, before adding a new one
            attendanceRecords = attendanceRecords.filter(rec => !(rec.scheduleId === scheduleId && rec.studentId === student.id && rec.date === todayString));

            // Add the new record
            attendanceRecords.push({
                scheduleId: scheduleId,
                studentId: student.id,
                date: todayString,
                status: status
            });
        });

        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
        Toastify({ text: 'Attendance has been submitted successfully!', duration: 3000, className: "toast-success" }).showToast();
        renderRoster(); // Re-render to disable fields
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
    renderRoster();
});
