/**
 * game.js - Quiz Logic and Interaction
 */

let gameState = {
    teamName: "",
    score: 0,
    currentQuestionIdx: 0,
    isAnswerLocked: false,
    timerInterval: null,
    timeLeft: 0,
    lifelinesUsed: 0,
    setA: [],
    setB: [],
    activeQuestions: [],
    performance: [],
    startTime: null,
    currentSet: 'A'
};

// DOM Elements
const screens = {
    welcome: document.getElementById('screen-welcome'),
    quiz: document.getElementById('screen-quiz'),
    results: document.getElementById('screen-results')
};

const elements = {
    teamInput: document.getElementById('team-name-input'),
    displayTeam: document.getElementById('display-team-name'),
    displayScore: document.getElementById('display-score'),
    timerClock: document.getElementById('timer-clock'),
    questionText: document.getElementById('question-text'),
    answerBtns: document.querySelectorAll('.answer-btn'),
    ladderItems: document.querySelectorAll('.ladder-item'),
    finalScore: document.getElementById('final-score-value'),
    resultsTeamName: document.getElementById('results-team-name'),
    perfSummary: document.getElementById('performance-summary'),
    readyOverlay: document.getElementById('ready-overlay')
};

// Init
async function initGame() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        gameState.setA = data.questions;
        gameState.setB = data.backups;
        gameState.activeQuestions = [...gameState.setA];
    } catch (e) {
        console.error("Failed to load questions:", e);
    }

    document.getElementById('btn-start-quiz').onclick = startQuiz;
    document.getElementById('btn-ready').onclick = () => {
        elements.readyOverlay.classList.add('hidden');
        startTimer(gameState.activeQuestions[gameState.currentQuestionIdx].time);
    };
    document.getElementById('btn-reveal').onclick = revealAnswer;
    document.getElementById('btn-next').onclick = nextQuestion;
    document.getElementById('btn-prev').onclick = prevQuestion;
    document.getElementById('btn-bank').onclick = bankAndStop;
    document.getElementById('btn-restart').onclick = () => location.reload();
    document.getElementById('btn-backup').onclick = toggleSet;

    elements.answerBtns.forEach(btn => {
        btn.onclick = () => selectAnswer(btn);
    });

    elements.ladderItems.forEach(item => {
        item.onclick = () => {
            const level = parseInt(item.dataset.level);
            jumpToQuestion(level - 1);
        };
    });

    document.getElementById('ll-5050').onclick = () => applyLifeline('50:50');
    // Audience lifeline is now removed as requested
}

function startQuiz() {
    const name = elements.teamInput.value.trim();
    if (!name) {
        alert("Please enter a team name!");
        return;
    }
    gameState.teamName = name;
    elements.displayTeam.innerText = gameState.teamName;
    switchScreen('quiz');
    loadQuestion();
}

function loadQuestion() {
    clearInterval(gameState.timerInterval);
    const q = gameState.activeQuestions[gameState.currentQuestionIdx];
    elements.questionText.innerText = q.prompt;
    const perf = gameState.performance[gameState.currentQuestionIdx];
    const wasAnswered = perf && perf.answered;
    gameState.isAnswerLocked = wasAnswered;

    if (!wasAnswered) {
        elements.readyOverlay.classList.remove('hidden');
    } else {
        elements.readyOverlay.classList.add('hidden');
    }

    elements.answerBtns.forEach(btn => {
        const opt = btn.dataset.option;
        btn.classList.remove('selected', 'correct', 'incorrect');
        btn.style.visibility = 'visible';
        btn.querySelector('.opt-text').innerText = q.choices[opt];
        if (wasAnswered) {
            if (opt === q.correct) btn.classList.add('correct');
            if (perf && perf.choice === opt) {
                btn.classList.add('selected');
                if (opt !== q.correct) btn.classList.add('incorrect');
            }
        }
    });
    updateLadder();
}

function startTimer(seconds) {
    gameState.timeLeft = seconds;
    elements.timerClock.innerText = gameState.timeLeft;
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        elements.timerClock.innerText = gameState.timeLeft;
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            lockAnswer();
        }
    }, 1000);
}

