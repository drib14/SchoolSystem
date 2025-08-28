document.addEventListener("DOMContentLoaded", () => {
    const eventList = document.getElementById("event-list");
    const adminFormContainer = document.getElementById("admin-event-form-container");
    const eventForm = document.getElementById("event-form");
    const formTitle = document.getElementById("form-title");
    const eventIdInput = document.getElementById("event-id");
    const eventTitleInput = document.getElementById("event-title");
    const eventDateInput = document.getElementById("event-date");
    const eventDescriptionInput = document.getElementById("event-description");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const sidebarMenu = document.getElementById("sidebar-menu");
    const sidebarPanelName = document.getElementById("sidebar-panel-name");

    const currentUserRole = localStorage.getItem("userRole");

    const DB = {
        getItem: (key, defaultValue = []) => {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        },
        setItem: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };

    let events = DB.getItem("events");

    const renderEvents = () => {
        eventList.innerHTML = "";
        if (events.length === 0) {
            eventList.innerHTML = "<p>No upcoming events.</p>";
            return;
        }

        const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedEvents.forEach(event => {
            const eventItem = document.createElement("div");
            eventItem.className = "event-item";
            eventItem.innerHTML = `
                <h4>${event.title}</h4>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p>${event.description}</p>
                ${currentUserRole === 'admin' ? `
                <div class="actions">
                    <button class="btn btn-sm btn-secondary" data-action="edit" data-id="${event.id}">Edit</button>
                    <button class="btn btn-sm deny-btn" data-action="delete" data-id="${event.id}">Delete</button>
                </div>
                ` : ''}
            `;
            eventList.appendChild(eventItem);
        });
    };

    const resetForm = () => {
        formTitle.textContent = "Add New Event";
        eventForm.reset();
        eventIdInput.value = "";
        cancelEditBtn.style.display = "none";
    };

    // --- Event Listeners ---
    eventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const eventData = {
            id: eventIdInput.value || `evt_${Date.now()}`,
            title: eventTitleInput.value,
            date: eventDateInput.value,
            description: eventDescriptionInput.value,
        };

        if (eventIdInput.value) { // Editing
            events = events.map(evt => evt.id === eventIdInput.value ? eventData : evt);
        } else { // Creating
            events.push(eventData);
        }

        DB.setItem("events", events);
        renderEvents();
        resetForm();
    });

    eventList.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        const eventId = e.target.dataset.id;
        if (!action || !eventId) return;

        if (action === "delete") {
            if (confirm("Are you sure you want to delete this event?")) {
                events = events.filter(evt => evt.id !== eventId);
                DB.setItem("events", events);
                renderEvents();
            }
        } else if (action === "edit") {
            const eventToEdit = events.find(evt => evt.id === eventId);
            if (eventToEdit) {
                formTitle.textContent = "Edit Event";
                eventIdInput.value = eventToEdit.id;
                eventTitleInput.value = eventToEdit.title;
                eventDateInput.value = eventToEdit.date;
                eventDescriptionInput.value = eventToEdit.description;
                cancelEditBtn.style.display = "inline-block";
            }
        }
    });

    cancelEditBtn.addEventListener("click", resetForm);

    // --- Initialization ---
    if (currentUserRole === 'admin') {
        adminFormContainer.style.display = "block";
    }

    // Rudimentary sidebar and logout
    if (sidebarPanelName && currentUserRole) {
        sidebarPanelName.textContent = `${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)} Panel`;
    }
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }

    renderEvents();
});
