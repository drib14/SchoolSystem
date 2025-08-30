// This script will be executed on every page to handle authentication and dynamic content.
// It relies on `data.js` being loaded first.

/**
 * Attempts to log a user in by checking credentials.
 * @param {string} username The username entered by the user.
 * @param {string} password The password entered by the user.
 * @returns {object | null} The user object if successful, otherwise null.
 */
function login(username, password) {
    const users = getData('users');
    if (!users) {
        console.error("Users data not found. Make sure data.js is loaded and initialized.");
        return null;
    }
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        saveData('loggedInUser', user);
        return user;
    }

    return null;
}

/**
 * Logs the current user out.
 */
function logout() {
    localStorage.removeItem('loggedInUser'); // Direct removal is fine for this simple operation
    // Ensure redirection goes to the root.
    window.location.href = '/index.html';
}

/**
 * Retrieves the currently logged-in user from localStorage.
 * @returns {object | null} The user object or null if not logged in.
 */
function getLoggedInUser() {
    return getData('loggedInUser');
}

/**
 * Loads the correct sidebar based on the logged-in user's role.
 */
async function loadSidebar() {
    const user = getLoggedInUser();
    if (!user) return;

    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    // Construct the correct path relative to the root.
    let sidebarPath = `/sidebars/${user.role}-sidebar.html`;

    try {
        const response = await fetch(sidebarPath);
        if (!response.ok) throw new Error(`Sidebar not found at ${sidebarPath}`);
        const sidebarHTML = await response.text();
        sidebarContainer.innerHTML = sidebarHTML;
    } catch (error) {
        console.error(`Error loading sidebar: ${error.message}`);
        sidebarContainer.innerHTML = '<p style="color: white;">Could not load navigation.</p>';
    }
}

/**
 * Updates the header with the user's name and profile picture.
 */
function populateHeader() {
    const user = getLoggedInUser();
    if (!user) return;

    const usernameDisplay = document.getElementById('username-display');
    const profilePicDisplay = document.getElementById('profile-pic-display');

    if (usernameDisplay) {
        usernameDisplay.textContent = user.name;
    }
    if (profilePicDisplay) {
        // Use a default image if the user's profilePic is empty or missing.
        profilePicDisplay.src = user.profilePic || 'https://via.placeholder.com/40';
    }
}

/**
 * Protects a page by checking for a logged-in user and their role.
 * This should be called from the specific page's script.
 * @param {string[]} allowedRoles An array of roles allowed to view the page.
 */
function protectPage(allowedRoles = []) {
    const user = getLoggedInUser();

    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        alert('You do not have permission to view this page.');
        // Redirect to their own dashboard as a safe fallback.
        window.location.href = `/${user.role}/dashboard.html`;
    }
}


/**
 * Checks for unread messages and displays a notification dot.
 */
function checkNotifications() {
    const user = getLoggedInUser();
    if (!user) return;

    const notificationDot = document.getElementById('notification-dot');
    if (!notificationDot) return;

    const messages = getData('messages') || [];
    const hasUnread = messages.some(msg => msg.toId === user.id && !msg.read);

    if (hasUnread) {
        notificationDot.style.display = 'block';
    } else {
        notificationDot.style.display = 'none';
    }
}


// Main execution block that runs on every page load.
document.addEventListener('DOMContentLoaded', () => {
    // Check if the current page is the login page by looking for a unique element, e.g., the login form.
    const isLoginPage = !!document.getElementById('login-form');

    if (!isLoginPage) {
        const user = getLoggedInUser();
        if (!user) {
            // If not on the login page and not logged in, redirect.
            window.location.href = '/index.html';
        } else {
            // If logged in, populate the common elements.
            loadSidebar();
            populateHeader();
            checkNotifications(); // Check for notifications on every page load

            // Hamburger menu logic
            const menuButton = document.getElementById('mobile-menu-button');
            if(menuButton) {
                menuButton.addEventListener('click', () => {
                    document.body.classList.toggle('sidebar-open');
                });
            }
        }
    }
});
