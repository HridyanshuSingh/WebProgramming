# ============================================================
# Project Title : Contact Management System
# Description   : A Flask-based CRUD web app to manage contacts
# Author        : [Your Name]
# Date          : April 2026
# ============================================================

from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# ── In-memory contact store ──────────────────────────────────
# Each contact is a dict: {id, name, phone, email}
contacts = [
    {"id": 1, "name": "Alice Johnson",  "phone": "9876543210", "email": "alice@example.com"},
    {"id": 2, "name": "Bob Williams",   "phone": "9123456780", "email": "bob@example.com"},
    {"id": 3, "name": "Carol Martinez", "phone": "9001122334", "email": "carol@example.com"},
]
next_id = 4   # Auto-incrementing ID counter


# ── Helper ───────────────────────────────────────────────────
def find_contact(contact_id):
    """Return the contact dict matching `contact_id`, or None."""
    return next((c for c in contacts if c["id"] == contact_id), None)


# ── Routes ───────────────────────────────────────────────────

@app.route("/")
def index():
    """Home page – list all contacts (with optional search)."""
    query = request.args.get("q", "").strip().lower()
    if query:
        results = [
            c for c in contacts
            if query in c["name"].lower() or query in c["phone"]
        ]
    else:
        results = contacts
    return render_template("index.html", contacts=results, query=query)


@app.route("/add", methods=["GET", "POST"])
def add_contact():
    """Add a new contact."""
    global next_id
    error = None

    if request.method == "POST":
        name  = request.form.get("name",  "").strip()
        phone = request.form.get("phone", "").strip()
        email = request.form.get("email", "").strip()

        # Basic validation
        if not name or not phone or not email:
            error = "All fields are required."
        elif not phone.isdigit() or len(phone) < 7:
            error = "Phone must contain only digits (min 7)."
        else:
            contacts.append({"id": next_id, "name": name,
                              "phone": phone, "email": email})
            next_id += 1
            return redirect(url_for("index"))

    return render_template("add_contact.html", error=error)


@app.route("/edit/<int:contact_id>", methods=["GET", "POST"])
def edit_contact(contact_id):
    """Edit an existing contact."""
    contact = find_contact(contact_id)
    if contact is None:
        return redirect(url_for("index"))

    error = None
    if request.method == "POST":
        name  = request.form.get("name",  "").strip()
        phone = request.form.get("phone", "").strip()
        email = request.form.get("email", "").strip()

        if not name or not phone or not email:
            error = "All fields are required."
        elif not phone.isdigit() or len(phone) < 7:
            error = "Phone must contain only digits (min 7)."
        else:
            contact["name"]  = name
            contact["phone"] = phone
            contact["email"] = email
            return redirect(url_for("index"))

    return render_template("edit_contact.html", contact=contact, error=error)


@app.route("/delete/<int:contact_id>", methods=["POST"])
def delete_contact(contact_id):
    """Delete a contact by ID."""
    global contacts
    contacts = [c for c in contacts if c["id"] != contact_id]
    return redirect(url_for("index"))


# ── Entry point ──────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True)
