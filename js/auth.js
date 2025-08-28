document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const currentPage = window.location.pathname.split('/').pop();

    // If no user is logged in, redirect to the login page (unless it's a public page)
    const publicPages = ['index.html', 'enroll.html', 'teacher-apply.html', 'forgot-password.html'];
    if (!publicPages.includes(currentPage) && (!userRole || !userId)) {
        window.location.href = 'index.html';
        return;
    }

    const sidebarMenu = document.querySelector('.sidebar-menu');
    const profileInfo = document.querySelector('.profile-info'); // A new element I will add to headers
    const logoutBtn = document.getElementById('logout-btn');

    // If this is not a panel page, do nothing.
    if (!sidebarMenu) {
        return;
    }

    // --- Update User Activity for Messaging Status ---
    const userActivity = JSON.parse(localStorage.getItem('userActivity')) || {};
    userActivity[userId] = new Date().getTime();
    localStorage.setItem('userActivity', JSON.stringify(userActivity));

    // --- Check for Upcoming Event Notifications ---
    const allEvents = JSON.parse(localStorage.getItem('events')) || [];
    const allNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    allEvents.forEach(event => {
        if (event.date === tomorrowString) {
            const notifIdentifier = `event_reminder_${event.id}`;
            const alreadyNotified = allNotifications.some(n => n.userId === userId && n.text.includes(notifIdentifier));
            if (!alreadyNotified) {
                createNotification(userId, `Reminder: The event "${event.title}" is tomorrow. ${notifIdentifier}`, "events.html");
            }
        }
    });

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

    // Populate sidebar
    const links = navLinks[userRole] || [];
    sidebarMenu.innerHTML = links.map(link => `
        <li>
            <a href="${link.href}" class="${currentPage === link.href ? 'active' : ''}">
                <i class="fas ${link.icon}"></i> <span>${link.text}</span>
            </a>
        </li>
    `).join('');

    // Populate user info in header
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

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }
});
