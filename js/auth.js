document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    // If no user is logged in, redirect to the login page
    if (!userRole || !userId) {
        window.location.href = 'index.html';
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
            { href: 'schedules.html', icon: 'fa-calendar-alt', text: 'Schedules' },
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
            { href: 'grade-entry.html', icon: 'fa-marker', text: 'Grades' },
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
    const profilePicElement = document.querySelector('.profile-pic');
    const userNameElement = document.querySelector('.user-name');
    const logoutBtn = document.getElementById('logout-btn');

    // Populate sidebar menu
    const links = navLinks[userRole];
    if (links && sidebarMenu) {
        const currentPage = window.location.pathname.split('/').pop();
        sidebarMenu.innerHTML = links.map(link => `
            <li>
                <a href="${link.href}" class="${currentPage === link.href ? 'active' : ''}">
                    <i class="fas ${link.icon}"></i> ${link.text}
                </a>
            </li>
        `).join('');
    }

    // Fetch and display user info
    let currentUser = null;
    if (userRole === 'admin') {
        // For admin, we can use a default name or fetch from a predefined admin object if available
        currentUser = {
            name: 'Admin User',
            photoUrl: null // Admin might not have a photo
        };
    } else {
        const storageKey = userRole === 'teacher' ? 'teachers' : 'students';
        const allUsers = JSON.parse(localStorage.getItem(storageKey)) || [];
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            currentUser = {
                name: `${user.firstName} ${user.lastName}`,
                photoUrl: user.photoUrl
            };
        }
    }

    if (currentUser && userNameElement) {
        userNameElement.textContent = currentUser.name;
    }

    if (currentUser && profilePicElement) {
        if (currentUser.photoUrl) {
            // Replace the <i> tag with an <img> tag
            const img = document.createElement('img');
            img.src = currentUser.photoUrl;
            img.alt = 'Profile Picture';
            img.className = 'profile-pic'; // Keep the class for styling
            profilePicElement.replaceWith(img);
        }
        // If no photoUrl, the default <i> tag with the icon will be used.
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

    // Hamburger menu functionality for mobile
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    if (hamburgerBtn && sidebar) {
        const newOverlay = overlay || document.createElement('div');
        if (!overlay) {
            newOverlay.className = 'overlay';
            document.body.appendChild(newOverlay);
        }

        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            newOverlay.classList.toggle('open');
        });

        newOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            newOverlay.classList.remove('open');
        });
    }
});
