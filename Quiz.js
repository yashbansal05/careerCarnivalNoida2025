const questions = [
    { q: "Who is first IBM Consulting Chairman?", options: ["John Granger", "Arvind Krishna", "Mark Foster", "Kelly Chambliss"], answer: 2 },
	{ q: "Which cloud service model provides the highest level of control and customization for users?", options: ["Infrastructure as a Service (IaaS)", "Platform as a Service (PaaS)", "Function as a Service (FaaS)", "Software as a Service (SaaS)"], answer: 0 },
	{ q: "What is Salesforce’s real-time data platform called (formerly known as CDP)?", options: ["Snowflake", "Genie", "Pulse", "Hub"], answer: 1 },
	{ q: "Which Salesforce product enables communication and collaboration across teams?", options: ["Zoom", "Meet", "Chatter", "Slack"], answer: 3 },
	{ q: "What is the term for a cloud deployment model that involves a combination of public and private cloud services?", options: ["Multi-cloud", "Hybrid cloud", "Community cloud", "Distributed cloud"], answer: 1 },
	{ q: "What is the name of IBM’s AI platform designed to understand, reason, and learn?", options: ["Azure", "Einstein", "Watson", "Bard"], answer: 2 },
	{ q: "Select the incorrect primitive data type.", options: ["DateTime", "Date", "Base32", "Email"], answer: 2 },
	{ q: "What Salesforce tool is used to integrate external systems?", options: ["Fusion", "Mulesoft", "Kafka", "Bridge"], answer: 1 },
	{ q: "Which Salesforce acquisition is a data visualization platform?", options: ["Slack", "Tableau", "Asana", "Mulesoft"], answer: 1 },
	{ q: "Which of the following is a standard Profile?", options: ["Read only", "Marketing Director", "Partner Portal User", "Standard Administrator"], answer: 0 }
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
