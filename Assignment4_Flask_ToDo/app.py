# app.py — Flask To-Do List Application
# Student Name: ______________________
# Roll Number:  ______________________
# Date:         ______________________

from flask import Flask, render_template, request, jsonify, abort
from datetime import datetime

app = Flask(__name__)

# In-memory task store (resets on server restart — intentional)
tasks = []
next_id = 1


# --- Route 1: Serve the main HTML page ---
@app.route('/')
def index():
    """Render the main To-Do page."""
    return render_template('index.html')


# --- Route 2: GET all tasks (with optional ?status filter) ---
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Return all tasks as JSON; supports ?status=active|completed filter."""
    status = request.args.get('status')
    if status == 'active':
        result = [t for t in tasks if not t['completed']]
    elif status == 'completed':
        result = [t for t in tasks if t['completed']]
    else:
        result = tasks
    return jsonify(result), 200


# --- Route 3: POST — create a new task ---
@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Accept JSON body {title, description, priority}, validate and create a task."""
    global next_id
    data = request.get_json()

    if not data or not data.get('title', '').strip():
        return jsonify({'error': 'Title is required'}), 400

    priority = data.get('priority', 'medium')
    if priority not in ('low', 'medium', 'high'):
        priority = 'medium'

    task = {
        'id': next_id,
        'title': data['title'].strip(),
        'description': data.get('description', '').strip(),
        'priority': priority,
        'completed': False,
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    tasks.append(task)
    next_id += 1
    return jsonify(task), 201


# --- Route 4: PUT — update a task by id ---
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Find task by id and update any subset of {title, description, priority, completed}."""
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task is None:
        abort(404)

    data = request.get_json()
    if 'title' in data and data['title'].strip():
        task['title'] = data['title'].strip()
    if 'description' in data:
        task['description'] = data['description'].strip()
    if 'priority' in data and data['priority'] in ('low', 'medium', 'high'):
        task['priority'] = data['priority']
    if 'completed' in data:
        task['completed'] = bool(data['completed'])

    return jsonify(task), 200


# --- Route 5: PATCH — toggle task completion ---
@app.route('/api/tasks/<int:task_id>/toggle', methods=['PATCH'])
def toggle_task(task_id):
    """Toggle the completed field of a task between True and False."""
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task is None:
        abort(404)
    task['completed'] = not task['completed']
    return jsonify(task), 200


# --- Route 6: DELETE — remove a task by id ---
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Remove task with given id from the list; return 204 on success."""
    global tasks
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task is None:
        abort(404)
    tasks = [t for t in tasks if t['id'] != task_id]
    return '', 204


if __name__ == '__main__':
    app.run(debug=True)
