// API Base URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const addTodoForm = document.getElementById('addTodoForm');
const todoTitle = document.getElementById('todoTitle');
const todoDescription = document.getElementById('todoDescription');
const todoDueDate = document.getElementById('todoDueDate');
const todoPriority = document.getElementById('todoPriority');
const todosList = document.getElementById('todosList');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');
const highPriorityCount = document.getElementById('highPriorityCount');

// State
let todos = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  setupEventListeners();
});

function setupEventListeners() {
  addTodoForm.addEventListener('submit', handleAddTodo);
  filterButtons.forEach(button => {
    button.addEventListener('click', handleFilterChange);
  });
}

// Load todos from backend
async function loadTodos() {
  try {
    const response = await fetch(`${API_URL}/todos`);
    if (!response.ok) throw new Error('Failed to load todos');
    todos = await response.json();
    renderTodos();
    updateCounters();
  } catch (error) {
    console.error('Error loading todos:', error);
    todosList.innerHTML = '<p class="empty-message">Failed to load todos. Please try again.</p>';
  }
}

// Handle add todo form submission
async function handleAddTodo(e) {
  e.preventDefault();

  if (!todoTitle.value.trim()) {
    alert('Please enter a task title');
    return;
  }

  const newTodo = {
    title: todoTitle.value.trim(),
    description: todoDescription.value.trim(),
    dueDate: todoDueDate.value,
    priority: todoPriority.value
  };

  try {
    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo)
    });

    if (!response.ok) throw new Error('Failed to create todo');
    const createdTodo = await response.json();
    todos.push(createdTodo);
    
    // Reset form
    addTodoForm.reset();
    todoPriority.value = 'medium';
    
    renderTodos();
    updateCounters();
  } catch (error) {
    console.error('Error creating todo:', error);
    alert('Failed to create todo. Please try again.');
  }
}

// Handle filter button click
function handleFilterChange(e) {
  const filterBtn = e.target;
  filterButtons.forEach(btn => btn.classList.remove('active'));
  filterBtn.classList.add('active');
  currentFilter = filterBtn.dataset.filter;
  renderTodos();
}

// Render todos based on current filter
function renderTodos() {
  let filteredTodos = todos;

  if (currentFilter === 'pending') {
    filteredTodos = todos.filter(todo => todo.status === 'pending');
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter(todo => todo.status === 'completed');
  } else if (['high', 'medium', 'low'].includes(currentFilter)) {
    filteredTodos = todos.filter(todo => todo.priority === currentFilter);
  }

  if (filteredTodos.length === 0) {
    todosList.innerHTML = '<p class="empty-message">No tasks found. Add one to get started!</p>';
    return;
  }

  todosList.innerHTML = filteredTodos.map(todo => createTodoElement(todo)).join('');
  attachTodoListeners();
}

// Create HTML for a todo item
function createTodoElement(todo) {
  const isCompleted = todo.status === 'completed';
  const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '';

  return `
    <div class="todo-item ${isCompleted ? 'completed' : ''}" data-id="${todo.id}">
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${isCompleted ? 'checked' : ''} 
        data-id="${todo.id}"
      >
      <div class="todo-content">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
        <div class="todo-meta">
          <span class="todo-badge badge-${todo.priority}">${capitalizeFirst(todo.priority)} Priority</span>
          ${dueDate ? `<span class="todo-badge badge-due">📅 ${dueDate}</span>` : ''}
          <span class="todo-badge badge-due">${isCompleted ? '✓ Completed' : 'Pending'}</span>
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn btn-small btn-edit" data-id="${todo.id}">Edit</button>
        <button class="btn btn-small btn-danger" data-id="${todo.id}">Delete</button>
      </div>
    </div>
  `;
}

// Attach event listeners to todo items
function attachTodoListeners() {
  // Checkbox listeners
  document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleTodoToggle);
  });

  // Edit button listeners
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => handleEditTodo(e.target.dataset.id));
  });

  // Delete button listeners
  document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', (e) => handleDeleteTodo(e.target.dataset.id));
  });
}

// Toggle todo completion status
async function handleTodoToggle(e) {
  const todoId = e.target.dataset.id;
  const todo = todos.find(t => t.id == todoId);
  const newStatus = todo.status === 'completed' ? 'pending' : 'completed';

  try {
    const response = await fetch(`${API_URL}/todos/${todoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...todo, status: newStatus })
    });

    if (!response.ok) throw new Error('Failed to update todo');
    
    todo.status = newStatus;
    renderTodos();
    updateCounters();
  } catch (error) {
    console.error('Error updating todo:', error);
    alert('Failed to update todo. Please try again.');
  }
}

// Handle edit todo
async function handleEditTodo(todoId) {
  const todo = todos.find(t => t.id == todoId);
  if (!todo) return;

  const newTitle = prompt('Edit title:', todo.title);
  if (newTitle === null) return; // User cancelled

  if (!newTitle.trim()) {
    alert('Title cannot be empty');
    return;
  }

  const newDescription = prompt('Edit description:', todo.description || '');
  const newDueDate = prompt('Edit due date (YYYY-MM-DD):', todo.dueDate || '');
  const newPriority = prompt('Edit priority (low/medium/high):', todo.priority);

  try {
    const response = await fetch(`${API_URL}/todos/${todoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        description: newDescription.trim(),
        dueDate: newDueDate || null,
        priority: newPriority || 'medium',
        status: todo.status
      })
    });

    if (!response.ok) throw new Error('Failed to update todo');
    
    const updatedTodo = await response.json();
    const index = todos.findIndex(t => t.id == todoId);
    todos[index] = updatedTodo;
    
    renderTodos();
    updateCounters();
  } catch (error) {
    console.error('Error updating todo:', error);
    alert('Failed to update todo. Please try again.');
  }
}

// Handle delete todo
async function handleDeleteTodo(todoId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/todos/${todoId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete todo');
    
    todos = todos.filter(t => t.id != todoId);
    renderTodos();
    updateCounters();
  } catch (error) {
    console.error('Error deleting todo:', error);
    alert('Failed to delete todo. Please try again.');
  }
}

// Update counter displays
function updateCounters() {
  const completed = todos.filter(t => t.status === 'completed').length;
  const pending = todos.filter(t => t.status === 'pending').length;
  const highPriority = todos.filter(t => t.priority === 'high').length;

  totalCount.textContent = todos.length;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
  highPriorityCount.textContent = highPriority;
}

// Utility functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
