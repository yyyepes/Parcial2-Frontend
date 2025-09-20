// ✅ Verificar autenticación
    if(localStorage.getItem("isLoggedIn") !== "true") {
      window.location.href = "login.html";
    }

    // Mostrar nombre de usuario
    document.getElementById("user").textContent = localStorage.getItem("username");

    // Botón Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("tasks"); // limpiar tareas si se desea
      window.location.href = "login.html";
    });

    // ✅ CRUD de tareas
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

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

        const text = document.createElement("span");
        text.textContent = task.text;
        if(task.done) text.classList.add("done");
        li.appendChild(text);

        const actions = document.createElement("div");
        actions.classList.add("actions");

        // Toggle done
        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = task.done ? "Desmarcar" : "Hecha";
        toggleBtn.classList.add("toggle");
        toggleBtn.onclick = () => {
          task.done = !task.done;
          task.updatedAt = Date.now();
          saveTasks();
          renderTasks();
        };

        // Editar
        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.classList.add("edit");
        editBtn.onclick = () => {
          const newText = prompt("Editar tarea:", task.text);
          if(newText) {
            task.text = newText;
            task.updatedAt = Date.now();
            saveTasks();
            renderTasks();
          }
        };

        // Eliminar
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.classList.add("delete");
        deleteBtn.onclick = () => {
          tasks = tasks.filter(t => t.id !== task.id);
          saveTasks();
          renderTasks();
        };

        actions.appendChild(toggleBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        li.appendChild(actions);

        taskList.appendChild(li);
      });
    }

    // Crear tarea
    taskForm.addEventListener("submit", e => {
      e.preventDefault();
      const newTask = {
        id: Date.now(),
        text: taskInput.value.trim(),
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