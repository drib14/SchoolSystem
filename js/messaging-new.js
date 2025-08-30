document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = localStorage.getItem("userId");

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
    const allUsers = [
        { id: 'admin', firstName: 'Admin', lastName: '', role: 'admin' },
        ...students,
        ...teachers
    ];

    const newMessageForm = document.getElementById('new-message-form');
    const recipientSelect = document.getElementById('recipient-select');

    function populateRecipients() {
        recipientSelect.innerHTML = '<option value="">Select a user...</option>';
        allUsers
            .filter(u => u.id !== currentUserId)
            .forEach(u => {
                recipientSelect.innerHTML += `<option value="${u.id}">${u.firstName} ${u.lastName} (${u.role})</option>`;
            });
    }

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

    populateRecipients();
});
