// ✅ Verificar autenticación
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

document.getElementById("user").textContent = localStorage.getItem("username");

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  window.location.href = "login.html"; // 🔑 redirigir
});

let tasks;
try {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (e) {
  tasks = [];
}

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.dataset.id = task.id;

    const row = document.createElement("div");
    row.classList.add("task-row");

    const text = document.createElement("span");
    text.textContent = task.text;
    if (task.done) text.classList.add("done");

    const actions = document.createElement("div");
    actions.classList.add("actions");

    // ✅ Marcar / Desmarcar
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = task.done ? "Desmarcar" : "Hecha";
    toggleBtn.classList.add("toggle");
    toggleBtn.addEventListener("click", () => {
      const t = tasks.find(tt => tt.id === task.id);
      if (!t) return;
      t.done = !t.done;
      t.updatedAt = Date.now();
      saveTasks();
      renderTasks();
    });

    // ✅ Editar
    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.classList.add("edit");
    editBtn.addEventListener("click", () => {
      const newText = prompt("Editar tarea:", task.text);
      if (newText !== null) {
        const trimmed = newText.trim();
        if (trimmed.length === 0) {
          alert("❌ El texto de la tarea no puede estar vacío.");
          return;
        }
        if (trimmed.length < 10) {
          alert("❌ La tarea debe tener al menos 10 caracteres.");
          return;
        }
        // 🚫 Verificar duplicados (ignora la tarea actual)
        const exists = tasks.some(tt => tt.text.toLowerCase() === trimmed.toLowerCase() && tt.id !== task.id);
        if (exists) {
          alert("❌ Ya existe una tarea con el mismo texto.");
          return;
        }

        const t = tasks.find(tt => tt.id === task.id);
        if (!t) return;
        t.text = trimmed;
        t.updatedAt = Date.now();
        saveTasks();
        renderTasks();
      }
    });

    // ✅ Eliminar
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.classList.add("delete");
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(tt => tt.id !== task.id);
      saveTasks();
      renderTasks();
    });

    actions.appendChild(toggleBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(text);
    row.appendChild(actions);

    // ✅ Fechas
    const dates = document.createElement("small");
    dates.classList.add("dates");
    const createdDate = new Date(task.createdAt).toLocaleString();
    const updatedDate = new Date(task.updatedAt).toLocaleString();
    if (task.createdAt === task.updatedAt) {
      dates.textContent = `Creada: ${createdDate}`;
    } else {
      dates.textContent = `Creada: ${createdDate} | Última edición: ${updatedDate}`;
    }

    li.appendChild(row);
    li.appendChild(dates);

    taskList.appendChild(li);
  });
}

// ✅ Crear tarea con validaciones
taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const textVal = taskInput.value.trim();

  if (!textVal) {
    alert("❌ El texto de la tarea no puede estar vacío.");
    return;
  }

  if (textVal.length < 10) {
    alert("❌ La tarea debe tener al menos 10 caracteres.");
    return;
  }

  // 🚫 Validar duplicados
  const exists = tasks.some(task => task.text.toLowerCase() === textVal.toLowerCase());
  if (exists) {
    alert("❌ Ya existe una tarea con el mismo texto.");
    return;
  }

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
});

renderTasks();
