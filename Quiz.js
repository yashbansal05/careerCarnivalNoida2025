const questions = [
    { q: "What is the capital of India?", options: ["Delhi", "Mumbai", "Chennai", "Kolkata"], answer: 0 },
    { q: "What is the opposite of Hot?", options: ["Warm", "Cold", "Freezing", "Cool"], answer: 1 },
	{ q: "What is the capital of India?", options: ["Delhi", "Mumbai", "Chennai", "Kolkata"], answer: 0 },
    { q: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: 1 }
];

let currentQuestion = 0;
let score = 0;
const userName = prompt("Enter your name to start the quiz");
let timerInterval;
let timeLeft = 10;
let selectedAnswer = null;

document.getElementById('start-btn').addEventListener('click', startQuiz);

function startQuiz() {
    document.getElementById('start-btn').style.display = 'none';
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        saveResult();
        return;
    }

    const qObj = questions[currentQuestion];
    const container = document.getElementById('question-container');
    timeLeft = 10;
    selectedAnswer = null;

    container.innerHTML = `<h3>${qObj.q}</h3><div id='options'></div>`;
    const optionsContainer = document.getElementById('options');

    qObj.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => {
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
    }, 400);
}

function updateClockDisplay(time) {
    document.getElementById('clock-hand').innerText = time;
}

function saveResult() {
    document.getElementById('quiz-container').innerHTML = `
        <h2>Quiz Completed!</h2>
        <p><strong>${userName}</strong>, your score: ${score} out of ${questions.length}</p>
        <div style="width: 80%; background-color: #ddd; margin: auto; padding: 5px; border-radius: 5px;">
            <div style="width: ${(score / questions.length) * 100}%; background-color: #00a1e0; height: 24px; border-radius: 5px;"></div>
        </div>
    `;

    const payload = {
        name: userName,
        score: score,
        timestamp: new Date().toISOString()
    };

    fetch('https://sheet.best/api/sheets/YOUR_SHEET_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}
