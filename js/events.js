document.addEventListener("DOMContentLoaded", () => {
    const calendarEl = document.getElementById("calendar");
    const adminFormContainer = document.getElementById("admin-event-form-container");
    const eventForm = document.getElementById("event-form");
    const formTitle = document.getElementById("form-title");
    const eventIdInput = document.getElementById("event-id");
    const eventTitleInput = document.getElementById("event-title");
    const eventDateInput = document.getElementById("event-date");
    const eventDescriptionInput = document.getElementById("event-description");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");

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

    const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: event.date,
        description: event.description,
        allDay: true
    }));

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        events: formattedEvents,
        eventClick: function(info) {
            if (currentUserRole === 'admin') {
                const eventId = info.event.id;
                const eventToEdit = events.find(evt => evt.id === eventId);
                if (eventToEdit) {
                    formTitle.textContent = "Edit Event";
                    eventIdInput.value = eventToEdit.id;
                    eventTitleInput.value = eventToEdit.title;
                    eventDateInput.value = eventToEdit.date;
                    eventDescriptionInput.value = eventToEdit.description;
                    cancelEditBtn.style.display = "inline-block";
                    adminFormContainer.style.display = 'block';
                    adminFormContainer.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    });

    calendar.render();

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

        // Refetch and rerender events in calendar
        calendar.removeAllEvents();
        calendar.addEventSource(events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.date,
            description: event.description,
            allDay: true
        })));

        resetForm();
    });

    cancelEditBtn.addEventListener("click", resetForm);

    // --- Initialization ---
    if (currentUserRole === 'admin') {
        adminFormContainer.style.display = "block";
    }
});
