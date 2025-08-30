document.addEventListener('DOMContentLoaded', () => {
    const conversationListItems = document.getElementById("conversation-list-items");
    const currentUserId = localStorage.getItem("userId");

    const allMessages = JSON.parse(localStorage.getItem("messages")) || {};
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
    const userActivity = JSON.parse(localStorage.getItem("userActivity")) || {};
    const allUsers = [
        { id: 'admin', firstName: 'Admin', lastName: '', role: 'admin' },
        ...students,
        ...teachers
    ];

    const getUserById = (userId) => allUsers.find(u => u.id === userId);

    const isUserActive = (userId) => {
        const lastActivity = userActivity[userId];
        if (!lastActivity) return false;
        const fiveMinutes = 5 * 60 * 1000;
        return (new Date().getTime() - lastActivity) < fiveMinutes;
    };

    function renderConversations() {
        conversationListItems.innerHTML = "";
        const conversations = {};

        Object.keys(allMessages).forEach(convoId => {
            if (convoId.includes(currentUserId)) {
                const messages = allMessages[convoId];
                const lastMessage = messages[messages.length - 1];
                const otherUserId = convoId.replace(currentUserId, '').replace('_', '');
                const otherUser = getUserById(otherUserId);
                if (otherUser) {
                    conversations[otherUserId] = {
                        user: otherUser,
                        lastMessage: lastMessage
                    };
                }
            }
        });

        const sortedConversations = Object.values(conversations).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

        if (sortedConversations.length === 0) {
            conversationListItems.innerHTML = '<div style="text-align: center; padding: 20px;">No conversations yet.</div>';
            return;
        }

        sortedConversations.forEach(({ user, lastMessage }) => {
            const conversationId = [currentUserId, user.id].sort().join('_');
            const item = document.createElement("a");
            item.className = "conversation-item";
            item.href = `messaging-conversation.html?conversationId=${conversationId}`;

            const activeClass = isUserActive(user.id) ? 'active' : 'inactive';
            const statusIndicatorHtml = `<span class="status-indicator ${activeClass}" title="${activeClass}"></span>`;
            item.innerHTML = `
                <h5>${user.firstName} ${user.lastName} ${statusIndicatorHtml}</h5>
                <p>${lastMessage.text.substring(0, 50)}...</p>
                <small>${new Date(lastMessage.timestamp).toLocaleString()}</small>
            `;
            conversationListItems.appendChild(item);
        });
    }

    renderConversations();
});
