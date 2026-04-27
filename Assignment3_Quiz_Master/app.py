from flask import Flask, render_template, request, session, redirect, url_for
import random

app = Flask(__name__)
app.secret_key = 'quiz_master_secret_key_2024'

# Quiz questions data
QUESTIONS = [
    # --- Technical ---
    {
        "id": 1,
        "question": "What does HTML stand for?",
        "options": [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"
        ],
        "answer": "Hyper Text Markup Language"
    },
    {
        "id": 2,
        "question": "Which Python framework is used to build web applications?",
        "options": ["Django", "NumPy", "Pandas", "Matplotlib"],
        "answer": "Django"
    },
    {
        "id": 3,
        "question": "What does CSS stand for?",
        "options": [
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Creative Style System",
            "Colorful Style Sheets"
        ],
        "answer": "Cascading Style Sheets"
    },
    {
        "id": 4,
        "question": "Which HTTP method is used to submit form data to a server?",
        "options": ["GET", "POST", "PUT", "DELETE"],
        "answer": "POST"
    },
    {
        "id": 5,
        "question": "What is Flask?",
        "options": [
            "A micro web framework for Python",
            "A JavaScript library",
            "A database management system",
            "A CSS framework"
        ],
        "answer": "A micro web framework for Python"
    },
    {
        "id": 6,
        "question": "Which tag is used to create a hyperlink in HTML?",
        "options": ["<link>", "<href>", "<a>", "<url>"],
        "answer": "<a>"
    },
    {
        "id": 7,
        "question": "In Python, which keyword is used to define a function?",
        "options": ["function", "def", "func", "define"],
        "answer": "def"
    },
    {
        "id": 8,
        "question": "What does JSON stand for?",
        "options": [
            "JavaScript Object Notation",
            "Java Synchronized Object Network",
            "JavaScript Ordered Names",
            "Java Simple Object Notation"
        ],
        "answer": "JavaScript Object Notation"
    },
    {
        "id": 9,
        "question": "Which symbol is used for single-line comments in Python?",
        "options": ["//", "#", "/*", "--"],
        "answer": "#"
    },
    {
        "id": 10,
        "question": "What does SQL stand for?",
        "options": [
            "Structured Query Language",
            "Simple Question Language",
            "Standard Query Logic",
            "System Query List"
        ],
        "answer": "Structured Query Language"
    },
    # --- General Knowledge ---
    {
        "id": 11,
        "question": "Which planet is known as the Red Planet?",
        "options": ["Venus", "Mars", "Jupiter", "Saturn"],
        "answer": "Mars"
    },
    {
        "id": 12,
        "question": "Who painted the Mona Lisa?",
        "options": ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        "answer": "Leonardo da Vinci"
    },
    {
        "id": 13,
        "question": "What is the capital city of Japan?",
        "options": ["Beijing", "Seoul", "Tokyo", "Bangkok"],
        "answer": "Tokyo"
    },
    {
        "id": 14,
        "question": "How many continents are there on Earth?",
        "options": ["5", "6", "7", "8"],
        "answer": "7"
    },
    {
        "id": 15,
        "question": "Which is the largest ocean in the world?",
        "options": ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        "answer": "Pacific Ocean"
    },
    {
        "id": 16,
        "question": "What is the chemical symbol for Gold?",
        "options": ["Go", "Gd", "Au", "Ag"],
        "answer": "Au"
    },
    {
        "id": 17,
        "question": "Which country is home to the Great Wall?",
        "options": ["Japan", "India", "China", "Mongolia"],
        "answer": "China"
    },
    {
        "id": 18,
        "question": "How many sides does a hexagon have?",
        "options": ["5", "6", "7", "8"],
        "answer": "6"
    },
    {
        "id": 19,
        "question": "What is the fastest land animal?",
        "options": ["Lion", "Horse", "Cheetah", "Leopard"],
        "answer": "Cheetah"
    },
    {
        "id": 20,
        "question": "Which gas do plants absorb from the atmosphere during photosynthesis?",
        "options": ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        "answer": "Carbon Dioxide"
    }
]

def get_feedback(score, total):
    percentage = (score / total) * 100
    if percentage == 100:
        return "🏆 Perfect Score! Outstanding!", "perfect"
    elif percentage >= 75:
        return "🌟 Excellent! Great job!", "excellent"
    elif percentage >= 50:
        return "👍 Good effort! Keep practicing!", "good"
    elif percentage >= 25:
        return "📚 Keep studying, you'll get there!", "average"
    else:
        return "💪 Don't give up! Review the material and try again.", "poor"

@app.route('/')
def home():
    session.clear()
    return render_template('index.html')

@app.route('/quiz', methods=['GET', 'POST'])
def quiz():
    if request.method == 'GET':
        # Shuffle and select questions for this session
        questions = random.sample(QUESTIONS, min(10, len(QUESTIONS)))
        session['questions'] = questions
        session['start_time'] = None
        return render_template('quiz.html', questions=questions, total=len(questions))

    # POST: process form submission
    questions = session.get('questions', [])
    score = 0
    results = []

    for q in questions:
        qid = str(q['id'])
        user_answer = request.form.get(f'q{qid}', None)
        correct = q['answer']
        is_correct = user_answer == correct
        if is_correct:
            score += 1
        results.append({
            'question': q['question'],
            'user_answer': user_answer if user_answer else "Not answered",
            'correct_answer': correct,
            'is_correct': is_correct
        })

    total = len(questions)
    feedback, feedback_class = get_feedback(score, total)

    session['score'] = score
    session['total'] = total
    session['results'] = results
    session['feedback'] = feedback
    session['feedback_class'] = feedback_class

    return redirect(url_for('result'))

@app.route('/result')
def result():
    score = session.get('score', 0)
    total = session.get('total', 0)
    results = session.get('results', [])
    feedback = session.get('feedback', '')
    feedback_class = session.get('feedback_class', '')
    return render_template('result.html',
                           score=score,
                           total=total,
                           results=results,
                           feedback=feedback,
                           feedback_class=feedback_class)

if __name__ == '__main__':
    app.run(debug=True)
