document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const addScheduleForm = document.getElementById('add-schedule-form');
    const schedulesTbody = document.getElementById('schedules-tbody');
    const subjectSelection = document.getElementById('subject-selection');

    let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const subjects = JSON.parse(localStorage.getItem('subjects')) || [];

    // --- Populate Subjects Dropdown ---
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

    // --- Render Schedules Table ---
    function renderSchedules() {
        schedulesTbody.innerHTML = '';
        if (schedules.length === 0) {
            schedulesTbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No schedules found.</td></tr>';
        } else {
            schedules.forEach((schedule, index) => {
                const row = document.createElement('tr');
                const subject = subjects.find(s => s.code === schedule.subjectCode);
                const subjectName = subject ? subject.name : 'N/A';

                row.innerHTML = `
                    <td>${subjectName} (${schedule.subjectCode})</td>
                    <td>${schedule.sectionCode}</td>
                    <td>${schedule.time}</td>
                    <td>${schedule.room}</td>
                    <td>${schedule.teacher}</td>
                    <td>
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
            teacher: document.getElementById('teacherName').value
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
    renderSchedules();
});
