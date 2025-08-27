document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const teacherSelect = document.getElementById('teacher-select');
    const scheduleContainer = document.getElementById('schedule-container');
    const scheduleGridContainer = document.getElementById('schedule-grid-container');
    const scheduleHeader = document.getElementById('schedule-header');
    const saveScheduleBtn = document.getElementById('save-schedule-btn');
    const dayOffSelect = document.getElementById('day-off-select');

    let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    let selectedTeacherId = null;
    let workSchedule = {}; // In-memory representation of the schedule being edited

    // --- Populate Teacher Dropdown ---
    function populateTeachers() {
        const approvedTeachers = teachers.filter(t => t.status === 'approved');
        teacherSelect.innerHTML = '<option value="">-- Select a Teacher --</option>';
        approvedTeachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = `${teacher.firstName} ${teacher.lastName} (${teacher.id})`;
            teacherSelect.appendChild(option);
        });
    }

    // --- Generate Schedule Grid ---
    function generateGrid() {
        scheduleGridContainer.innerHTML = '';
        const days = ['Time', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

        scheduleGridContainer.style.gridTemplateColumns = `repeat(${days.length}, 1fr)`;

        days.forEach(day => {
            const headerEl = document.createElement('div');
            headerEl.className = 'grid-header';
            headerEl.textContent = day;
            scheduleGridContainer.appendChild(headerEl);
        });

        hours.forEach(hour => {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'grid-header';
            timeLabel.textContent = `${hour}:00`;
            scheduleGridContainer.appendChild(timeLabel);

            days.slice(1).forEach((day, dayIndex) => {
                const slot = document.createElement('div');
                slot.className = 'time-slot unavailable';
                slot.dataset.day = dayIndex;
                slot.dataset.hour = hour;
                scheduleGridContainer.appendChild(slot);
            });
        });
    }

    // --- Load and Display Schedule ---
    function loadScheduleForTeacher(teacherId) {
        const teacher = teachers.find(t => t.id === teacherId);
        if (!teacher) return;

        workSchedule = teacher.workSchedule ? JSON.parse(JSON.stringify(teacher.workSchedule)) : {};
        dayOffSelect.value = teacher.dayOff !== undefined ? teacher.dayOff : '-1';
        scheduleHeader.textContent = `Editing schedule for ${teacher.firstName} ${teacher.lastName}`;

        updateGridDisplay();
    }

    function updateGridDisplay() {
        const dayOff = parseInt(dayOffSelect.value, 10);
        document.querySelectorAll('.time-slot').forEach(slot => {
            const day = parseInt(slot.dataset.day, 10);
            const hour = parseInt(slot.dataset.hour, 10);

            if (day === dayOff) {
                slot.className = 'time-slot unavailable';
                return;
            }

            const isAvailable = workSchedule[day] && workSchedule[day].includes(hour);
            slot.classList.toggle('available', isAvailable);
            slot.classList.toggle('unavailable', !isAvailable);
        });
    }

    // --- Event Listeners ---
    teacherSelect.addEventListener('change', () => {
        selectedTeacherId = teacherSelect.value;
        if (selectedTeacherId) {
            scheduleContainer.style.display = 'block';
            loadScheduleForTeacher(selectedTeacherId);
        } else {
            scheduleContainer.style.display = 'none';
        }
    });

    dayOffSelect.addEventListener('change', updateGridDisplay);

    scheduleGridContainer.addEventListener('click', (e) => {
        const dayOff = parseInt(dayOffSelect.value, 10);
        const slot = e.target;
        if (slot.classList.contains('time-slot')) {
            const day = parseInt(slot.dataset.day, 10);
            if(day === dayOff) return; // Don't allow changing day off slots

            const hour = parseInt(slot.dataset.hour, 10);
            if (!workSchedule[day]) workSchedule[day] = [];

            const hourIndex = workSchedule[day].indexOf(hour);
            if (hourIndex > -1) {
                workSchedule[day].splice(hourIndex, 1);
            } else {
                workSchedule[day].push(hour);
            }
            updateGridDisplay();
        }
    });

    saveScheduleBtn.addEventListener('click', () => {
        if (!selectedTeacherId) return;
        const teacherIndex = teachers.findIndex(t => t.id === selectedTeacherId);
        if (teacherIndex > -1) {
            teachers[teacherIndex].workSchedule = workSchedule;
            teachers[teacherIndex].dayOff = parseInt(dayOffSelect.value, 10);
            localStorage.setItem('teachers', JSON.stringify(teachers));
            Toastify({ text: "Teacher's schedule saved successfully!", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();
        } else {
            Toastify({ text: "Error: Could not find teacher to save schedule.", duration: 3000, gravity: "top", position: "center", backgroundColor: "linear-gradient(to right, #dc3545, #ef5350)" }).showToast();
        }
    });

    // --- Initial Load ---
    populateTeachers();
    generateGrid();
});
