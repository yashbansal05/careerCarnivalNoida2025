const questions = [
    { q: "Which feature of Salesforce Einstein recommends the best next steps for sales reps?", options: ["Einstein Discovery", "Next Best Action", "Einstein Vision", "Einstein Bots"], answer: 1 },
	{ q: "Who is the father of cloud computing?", options: ["Sharon B. Codd", "Edgar Frank Codd", "J.C.R. Licklider", "Charles Bachman"], answer: 2 },
	{ q: "Which Salesforce feature provides AI-powered chatbots for customer support?", options: ["Einstein Bots", "Flow Builder", "Omni-Channel", "Lightning Knowledge"], answer: 0 },
	{ q: "What is one benefit of using AI in sales?", options: ["Slower response time", "Manual data entry", "Personalized recommendations", "Fewer customer insights"], answer: 2 },
	{ q: "Arvind Krishna is ---th CEO of IBM", options: ["11th", "10th", "12th", "8th"], answer: 1 },
	{ q: "Which technology helps AI recognize objects in images?", options: ["Image Recognition", "Blockchain", "Neural Networks", "Natural Language Processing (NLP)"], answer: 0 },
	{ q: "Which of the following is not a type of cloud server?", options: ["Public Cloud Servers", "Private Cloud Servers", "Dedicated Cloud Servers", "Merged Cloud Servers"], answer: 3 },
	{ q: "What language is used to write custom logic in Salesforce?", options: ["Java", "Python", "Apex", "SQL"], answer: 2 },
	{ q: "What is the term for the practice of renting computing resources over the internet?", options: ["Cloud computing", "Virtualization", "On-premises hosting", "Cloud services"], answer: 0 },
	{ q: "Which company created Einstein AI for CRM?", options: ["Microsoft", "Google", "Amazon", "Salesforce"], answer: 3 }
];

let currentQuestion = 0;
let score = 0;
let userName = '';
let userEmail = '';
let timerInterval;
let timeLeft = 10;
let selectedAnswer = null;
let totalTimeTaken = 0;
let questionStartTime = null;
let timeSpentForThisQuestion = null;

document.getElementById('register-btn').addEventListener('click', () => {
    userName = document.getElementById('name-input').value.trim();
    userEmail = document.getElementById('email-input').value.trim();

    if (userName === '' || userEmail === '') {
        alert('Please enter both name and email.');
        return;
    }

    document.getElementById('registration-form').style.display = 'none';
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('clock-hand').style.display = 'block';
    document.getElementById('options').style.display = 'block';

    waitForAdminStart();
});

function waitForAdminStart() {
    const messageContainer = document.getElementById('question-container');
    messageContainer.innerHTML = `<h3>Waiting for Admin to start the quiz...</h3>`;

    const interval = setInterval(() => {
        fetch('https://api.sheetbest.com/sheets/1cb8e9bb-87e6-4c4b-8e26-b7e24b41d7b7')
            .then(response => response.json())
            .then(data => {
                if (data[0].quizStarted === 'TRUE') {
                    clearInterval(interval);
                    showQuestion();
                }
            });
    }, 1000);
}


function showQuestion() {
    if (currentQuestion >= questions.length) {
        saveResult();
        return;
    }
	
	clearInterval(timerInterval);

    const qObj = questions[currentQuestion];
    timeLeft = 10;
    selectedAnswer = null;
    timeSpentForThisQuestion = null;
    questionStartTime = Date.now();

    document.getElementById('question-container').innerHTML = `<h3>${qObj.q}</h3>`;
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    qObj.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => {
            if (timeSpentForThisQuestion === null) {
                timeSpentForThisQuestion = (Date.now() - questionStartTime) / 1000;

                if (index === qObj.answer) {
                    totalTimeTaken += timeSpentForThisQuestion;
                    console.log(`Question ${currentQuestion + 1}: Correct in ${timeSpentForThisQuestion.toFixed(3)} seconds`);
                } else {
                    console.log(`Question ${currentQuestion + 1}: Incorrect, time not counted`);
                }
            }

            selectedAnswer = index;
            document.querySelectorAll('#options button').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        };
        optionsContainer.appendChild(btn);
    });

    updateClockDisplay(10);

    timerInterval = setInterval(() => {
        updateClockDisplay(timeLeft);
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timerInterval);

            if (selectedAnswer === qObj.answer) {
                score++;
            }

            currentQuestion++;
            showQuestion();
        }
    }, 1000);
}

function updateClockDisplay(time) {
    document.getElementById('clock-hand').innerText = time;
}

function saveResult() {
    document.getElementById('quiz-container').innerHTML = `
        <h2>Quiz Completed!</h2>
        <p><strong>${userName}</strong> (${userEmail}), your score: ${score} out of ${questions.length}</p>
        <div style="width: 80%; background-color: #ddd; margin: auto; padding: 5px; border-radius: 5px;">
            <div style="width: ${(score / questions.length) * 100}%; background-color: #00a1e0; height: 24px; border-radius: 5px;"></div>
        </div>
        <div id="top-winners"></div>
    `;

    const payload = {
        name: userName,
        email: userEmail,
        score: score,
        timeTaken: totalTimeTaken.toFixed(3),
        timestamp: new Date().toISOString()
    };

    fetch('https://api.sheetbest.com/sheets/baaa64ab-bdeb-452d-a5a1-c520ee46ac70', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(() => {
        setTimeout(displayTopWinners, 10000);
    });
}

function displayTopWinners() {
    fetch('https://api.sheetbest.com/sheets/baaa64ab-bdeb-452d-a5a1-c520ee46ac70')
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return parseFloat(a.timeTaken) - parseFloat(b.timeTaken);
            });

            const top3 = data.slice(0, 3);

            let resultHTML = '<h3>🏆 Top 3 Winners 🏆</h3>';
            top3.forEach(entry => {
                resultHTML += `<li>${entry.name} (${entry.email}) - Score: ${entry.score}, Time: ${entry.timeTaken}s</li>`;
            });

            document.getElementById('top-winners').innerHTML = resultHTML;
        });
}
