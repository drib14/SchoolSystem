/**
 * Centralized Data Management for the School Management System
 * Handles all interactions with localStorage.
 */

/**
 * Retrieves data from localStorage.
 * @param {string} key The key for the data to retrieve.
 * @returns {any} The parsed data from localStorage, or null if not found.
 */
function getData(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (e) {
        console.error(`Error getting data for key: ${key}`, e);
        return null;
    }
}

/**
 * Saves data to localStorage.
 * @param {string} key The key under which to save the data.
 * @param {any} data The data to save (will be stringified).
 */
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving data for key: ${key}`, e);
    }
}

/**
 * Initializes the database in localStorage with default values if they don't exist.
 * This function should be called once, perhaps on the login page, to set up the environment.
 */
function initializeDatabase() {
    // Default user data
    if (!getData('users')) {
        const preloadedUsers = [
            { id: 1, username: 'admin', password: 'password', role: 'admin', name: 'Admin User', email: 'admin@school.com', profilePic: '' },
            { id: 2, username: 'teacher', password: 'password', role: 'teacher', name: 'Teacher Smith', email: 'smith@school.com', profilePic: '' },
            { id: 3, username: 'student', password: 'password', role: 'student', name: 'Student Jones', email: 'jones@school.com', profilePic: '' }
        ];
        saveData('users', preloadedUsers);
    }

    // Applicants
    if (!getData('applicants')) {
        saveData('applicants', []);
    }

    // Academic Data
    if (!getData('courses')) {
        saveData('courses', []);
    }
    if (!getData('subjects')) {
        saveData('subjects', []);
    }
    if (!getData('schedules')) {
        saveData('schedules', []);
    }
    if (!getData('enrollments')) {
        saveData('enrollments', []);
    }

    // Financial Data
    if (!getData('tuition')) {
        saveData('tuition', []);
    }
    if (!getData('payroll')) {
        saveData('payroll', []);
    }

    // Other Data
    if (!getData('library')) {
        saveData('library', []);
    }
    if (!getData('events')) {
        saveData('events', []);
    }
    if (!getData('departments')) {
        saveData('departments', []);
    }
    if (!getData('messages')) {
        saveData('messages', []);
    }
    if (!getData('notifications')) {
        saveData('notifications', []);
    }
}

// Ensure the database is initialized when this script is loaded.
// It's safe to call this multiple times since it checks for existence.
initializeDatabase();
