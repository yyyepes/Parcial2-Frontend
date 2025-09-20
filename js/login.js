 const users = [{ username: "admin", password: "admin" }];

    // Si ya hay sesión, redirigir a la To-Do List
    if(localStorage.getItem("isLoggedIn") === "true") {
      window.location.href = "todo.html";
    }

    const form = document.getElementById("loginForm");
    const errorMsg = document.getElementById("errorMsg");

    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      const user = users.find(u => u.username === username && u.password === password);

      if(user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        window.location.href = "todo.html";
      } else {
        errorMsg.textContent = "Credenciales incorrectas";
      }
    });