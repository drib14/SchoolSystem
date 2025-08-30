document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect page and get DOM elements
    protectPage(['admin']);
    const form = document.getElementById('add-subject-form');
    const courseSelect = document.getElementById('course-select');

    // 2. Populate the courses dropdown
    function populateCoursesDropdown() {
        const courses = getData('courses') || [];
        if (courses.length === 0) {
            const option = new Option('No courses available. Please add a course first.', '');
            option.disabled = true;
            courseSelect.add(option);
            // Disable form submission if no courses exist
            form.querySelector('button[type="submit"]').disabled = true;
        } else {
            courses.forEach(course => {
                const option = new Option(course.name, course.id);
                courseSelect.add(option);
            });
        }
    }

    populateCoursesDropdown();

    // 3. Add form submission event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 4. Get form values
        const subjectName = document.getElementById('subject-name').value.trim();
        const subjectDescription = document.getElementById('subject-description').value.trim();
        const courseId = document.getElementById('course-select').value;

        // 5. Validate input
        if (!subjectName || !courseId) {
            alert('Subject Name and Assigned Course are required.');
            return;
        }

        // 6. Create new subject object
        const newSubject = {
            id: Date.now(),
            name: subjectName,
            description: subjectDescription,
            courseId: parseInt(courseId) // Ensure courseId is a number
        };

        // 7. Add to localStorage
        try {
            const subjects = getData('subjects') || [];
            subjects.push(newSubject);
            saveData('subjects', subjects);

            // 8. Redirect on success
            alert('Subject added successfully!');
            window.location.href = '/admin/subjects.html';

        } catch (error) {
            console.error('Error saving subject:', error);
            alert('Failed to save subject. Please check the console for errors.');
        }
    });
});
