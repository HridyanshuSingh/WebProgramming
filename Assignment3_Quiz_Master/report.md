# Quiz Master Application — Short Report

**Student Assignment: Web Programming with Python and JavaScript Lab**  
**Assignment 3: Full-Stack Quiz Master Application**

---

## 1. Objective
To design and develop a full-stack quiz web application using HTML, CSS, Python, and Flask that demonstrates integration of frontend and backend technologies.

---

## 2. Project Structure

```
quiz_master/
├── app.py               # Flask backend — routes and logic
├── requirements.txt     # Python dependencies
├── templates/
│   ├── index.html       # Home page
│   ├── quiz.html        # Quiz page (MCQs with timer)
│   └── result.html      # Score and feedback page
└── static/
    └── style.css        # Complete UI styling
```

---

## 3. Technologies Used

| Layer    | Technology        |
|----------|-------------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend  | Python 3, Flask   |
| Templating | Jinja2 (Flask)  |

---

## 4. Features Implemented

### Mandatory Features
- ✅ Flask working application with proper routing
- ✅ Minimum 5 questions (8 total, 5 randomly selected per session)
- ✅ Three proper UI pages: Home, Quiz, Result
- ✅ Score calculation logic in Python
- ✅ Feedback messages based on performance percentage

### Bonus Features
- ✅ **Restart quiz** — button on result page returns to quiz with reshuffled questions
- ✅ **Timer** — 10-minute countdown; auto-submits when time runs out
- ✅ **Shuffle questions** — `random.sample()` selects 5 of 8 questions in random order each attempt

---

## 5. Application Flow

1. User visits `/` → Home page with quiz info
2. User clicks "Start Quiz" → GET `/quiz` → Flask shuffles questions, stores in session
3. User answers MCQs → POST `/quiz` → Flask compares answers, calculates score
4. Flask redirects to `/result` → Shows score ring, feedback, and per-question review

---

## 6. Score Feedback Logic

| Score %    | Feedback Message               |
|------------|-------------------------------|
| 100%       | 🏆 Perfect Score! Outstanding! |
| 75–99%     | 🌟 Excellent! Great job!        |
| 50–74%     | 👍 Good effort! Keep practicing! |
| 25–49%     | 📚 Keep studying, you'll get there! |
| 0–24%      | 💪 Don't give up! Review and retry. |

---

## 7. How to Run

```bash
pip install flask
cd quiz_master
python app.py
```
Open browser at: `http://127.0.0.1:5000`

---

## 8. Conclusion
The Quiz Master application successfully demonstrates full-stack web development by combining Flask routing, Jinja2 templating, Python session management, and CSS-styled frontend pages into a cohesive, interactive quiz experience.
