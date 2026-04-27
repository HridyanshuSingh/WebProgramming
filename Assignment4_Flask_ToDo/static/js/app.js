// app.js — Flask To-Do List — All JavaScript & Fetch logic
// Student Name: ______________________
// Roll Number:  ______________________
// Date:         ______________________

'use strict';

// ─── State ──────────────────────────────────────────────────────────────────
let currentFilter = 'all';   // tracks which filter button is active

// ─── DOM References ─────────────────────────────────────────────────────────
const taskList      = document.getElementById('task-list');
const titleInput    = document.getElementById('task-title');
const descInput     = document.getElementById('task-description');
const priorityInput = document.getElementById('task-priority');
const titleError    = document.getElementById('title-error');
const globalError   = document.getElementById('global-error');
const navCount      = document.getElementById('nav-task-count');

// ─── Utility: show / hide error messages ────────────────────────────────────
function showGlobalError(msg) {
  globalError.textContent = msg;
  globalError.style.display = 'block';
  setTimeout(() => { globalError.style.display = 'none'; }, 4000);
}

// ─── 1. loadTasks() — fetch and render all (or filtered) tasks ──────────────
async function loadTasks(filter = currentFilter) {
  const url = filter === 'all' ? '/api/tasks' : `/api/tasks?status=${filter}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const tasks = await res.json();
    renderTasks(tasks);
    await updateCounter();
  } catch (err) {
    showGlobalError('Could not load tasks. Is the Flask server running?');
    console.error(err);
  }
}

// ─── 2. renderTasks() — build DOM cards from task array ─────────────────────
function renderTasks(tasks) {
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p>🎉 No tasks yet! Add your first task above.</p>
      </div>`;
    return;
  }
  taskList.innerHTML = tasks.map(buildTaskCard).join('');
}

// ─── 3. buildTaskCard() — return HTML string for one task ───────────────────
function buildTaskCard(task) {
  const completedClass = task.completed ? 'completed' : '';
  const checkedAttr    = task.completed ? 'checked' : '';
  return `
    <div class="task-card ${completedClass} fade-in" data-id="${task.id}" id="card-${task.id}">
      <div class="card-left">
        <input type="checkbox" class="task-checkbox" ${checkedAttr}
               onchange="toggleTask(${task.id})" title="Mark complete" />
      </div>
      <div class="card-body">
        <div class="card-header">
          <span class="task-title">${escapeHtml(task.title)}</span>
          <span class="badge priority-${task.priority}">${task.priority}</span>
        </div>
        ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        <small class="task-date">Added: ${task.created_at}</small>
      </div>
      <div class="card-actions">
        <button class="btn btn-edit"   onclick="editTask(${task.id})">✏️ Edit</button>
        <button class="btn btn-delete" onclick="deleteTask(${task.id})">🗑️ Delete</button>
      </div>
    </div>`;
}

// ─── 4. addTask() — validate and POST a new task ────────────────────────────
async function addTask() {
  const title       = titleInput.value.trim();
  const description = descInput.value.trim();
  const priority    = priorityInput.value;

  // Client-side validation — no fetch sent for empty title
  if (!title) {
    titleError.textContent = '⚠️ Title cannot be empty.';
    titleInput.focus();
    return;
  }
  titleError.textContent = '';

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Clear inputs on success
    titleInput.value    = '';
    descInput.value     = '';
    priorityInput.value = 'medium';

    await loadTasks();
  } catch (err) {
    showGlobalError('Failed to add task. Please try again.');
    console.error(err);
  }
}

// ─── 5. deleteTask() — send DELETE and remove card from DOM ─────────────────
async function deleteTask(id) {
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.status !== 204) throw new Error(`HTTP ${res.status}`);

    // Animate card out, then remove
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.classList.add('slide-out');
      card.addEventListener('animationend', () => {
        card.remove();
        updateCounter();
        checkEmptyState();
      }, { once: true });
    }
  } catch (err) {
    showGlobalError('Failed to delete task.');
    console.error(err);
  }
}

// ─── 6. toggleTask() — PATCH toggle and update card CSS ─────────────────────
async function toggleTask(id) {
  try {
    const res = await fetch(`/api/tasks/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const task = await res.json();

    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.classList.toggle('completed', task.completed);
      const cb = card.querySelector('.task-checkbox');
      if (cb) cb.checked = task.completed;
    }
    await updateCounter();
  } catch (err) {
    showGlobalError('Failed to update task.');
    console.error(err);
  }
}

// ─── 7. editTask() — inline editing with PUT on Save ────────────────────────
async function editTask(id) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;

  // Grab current values from the card
  const currentTitle = card.querySelector('.task-title').textContent;
  const currentDesc  = card.querySelector('.task-desc')  ? card.querySelector('.task-desc').textContent : '';
  const currentBadge = card.querySelector('.badge').className.replace('badge priority-', '');

  // Replace card body with editable inputs
  card.querySelector('.card-body').innerHTML = `
    <div class="edit-form">
      <input  type="text"  class="edit-title" value="${escapeHtml(currentTitle)}" placeholder="Title" />
      <textarea class="edit-desc" rows="2">${escapeHtml(currentDesc)}</textarea>
      <select class="edit-priority">
        <option value="low"    ${currentBadge === 'low'    ? 'selected' : ''}>🟢 Low</option>
        <option value="medium" ${currentBadge === 'medium' ? 'selected' : ''}>🟠 Medium</option>
        <option value="high"   ${currentBadge === 'high'   ? 'selected' : ''}>🔴 High</option>
      </select>
    </div>`;

  // Replace action buttons
  card.querySelector('.card-actions').innerHTML = `
    <button class="btn btn-save"   onclick="saveTask(${id})">💾 Save</button>
    <button class="btn btn-cancel" onclick="loadTasks()">✖ Cancel</button>`;
}

// ─── 8. saveTask() — PUT updated values ─────────────────────────────────────
async function saveTask(id) {
  const card  = document.getElementById(`card-${id}`);
  const title    = card.querySelector('.edit-title').value.trim();
  const desc     = card.querySelector('.edit-desc').value.trim();
  const priority = card.querySelector('.edit-priority').value;

  if (!title) {
    showGlobalError('Title cannot be empty.');
    return;
  }
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc, priority })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadTasks();
  } catch (err) {
    showGlobalError('Failed to save task.');
    console.error(err);
  }
}

// ─── 9. filterTasks() — highlight active button & reload ────────────────────
function filterTasks(filter) {
  currentFilter = filter;
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  loadTasks(filter);
}

// ─── 10. updateCounter() — recalculate counts from server ───────────────────
async function updateCounter() {
  try {
    const res   = await fetch('/api/tasks');
    if (!res.ok) return;
    const tasks = await res.json();
    const total     = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active    = total - completed;

    document.getElementById('count-total').textContent     = total;
    document.getElementById('count-active').textContent    = active;
    document.getElementById('count-completed').textContent = completed;
    navCount.textContent = `${total} task${total !== 1 ? 's' : ''}`;
  } catch (err) {
    console.error('Counter update failed:', err);
  }
}

// ─── 11. checkEmptyState() — show friendly message when list is empty ────────
function checkEmptyState() {
  if (taskList.querySelectorAll('.task-card').length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p>🎉 No tasks yet! Add your first task above.</p>
      </div>`;
  }
}

// ─── 12. escapeHtml() — prevent XSS in task titles/descriptions ─────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Wire up Add Task button & Enter key ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-task-btn').addEventListener('click', addTask);
  titleInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
  loadTasks();
});
