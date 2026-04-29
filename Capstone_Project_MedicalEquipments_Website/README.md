# ⚕ MediEquip Pro — Medical Equipment Website

A complete full-stack Flask web application for hospital-grade medical equipment
supply management. Built with Python, Flask, SQLite, and vanilla JS.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Application
```bash
python app.py
```

### 4. Open in Browser
```
http://127.0.0.1:5000
```

---

## 🔑 Default Admin Login

| Field    | Value                    |
|----------|--------------------------|
| Email    | admin@mediequip.com      |
| Password | admin123                 |
| URL      | http://127.0.0.1:5000/admin |

---

## 📁 Project Structure

```
medequip/
│
├── app.py                  # Main Flask app — routes, auth, API
├── chatbot.py              # NLP chatbot logic & recommendations
├── requirements.txt        # Python dependencies
│
├── models/
│   ├── __init__.py
│   └── database.py         # SQLAlchemy ORM models
│
├── templates/
│   ├── base.html           # Master layout (navbar, footer, chatbot)
│   ├── index.html          # Homepage
│   ├── products.html       # Product listing with search/filter
│   ├── product_detail.html # Single product page
│   ├── contact.html        # Inquiry/quote form
│   ├── about.html          # About page
│   ├── login.html          # Login form
│   ├── signup.html         # Registration form
│   └── admin/
│       ├── dashboard.html  # Admin overview
│       ├── inquiries.html  # View/delete inquiries
│       ├── users.html      # View users
│       ├── products.html   # Manage products
│       └── product_form.html # Add/Edit product form
│
└── static/
    ├── css/
    │   └── style.css       # Full medical-themed stylesheet
    └── js/
        └── main.js         # Chatbot UI + interactions
```

---

## 🗄 Database Tables

| Table        | Description                                      |
|--------------|--------------------------------------------------|
| `users`      | Registered users + admin accounts (hashed passwords) |
| `products`   | Medical equipment catalog with specs             |
| `inquiries`  | Quote requests submitted via contact form        |
| `chat_logs`  | Chatbot conversation history                     |

---

## ✨ Features

- **Product Catalog** — MRI, CT Scan, Ventilator, X-Ray, Ultrasound, Patient Monitor
- **Search & Filter** — By name, description, tags, or category
- **Inquiry System** — Quote request form stored in DB
- **User Auth** — Signup/login with hashed passwords
- **Admin Dashboard** — Full CRUD for products, view inquiries & users
- **AI Chatbot** — Keyword NLP answering medical equipment queries
- **Smart Recommendations** — Suggests equipment by department (ICU → Ventilator)
- **Responsive Design** — Mobile-friendly medical blue/white theme

---

## 🤖 Chatbot Example Queries

| User Types              | Bot Responds About          |
|-------------------------|-----------------------------|
| "What is MRI?"          | MRI Machine details         |
| "Tell me about CT scan" | CT Scanner information      |
| "ICU equipment"         | Ventilator + Monitor (recs) |
| "Do you have ventilators?" | Ventilator details       |
| "Price / Quote"         | Explains quote-only policy  |
| "Installation support?" | Installation & AMC details  |

---

## 🛡 Security Notes

- Passwords hashed with `werkzeug.security.generate_password_hash`
- Admin routes protected by `@admin_required` decorator
- Session-based authentication with Flask sessions
- **For production:** Set `SECRET_KEY` as environment variable,
  use HTTPS, and switch to PostgreSQL

---

## 📦 Dependencies

| Package           | Version | Purpose                        |
|-------------------|---------|--------------------------------|
| Flask             | 3.0.0   | Web framework                  |
| Flask-SQLAlchemy  | 3.1.1   | ORM / database layer           |
| Werkzeug          | 3.0.1   | Password hashing, WSGI utils   |

---

## 👨‍💻 Development Notes

- Database file: `instance/medequip.db` (auto-created on first run)
- Debug mode is ON by default — disable in production
- Chatbot uses pure Python keyword matching — no external AI API needed
- Product images use emoji placeholders — replace with real images in `static/images/`
