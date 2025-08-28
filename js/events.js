document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');

    const monthYearHeader = document.getElementById('month-year-header');
    const weekdaysHeader = document.getElementById('weekdays-header');
    const calendarGrid = document.getElementById('calendar-days-grid');
    const eventsListContainer = document.getElementById('events-list-container');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const addEventFormContainer = document.getElementById('admin-event-form-container');
    const addEventForm = document.getElementById('add-event-form');

    let events = JSON.parse(localStorage.getItem('events')) || [];
    let currentDate = new Date();

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        eventsListContainer.innerHTML = '<h3>Upcoming Events</h3>';
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        monthYearHeader.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add blank days for the start of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            const dayEvents = events.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day;
            });

            if (dayEvents.length > 0) {
                dayEvents.forEach(event => {
                    const eventMarker = document.createElement('div');
                    eventMarker.className = 'event-marker';
                    eventMarker.textContent = event.title;
                    dayEl.appendChild(eventMarker);
                });
            }
            calendarGrid.appendChild(dayEl);
        }

        // Render upcoming events list
        const upcomingEvents = events
            .filter(e => new Date(e.date) >= new Date())
            .sort((a,b) => new Date(a.date) - new Date(b.date));

        if(upcomingEvents.length > 0) {
            upcomingEvents.forEach(e => {
                const eventDate = new Date(e.date);
                eventsListContainer.innerHTML += `<p><strong>${eventDate.toLocaleDateString()}:</strong> ${e.title}</p>`;
            });
        } else {
            eventsListContainer.innerHTML += '<p>No upcoming events.</p>';
        }
    }

    function renderWeekdaysHeader() {
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdaysHeader.innerHTML = '';
        weekdays.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day-header';
            dayEl.textContent = day;
            weekdaysHeader.appendChild(dayEl);
        });
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Admin-specific functionality
    if (userRole === 'admin') {
        addEventFormContainer.style.display = 'block';
        addEventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('event-title').value;
            const date = document.getElementById('event-date').value;

            if (title && date) {
                events.push({ id: Date.now(), title, date });
                localStorage.setItem('events', JSON.stringify(events));
                renderCalendar();
                Toastify({ text: "Event added successfully!", duration: 3000 }).showToast();
                addEventForm.reset();
            }
        });
    }

    renderWeekdaysHeader();
    renderCalendar();
});
