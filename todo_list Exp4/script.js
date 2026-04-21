// Get elements from HTML
let taskInput = document.getElementById("taskInput");
let taskList = document.getElementById("taskList");
let taskCounter = document.getElementById("taskCounter");

// Add Task Function
function addTask() {

    let taskText = taskInput.value.trim();

    // Prevent empty task
    if (taskText == "") {
        alert("Please enter a task!");
        return;
    }

    // Create list item
    let li = document.createElement("li");

    // Create checkbox
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    // Task text
    let span = document.createElement("span");
    span.textContent = taskText;

    // When checkbox is clicked
    checkbox.onchange = function () {
        span.classList.toggle("completed");
        updateCounter();
    };

    // Edit button
    let editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = function () {
        let newText = prompt("Edit your task:", span.textContent);
        if (newText !== null && newText.trim() !== "") {
            span.textContent = newText;
        }
    };

    // Delete button
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = function () {
        taskList.removeChild(li);
        updateCounter();
    };

    // Button container
    let buttonDiv = document.createElement("div");
    buttonDiv.className = "task-buttons";
    buttonDiv.appendChild(editBtn);
    buttonDiv.appendChild(deleteBtn);

    // Append elements to list item
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(buttonDiv);

    // Add to task list
    taskList.appendChild(li);

    // Clear input
    taskInput.value = "";

    updateCounter();
}

// Update Task Counter
function updateCounter() {
    let totalTasks = taskList.children.length;
    let completedTasks = document.querySelectorAll(".completed").length;
    let pendingTasks = totalTasks - completedTasks;

    taskCounter.textContent =
        "Pending: " + pendingTasks + " | Completed: " + completedTasks;
}