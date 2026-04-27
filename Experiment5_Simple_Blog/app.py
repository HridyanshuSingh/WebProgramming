# ============================================================
# Project Title : Simple Blog Platform (Experiment-5)
# Author        : Student
# Date          : 2026
# Description   : A Flask-based CRUD blog application
#                 without a database — posts stored in memory.
# ============================================================

from flask import Flask, render_template, request, redirect, url_for

# ------------------------------------
# App Initialization
# ------------------------------------
app = Flask(__name__)

# ------------------------------------
# In-memory post storage
# Each post is a dict: {id, title, content}
# ------------------------------------
posts = [
    {
        "id": 1,
        "title": "Welcome to Simple Blog",
        "content": "This is a demo post. Use the navigation above to create, edit, or delete posts. Enjoy your blogging journey!"
    },
    {
        "id": 2,
        "title": "Flask is Fantastic",
        "content": "Flask is a lightweight WSGI web framework written in Python. It is designed to make getting started quick and easy, with the ability to scale up to complex applications."
    }
]

# Auto-increment counter for unique post IDs
next_id = 3


# ============================================================
# READ  –  Home page: list all posts
# ============================================================
@app.route("/")
def index():
    """Display all blog posts on the home page."""
    return render_template("index.html", posts=posts)


# ============================================================
# CREATE  –  New post form + submission
# ============================================================
@app.route("/create", methods=["GET", "POST"])
def create():
    """
    GET  → show the blank create-post form.
    POST → validate and save the new post, then redirect home.
    """
    global next_id

    if request.method == "POST":
        title   = request.form.get("title", "").strip()
        content = request.form.get("content", "").strip()

        # Basic validation
        if title and content:
            new_post = {
                "id":      next_id,
                "title":   title,
                "content": content
            }
            posts.append(new_post)
            next_id += 1
            return redirect(url_for("index"))

    return render_template("create.html")


# ============================================================
# UPDATE  –  Edit existing post
# ============================================================
@app.route("/edit/<int:post_id>", methods=["GET", "POST"])
def edit(post_id):
    """
    GET  → pre-fill form with the existing post data.
    POST → update the post fields in-place, then redirect home.
    """
    # Find the post by id
    post = next((p for p in posts if p["id"] == post_id), None)

    if post is None:
        return redirect(url_for("index"))   # Post not found — go home

    if request.method == "POST":
        title   = request.form.get("title", "").strip()
        content = request.form.get("content", "").strip()

        if title and content:
            post["title"]   = title
            post["content"] = content
            return redirect(url_for("index"))

    return render_template("edit.html", post=post)


# ============================================================
# DELETE  –  Remove a post by id
# ============================================================
@app.route("/delete/<int:post_id>")
def delete(post_id):
    """Remove the post with the given id and redirect to home."""
    global posts
    posts = [p for p in posts if p["id"] != post_id]
    return redirect(url_for("index"))


# ============================================================
# Entry point
# ============================================================
if __name__ == "__main__":
    app.run(debug=True)
