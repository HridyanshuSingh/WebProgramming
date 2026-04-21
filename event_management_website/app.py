# Project Title : Event Management Website
# Student Name  : ___________________________
# Roll Number   : ___________________________
# Date          : ___________________________

from flask import Flask, render_template, request, redirect, url_for, session, flash

app = Flask(__name__)
app.secret_key = "event_mgmt_secret_key_2024"

# ── In-memory data store ──────────────────────────────────────────────────────
events = [
    {
        "id": 1,
        "name": "Tech Summit 2025",
        "date": "2025-08-15",
        "time": "10:00 AM",
        "venue": "Convention Center, Hall A",
        "description": "Annual gathering of technology innovators and industry leaders.",
        "category": "Technology",
        "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
        "rsvp_count": 0,
    },
    {
        "id": 2,
        "name": "Music Fest Live",
        "date": "2025-09-05",
        "time": "06:00 PM",
        "venue": "Open-Air Amphitheatre",
        "description": "An electrifying evening of live performances across multiple genres.",
        "category": "Music",
        "image_url": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400",
        "rsvp_count": 0,
    },
    {
        "id": 3,
        "name": "Business Leadership Forum",
        "date": "2025-09-20",
        "time": "09:00 AM",
        "venue": "Grand Hotel, Banquet Hall",
        "description": "Networking event for entrepreneurs and business executives.",
        "category": "Business",
        "image_url": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400",
        "rsvp_count": 0,
    },
    {
        "id": 4,
        "name": "Art & Design Expo",
        "date": "2025-10-10",
        "time": "11:00 AM",
        "venue": "City Art Gallery",
        "description": "Showcasing contemporary art, design, and digital creativity.",
        "category": "Art",
        "image_url": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400",
        "rsvp_count": 0,
    },
    {
        "id": 5,
        "name": "Health & Wellness Summit",
        "date": "2025-11-02",
        "time": "08:00 AM",
        "venue": "Sports Complex, Main Hall",
        "description": "Expert talks on nutrition, mental health, and physical fitness.",
        "category": "Health",
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        "rsvp_count": 0,
    },
]

registrations = []
next_event_id = 6  # Counter for new event IDs


def get_event_by_id(event_id):
    return next((e for e in events if e["id"] == event_id), None)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Landing page."""
    return render_template("index.html", featured_events=events[:3])


@app.route("/events")
def event_list():
    """All events listing page."""
    return render_template("events.html", events=events)


@app.route("/register", methods=["GET", "POST"])
def register():
    """Event registration form."""
    if request.method == "POST":
        name     = request.form.get("name", "").strip()
        email    = request.form.get("email", "").strip()
        phone    = request.form.get("phone", "").strip()
        event_id = request.form.get("event_id", "").strip()
        tickets  = request.form.get("tickets", "1").strip()

        # Server-side validation
        if not all([name, email, phone, event_id, tickets]):
            flash("All fields are required.", "error")
            return render_template("register.html", events=events)

        # Increment RSVP counter
        ev = get_event_by_id(int(event_id))
        if ev:
            ev["rsvp_count"] += int(tickets)

        registrations.append({
            "name": name, "email": email, "phone": phone,
            "event_id": int(event_id), "tickets": int(tickets),
        })
        flash(f"🎉 Registration successful! Welcome, {name}!", "success")
        return redirect(url_for("event_list"))

    pre_select = request.args.get("event_id")
    return render_template("register.html", events=events, pre_select=pre_select)


# ── Admin ─────────────────────────────────────────────────────────────────────

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        if request.form.get("password") == "admin123":
            session["admin"] = True
            flash("Logged in successfully.", "success")
            return redirect(url_for("admin"))
        flash("Invalid password.", "error")
    return render_template("admin_login.html")


@app.route("/admin/logout")
def admin_logout():
    session.pop("admin", None)
    flash("Logged out.", "success")
    return redirect(url_for("index"))


@app.route("/admin")
def admin():
    if not session.get("admin"):
        flash("Please log in to access the admin panel.", "error")
        return redirect(url_for("admin_login"))
    return render_template("admin.html", events=events, registrations=registrations)


@app.route("/admin/add", methods=["POST"])
def admin_add():
    global next_event_id
    if not session.get("admin"):
        return redirect(url_for("admin_login"))

    events.append({
        "id":          next_event_id,
        "name":        request.form.get("name", "").strip(),
        "date":        request.form.get("date", "").strip(),
        "time":        request.form.get("time", "").strip(),
        "venue":       request.form.get("venue", "").strip(),
        "description": request.form.get("description", "").strip(),
        "category":    request.form.get("category", "General").strip(),
        "image_url":   request.form.get("image_url", "").strip(),
        "rsvp_count":  0,
    })
    next_event_id += 1
    flash("Event added successfully!", "success")
    return redirect(url_for("admin"))


@app.route("/admin/edit/<int:event_id>", methods=["GET", "POST"])
def admin_edit(event_id):
    if not session.get("admin"):
        return redirect(url_for("admin_login"))

    ev = get_event_by_id(event_id)
    if not ev:
        flash("Event not found.", "error")
        return redirect(url_for("admin"))

    if request.method == "POST":
        ev["name"]        = request.form.get("name", ev["name"]).strip()
        ev["date"]        = request.form.get("date", ev["date"]).strip()
        ev["time"]        = request.form.get("time", ev["time"]).strip()
        ev["venue"]       = request.form.get("venue", ev["venue"]).strip()
        ev["description"] = request.form.get("description", ev["description"]).strip()
        ev["category"]    = request.form.get("category", ev["category"]).strip()
        ev["image_url"]   = request.form.get("image_url", ev["image_url"]).strip()
        flash("Event updated successfully!", "success")
        return redirect(url_for("admin"))

    return render_template("admin_edit.html", event=ev)


@app.route("/admin/delete/<int:event_id>")
def admin_delete(event_id):
    if not session.get("admin"):
        return redirect(url_for("admin_login"))

    global events
    events = [e for e in events if e["id"] != event_id]
    flash("Event deleted.", "success")
    return redirect(url_for("admin"))


if __name__ == "__main__":
    app.run(debug=True)
