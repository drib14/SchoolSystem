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
    const profileInfo = document.querySelector('.profile-info');
    const logoutBtn = document.getElementById('logout-btn');
    const sidebarPanelName = document.getElementById('sidebar-panel-name');
    const pageTitle = document.getElementById('page-title');

    // If this is a public page, do nothing more.
    if (publicPages.includes(currentPage)) {
        return;
    }

    // --- Role-based titles ---
    if (sidebarPanelName) {
        sidebarPanelName.textContent = `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Panel`;
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
            { href: 'library-admin.html', icon: 'fa-book-reader', text: 'Library Admin' },
            { href: 'events.html', icon: 'fa-calendar-star', text: 'Events' },
            { href: 'messaging-inbox.html', icon: 'fa-comments', text: 'Messaging' },
            { href: 'requirements.html', icon: 'fa-file-alt', text: 'Requirements' },
            { href: 'tuition-management.html', icon: 'fa-file-invoice-dollar', text: 'Tuition' },
            { href: 'payroll.html', icon: 'fa-dollar-sign', text: 'Payroll' }
        ],
        teacher: [
            { href: 'teacher.html', icon: 'fa-tachometer-alt', text: 'Dashboard' },
            { href: 'my-classes.html', icon: 'fa-chalkboard-teacher', text: 'My Classes' },
            { href: 'teacher-attendance.html', icon: 'fa-user-clock', text: 'My Attendance' },
            { href: 'library.html', icon: 'fa-book-bookmark', text: 'Library' },
            { href: 'events.html', icon: 'fa-calendar-star', text: 'Events' },
            { href: 'messaging-inbox.html', icon: 'fa-comments', text: 'Messaging' },
            { href: 'profile.html', icon: 'fa-user-cog', text: 'Profile' }
        ],
        student: [
            { href: 'student.html', icon: 'fa-tachometer-alt', text: 'Dashboard' },
            { href: 'plot-schedule.html', icon: 'fa-calendar-plus', text: 'Class Enrollment' },
            { href: 'my-attendance.html', icon: 'fa-user-check', text: 'My Attendance' },
            { href: 'my-grades.html', icon: 'fa-graduation-cap', text: 'My Grades' },
            { href: 'library.html', icon: 'fa-book-bookmark', text: 'Library' },
            { href: 'events.html', icon: 'fa-calendar-star', text: 'Events' },
            { href: 'messaging-inbox.html', icon: 'fa-comments', text: 'Messaging' },
            { href: 'profile.html', icon: 'fa-user-cog', text: 'Profile' }
        ]
    };

    // --- Populate Sidebar ---
    const links = navLinks[userRole] || [];
    if (sidebarMenu) {
        sidebarMenu.innerHTML = links.map(link => {
            const isActive = currentPage === link.href;
            if (isActive && pageTitle) {
                // Update the main page title based on the active link
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
    }

    // --- Populate User Info in Header ---
    if (profileInfo) {
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

        if (currentUser) {
            const picHtml = currentUser.photoUrl
                ? `<img src="${currentUser.photoUrl}" alt="Profile" class="user-avatar">`
                : `<i class="fas fa-user-circle user-avatar-icon"></i>`;
            profileInfo.innerHTML = `${picHtml} <span class="user-name">${currentUser.name}</span>`;
        }
    }

    // --- Logout Functionality ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }
});
