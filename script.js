document.addEventListener('DOMContentLoaded', () => {
    // --- Element Cache ---
    const loginSection = document.getElementById('login-section');
    const reportSection = document.getElementById('report-section');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const studentNameInput = document.getElementById('login-student-name');
    const studentIdInput = document.getElementById('login-student-id');
    const logoutBtn = document.getElementById('logout-btn');
    const printBtn = document.getElementById('print-btn');

    // --- API Configuration ---
    const API_BASE_URL = 'https://online-report-card-frontend.onrender.com';

    // --- State ---
    let currentStudentData = null;

    // --- Functions ---

    /**
     * Handles the login form submission.
     * @param {Event} e The form submission event.
     */
    async function handleLogin(e) {
        e.preventDefault();
        errorMessage.classList.add('hidden');
        const name = studentNameInput.value.trim();
        const id = studentIdInput.value.trim();

        if (!name || !id) {
            errorMessage.textContent = 'Please enter both name and ID.';
            errorMessage.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/students/${id}`);
            if (!response.ok) {
                throw new Error('Student data not found.');
            }
            const studentData = await response.json();

            // Verify that the fetched student's name matches the input name (case-insensitive)
            if (studentData.name.toLowerCase() !== name.toLowerCase()) {
                throw new Error('Student name does not match the ID.');
            }

            currentStudentData = studentData;
            displayReportCard(currentStudentData);

        } catch (error) {
            errorMessage.textContent = 'Invalid name or ID. Please try again.';
            errorMessage.classList.remove('hidden');
            console.error('Login failed:', error);
        }
    }

    /**
     * Renders the report card view with the student's data.
     * @param {object} student The student data object from the API.
     */
    function displayReportCard(student) {
        // Populate student info
        document.getElementById('report-school-name').textContent = student.schoolName || 'School Name Not Provided';
        document.getElementById('report-school-address').textContent = student.schoolAddress || '';
        document.getElementById('student-info-name').textContent = student.name;
        document.getElementById('student-info-id').textContent = student.id;
        document.getElementById('report-date').textContent = new Date().toLocaleDateString();

        // Render table
        renderGradeTable(student.grades);

        // Switch views
        loginSection.classList.remove('active');
        loginSection.classList.add('hidden');
        reportSection.classList.remove('hidden');
        reportSection.classList.add('active');
    }

    /**
     * Dynamically builds the grades table from the student's grade data.
     * @param {Array<object>} grades The array of grade objects for the student.
     */
    function renderGradeTable(grades) {
        const tableHead = document.querySelector('#gradeTable thead');
        const tableBody = document.getElementById('grades-body');
        const sem1Row = document.getElementById('sem1-average-row');
        const sem2Row = document.getElementById('sem2-average-row');
        const overallGradeSpan = document.getElementById('overall-grade');

        // Clear previous data
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        sem1Row.innerHTML = '';
        sem2Row.innerHTML = '';

        if (grades.length === 0) return;

        // --- Determine periods from the first subject ---
        const firstGrade = grades[0];
        const periods = Object.keys(firstGrade).filter(key => key !== 'subject');
        const sem1Periods = periods.filter(p => ['p1', 'p2', 'p3', 'exam1'].includes(p));
        const sem2Periods = periods.filter(p => ['p4', 'p5', 'p6', 'exam2'].includes(p));

        // --- Build Table Header ---
        let headerHTML = '<tr><th>Subject</th>';
        periods.forEach(p => {
            const periodName = p.startsWith('p') ? `Period ${p.substring(1)}` : `Exam ${p.substring(4)}`;
            headerHTML += `<th>${periodName}</th>`;
        });
        headerHTML += '</tr>';
        tableHead.innerHTML = headerHTML;

        // --- Build Table Body ---
        let totalPoints = 0;
        let totalPossiblePoints = 0;
        const semesterTotals = { sem1: 0, sem2: 0 };
        const semesterCounts = { sem1: 0, sem2: 0 };

        grades.forEach(grade => {
            let rowHTML = `<tr><td>${grade.subject}</td>`;
            periods.forEach(p => {
                const score = grade[p] || 0;
                rowHTML += `<td class="${score < 60 ? 'failing-score' : ''}">${score}</td>`;
                totalPoints += score;
                totalPossiblePoints += 100;

                if (sem1Periods.includes(p)) {
                    semesterTotals.sem1 += score;
                    semesterCounts.sem1++;
                }
                if (sem2Periods.includes(p)) {
                    semesterTotals.sem2 += score;
                    semesterCounts.sem2++;
                }
            });
            rowHTML += `</tr>`;
            tableBody.innerHTML += rowHTML;
        });

        // --- Calculate and Display Averages ---
        const sem1Avg = (semesterCounts.sem1 > 0) ? (semesterTotals.sem1 / (semesterCounts.sem1 / grades.length)) : 0;
        const sem2Avg = (semesterCounts.sem2 > 0) ? (semesterTotals.sem2 / (semesterCounts.sem2 / grades.length)) : 0;
        const finalAvg = (totalPossiblePoints > 0) ? (totalPoints / (totalPossiblePoints / 100)) : 0;

        // Semester 1 Average Row
        if (sem1Periods.length > 0) {
            sem1Row.innerHTML = `
                <td colspan="${periods.length}" class="average-label">Semester 1 Average</td>
                <td class="${sem1Avg < 60 ? 'failing-score' : ''}">${sem1Avg.toFixed(2)}</td>
            `;
        }

        // Semester 2 Average Row
        if (sem2Periods.length > 0) {
            sem2Row.innerHTML = `
                <td colspan="${periods.length}" class="average-label">Semester 2 Average</td>
                <td class="${sem2Avg < 60 ? 'failing-score' : ''}">${sem2Avg.toFixed(2)}</td>
            `;
        }

        // Final Overall Grade
        overallGradeSpan.textContent = finalAvg.toFixed(2);
        overallGradeSpan.className = finalAvg < 60 ? 'failing-score' : '';

        // Set overall comment based on final average
        const overallComment = document.getElementById('overall-comment');
        if (finalAvg >= 90) {
            overallComment.textContent = "Excellent work! Keep up the high standards.";
        } else if (finalAvg >= 80) {
            overallComment.textContent = "Great job! Consistently strong performance.";
        } else if (finalAvg >= 70) {
            overallComment.textContent = "Good effort. Continue to strive for improvement.";
        } else if (finalAvg >= 60) {
            overallComment.textContent = "Satisfactory performance. Focus on areas needing improvement.";
        } else {
            overallComment.textContent = "Improvement is needed. Please see your advisor for a support plan.";
        }
    }

    /**
     * Handles the logout process.
     */
    function handleLogout() {
        // Clear state and form inputs
        currentStudentData = null;
        loginForm.reset();

        // Switch views
        reportSection.classList.remove('active');
        reportSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        loginSection.classList.add('active');
    }

    /**
     * Triggers the browser's print dialog.
     */
    function handlePrint() {
        window.print();
    }

    // --- Event Listeners ---
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    printBtn.addEventListener('click', handlePrint);
});