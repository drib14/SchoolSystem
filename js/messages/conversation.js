document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup and Protection
    protectPage(['admin', 'teacher', 'student']);
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) return;

    // 2. Get other user's ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const otherUserId = parseInt(urlParams.get('with'));
    if (!otherUserId) {
        window.location.href = '/messages/inbox.html';
        return;
    }

    // 3. DOM Elements
    const messageContainer = document.getElementById('message-container');
    const replyForm = document.getElementById('reply-form');
    const conversationTitle = document.getElementById('conversation-title');

    // 4. Data
    let allMessages = getData('messages') || [];
    const users = getData('users') || [];
    const otherUser = users.find(u => u.id === otherUserId);
    if (otherUser) {
        conversationTitle.textContent = `Conversation with ${otherUser.name}`;
    }

    // 5. Initial Display
    displayMessages();

    // 6. Event Listeners
    replyForm.addEventListener('submit', handleReply);

    function displayMessages() {
        messageContainer.innerHTML = '';
        let shouldResave = false;

        const conversationMessages = allMessages
            .filter(msg =>
                (msg.fromId === loggedInUser.id && msg.toId === otherUserId) ||
                (msg.fromId === otherUserId && msg.toId === loggedInUser.id)
            )
            .sort((a, b) => a.timestamp - b.timestamp);

        conversationMessages.forEach(msg => {
            if (msg.toId === loggedInUser.id && !msg.read) {
                msg.read = true;
                shouldResave = true;
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.textContent = msg.content;

            if (msg.fromId === loggedInUser.id) {
                messageDiv.classList.add('sent');
            } else {
                messageDiv.classList.add('received');
            }
            messageContainer.appendChild(messageDiv);
        });

        // Scroll to the bottom
        messageContainer.scrollTop = messageContainer.scrollHeight;

        if (shouldResave) {
            saveData('messages', allMessages);
        }
    }

    function handleReply(event) {
        event.preventDefault();
        const contentInput = document.getElementById('reply-content');
        const content = contentInput.value.trim();
        if (!content) return;

        const newMessage = {
            id: Date.now(),
            fromId: loggedInUser.id,
            toId: otherUserId,
            content: content,
            timestamp: Date.now(),
            read: false
        };

        allMessages.push(newMessage);
        saveData('messages', allMessages);
        contentInput.value = ''; // Clear the input
        displayMessages(); // Refresh the view
    }
});
