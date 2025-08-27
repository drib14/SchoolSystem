document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const addScheduleForm = document.getElementById('add-schedule-form');
    const schedulesTbody = document.getElementById('schedules-tbody');
    const subjectSelection = document.getElementById('subject-selection');
    const teacherSelection = document.getElementById('teacher-selection');

    let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const subjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const teachers = JSON.parse(localStorage.getItem('teachers')) || [];

    // --- Populate Dropdowns ---
    function populateSubjectsDropdown() {
        if (subjects.length === 0) {
            subjectSelection.innerHTML = '<option value="">Please add a subject first</option>';
        } else {
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.code;
                option.textContent = `${subject.name} (${subject.code})`;
                subjectSelection.appendChild(option);
            });
        }
    }

    function populateTeachersDropdown() {
        const approvedTeachers = teachers.filter(t => t.status === 'approved');
        if (approvedTeachers.length === 0) {
            teacherSelection.innerHTML = '<option value="">No approved teachers found</option>';
        } else {
            approvedTeachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = `${teacher.firstName} ${teacher.lastName} (${teacher.id})`;
                teacherSelection.appendChild(option);
            });
        }
    }

    // --- Render Schedules Table ---
    function renderSchedules() {
        schedulesTbody.innerHTML = '';
        if (schedules.length === 0) {
            schedulesTbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No schedules found.</td></tr>';
        } else {
            schedules.forEach((schedule, index) => {
                const row = document.createElement('tr');
                const subject = subjects.find(s => s.code === schedule.subjectCode);
                const teacher = teachers.find(t => t.id === schedule.teacherId);

                const subjectName = subject ? subject.name : 'N/A';
                const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';

                row.innerHTML = `
                    <td data-label="Subject">${subjectName} (${schedule.subjectCode})</td>
                    <td data-label="Section">${schedule.sectionCode}</td>
                    <td data-label="Schedule">${schedule.time}</td>
                    <td data-label="Room">${schedule.room}</td>
                    <td data-label="Teacher">${teacherName}</td>
                    <td data-label="Actions">
                        <button class="action-btn deny-btn delete-btn" data-index="${index}">Delete</button>
                    </td>
                `;
                schedulesTbody.appendChild(row);
            });
        }
    }

    // --- Conflict Checking Logic ---
    function checkForConflicts(teacherId, newTime) {
        const teacher = teachers.find(t => t.id === teacherId);
        if (!teacher) return;

        const teacherWorkSchedule = teacher.workSchedule || {};
        const teacherSchedules = schedules.filter(s => s.teacherId === teacherId);

        // Simple time parsing (assumes "DAYS HH:MM-HH:MM AM/PM" format)
        const timeParts = newTime.match(/([A-Z,a-z]+)\s*(\d{1,2}):\d{2}-(\d{1,2}):\d{2}/);
        if (!timeParts) return; // Cannot parse time

        const daysStr = timeParts[1];
        const startHour = parseInt(timeParts[2]);
        const endHour = parseInt(timeParts[3]);

        const dayMap = { M: 0, T: 1, W: 2, Th: 3, F: 4 };
        const days = daysStr.split('').map(d => dayMap[d]).filter(d => d !== undefined);

        // 1. Check against teacher's general availability
        days.forEach(day => {
            for (let hour = startHour; hour < endHour; hour++) {
                if (!teacherWorkSchedule[day] || !teacherWorkSchedule[day].includes(hour)) {
                    Toastify({ text: `Warning: Teacher is not available on this day/time.`, duration: 5000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #ffc107, #ff9a4f)" }).showToast();
                    return; // Show one warning and stop
                }
            }
        });

        // 2. Check against other classes for the same teacher
        teacherSchedules.forEach(existingSchedule => {
            const existingParts = existingSchedule.time.match(/([A-Z,a-z]+)\s*(\d{1,2}):\d{2}-(\d{1,2}):\d{2}/);
            if (!existingParts) return;

            const existingDays = existingParts[1].split('').map(d => dayMap[d]).filter(d => d !== undefined);
            if (days.some(d => existingDays.includes(d))) { // If any day overlaps
                 Toastify({ text: `Warning: Teacher already has a class scheduled at this time.`, duration: 5000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #ffc107, #ff9a4f)" }).showToast();
            }
        });
    }

    // --- Form Submission ---
    addScheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newSchedule = {
            subjectCode: subjectSelection.value,
            sectionCode: document.getElementById('sectionCode').value,
            time: document.getElementById('scheduleTime').value,
            room: document.getElementById('roomNumber').value,
            teacherId: teacherSelection.value
        };

        checkForConflicts(newSchedule.teacherId, newSchedule.time);

        schedules.push(newSchedule);
        localStorage.setItem('schedules', JSON.stringify(schedules));
        renderSchedules();
        addScheduleForm.reset();
    });

    // --- Delete Schedule ---
    schedulesTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const scheduleIndex = e.target.dataset.index;
            if (confirm(`Are you sure you want to delete this schedule?`)) {
                schedules.splice(scheduleIndex, 1);
                localStorage.setItem('schedules', JSON.stringify(schedules));
                renderSchedules();
            }
        }
    });

    // --- Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }

    // --- Initial Load ---
    populateSubjectsDropdown();
    populateTeachersDropdown();
    renderSchedules();
});
