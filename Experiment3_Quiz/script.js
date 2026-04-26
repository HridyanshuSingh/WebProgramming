// Quiz Questions for B.Tech CSE Students
const quizData = [
    {
        question: "What does CPU stand for?",
        options: [
            "Central Processing Unit",
            "Computer Personal Unit",
            "Central Programming Unit",
            "Control Processing Unit"
        ],
        answer: "Central Processing Unit"
    },
    {
        question: "Which language is used for web page structure?",
        options: ["Python", "HTML", "Java", "C++"],
        answer: "HTML"
    },
    {
        question: "Which data structure follows FIFO?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        answer: "Queue"
    },
    {
        question: "Java was developed by which company?",
        options: ["Microsoft", "Google", "Sun Microsystems", "IBM"],
        answer: "Sun Microsystems"
    },
    {
        question: "Single line comment in JavaScript is written using?",
        options: ["//", "<!-- -->", "/* */", "##"],
        answer: "//"
    }
];

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const optionsForm = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");

const quizSection = document.getElementById("quiz-section");
const resultSection = document.getElementById("result-section");
const finalScore = document.getElementById("final-score");
const feedback = document.getElementById("feedback");
const restartBtn = document.getElementById("restartBtn");

// Load Question
function loadQuestion() {
    let q = quizData[currentQuestion];
    questionEl.textContent = q.question;
    optionsForm.innerHTML = "";

    q.options.forEach(option => {
        const label = document.createElement("label");
        label.classList.add("option");

        label.innerHTML = `
            <input type="radio" name="option" value="${option}">
            ${option}
        `;

        optionsForm.appendChild(label);
    });
}

// Next Button Click
nextBtn.addEventListener("click", function() {

    const selected = document.querySelector('input[name="option"]:checked');

    if (!selected) {
        alert("Please select an option");
        return;
    }

    if (selected.value === quizData[currentQuestion].answer) {
        score++;
    }

    currentQuestion++;

    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        showResult();
    }
});

// Show Result
function showResult() {
    quizSection.classList.add("hide");
    resultSection.classList.remove("hide");

    finalScore.textContent = "Your Score: " + score + " / " + quizData.length;

    if (score === quizData.length) {
        feedback.textContent = "Excellent! Perfect Score!";
    } else if (score >= 3) {
        feedback.textContent = "Good Job! Keep Practicing!";
    } else {
        feedback.textContent = "Try Again! You Can Improve!";
    }
}

// Restart Quiz
restartBtn.addEventListener("click", function() {
    currentQuestion = 0;
    score = 0;
    quizSection.classList.remove("hide");
    resultSection.classList.add("hide");
    loadQuestion();
});

// Start Quiz
loadQuestion();
