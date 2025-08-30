document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect the page and get the logged-in user
    protectPage(['teacher']);
    const loggedInTeacher = getLoggedInUser();
    if (!loggedInTeacher) return; // Should be handled by protectPage, but as a safeguard

    // 2. Get DOM elements
    const classCountEl = document.getElementById('class-count');
    const studentCountEl = document.getElementById('student-count');

    // 3. Fetch data
    const schedules = getData('schedules') || [];
    const enrollments = getData('enrollments') || [];

    // 4. Calculate stats
    // Find all schedules assigned to the current teacher
    const mySchedules = schedules.filter(s => s.teacherId === loggedInTeacher.id);

    const classCount = mySchedules.length;

    // Get the IDs of the schedules taught by the teacher
    const myScheduleIds = mySchedules.map(s => s.id);

    // Find all enrollments that correspond to the teacher's schedules
    const myEnrollments = enrollments.filter(e => myScheduleIds.includes(e.scheduleId));

    // Count the number of unique students in those enrollments
    const uniqueStudentIds = new Set(myEnrollments.map(e => e.studentId));
    const studentCount = uniqueStudentIds.size;

    // 5. Update the DOM
    classCountEl.textContent = classCount;
    studentCountEl.textContent = studentCount;
});
