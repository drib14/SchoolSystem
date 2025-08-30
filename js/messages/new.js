document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup and Protection
    protectPage(['admin', 'teacher', 'student']);
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) return;

    // 2. DOM Elements
    const recipientSelect = document.getElementById('recipient-select');
    const form = document.getElementById('new-message-form');

    // 3. Data
    const users = getData('users') || [];

    // 4. Populate recipients
    users.forEach(user => {
        if (user.id !== loggedInUser.id) {
            recipientSelect.add(new Option(`${user.name} (${user.role})`, user.id));
        }
    });

    // 5. Event Listener
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const toId = parseInt(recipientSelect.value);
        const content = document.getElementById('message-content').value.trim();

        if (!toId || !content) {
            alert('Please select a recipient and write a message.');
            return;
        }

        const newMessage = {
            id: Date.now(),
            fromId: loggedInUser.id,
            toId: toId,
            content: content,
            timestamp: Date.now(),
            read: false
        };

        const allMessages = getData('messages') || [];
        allMessages.push(newMessage);
        saveData('messages', allMessages);

        alert('Message sent successfully!');
        window.location.href = '/messages/inbox.html';
    });
});
