document.addEventListener('DOMContentLoaded', () => {
    // --- Data ---
    const currentUserId = localStorage.getItem("userId");
    const DB = {
        getItem: (key, def = []) => JSON.parse(localStorage.getItem(key) || JSON.stringify(def)),
    };
    const students = DB.getItem("students") || [];
    const teachers = DB.getItem("teachers") || [];
    const allUsers = [
        { id: 'admin', firstName: 'Admin', lastName: '', role: 'admin' },
        ...students,
        ...teachers
    ];

    // --- DOM Elements ---
    const newMessageForm = document.getElementById('new-message-form');
    const recipientSelect = document.getElementById('recipient-select');

    // --- Functions ---
    function populateRecipients() {
        recipientSelect.innerHTML = '<option value="">Select a user...</option>';
        allUsers
            .filter(u => u.id !== currentUserId)
            .forEach(u => {
                recipientSelect.innerHTML += `<option value="${u.id}">${u.firstName} ${u.lastName} (${u.role})</option>`;
            });
    }

    // --- Event Listeners ---
    newMessageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const recipientId = recipientSelect.value;
        if (!recipientId) {
            Toastify({ text: "Please select a recipient.", duration: 3000, className: "toast-warning" }).showToast();
            return;
        }

        const conversationId = [currentUserId, recipientId].sort().join('_');
        window.location.href = `messaging-conversation.html?conversationId=${conversationId}`;
    });

    // --- Init ---
    populateRecipients();
});
