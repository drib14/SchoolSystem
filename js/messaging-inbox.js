document.addEventListener('DOMContentLoaded', () => {
    const conversationListItems = document.getElementById("conversation-list-items");
    const currentUserId = localStorage.getItem("userId");

    const DB = {
        getItem: (key, def = {}) => JSON.parse(localStorage.getItem(key) || JSON.stringify(def)),
    };
    const allMessages = DB.getItem("messages");
    const students = DB.getItem("students") || [];
    const teachers = DB.getItem("teachers") || [];
    const userActivity = DB.getItem("userActivity", {});
    const allUsers = [
        { id: 'admin', firstName: 'Admin', lastName: '', role: 'admin' },
        ...students,
        ...teachers
    ];

    const getUserById = (userId) => allUsers.find(u => u.id === userId);
    const getConversationId = (userId1, userId2) => [userId1, userId2].sort().join('_');

    const isUserActive = (userId) => {
        const lastActivity = userActivity[userId];
        if (!lastActivity) return false;
        const fiveMinutes = 5 * 60 * 1000;
        return (new Date().getTime() - lastActivity) < fiveMinutes;
    };

    function renderConversations() {
        conversationListItems.innerHTML = "";
        const conversations = {};

        Object.values(allMessages).flat().forEach(msg => {
            const otherUserId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
            const otherUser = getUserById(otherUserId);
            if (!otherUser) return;

            if (!conversations[otherUserId] || new Date(msg.timestamp) > new Date(conversations[otherUserId].lastMessage.timestamp)) {
                conversations[otherUserId] = {
                    user: otherUser,
                    lastMessage: msg
                };
            }
        });

        const sortedConversations = Object.values(conversations).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

        if (sortedConversations.length === 0) {
            conversationListItems.innerHTML = '<div style="text-align: center; padding: 20px;">No conversations yet. Start a new one!</div>';
            return;
        }

        sortedConversations.forEach(({ user, lastMessage }) => {
            const conversationId = getConversationId(currentUserId, user.id);
            const item = document.createElement("a");
            item.className = "conversation-item";
            item.href = `messaging-conversation.html?conversationId=${conversationId}`;

            const activeClass = isUserActive(user.id) ? 'active' : 'inactive';
            const statusIndicatorHtml = `<span class="status-indicator ${activeClass}" title="${activeClass}"></span>`;
            item.innerHTML = `
                <div class="user-with-status" style="display: flex; align-items: center; gap: 8px;">
                    <h5>${user.firstName} ${user.lastName}</h5>
                    ${statusIndicatorHtml}
                </div>
                <p>${lastMessage.text.substring(0, 50)}...</p>
                <small>${new Date(lastMessage.timestamp).toLocaleString()}</small>
            `;
            conversationListItems.appendChild(item);
        });
    }

    renderConversations();
});
