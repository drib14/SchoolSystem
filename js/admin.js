document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // --- Data Loading ---
    const allStudents = JSON.parse(localStorage.getItem('students')) || [];
    const allTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const allCourses = JSON.parse(localStorage.getItem('courses')) || [];
    const allSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendanceRecords')) || [];
    const tuitionRate = parseFloat(localStorage.getItem('tuitionRate')) || 0;
    const feeComponents = JSON.parse(localStorage.getItem('feeComponents')) || [];
    const payrollComponents = JSON.parse(localStorage.getItem('payrollComponents')) || [];
    const hourlyRate = parseFloat(localStorage.getItem('teacherHourlyRate')) || 0;

    // --- Calculations ---

    // Enrollment
    const studentApplicants = allStudents.filter(s => s.status === 'pending').length;
    const enrolledStudents = allStudents.filter(s => s.status === 'enrolled').length;
    const teacherApplicants = allTeachers.filter(t => t.status === 'pending').length;
    const approvedTeachers = allTeachers.filter(t => t.status === 'approved').length;

    // Academic
    const totalCourses = allCourses.length;
    const totalSubjects = allSubjects.length;

    // Financials
    // Total Tuition
    let totalTuition = 0;
    const enrolledStudentList = allStudents.filter(s => s.status === 'enrolled');
    const miscellaneousFeesTotal = feeComponents.reduce((sum, fee) => sum + fee.amount, 0);
    enrolledStudentList.forEach(student => {
        let totalUnits = 0;
        (student.plottedClasses || []).forEach(schedule => {
            const subject = allSubjects.find(s => s.code === schedule.subjectCode);
            if (subject) totalUnits += parseFloat(subject.units) || 0;
        });
        totalTuition += (totalUnits * tuitionRate) + miscellaneousFeesTotal;
    });

    // Total Payroll
    let totalPayroll = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const approvedTeacherList = allTeachers.filter(t => t.status === 'approved');
    approvedTeacherList.forEach(teacher => {
        const monthlyRecords = attendanceRecords.filter(rec => {
            const recDate = new Date(rec.date);
            return rec.teacherId === teacher.id && recDate.getMonth() === currentMonth && recDate.getFullYear() === currentYear;
        });
        let totalHours = 0;
        monthlyRecords.forEach(rec => {
            if (rec.checkIn && rec.checkOut) totalHours += (new Date(rec.checkOut) - new Date(rec.checkIn)) / 1000 / 60 / 60;
        });
        const grossSalary = totalHours * hourlyRate;
        const totalAllowances = payrollComponents.filter(c => c.type === 'allowance').reduce((sum, c) => sum + c.amount, 0);
        const totalDeductions = payrollComponents.filter(c => c.type === 'deduction').reduce((sum, c) => sum + c.amount, 0);
        totalPayroll += grossSalary + totalAllowances - totalDeductions;
    });

    // --- Update UI ---
    document.getElementById('student-applicants-count').textContent = studentApplicants;
    document.getElementById('enrolled-students-count').textContent = enrolledStudents;
    document.getElementById('teacher-applicants-count').textContent = teacherApplicants;
    document.getElementById('approved-teachers-count').textContent = approvedTeachers;
    document.getElementById('total-courses-count').textContent = totalCourses;
    document.getElementById('total-subjects-count').textContent = totalSubjects;
    document.getElementById('total-tuition').textContent = `₱ ${totalTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('total-payroll').textContent = `₱ ${totalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // --- Logout is handled by auth.js ---

    // --- Chart Rendering ---

    // 1. Students per Course (Bar Chart)
    const courseCtx = document.getElementById('course-chart').getContext('2d');
    if (courseCtx) {
        const courseLabels = allCourses.map(c => c.name);
        const courseData = allCourses.map(course => {
            return enrolledStudentList.filter(student => student.course && student.course.code === course.code).length;
        });

        new Chart(courseCtx, {
            type: 'bar',
            data: {
                labels: courseLabels,
                datasets: [{
                    label: '# of Enrolled Students',
                    data: courseData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // 2. Student Status (Pie Chart)
    const statusCtx = document.getElementById('student-status-chart').getContext('2d');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'pie',
            data: {
                labels: ['Pending Applicants', 'Enrolled Students'],
                datasets: [{
                    label: 'Student Status',
                    data: [studentApplicants, enrolledStudents],
                    backgroundColor: [
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)'
                    ],
                    borderColor: [
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    }
});