function selectAnswer(btn) {
    if (gameState.isAnswerLocked) return;
    elements.answerBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function lockAnswer() {
    gameState.isAnswerLocked = true;
    clearInterval(gameState.timerInterval);
}

function revealAnswer() {
    if (!gameState.isAnswerLocked) {
        lockAnswer();
    }
    const q = gameState.activeQuestions[gameState.currentQuestionIdx];
    const correctOpt = q.correct;
    const selectedBtn = document.querySelector('.answer-btn.selected');
    const choice = selectedBtn ? selectedBtn.dataset.option : null;

    elements.answerBtns.forEach(btn => {
        if (btn.dataset.option === correctOpt) btn.classList.add('correct');
        else if (btn === selectedBtn) btn.classList.add('incorrect');
    });

    if (selectedBtn && selectedBtn.dataset.option === correctOpt) {
        gameState.score += q.points;
        elements.displayScore.innerText = `Score: ${gameState.score}`;
    }

    const timeSpent = q.time - gameState.timeLeft;
    if (!gameState.performance[gameState.currentQuestionIdx]) {
        gameState.performance[gameState.currentQuestionIdx] = { qNum: gameState.currentQuestionIdx + 1 };
    }
    gameState.performance[gameState.currentQuestionIdx].timeTaken = timeSpent + "s";
    gameState.performance[gameState.currentQuestionIdx].answered = true;
    gameState.performance[gameState.currentQuestionIdx].choice = choice;
}

function nextQuestion() {
    if (gameState.currentQuestionIdx < gameState.activeQuestions.length - 1) {
        gameState.currentQuestionIdx++;
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function prevQuestion() {
    if (gameState.currentQuestionIdx > 0) {
        gameState.currentQuestionIdx--;
        loadQuestion();
    }
}

function jumpToQuestion(idx) {
    gameState.currentQuestionIdx = idx;
    loadQuestion();
}

function toggleSet() {
    const idx = gameState.currentQuestionIdx;
    if (gameState.currentSet === 'A') {
        gameState.activeQuestions[idx] = gameState.setB[idx];
        gameState.currentSet = 'B';
    } else {
        gameState.activeQuestions[idx] = gameState.setA[idx];
        gameState.currentSet = 'A';
    }
    gameState.performance[idx] = { qNum: idx + 1, answered: false };
    loadQuestion();
}

function applyLifeline(type) {
    if (type !== '50:50') return; // Remove Audience lifeline logic

    if (gameState.lifelinesUsed >= 1) {
        alert("Lifeline already used!");
        return;
    }
    gameState.lifelinesUsed++;
    if (!gameState.performance[gameState.currentQuestionIdx]) {
        gameState.performance[gameState.currentQuestionIdx] = { qNum: gameState.currentQuestionIdx + 1 };
    }
    gameState.performance[gameState.currentQuestionIdx].lifeline = type;

    const q = gameState.activeQuestions[gameState.currentQuestionIdx];
    const correct = q.correct;
    let removed = 0;
    elements.answerBtns.forEach(btn => {
        if (btn.dataset.option !== correct && removed < 2) {
            btn.style.visibility = 'hidden';
            removed++;
        }
    });
}

function bankAndStop() {
    finishQuiz();
}

function finishQuiz() {
    clearInterval(gameState.timerInterval);
    elements.resultsTeamName.innerText = `${gameState.teamName}'s Result`;
    elements.finalScore.innerText = gameState.score;
    let html = `
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Question</th>
                    <th>Time Taken</th>
                    <th>Lifeline</th>
                </tr>
            </thead>
            <tbody>
    `;
    for (let i = 0; i < gameState.activeQuestions.length; i++) {
        const perf = gameState.performance[i] || { timeTaken: "N/A", lifeline: "None" };
        html += `<tr><td>${i + 1}</td><td>${perf.timeTaken || "N/A"}</td><td>${perf.lifeline || "None"}</td></tr>`;
    }
    html += `</tbody></table>`;
    elements.perfSummary.innerHTML = html;
    switchScreen('results');
}

function updateLadder() {
    elements.ladderItems.forEach(item => {
        const level = parseInt(item.dataset.level);
        item.classList.remove('active', 'completed');
        if (level === gameState.currentQuestionIdx + 1) item.classList.add('active');
        else if (level < gameState.currentQuestionIdx + 1) item.classList.add('completed');
    });
}

function switchScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenId].classList.add('active');
}

initGame();
