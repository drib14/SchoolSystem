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
        if (!student.course || !student.course.code) return; // Skip students with no course assigned

        // Correctly calculate units based on the student's assigned course
        const courseSubjects = allSubjects.filter(s => s.courseCode === student.course.code);
        const totalUnits = courseSubjects.reduce((sum, subject) => sum + (parseFloat(subject.units) || 0), 0);

        totalTuition += (totalUnits * tuitionRate) + miscellaneousFeesTotal;
    });

    // Total Payroll
    let totalPayroll = 0;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const payrollSettings = JSON.parse(localStorage.getItem('payrollSettings')) || { workingDays: [1,2,3,4,5], deductionPerAbsence: 0, components: [] };

    const getWorkDaysInMonth = (year, month, workingDays) => {
        const date = new Date(year, month, 1);
        let workDays = 0;
        while (date.getMonth() === month) {
            if (workingDays.includes(date.getDay())) workDays++;
            date.setDate(date.getDate() + 1);
        }
        return workDays;
    };
    const totalWorkDays = getWorkDaysInMonth(currentYear, currentMonth, payrollSettings.workingDays);

    const approvedTeacherList = allTeachers.filter(t => t.status === 'approved');
    approvedTeacherList.forEach(teacher => {
        const baseSalary = teacher.monthlySalary || 0;
        const teacherRecords = attendanceRecords.filter(rec => rec.teacherId === teacher.id && new Date(rec.date).getMonth() === currentMonth && new Date(rec.date).getFullYear() === currentYear);
        const daysPresent = new Set(teacherRecords.map(rec => rec.date)).size;
        const absences = totalWorkDays - daysPresent;
        const absenceDeductions = absences * payrollSettings.deductionPerAbsence;

        const totalAllowances = payrollSettings.components.filter(c => c.type === 'allowance').reduce((sum, c) => sum + c.amount, 0);
        const totalDeductions = payrollSettings.components.filter(c => c.type === 'deduction').reduce((sum, c) => sum + c.amount, 0);

        totalPayroll += baseSalary - absenceDeductions + totalAllowances - totalDeductions;
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

    // --- Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }

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
