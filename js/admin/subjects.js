document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect the page
    protectPage(['admin']);

    // 2. Get DOM elements
    const tableBody = document.getElementById('subjects-table-body');

    // 3. Load and display subjects
    loadSubjects();

    function loadSubjects() {
        const subjects = getData('subjects') || [];
        const courses = getData('courses') || [];

        // Create a lookup map for courses for efficient access
        const courseMap = courses.reduce((map, course) => {
            map[course.id] = course.name;
            return map;
        }, {});

        // Clear existing table rows
        tableBody.innerHTML = '';

        if (subjects.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4; // Span across all columns
            cell.textContent = 'No subjects found. Add a course first, then add subjects.';
            cell.style.textAlign = 'center';
            return;
        }

        subjects.forEach(subject => {
            const row = tableBody.insertRow();

            const nameCell = row.insertCell();
            nameCell.textContent = subject.name;

            const descCell = row.insertCell();
            descCell.textContent = subject.description;

            const courseCell = row.insertCell();
            // Use the map to find the course name, provide fallback text if not found
            courseCell.textContent = courseMap[subject.courseId] || 'Unassigned';

            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <button class="btn btn-sm btn-primary" onclick="editSubject(${subject.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteSubject(${subject.id})">Delete</button>
            `;
        });
    }
});

// Placeholder functions for actions
function editSubject(subjectId) {
    window.location.href = `/admin/edit-subject.html?id=${subjectId}`;
}

function deleteSubject(subjectId) {
    const confirmed = confirm('Are you sure you want to delete this subject?');

    if (confirmed) {
        // TODO: Add dependency check here. We should check if any students are
        // enrolled in a class with this subject before deleting. This requires
        // the scheduling and enrollment systems to be implemented first.

        let subjects = getData('subjects') || [];
        const updatedSubjects = subjects.filter(subject => subject.id !== subjectId);
        saveData('subjects', updatedSubjects);
        location.reload();
    }
}
