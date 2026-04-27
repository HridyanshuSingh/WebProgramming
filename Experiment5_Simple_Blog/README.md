# Simple Blog — Experiment 5

A lightweight CRUD blog platform built with **Python / Flask**.  
No database required — posts are stored in an in-memory list.

---

## Project Structure

```
simple_blog/
├── app.py                  # Flask application & routes
├── templates/
│   ├── base.html           # Shared layout (header, nav, footer)
│   ├── index.html          # Home page — list all posts
│   ├── create.html         # Create new post form
│   └── edit.html           # Edit existing post form
├── static/
│   └── style.css           # Editorial-themed stylesheet
└── README.md
```

---

## Setup & Run

```bash
# 1. (Optional) Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 2. Install Flask
pip install flask

# 3. Run the development server
python app.py
```

Open your browser at **http://127.0.0.1:5000**

---

## Features

| Operation | Route | Method |
|-----------|-------|--------|
| List all posts | `/` | GET |
| Create post form | `/create` | GET |
| Save new post | `/create` | POST |
| Edit post form | `/edit/<id>` | GET |
| Save edited post | `/edit/<id>` | POST |
| Delete post | `/delete/<id>` | GET |

---

## External References

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Jinja2 Templating](https://jinja.palletsprojects.com/)
- [Google Fonts — Playfair Display & Source Serif 4](https://fonts.google.com/)

---

*All code is original work written for Experiment 5.*
