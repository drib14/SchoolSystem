document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect page and get DOM elements
    protectPage(['admin']);
    const form = document.getElementById('edit-subject-form');
    const subjectIdInput = document.getElementById('subject-id');
    const subjectNameInput = document.getElementById('subject-name');
    const subjectDescriptionInput = document.getElementById('subject-description');
    const courseSelect = document.getElementById('course-select');

    // 2. Get subject ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const subjectId = parseInt(urlParams.get('id'));

    if (!subjectId) {
        alert('No subject ID provided.');
        window.location.href = '/admin/subjects.html';
        return;
    }

    // 3. Load data and populate the form
    let subjects = getData('subjects') || [];
    const courses = getData('courses') || [];
    const subjectToEdit = subjects.find(s => s.id === subjectId);

    if (!subjectToEdit) {
        alert('Subject not found.');
        window.location.href = '/admin/subjects.html';
        return;
    }

    // Populate course dropdown
    courses.forEach(course => {
        const option = new Option(course.name, course.id);
        courseSelect.add(option);
    });

    // Set form values
    subjectIdInput.value = subjectToEdit.id;
    subjectNameInput.value = subjectToEdit.name;
    subjectDescriptionInput.value = subjectToEdit.description;
    courseSelect.value = subjectToEdit.courseId; // Set the selected course

    // 4. Add form submission event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedName = subjectNameInput.value.trim();
        const updatedDescription = subjectDescriptionInput.value.trim();
        const updatedCourseId = parseInt(courseSelect.value);

        if (!updatedName || !updatedCourseId) {
            alert('Subject Name and Assigned Course are required.');
            return;
        }

        const subjectIndex = subjects.findIndex(s => s.id === subjectId);
        if (subjectIndex > -1) {
            subjects[subjectIndex].name = updatedName;
            subjects[subjectIndex].description = updatedDescription;
            subjects[subjectIndex].courseId = updatedCourseId;

            saveData('subjects', subjects);
            alert('Subject updated successfully!');
            window.location.href = '/admin/subjects.html';
        } else {
            alert('Could not find the subject to update.');
            window.location.href = '/admin/subjects.html';
        }
    });
});
