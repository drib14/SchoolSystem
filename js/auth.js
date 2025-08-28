document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    // If no user is logged in, redirect to the login page
    if (!userRole || !userId) {
        // Allow access to public pages without redirecting
        const publicPages = ['index.html', 'enroll.html', 'teacher-apply.html'];
        if (!publicPages.includes(window.location.pathname.split('/').pop())) {
            window.location.href = 'index.html';
        }
        return;
    }

    // Define navigation links for each role
    const navLinks = {
        admin: [
            { href: 'admin.html', icon: 'fa-tachometer-alt', text: 'Dashboard' },
            { href: 'admin-approval.html', icon: 'fa-check-double', text: 'Approval Queue' },
            { href: 'applicants.html', icon: 'fa-user-plus', text: 'Student Applicants' },
            { href: 'teacher-applicants.html', icon: 'fa-user-tie', text: 'Teacher Applicants' },
            { href: 'enrolled-students.html', icon: 'fa-user-graduate', text: 'Students' },
            { href: 'approved-teachers.html', icon: 'fa-chalkboard-teacher', text: 'Teachers' },
            { href: 'courses.html', icon: 'fa-book', text: 'Courses' },
            { href: 'subjects.html', icon: 'fa-flask', text: 'Subjects' },
            { href: 'schedules.html', icon: 'fa-calendar-alt', text: 'Class Schedules' },
            { href: 'teacher-schedules.html', icon: 'fa-user-clock', text: 'Teacher Schedules' },
            { href: 'requirements.html', icon: 'fa-file-alt', text: 'Requirements' },
            { href: 'tuition-management.html', icon: 'fa-file-invoice-dollar', text: 'Tuition Management' },
            { href: 'tuition-settings.html', icon: 'fa-cogs', text: 'Tuition Settings' },
            { href: 'payroll.html', icon: 'fa-dollar-sign', text: 'Payroll' },
            { href: 'payroll-settings.html', icon: 'fa-money-check-alt', text: 'Payroll Settings' }
        ],
        teacher: [
            { href: 'teacher.html', icon: 'fa-tachometer-alt', text: 'Dashboard' },
            { href: 'my-classes.html', icon: 'fa-chalkboard-teacher', text: 'My Classes' },
            { href: 'teacher-attendance.html', icon: 'fa-user-clock', text: 'My Attendance' },
            { href: 'my-payslips.html', icon: 'fa-wallet', text: 'My Payslips' },
            { href: 'grade-entry.html', icon: 'fa-marker', text: 'Grades' },
            { href: 'class-analytics.html', icon: 'fa-chart-bar', text: 'Class Analytics' },
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

    const sidebarMenu = document.querySelector('.sidebar-menu');
    const profileInfo = document.querySelector('.profile-info');
    const logoutBtn = document.getElementById('logout-btn');

    if (!sidebarMenu || !profileInfo || !logoutBtn) {
        // This script is not on a panel page, so do nothing.
        return;
    }

    // Populate sidebar menu
    const links = navLinks[userRole];
    const currentPage = window.location.pathname.split('/').pop();
    sidebarMenu.innerHTML = links.map(link => `
        <li>
            <a href="${link.href}" class="${currentPage === link.href ? 'active' : ''}">
                <i class="fas ${link.icon}"></i> <span>${link.text}</span>
            </a>
        </li>
    `).join('');

    // Fetch and display user info
    let currentUser = null;
    if (userRole === 'admin') {
        currentUser = { name: 'Admin User', photoUrl: null };
    } else {
        const storageKey = userRole === 'teacher' ? 'teachers' : 'students';
        const allUsers = JSON.parse(localStorage.getItem(storageKey)) || [];
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            currentUser = { name: `${user.firstName} ${user.lastName}`, photoUrl: user.photoUrl };
        }
    }

    // Populate profile info
    if (currentUser) {
        const picHtml = currentUser.photoUrl
            ? `<img src="${currentUser.photoUrl}" alt="Profile Picture" class="profile-pic">`
            : `<i class="fas fa-user-circle profile-pic"></i>`;

        profileInfo.innerHTML = `
            ${picHtml}
            <h3 class="user-name">${currentUser.name}</h3>
        `;
    }

    // Logout functionality
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    });

    // Hamburger menu functionality
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    if (hamburgerBtn && sidebar && overlay) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }
});
