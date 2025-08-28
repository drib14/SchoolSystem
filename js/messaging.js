// These need to be global for the showView function
const welcomeView = document.getElementById("welcome-view");
const conversationView = document.getElementById("conversation-view");
const newMessageView = document.getElementById("new-message-view");

// Make this global for testing if needed, but primarily used inside
function showView(viewToShow) {
    [welcomeView, conversationView, newMessageView].forEach(v => {
        if(v) v.style.display = 'none'
    });
    if(viewToShow) viewToShow.style.display = 'block';
    if(viewToShow === conversationView) conversationView.style.display = 'flex';
};

document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const messagingContainer = document.querySelector(".messaging-container");
    const conversationListItems = document.getElementById("conversation-list-items");
    const conversationWithName = document.getElementById("conversation-with-name");
    const messageBody = document.getElementById("message-body");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");
    const newMessageBtn = document.getElementById("new-message-btn");
    const cancelNewMessageBtn = document.getElementById("cancel-new-message-btn");
    const recipientSelect = document.getElementById("recipient-select");
    const startConversationBtn = document.getElementById("start-conversation-btn");
    const mobileBackBtn = document.querySelector(".mobile-back-btn");

    // --- Data ---
    const currentUserId = localStorage.getItem("userId");
    const DB = {
        getItem: (key, def = []) => JSON.parse(localStorage.getItem(key) || JSON.stringify(def)),
        setItem: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    };
    const allMessages = DB.getItem("messages", {});
    const students = DB.getItem("students");
    const teachers = DB.getItem("teachers");
    const userActivity = DB.getItem("userActivity", {});

    const allUsers = [
        { id: 'admin', firstName: 'Admin', lastName: '', role: 'admin' },
        ...students,
        ...teachers
    ];
    let activeConversationId = null;

    // --- Functions ---
    const getConversationId = (userId1, userId2) => [userId1, userId2].sort().join('_');
    const getUserById = (userId) => allUsers.find(u => u.id === userId);

    const updateUserActivity = () => {
        userActivity[currentUserId] = new Date().getTime();
        DB.setItem('userActivity', userActivity);
    };

    const isUserActive = (userId) => {
        const lastActivity = userActivity[userId];
        if (!lastActivity) return false;
        const fiveMinutes = 5 * 60 * 1000;
        return (new Date().getTime() - lastActivity) < fiveMinutes;
    };

    const renderConversations = () => {
        conversationListItems.innerHTML = "";
        const conversations = {};
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

        Object.values(conversations)
            .sort((a, b) => b.timestamp - a.timestamp)
            .forEach(({ user, lastMessage }) => {
                const conversationId = getConversationId(currentUserId, user.id);
                const item = document.createElement("div");
                item.className = "conversation-item";
                if(conversationId === activeConversationId) item.classList.add('active');
                item.dataset.userId = user.id;

                const activeClass = isUserActive(user.id) ? 'active' : 'inactive';
                item.innerHTML = `
                    <div class="user-with-status">
                        <h5>${user.firstName} ${user.lastName}</h5>
                        <span class="status-indicator ${activeClass}"></span>
                    </div>
                    <p>${lastMessage.text.substring(0, 30)}...</p>
                `;
                item.addEventListener("click", () => openConversation(user.id));
                conversationListItems.appendChild(item);
            });
    };

    const openConversation = (otherUserId) => {
        const otherUser = getUserById(otherUserId);
        if (!otherUser) return;

        activeConversationId = getConversationId(currentUserId, otherUserId);
        const activeClass = isUserActive(otherUserId) ? 'active' : 'inactive';
        conversationWithName.innerHTML = `${otherUser.firstName} ${otherUser.lastName} <span class="status-indicator ${activeClass}"></span>`;

        renderMessages(activeConversationId);
        showView(conversationView);
        renderConversations();
        messagingContainer.classList.add('mobile-chat-active');
    };

    const renderMessages = (conversationId) => {
        messageBody.innerHTML = "";
        const messages = allMessages[conversationId] || [];
        messages.forEach(msg => {
            const messageDiv = document.createElement("div");
            messageDiv.className = `message ${msg.senderId === currentUserId ? 'sent' : 'received'}`;
            messageDiv.innerHTML = `<div class="bubble">${msg.text}</div>`;
            messageBody.appendChild(messageDiv);
        });
        messageBody.scrollTop = messageBody.scrollHeight;
    };

    const populateRecipients = () => {
        recipientSelect.innerHTML = '<option value="">Select a user...</option>';
        allUsers
            .filter(u => u.id !== currentUserId)
            .forEach(u => {
                const activeText = isUserActive(u.id) ? ' (Active)' : '';
                recipientSelect.innerHTML += `<option value="${u.id}">${u.firstName} ${u.lastName} (${u.role})${activeText}</option>`;
            });
    };

    // --- Event Listeners ---
    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!activeConversationId || !messageInput.value.trim()) return;

        const otherUserId = activeConversationId.replace(currentUserId, '').replace('_', '');
        const newMessage = {
            senderId: currentUserId,
            receiverId: otherUserId,
            text: messageInput.value.trim(),
            timestamp: new Date().toISOString(),
        };

        if (!allMessages[activeConversationId]) allMessages[activeConversationId] = [];
        allMessages[activeConversationId].push(newMessage);
        DB.setItem("messages", allMessages);

        updateUserActivity();
        renderMessages(activeConversationId);
        messageInput.value = "";
        renderConversations();
    });

    newMessageBtn.addEventListener('click', () => {
        populateRecipients();
        showView(newMessageView);
        messagingContainer.classList.add('mobile-chat-active');
    });

    cancelNewMessageBtn.addEventListener('click', () => {
        showView(welcomeView);
        messagingContainer.classList.remove('mobile-chat-active');
    });

    mobileBackBtn.addEventListener('click', () => {
        messagingContainer.classList.remove('mobile-chat-active');
    });

    startConversationBtn.addEventListener('click', () => {
        const recipientId = recipientSelect.value;
        if(recipientId) openConversation(recipientId);
    });

    // --- Init ---
    updateUserActivity();
    renderConversations();
    showView(welcomeView);
});
