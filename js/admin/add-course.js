document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect the page
    protectPage(['admin']);

    // 2. Get DOM elements
    const form = document.getElementById('add-course-form');

    // 3. Add form submission event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 4. Get form values
        const courseName = document.getElementById('course-name').value.trim();
        const courseDescription = document.getElementById('course-description').value.trim();

        // 5. Validate input
        if (!courseName) {
            alert('Course Name is required.');
            return;
        }

        // 6. Create new course object
        const newCourse = {
            id: Date.now(), // Use timestamp for a simple unique ID
            name: courseName,
            description: courseDescription
        };

        // 7. Add to localStorage
        try {
            const courses = getData('courses') || [];
            courses.push(newCourse);
            saveData('courses', courses);

            // 8. Redirect on success
            alert('Course added successfully!');
            window.location.href = '/admin/courses.html';

        } catch (error) {
            console.error('Error saving course:', error);
            alert('Failed to save course. Please check the console for errors.');
        }
    });
});
