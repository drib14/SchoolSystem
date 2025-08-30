document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversationId');
    const currentUserId = localStorage.getItem("userId");

    if (!conversationId || !currentUserId) {
        window.location.href = 'messaging-inbox.html';
        return;
    }

    const otherUserId = conversationId.replace(currentUserId, '').replace('_', '');

    const DB = {
        getItem: (key, def = {}) => JSON.parse(localStorage.getItem(key) || JSON.stringify(def)),
        setItem: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    };
    let allMessages = DB.getItem("messages");
    const students = DB.getItem("students") || [];
    const teachers = DB.getItem("teachers") || [];
    const allUsers = [
        { id: 'admin', firstName: 'Admin', lastName: '' },
        ...students,
        ...teachers
    ];
    const otherUser = allUsers.find(u => u.id === otherUserId);

    const conversationWithName = document.getElementById("conversation-with-name");
    const messageBody = document.getElementById("message-body");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");

    function setHeader() {
        if (otherUser) {
            conversationWithName.textContent = `Conversation with ${otherUser.firstName} ${otherUser.lastName}`;
        }
    }

    function renderMessages() {
        messageBody.innerHTML = "";
        const messages = allMessages[conversationId] || [];
        if (messages.length === 0) {
            messageBody.innerHTML = '<p style="text-align:center; color: #888;">This is the beginning of your conversation.</p>';
            return;
        }

        messages.forEach(msg => {
            const messageDiv = document.createElement("div");
            messageDiv.className = `message ${msg.senderId === currentUserId ? 'sent' : 'received'}`;
            messageDiv.innerHTML = `<div class="bubble">${msg.text}</div>`;
            messageBody.appendChild(messageDiv);
        });
        messageBody.scrollTop = messageBody.scrollHeight;
    }

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!messageInput.value.trim()) return;

        const newMessage = {
            senderId: currentUserId,
            receiverId: otherUserId,
            text: messageInput.value.trim(),
            timestamp: new Date().toISOString(),
        };

        if (!allMessages[conversationId]) {
            allMessages[conversationId] = [];
        }
        allMessages[conversationId].push(newMessage);
        DB.setItem("messages", allMessages);

        messageInput.value = "";
        renderMessages();

        // Create a notification for the other user
        createNotification(otherUserId, `New message from ${localStorage.getItem('userName')}`, `messaging-conversation.html?conversationId=${conversationId}`);
    });

    setHeader();
    renderMessages();
});
