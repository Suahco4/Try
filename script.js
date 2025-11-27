document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const reportSection = document.getElementById('report-section');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');
    const printBtn = document.getElementById('print-btn');

    // --- API Communication Layer ---
    // This should be the URL of your deployed backend server (e.g., from Render).
    // IMPORTANT: Replace this with your actual backend URL once it is deployed.
    const API_BASE_URL = 'https://backend-wf9k.onrender.com'; 

    // Function to Fetch a single student's data from the backend
    async function getStudent(id) {
        const response = await fetch(`${API_BASE_URL}/api/students/${id}`);
        if (!response.ok) {
            throw new Error('Student not found');
        }
        return await response.json();
    }

    // --- Login Logic ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('student-name').value.trim();
        const id = document.getElementById('student-id').value.trim();

        try {
            const studentData = await getStudent(id); // Fetch student data from the API
            if (studentData && studentData.name.toLowerCase() === name.toLowerCase()) {
                displayReportCard(studentData, id);
                showSection('report');
            } else {
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            errorMessage.classList.remove('hidden');
        }
    });

    // --- Logout Logic ---
    logoutBtn.addEventListener('click', () => {
        loginForm.reset();
        reportSection.classList.remove('active');
        showSection('login');
    });

    // --- Print Logic ---
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Helper function to switch between login and report sections
    function showSection(sectionName) {
        if (sectionName === 'report') {
            loginSection.classList.remove('active');
            loginSection.classList.add('hidden');
            reportSection.classList.remove('hidden');
            reportSection.classList.add('active');
            errorMessage.classList.add('hidden');
        } else { // 'login'
            reportSection.classList.remove('active');
            reportSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
            loginSection.classList.add('active');
        }
    }

    // --- Report Card Display Logic ---
    function displayReportCard(studentData, studentId) {
        document.getElementById('student-info-name').textContent = studentData.name;
        document.getElementById('student-info-id').textContent = studentId;

        const grades = studentData.grades;
        if (!grades || grades.length === 0) {
            document.getElementById('grades-body').innerHTML = '<tr><td colspan="100%">No grades found.</td></tr>';
            return;
        }

        // 1. Determine active periods from the first subject's data
        const activePeriods = [];
        const firstSubject = grades[0];
        for (const key in firstSubject) {
            if (key !== 'subject' && key !== 'comment') {
                const isExam = key.startsWith('exam');
                const name = isExam ? `Exam ${key.replace('exam', '')}` : `${key.replace('p', '')}${getOrdinalSuffix(parseInt(key.replace('p', '')))} Period`;
                activePeriods.push({ id: key, name: name, type: isExam ? 'exam' : 'period' });
            }
        }
        
        // Define which periods belong to which semester
        const sem1PeriodIds = ['p1', 'p2', 'p3', 'exam1'];
        const sem2PeriodIds = ['p4', 'p5', 'p6', 'exam2'];

        const activeSem1Periods = activePeriods.filter(p => sem1PeriodIds.includes(p.id));
        const activeSem2Periods = activePeriods.filter(p => sem2PeriodIds.includes(p.id));

        // 2. Build Table Header
        const tableHead = document.querySelector('#gradeTable thead');
        let headerHTML = '<tr><th class="subject-col">Subject</th>';
        activeSem1Periods.forEach(p => headerHTML += `<th>${p.name}</th>`);
        if (activeSem1Periods.length > 0) headerHTML += '<th>Sem 1 Avg</th>';
        activeSem2Periods.forEach(p => headerHTML += `<th>${p.name}</th>`);
        if (activeSem2Periods.length > 0) headerHTML += '<th>Sem 2 Avg</th>';
        headerHTML += '<th>Final Avg</th></tr>';
        tableHead.innerHTML = headerHTML;

        // 3. Build Table Body and Calculate Averages
        const tableBody = document.getElementById('grades-body');
        tableBody.innerHTML = '';
        const periodTotals = {};
        activePeriods.forEach(p => periodTotals[p.id] = 0);

        grades.forEach(subjectGrade => {
            let rowHTML = `<tr><td class="subject-col">${subjectGrade.subject}</td>`;
            
            // Semester 1
            let sem1Scores = activeSem1Periods.map(p => subjectGrade[p.id] || 0);
            sem1Scores.forEach(score => {
                rowHTML += `<td class="${score < 60 ? 'failing-score' : ''}">${score}</td>`;
            });
            const sem1Avg = sem1Scores.length > 0 ? sem1Scores.reduce((a, b) => a + b, 0) / sem1Scores.length : 0;
            if (activeSem1Periods.length > 0) {
                rowHTML += `<td class="${sem1Avg < 60 ? 'failing-score' : ''}">${sem1Avg.toFixed(2)}</td>`;
            }

            // Semester 2
            let sem2Scores = activeSem2Periods.map(p => subjectGrade[p.id] || 0);
            sem2Scores.forEach(score => {
                rowHTML += `<td class="${score < 60 ? 'failing-score' : ''}">${score}</td>`;
            });
            const sem2Avg = sem2Scores.length > 0 ? sem2Scores.reduce((a, b) => a + b, 0) / sem2Scores.length : 0;
            if (activeSem2Periods.length > 0) rowHTML += `<td class="${sem2Avg < 60 ? 'failing-score' : ''}">${sem2Avg.toFixed(2)}</td>`;

            // Final Average for the subject
            const finalAvg = (sem1Avg + sem2Avg) / 2;
            rowHTML += `<td class="${finalAvg < 60 ? 'failing-score' : ''}">${finalAvg.toFixed(2)}</td></tr>`;

            tableBody.innerHTML += rowHTML;

            // Add a new row for the comment if it exists
            if (subjectGrade.comment && subjectGrade.comment.trim() !== '') {
                const commentRowHTML = `<tr class="comment-row"><td colspan="100%"><span class="comment-label">Comment:</span> ${subjectGrade.comment}</td></tr>`;
                tableBody.innerHTML += commentRowHTML;
            }


            // Add to period totals for footer calculation
            activePeriods.forEach(p => periodTotals[p.id] += (subjectGrade[p.id] || 0));
        });

        // 4. Build Table Footer
        const tableFoot = document.querySelector('#gradeTable tfoot');
        let footerHTML = '<tr><th class="subject-col">Average</th>';
        let overallSem1Total = 0;
        let overallSem2Total = 0;

        activeSem1Periods.forEach(p => {
            const avg = periodTotals[p.id] / grades.length;
            footerHTML += `<td class="${avg < 60 ? 'failing-score' : ''}">${avg.toFixed(2)}</td>`;
            overallSem1Total += avg;
        });
        const overallSem1Avg = activeSem1Periods.length > 0 ? overallSem1Total / activeSem1Periods.length : 0;
        if (activeSem1Periods.length > 0) {
            footerHTML += `<td class="${overallSem1Avg < 60 ? 'failing-score' : ''}">${overallSem1Avg.toFixed(2)}</td>`;
        }

        activeSem2Periods.forEach(p => {
            const avg = periodTotals[p.id] / grades.length;
            footerHTML += `<td class="${avg < 60 ? 'failing-score' : ''}">${avg.toFixed(2)}</td>`;
            overallSem2Total += avg;
        });
        const overallSem2Avg = activeSem2Periods.length > 0 ? overallSem2Total / activeSem2Periods.length : 0;
        if (activeSem2Periods.length > 0) {
            footerHTML += `<td class="${overallSem2Avg < 60 ? 'failing-score' : ''}">${overallSem2Avg.toFixed(2)}</td>`;
        }

        const finalOverallAvg = (overallSem1Avg + overallSem2Avg) / 2;
        footerHTML += `<td class="${finalOverallAvg < 60 ? 'failing-score' : ''}">${finalOverallAvg.toFixed(2)}</td></tr>`;
        tableFoot.innerHTML = footerHTML;

        // 5. Set Overall Performance Comment
        setOverallPerformance(finalOverallAvg);
        // 6. Set the print date
        const today = new Date();
        document.getElementById('report-date').textContent = today.toLocaleDateString();
    }

    function setOverallPerformance(finalAvg) {
        const gradeSpan = document.getElementById('overall-grade');
        const commentP = document.getElementById('overall-comment');
        let grade = '';
        let comment = '';

        if (finalAvg >= 90) {
            grade = 'A';
            comment = 'Excellent work! Keep up the outstanding performance.';
        } else if (finalAvg >= 80) {
            grade = 'B';
            comment = 'Great job! Consistently strong performance.';
        } else if (finalAvg >= 70) {
            grade = 'C';
            comment = 'Good effort. Continue to work hard.';
        } else if (finalAvg >= 60) {
            grade = 'D';
            comment = 'Satisfactory. There is room for improvement.';
        } else {
            grade = 'F';
            comment = 'Needs improvement. Please see the administration for guidance.';
        }

        gradeSpan.textContent = grade;
        commentP.textContent = comment;
    }

    function getOrdinalSuffix(i) {
        const j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) return "st";
        if (j === 2 && k !== 12) return "nd";
        if (j === 3 && k !== 13) return "rd";
        return "th";
    }
});