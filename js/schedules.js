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

        schedules.push(newSchedule);
        localStorage.setItem('schedules', JSON.stringify(schedules));
        renderSchedules();
        addScheduleForm.reset();
    });

    // --- Delete Schedule ---
    schedulesTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const scheduleIndex = e.target.dataset.index;
            const scheduleToDelete = schedules[scheduleIndex];
            const scheduleId = `${scheduleToDelete.subjectCode}_${scheduleToDelete.sectionCode}`;

            // Dependency check
            const students = JSON.parse(localStorage.getItem('students')) || [];
            const isScheduleInUse = students.some(student =>
                student.plottedClasses && student.plottedClasses.some(plotted => `${plotted.subjectCode}_${plotted.sectionCode}` === scheduleId)
            );

            if (isScheduleInUse) {
                Toastify({ text: `Cannot delete this schedule because students have already enrolled in it.`, duration: 3000, className: "toast-error" }).showToast();
                return;
            }

            if (confirm(`Are you sure you want to delete this schedule?`)) {
                schedules.splice(scheduleIndex, 1);
                localStorage.setItem('schedules', JSON.stringify(schedules));
                renderSchedules();
                Toastify({ text: "Schedule deleted successfully.", duration: 3000, className: "toast-success" }).showToast();
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
