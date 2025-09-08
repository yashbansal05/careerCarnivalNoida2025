const questions = [
    { q: "What is the capital of India?", options: ["Delhi", "Mumbai", "Chennai", "Kolkata"], answer: 0 },
    { q: "2 + 2 equals?", options: ["3", "4", "5", "2"], answer: 1 },
    { q: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: 1 },
    { q: "What is H2O?", options: ["Oxygen", "Hydrogen", "Water", "Salt"], answer: 2 },
    { q: "What is the opposite of Hot?", options: ["Warm", "Cold", "Freezing", "Cool"], answer: 1 }
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

    container.innerHTML = `<h3>${qObj.q}</h3><div id='options'></div><p>Time left: <span id='timer'>10</span> seconds</p>`;
    const optionsContainer = document.getElementById('options');

    qObj.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => {
            selectedAnswer = index;
            // Highlight selected button
            document.querySelectorAll('#options button').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        };
        optionsContainer.appendChild(btn);
    });

    timerInterval = setInterval(() => {
        document.getElementById('timer').innerText = timeLeft;
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

function saveResult() {
    document.getElementById('question-container').innerHTML = `
        <h2>Quiz Completed!</h2>
        <p><strong>${userName}</strong>, your score: ${score} out of ${questions.length}</p>
        <div style="width: 80%; background-color: #ddd; margin: auto; padding: 5px; border-radius: 5px;">
            <div style="width: ${(score / questions.length) * 100}%; background-color: #4CAF50; height: 24px; border-radius: 5px;"></div>
        </div>
    `;

    const payload = {
        name: userName,
        score: score,
        timestamp: new Date().toISOString()
    };

    fetch('https://docs.google.com/spreadsheets/d/1jH_ufNFrOku_zAQh0-5PM13K841GsryxE-Bew44rJYo/edit?gid=0#gid=0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}
