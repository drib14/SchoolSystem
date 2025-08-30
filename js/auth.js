document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const currentPage = window.location.pathname.split('/').pop();

    const publicPages = ['index.html', 'enroll.html', 'teacher-apply.html', 'forgot-password.html'];

    if (!publicPages.includes(currentPage) && (!userRole || !userId)) {
        window.location.href = 'index.html';
        return;
    }

    // --- DOM elements that exist on all panel pages ---
    const sidebarMenu = document.querySelector('.sidebar-menu');
    const pageTitle = document.getElementById('page-title'); // Assuming the template has this

    // If this is a public page, or a page without a sidebar, do nothing more.
    if (publicPages.includes(currentPage) || !sidebarMenu) {
        return;
    }

    // --- Define Navigation Links for Each Role ---
    const navLinks = {
        admin: [
            { href: 'admin.html', icon: 'fa-tachometer-alt', text: 'Dashboard' },
            { href: 'applicants.html', icon: 'fa-user-plus', text: 'Student Applicants' },
            { href: 'teacher-applicants.html', icon: 'fa-user-tie', text: 'Teacher Applicants' },
            { href: 'enrolled-students.html', icon: 'fa-user-graduate', text: 'Students' },
            { href: 'approved-teachers.html', icon: 'fa-chalkboard-teacher', text: 'Teachers' },
            { href: 'courses.html', icon: 'fa-book', text: 'Courses' },
            { href: 'subjects.html', icon: 'fa-flask', text: 'Subjects' },
            { href: 'schedules.html', icon: 'fa-calendar-alt', text: 'Schedules' },
            { href: 'requirements.html', icon: 'fa-file-alt', text: 'Requirements' }
        ],
        teacher: [
            { href: 'teacher.html', icon: 'fa-tachometer-alt', text: 'Dashboard' },
            { href: 'my-classes.html', icon: 'fa-chalkboard-teacher', text: 'My Classes' },
            { href: 'teacher-attendance.html', icon: 'fa-user-clock', text: 'My Attendance' },
            { href: 'profile.html', icon: 'fa-user-cog', text: 'Profile' }
        ],
        student: [
            { href: 'student.html', icon: 'fa-tachometer-alt', text: 'Dashboard' },
            { href: 'plot-schedule.html', icon: 'fa-calendar-plus', text: 'Class Enrollment' },
            { href: 'my-attendance.html', icon: 'fa-user-check', text: 'My Attendance' },
            { href: 'my-grades.html', icon: 'fa-graduation-cap', text: 'My Grades' },
            { href: 'profile.html', icon: 'fa-user-cog', text: 'Profile' }
        ]
    };

    // --- Populate Sidebar ---
    const links = navLinks[userRole] || [];
    sidebarMenu.innerHTML = links.map(link => {
        const isActive = currentPage === link.href;
        // Also update the main page title based on the active link
        if (isActive && pageTitle) {
            pageTitle.textContent = link.text;
        }
        return `
            <li>
                <a href="${link.href}" class="${isActive ? 'active' : ''}">
                    <i class="fas ${link.icon}"></i> <span>${link.text}</span>
                </a>
            </li>
        `;
    }).join('');

    // --- Centralized Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }
});
