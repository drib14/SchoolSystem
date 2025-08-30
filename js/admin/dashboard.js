document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect the page
    protectPage(['admin']);

    // 2. Get the DOM elements
    const totalStudentsEl = document.getElementById('total-students');
    const totalTeachersEl = document.getElementById('total-teachers');
    const totalApplicantsEl = document.getElementById('total-applicants');
    const totalCoursesEl = document.getElementById('total-courses');

    // 3. Fetch data and calculate stats
    try {
        const users = getData('users') || [];
        const applicants = getData('applicants') || [];
        const courses = getData('courses') || [];

        // Calculate student count (users with role 'student')
        const studentCount = users.filter(user => user.role === 'student').length;

        // Calculate teacher count (users with role 'teacher')
        const teacherCount = users.filter(user => user.role === 'teacher').length;

        // Calculate applicant count (can add filters later, e.g., for 'pending' status)
        const applicantCount = applicants.length;

        // Calculate course count
        const courseCount = courses.length;

        // 4. Update the DOM
        totalStudentsEl.textContent = studentCount;
        totalTeachersEl.textContent = teacherCount;
        totalApplicantsEl.textContent = applicantCount;
        totalCoursesEl.textContent = courseCount;

    } catch (error) {
        console.error("Error populating dashboard:", error);
        // Optionally display an error message on the page
        const mainContent = document.getElementById('page-content');
        if(mainContent) {
            mainContent.innerHTML = '<p>Error loading dashboard data. Please try again later.</p>';
        }
    }
});
