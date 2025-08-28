document.addEventListener('DOMContentLoaded', () => {
    const conversationListItems = document.getElementById("conversation-list-items");
    const currentUserId = localStorage.getItem("userId");

    // --- Data ---
    const DB = {
        getItem: (key, def = []) => JSON.parse(localStorage.getItem(key) || JSON.stringify(def)),
    };
    const allMessages = DB.getItem("messages", {});
    const students = DB.getItem("students") || [];
    const teachers = DB.getItem("teachers") || [];
    const userActivity = DB.getItem("userActivity", {});
    const allUsers = [
        { id: 'admin', firstName: 'Admin', lastName: '', role: 'admin' },
        ...students,
        ...teachers
    ];

    // --- Functions ---
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

        // Group messages by conversation
        Object.values(allMessages).flat().forEach(msg => {
            const otherUserId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
            const otherUser = getUserById(otherUserId);
            if (!otherUser) return;

            if (!conversations[otherUserId] || new Date(msg.timestamp) > conversations[otherUserId].timestamp) {
                conversations[otherUserId] = {
                    user: otherUser,
                    lastMessage: msg,
                    timestamp: new Date(msg.timestamp)
                };
            }
        });

        const sortedConversations = Object.values(conversations).sort((a, b) => b.timestamp - a.timestamp);

        if (sortedConversations.length === 0) {
            conversationListItems.innerHTML = '<p>No conversations yet. Start a new one!</p>';
            return;
        }

        sortedConversations.forEach(({ user, lastMessage }) => {
            const conversationId = getConversationId(currentUserId, user.id);
            const item = document.createElement("a");
            item.className = "conversation-item";
            item.href = `messaging-conversation.html?conversationId=${conversationId}`;

            const activeClass = isUserActive(user.id) ? 'active' : 'inactive';
            item.innerHTML = `
                <div class="user-with-status">
                    <h5>${user.firstName} ${user.lastName}</h5>
                    <span class="status-indicator ${activeClass}"></span>
                </div>
                <p>${lastMessage.text.substring(0, 50)}...</p>
                <small>${new Date(lastMessage.timestamp).toLocaleString()}</small>
            `;
            conversationListItems.appendChild(item);
        });
    }

    renderConversations();
});
