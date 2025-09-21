if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "index.html";
}

document.getElementById("user").textContent = localStorage.getItem("username");

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  window.location.href = "index.html";
});

let tasks;
let apiTasks = [];

try {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (e) {
  tasks = [];
}

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const apiTaskList = document.getElementById("apiTaskList");
const taskError = document.getElementById("taskError");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showError(message) {
  taskError.textContent = message;
  setTimeout(() => {
    taskError.textContent = "";
  }, 3000);
}

function validateText(text, excludeId = null) {
  const trimmed = text.trim();
  
  if (!trimmed) {
    showError("El texto de la tarea no puede estar vacío.");
    return false;
  }
  
  if (/^\d+$/.test(trimmed)) {
    showError("La tarea no puede contener solo números.");
    return false;
  }
  
  if (trimmed.length < 10) {
    showError("La tarea debe tener al menos 10 caracteres.");
    return false;
  }
  
  const exists = tasks.some(task => 
    task.text.toLowerCase() === trimmed.toLowerCase() && task.id !== excludeId
  );
  
  if (exists) {
    showError("Ya existe una tarea con el mismo texto.");
    return false;
  }
  
  return true;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function createTaskElement(task, isApiTask = false) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  if (task.done) li.classList.add("done");
  li.dataset.id = task.id;

  const taskContent = document.createElement("div");
  taskContent.classList.add("task-content");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.classList.add("task-checkbox");
  checkbox.disabled = isApiTask;
  
  if (!isApiTask) {
    checkbox.addEventListener("change", () => {
      const t = tasks.find(tt => tt.id === task.id);
      if (t) {
        t.done = checkbox.checked;
        t.updatedAt = Date.now();
        saveTasks();
        li.classList.toggle("done");
      }
    });
  }

  const textSpan = document.createElement("span");
  textSpan.classList.add("task-text");
  textSpan.textContent = task.text;

  taskContent.appendChild(checkbox);
  taskContent.appendChild(textSpan);

  const taskMeta = document.createElement("div");
  taskMeta.classList.add("task-meta");
  
  const dates = document.createElement("small");
  dates.classList.add("dates");
  dates.textContent = `Creada: ${formatDate(task.createdAt)}`;
  if (task.updatedAt !== task.createdAt) {
    dates.textContent += ` | Actualizada: ${formatDate(task.updatedAt)}`;
  }
  taskMeta.appendChild(dates);

  if (!isApiTask) {
    const actions = document.createElement("div");
    actions.classList.add("actions");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.classList.add("edit");
    editBtn.addEventListener("click", () => editTask(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.classList.add("delete");
    deleteBtn.addEventListener("click", () => {
      if (confirm("¿Estás seguro de eliminar esta tarea?")) {
        tasks = tasks.filter(tt => tt.id !== task.id);
        saveTasks();
        renderTasks();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    taskMeta.appendChild(actions);
  }

  li.appendChild(taskContent);
  li.appendChild(taskMeta);

  return li;
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const li = document.querySelector(`[data-id="${id}"]`);
  const textSpan = li.querySelector(".task-text");
  
  const input = document.createElement("input");
  input.type = "text";
  input.value = task.text;
  input.classList.add("edit-input");
  
  textSpan.replaceWith(input);
  input.focus();
  input.select();

  const saveEdit = () => {
    const newText = input.value;
    if (validateText(newText, id)) {
      task.text = newText.trim();
      task.updatedAt = Date.now();
      saveTasks();
      renderTasks();
    } else {
      input.replaceWith(textSpan);
    }
  };

  input.addEventListener("blur", saveEdit);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      input.replaceWith(textSpan);
    }
  });
}

function renderTasks() {
  const sortedTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt);
  
  taskList.innerHTML = "";
  if (sortedTasks.length === 0) {
    taskList.innerHTML = '<li class="empty-state">No hay tareas creadas</li>';
  } else {
    sortedTasks.forEach(task => {
      taskList.appendChild(createTaskElement(task, false));
    });
  }
}

function renderApiTasks() {
  apiTaskList.innerHTML = "";
  if (apiTasks.length === 0) {
    apiTaskList.innerHTML = '<li class="empty-state">No hay tareas de la API</li>';
  } else {
    apiTasks.forEach(task => {
      apiTaskList.appendChild(createTaskElement(task, true));
    });
  }
}

taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const textVal = taskInput.value.trim();

  if (validateText(textVal)) {
    const newTask = {
      id: Date.now(),
      text: textVal,
      done: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
    taskError.textContent = "";
  }
});

async function loadApiTasks() {
  try {
    const response = await fetch("https://dummyjson.com/c/28e8-a101-4223-a35c");
    if (response.ok) {
      const data = await response.json();
      apiTasks = data.sort((a, b) => b.createdAt - a.createdAt);
      renderApiTasks();
    }
  } catch (error) {
    console.error("Error al cargar tareas de la API:", error);
    apiTaskList.innerHTML = '<li class="empty-state error">Error al cargar tareas de la API</li>';
  }
}

renderTasks();
loadApiTasks();