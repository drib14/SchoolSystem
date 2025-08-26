# ISCP (International State College of the Philippines) - School Management System

This is a comprehensive, frontend-only school management system built from scratch. It utilizes browser local storage to simulate a database, allowing for a fully functional client-side experience.

## Features

The system is divided into three main user panels: Admin, Teacher, and Student.

### Admin Panel
*   **Analytics Dashboard:** A real-time overview of key school metrics, including enrollment, academic, and financial statistics.
*   **Student Applicant Management:** View and approve/deny student applications.
*   **Teacher Applicant Management:** View and approve/deny teacher applications.
*   **Requirements Management:** Define and track the submission status of required documents for all applicants.
*   **Course Management:** Create and manage academic courses.
*   **Subject Management:** Create and manage subjects, assigning them to specific courses.
*   **Schedule Management:** Create class schedules for subjects and assign approved teachers.
*   **Tuition Management:** View calculated tuition fees for all enrolled students based on their plotted classes.
*   **Tuition Settings:** Set the per-unit tuition rate and manage miscellaneous fees.
*   **Payroll Management:** View calculated gross salary for all approved teachers based on their logged attendance hours.
*   **Payroll Settings:** Set the standard hourly rate for teachers and manage payroll components (allowances/deductions).

### Teacher Panel
*   **Login & Dashboard:** A dedicated portal for teachers.
*   **Class Management:** View a list of assigned classes.
*   **Attendance Tracking:** Take daily attendance for each class (Present, Late, Absent).
*   **Grade Entry:** Enter and save grades for students based on various components (quizzes, assignments, exams).
*   **Attendance Logging:** Check-in and check-out to log daily work hours for payroll calculation.

### Student Panel
*   **Login & Dashboard:** A dedicated portal for students.
*   **Multi-Step Enrollment:** A guided form for new students to apply for admission and select a course.
*   **Credential Generation:** Automatic generation of a student ID and password upon application.
*   **Class Plotting:** Enroll in specific class schedules for the semester.
*   **View Grades:** View a detailed breakdown of grades for each subject.
*   **View Attendance:** View personal attendance history for all classes.
*   **Simulated Biometric Check-in:** A feature to self-report attendance for a class.
*   **Downloadable Study Load:** Generate a clean, printer-friendly version of the plotted class schedule.

## Tech Stack

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Styling:** Custom CSS with responsive design (Flexbox, Grid), and Font Awesome for icons.
*   **Data Persistence:** Browser Local Storage is used as a client-side database.
*   **No external libraries or frameworks were used.**
