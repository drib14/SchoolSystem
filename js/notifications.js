document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (!loggedInUserId) return;

    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.querySelector('.notification-panel');
    const notificationBadge = document.querySelector('.notification-badge');
    const notificationList = document.querySelector('.notification-list');

    if (!notificationBtn) return; // Not on a panel page

    let allNotifications = JSON.parse(localStorage.getItem('notifications')) || [];

    function renderNotifications() {
        // For admin, show all notifications. For others, filter by userId.
        const myNotifications = userRole === 'admin'
            ? allNotifications
            : allNotifications.filter(n => n.userId === loggedInUserId || n.role === userRole || !n.userId);

        const unreadCount = myNotifications.filter(n => !n.isRead).length;

        // Update badge
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }

        // Populate list
        notificationList.innerHTML = '';
        if (myNotifications.length === 0) {
            notificationList.innerHTML = '<li>No notifications yet.</li>';
        } else {
            myNotifications.slice(0, 10).forEach(notif => { // Show latest 10
                const li = document.createElement('li');
                li.className = notif.isRead ? '' : 'unread';
                li.dataset.id = notif.id;
                li.innerHTML = `
                    <p class="notification-message">${notif.message}</p>
                    <p class="notification-date">${new Date(notif.timestamp).toLocaleString()}</p>
                `;
                notificationList.appendChild(li);
            });
        }
    }

    // Toggle panel
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationPanel.classList.toggle('show');
    });

    // Mark as read and navigate
    notificationList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li || !li.dataset.id) return;

        const notifId = parseInt(li.dataset.id, 10);
        const notifIndex = allNotifications.findIndex(n => n.id === notifId);

        if (notifIndex > -1) {
            allNotifications[notifIndex].isRead = true;
            localStorage.setItem('notifications', JSON.stringify(allNotifications));

            if (allNotifications[notifIndex].link) {
                window.location.href = allNotifications[notifIndex].link;
            } else {
                renderNotifications(); // Re-render to show it as read
            }
        }
    });

    // Close panel when clicking outside
    document.addEventListener('click', () => {
        if (notificationPanel.classList.contains('show')) {
            notificationPanel.classList.remove('show');
        }
    });

    renderNotifications();
});
