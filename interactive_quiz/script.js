const questions = [
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: "4"
    },
    {
        question: "Capital of India?",
        options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
        answer: "Delhi"
    },
    {
        question: "Which is a programming language?",
        options: ["HTML", "CSS", "JavaScript", "Photoshop"],
        answer: "JavaScript"
    }
];

let currentQuestion = 0;
let score = 0;
let selected = null;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const resultEl = document.getElementById("result");

function loadQuestion() {
    selected = null;
    let q = questions[currentQuestion];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";

    q.options.forEach(option => {
        let btn = document.createElement("div");
        btn.textContent = option;
        btn.classList.add("option");

        btn.onclick = () => {
            selected = option;
        };

        optionsEl.appendChild(btn);
    });
}

nextBtn.onclick = function () {
    if (selected === questions[currentQuestion].answer) {
        score++;
    }

    currentQuestion++;

    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
};

function showResult() {
    questionEl.textContent = "Quiz Completed!";
    optionsEl.innerHTML = "";
    nextBtn.style.display = "none";

    resultEl.textContent = "Your Score: " + score + " / " + questions.length;
}

loadQuestion();