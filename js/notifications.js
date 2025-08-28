// --- Global Notification Creator ---
// Accessible to other scripts to create notifications
function createNotification(userId, text, link) {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const newNotif = {
        id: `notif_${Date.now()}`,
        userId: userId, // The ID of the user who should receive the notification
        text: text,
        link: link,     // Where the user should be taken when clicking the notification
        timestamp: new Date().toISOString(),
        seen: false
    };
    notifications.push(newNotif);
    localStorage.setItem('notifications', JSON.stringify(notifications));
}


document.addEventListener("DOMContentLoaded", () => {
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.querySelector('.notification-panel');
    const notificationBadge = document.querySelector('.notification-badge');
    const notificationList = document.querySelector('.notification-list');

    if (!notificationBtn) return; // Not a panel page

    const currentUserId = localStorage.getItem("userId");
    const allNotifications = JSON.parse(localStorage.getItem('notifications')) || [];

    // Filter for unseen notifications for the current user
    const myUnseenNotifications = allNotifications.filter(n => n.userId === currentUserId && !n.seen);

    const renderNotifications = () => {
        if (myUnseenNotifications.length > 0) {
            notificationBadge.textContent = myUnseenNotifications.length;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }

        notificationList.innerHTML = "";

        // Show all notifications (seen and unseen), but sorted
        const myAllNotifications = allNotifications
            .filter(n => n.userId === currentUserId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10); // Show latest 10

        if (myAllNotifications.length === 0) {
            notificationList.innerHTML = '<li>No notifications.</li>';
            return;
        }

        myAllNotifications.forEach(notif => {
            const li = document.createElement('li');
            if(!notif.seen) {
                li.style.fontWeight = 'bold';
            }
            li.innerHTML = `
                <a href="${notif.link}">
                    <p>${notif.text}</p>
                    <p class="notification-time">${new Date(notif.timestamp).toLocaleString()}</p>
                </a>
            `;
            notificationList.appendChild(li);
        });
    };

    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = notificationPanel.style.display === 'block';
        notificationPanel.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) { // If we just opened the panel, mark all as seen
            const updatedNotifications = allNotifications.map(n => {
                if (n.userId === currentUserId) {
                    n.seen = true;
                }
                return n;
            });
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
            notificationBadge.style.display = 'none'; // Hide badge immediately
        }
    });

    // Close panel if clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationPanel.style.display = 'none';
        }
    });

    renderNotifications();
});
