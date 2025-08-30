document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect page and get DOM elements
    protectPage(['admin']);
    const form = document.getElementById('edit-course-form');
    const courseIdInput = document.getElementById('course-id');
    const courseNameInput = document.getElementById('course-name');
    const courseDescriptionInput = document.getElementById('course-description');

    // 2. Get course ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = parseInt(urlParams.get('id'));

    if (!courseId) {
        alert('No course ID provided.');
        window.location.href = '/admin/courses.html';
        return;
    }

    // 3. Load existing data into the form
    let courses = getData('courses') || [];
    const courseToEdit = courses.find(c => c.id === courseId);

    if (!courseToEdit) {
        alert('Course not found.');
        window.location.href = '/admin/courses.html';
        return;
    }

    courseIdInput.value = courseToEdit.id;
    courseNameInput.value = courseToEdit.name;
    courseDescriptionInput.value = courseToEdit.description;

    // 4. Add form submission event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 5. Get updated values
        const updatedName = courseNameInput.value.trim();
        const updatedDescription = courseDescriptionInput.value.trim();

        if (!updatedName) {
            alert('Course Name is required.');
            return;
        }

        // 6. Find the course in the array and update it
        const courseIndex = courses.findIndex(c => c.id === courseId);
        if (courseIndex > -1) {
            courses[courseIndex].name = updatedName;
            courses[courseIndex].description = updatedDescription;

            // 7. Save the updated array back to localStorage
            saveData('courses', courses);
            alert('Course updated successfully!');
            window.location.href = '/admin/courses.html';
        } else {
            alert('Could not find the course to update. It might have been deleted.');
            window.location.href = '/admin/courses.html';
        }
    });
});
