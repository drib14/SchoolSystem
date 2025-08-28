document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const pendingCoursesTbody = document.getElementById('pending-courses-tbody');
    let pendingActions = JSON.parse(localStorage.getItem('pendingActions')) || [];
    let courses = JSON.parse(localStorage.getItem('courses')) || [];

    function renderPendingCourses() {
        const pendingCourses = pendingActions.filter(action => action.type === 'newCourse');
        pendingCoursesTbody.innerHTML = '';

        if (pendingCourses.length > 0) {
            pendingCourses.forEach((action, index) => {
                const course = action.payload;
                const row = pendingCoursesTbody.insertRow();
                row.innerHTML = `
                    <td data-label="Course Name">${course.name}</td>
                    <td data-label="Course Code">${course.code}</td>
                    <td data-label="Submitted On">${new Date(action.date).toLocaleString()}</td>
                    <td data-label="Actions">
                        <button class="action-btn approve-btn" data-action-index="${index}">Approve</button>
                        <button class="action-btn deny-btn" data-action-index="${index}">Decline</button>
                    </td>
                `;
            });
        } else {
            pendingCoursesTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No pending courses for approval.</td></tr>';
        }
    }

    function approveCourse(actionIndex) {
        const action = pendingActions.filter(a => a.type === 'newCourse')[actionIndex];
        if (!action) return;

        courses.push(action.payload);
        localStorage.setItem('courses', JSON.stringify(courses));

        const originalIndex = pendingActions.findIndex(a => a.date === action.date && a.payload.code === action.payload.code);
        if (originalIndex > -1) {
            pendingActions.splice(originalIndex, 1);
            localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
        }

        // Create notification for other admins
        let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        notifications.push({
            id: Date.now(),
            role: 'admin', // Target all admins
            message: `A new course, '${action.payload.name}', was approved.`,
            link: "courses.html",
            isRead: false,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));

        Toastify({ text: "Course approved.", duration: 3000 }).showToast();
        renderPendingCourses();
    }

    function declineCourse(actionIndex) {
        const action = pendingActions.filter(a => a.type === 'newCourse')[actionIndex];
        if (!action) return;

        const originalIndex = pendingActions.findIndex(a => a.date === action.date && a.payload.code === action.payload.code);
        if (originalIndex > -1) {
            pendingActions.splice(originalIndex, 1);
            localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
        }

        Toastify({ text: "Course declined.", duration: 3000 }).showToast();
        renderPendingCourses();
    }

    pendingCoursesTbody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('action-btn')) {
            const actionIndex = parseInt(target.dataset.actionIndex, 10);
            if (target.classList.contains('approve-btn')) {
                approveCourse(actionIndex);
            } else if (target.classList.contains('deny-btn')) {
                declineCourse(actionIndex);
            }
        }
    });

    renderPendingCourses();
});
