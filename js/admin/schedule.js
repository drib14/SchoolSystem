document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup and Protection
    protectPage(['admin']);

    // 2. DOM Elements
    const subjectSelect = document.getElementById('subject-select');
    const teacherSelect = document.getElementById('teacher-select');
    const form = document.getElementById('create-schedule-form');
    const tableBody = document.getElementById('schedules-table-body');

    // 3. Data
    const subjects = getData('subjects') || [];
    const users = getData('users') || [];
    const teachers = users.filter(u => u.role === 'teacher');

    // 4. Initial Population
    populateDropdown(subjectSelect, subjects, 'Select a Subject');
    populateDropdown(teacherSelect, teachers, 'Select a Teacher');
    displaySchedules();

    // 5. Event Listeners
    form.addEventListener('submit', handleCreateSchedule);

    function populateDropdown(selectElement, items, defaultText) {
        selectElement.innerHTML = `<option value="">-- ${defaultText} --</option>`;
        items.forEach(item => {
            selectElement.add(new Option(item.name, item.id));
        });
    }

    function displaySchedules() {
        const schedules = getData('schedules') || [];
        const subjectMap = subjects.reduce((map, item) => { map[item.id] = item.name; return map; }, {});
        const teacherMap = teachers.reduce((map, item) => { map[item.id] = item.name; return map; }, {});

        tableBody.innerHTML = '';
        schedules.forEach(schedule => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = subjectMap[schedule.subjectId] || 'Unknown';
            row.insertCell().textContent = teacherMap[schedule.teacherId] || 'Unknown';
            row.insertCell().textContent = schedule.time;
            row.insertCell().innerHTML = `<button class="btn btn-sm btn-danger" onclick="deleteSchedule(${schedule.id})">Delete</button>`;
        });
    }

    function handleCreateSchedule(event) {
        event.preventDefault();
        const subjectId = parseInt(subjectSelect.value);
        const teacherId = parseInt(teacherSelect.value);
        const time = document.getElementById('schedule-time').value.trim();

        if (!subjectId || !teacherId || !time) {
            alert('All fields are required.');
            return;
        }

        const newSchedule = {
            id: Date.now(),
            subjectId,
            teacherId,
            time
        };

        const schedules = getData('schedules') || [];
        schedules.push(newSchedule);
        saveData('schedules', schedules);

        alert('Schedule created successfully!');
        form.reset();
        displaySchedules(); // Refresh the table
    }
});

function deleteSchedule(scheduleId) {
    const confirmed = confirm('Are you sure you want to delete this schedule? This may affect enrolled students.');
    if (!confirmed) return;

    const enrollments = getData('enrollments') || [];
    const hasEnrollments = enrollments.some(e => e.scheduleId === scheduleId);

    if (hasEnrollments) {
        alert('Error: Cannot delete this schedule because students are enrolled in it. Please unenroll students first.');
        return;
    }

    let schedules = getData('schedules') || [];
    const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
    saveData('schedules', updatedSchedules);
    location.reload();
}
