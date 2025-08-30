document.addEventListener('DOMContentLoaded', () => {
    // 1. Protection and User Info
    // All logged-in users can access the inbox
    protectPage(['admin', 'teacher', 'student']);
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) return;

    // 2. DOM Elements
    const conversationList = document.getElementById('conversation-list');

    // 3. Data
    const allMessages = getData('messages') || [];
    const users = getData('users') || [];
    const userMap = users.reduce((map, user) => { map[user.id] = user.name; return map; }, {});

    // 4. Logic to group messages into conversations
    const conversations = {};

    allMessages.forEach(msg => {
        // Find the other person in the conversation
        let otherUserId;
        if (msg.fromId === loggedInUser.id) {
            otherUserId = msg.toId;
        } else if (msg.toId === loggedInUser.id) {
            otherUserId = msg.fromId;
        } else {
            return; // This message is not for or from the current user
        }

        // If this is the first message for this conversation, or if it's newer
        if (!conversations[otherUserId] || msg.timestamp > conversations[otherUserId].timestamp) {
            conversations[otherUserId] = msg;
        }
    });

    // 5. Render conversations
    if (Object.keys(conversations).length === 0) {
        conversationList.innerHTML = '<p>You have no messages.</p>';
        return;
    }

    // Sort conversations by most recent message first
    const sortedConversations = Object.entries(conversations).sort((a, b) => b[1].timestamp - a[1].timestamp);

    sortedConversations.forEach(([otherUserId, lastMessage]) => {
        const otherUserName = userMap[otherUserId] || 'Unknown User';
        const link = document.createElement('a');
        link.href = `/messages/conversation.html?with=${otherUserId}`;

        // Check if the last message is unread and sent to the logged-in user
        const isUnread = !lastMessage.read && lastMessage.toId === loggedInUser.id;
        if (isUnread) {
            link.className = 'unread';
        }

        link.innerHTML = `
            <strong>${otherUserName}</strong>
            <p>${lastMessage.content.substring(0, 50)}...</p>
            <small>${new Date(lastMessage.timestamp).toLocaleString()}</small>
        `;
        conversationList.appendChild(link);
    });
});
