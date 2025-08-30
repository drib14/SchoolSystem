document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup and Protection
    protectPage(['admin']);

    // 2. DOM Elements
    const studentSelect = document.getElementById('student-select');
    const scheduleSelect = document.getElementById('schedule-select');
    const form = document.getElementById('enrollment-form');
    const tableBody = document.getElementById('enrollments-table-body');

    // 3. Data
    const users = getData('users') || [];
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    const schedules = getData('schedules') || [];
    const subjects = getData('subjects') || [];

    // 4. Initial Population
    populateDropdown(studentSelect, students, 'Select a Student');
    populateScheduleDropdown();
    displayEnrollments();

    // 5. Event Listeners
    form.addEventListener('submit', handleCreateEnrollment);

    function populateDropdown(selectElement, items, defaultText) {
        selectElement.innerHTML = `<option value="">-- ${defaultText} --</option>`;
        items.forEach(item => {
            selectElement.add(new Option(item.name, item.id));
        });
    }

    function populateScheduleDropdown() {
        const subjectMap = subjects.reduce((map, item) => { map[item.id] = item.name; return map; }, {});
        const teacherMap = teachers.reduce((map, item) => { map[item.id] = item.name; return map; }, {});

        scheduleSelect.innerHTML = '<option value="">-- Select a Class Schedule --</option>';
        schedules.forEach(schedule => {
            const subjectName = subjectMap[schedule.subjectId] || 'Unknown';
            const teacherName = teacherMap[schedule.teacherId] || 'Unknown';
            const label = `${subjectName} (${teacherName}, ${schedule.time})`;
            scheduleSelect.add(new Option(label, schedule.id));
        });
    }

    function displayEnrollments() {
        const enrollments = getData('enrollments') || [];
        const studentMap = students.reduce((map, item) => { map[item.id] = item.name; return map; }, {});
        const scheduleMap = schedules.reduce((map, item) => { map[item.id] = item; return map; }, {});
        const subjectMap = subjects.reduce((map, item) => { map[item.id] = item.name; return map; }, {});
        const teacherMap = teachers.reduce((map, item) => { map[item.id] = item.name; return map; }, {});

        tableBody.innerHTML = '';
        enrollments.forEach(enrollment => {
            const studentName = studentMap[enrollment.studentId] || 'Unknown';
            const schedule = scheduleMap[enrollment.scheduleId];
            if (!schedule) return;
            const subjectName = subjectMap[schedule.subjectId] || 'Unknown';
            const teacherName = teacherMap[schedule.teacherId] || 'Unknown';

            const row = tableBody.insertRow();
            row.insertCell().textContent = studentName;
            row.insertCell().textContent = subjectName;
            row.insertCell().textContent = teacherName;
            row.insertCell().innerHTML = `<button class="btn btn-sm btn-danger" onclick="deleteEnrollment(${enrollment.id})">Unenroll</button>`;
        });
    }

    function handleCreateEnrollment(event) {
        event.preventDefault();
        const studentId = parseInt(studentSelect.value);
        const scheduleId = parseInt(scheduleSelect.value);

        if (!studentId || !scheduleId) {
            alert('Please select both a student and a class.');
            return;
        }

        const enrollments = getData('enrollments') || [];
        const alreadyEnrolled = enrollments.some(e => e.studentId === studentId && e.scheduleId === scheduleId);

        if (alreadyEnrolled) {
            alert('This student is already enrolled in this class.');
            return;
        }

        const newEnrollment = { id: Date.now(), studentId, scheduleId };
        enrollments.push(newEnrollment);
        saveData('enrollments', enrollments);

        alert('Student enrolled successfully!');
        displayEnrollments();
    }
});

function deleteEnrollment(enrollmentId) {
    const confirmed = confirm('Are you sure you want to unenroll this student?');
    if (!confirmed) return;

    let enrollments = getData('enrollments') || [];
    const updatedEnrollments = enrollments.filter(e => e.id !== enrollmentId);
    saveData('enrollments', updatedEnrollments);
    location.reload();
}
