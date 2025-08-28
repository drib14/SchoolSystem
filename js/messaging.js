document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (!loggedInUserId) return;

    // --- DOM Elements ---
    const threadListContainer = document.getElementById('thread-list-container');
    const messageViewContainer = document.getElementById('message-view-container');
    const msgViewHeader = document.getElementById('message-view-header-name');
    const msgListContainer = document.getElementById('message-list-container');
    const msgForm = document.getElementById('message-input-form');
    const msgInput = document.getElementById('message-input');

    // --- Data ---
    let messageThreads = JSON.parse(localStorage.getItem('messageThreads')) || [];
    let allUsers = [
        ...JSON.parse(localStorage.getItem('students')) || [],
        ...JSON.parse(localStorage.getItem('teachers')) || [],
        { id: 'admin', firstName: 'Admin', lastName: '' }
    ];
    let activeThreadId = null;

    // --- Functions ---
    function renderThreadList() {
        threadListContainer.innerHTML = '';
        const myThreads = messageThreads
            .filter(t => t.participants.includes(loggedInUserId))
            .sort((a,b) => new Date(b.messages[b.messages.length - 1].timestamp) - new Date(a.messages[a.messages.length - 1].timestamp));

        if (myThreads.length === 0) {
            threadListContainer.innerHTML = '<p style="padding: 15px;">No conversations yet.</p>';
            return;
        }

        myThreads.forEach(thread => {
            const otherParticipantId = thread.participants.find(p => p !== loggedInUserId);
            const otherUser = allUsers.find(u => u.id === otherParticipantId);
            const otherUserName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
            const lastMessage = thread.messages[thread.messages.length - 1];

            const threadEl = document.createElement('div');
            threadEl.className = 'thread-list-item';
            threadEl.dataset.threadId = thread.id;
            threadEl.innerHTML = `
                <h4>${otherUserName}</h4>
                <p>${lastMessage.text.substring(0, 30)}...</p>
            `;
            threadListContainer.appendChild(threadEl);
        });
    }

    function renderMessageView(threadId) {
        activeThreadId = threadId;
        const thread = messageThreads.find(t => t.id === threadId);
        if (!thread) {
            messageViewContainer.style.display = 'none';
            return;
        }

        const otherParticipantId = thread.participants.find(p => p !== loggedInUserId);
        const otherUser = allUsers.find(u => u.id === otherParticipantId);
        msgViewHeader.textContent = `Conversation with ${otherUser ? otherUser.firstName + ' ' + otherUser.lastName : 'Unknown'}`;

        msgListContainer.innerHTML = '';
        thread.messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${msg.senderId === loggedInUserId ? 'sent' : 'received'}`;
            messageEl.innerHTML = `<div class="message-bubble">${msg.text}</div>`;
            msgListContainer.appendChild(messageEl);
        });

        msgListContainer.scrollTop = msgListContainer.scrollHeight; // Scroll to bottom
        messageViewContainer.style.display = 'flex';
    }

    function sendMessage() {
        const text = msgInput.value.trim();
        if (!text || !activeThreadId) return;

        const threadIndex = messageThreads.findIndex(t => t.id === activeThreadId);
        if (threadIndex > -1) {
            messageThreads[threadIndex].messages.push({
                senderId: loggedInUserId,
                text: text,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('messageThreads', JSON.stringify(messageThreads));
            renderMessageView(activeThreadId); // Re-render the view
            renderThreadList(); // Re-render thread list to update last message
            msgInput.value = '';
        }
    }

    // --- Event Listeners ---
    threadListContainer.addEventListener('click', (e) => {
        const threadItem = e.target.closest('.thread-list-item');
        if (threadItem) {
            const threadId = threadItem.dataset.threadId;
            renderMessageView(threadId);
        }
    });

    msgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });

    // --- Initial Load ---
    renderThreadList();

    // Check for URL param to start a new message
    const urlParams = new URLSearchParams(window.location.search);
    const newMsgTo = urlParams.get('newMsgTo');
    if (newMsgTo) {
        let thread = messageThreads.find(t => t.participants.includes(loggedInUserId) && t.participants.includes(newMsgTo));
        if (thread) {
            renderMessageView(thread.id);
        } else {
            // Create a new thread
            const newThread = {
                id: `thread-${Date.now()}`,
                participants: [loggedInUserId, newMsgTo],
                messages: []
            };
            messageThreads.push(newThread);
            localStorage.setItem('messageThreads', JSON.stringify(messageThreads));
            renderThreadList();
            renderMessageView(newThread.id);
        }
    }
});
