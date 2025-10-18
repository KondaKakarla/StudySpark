document.addEventListener("DOMContentLoaded", () => {
  // -------------------- AUTH LOGIC --------------------
  const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
  const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users));
  const currentUser = localStorage.getItem("currentUser");

  if (document.getElementById("loginForm")) {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    document.getElementById("loginBtn").onclick = () => {
      const u = document.getElementById("loginUsername").value.trim();
      const p = document.getElementById("loginPassword").value.trim();
      const user = getUsers().find(x => x.username === u && x.password === p);
      if (user) {
        localStorage.setItem("currentUser", u);
        window.location.href = "dashboard.html";
      } else alert("Invalid credentials");
    };

    document.getElementById("signupBtn").onclick = () => {
      const u = document.getElementById("signupUsername").value.trim();
      const p = document.getElementById("signupPassword").value.trim();
      if (!u || !p) return alert("Fill all fields");
      let users = getUsers();
      if (users.some(x => x.username === u)) return alert("User exists");
      users.push({ username: u, password: p });
      saveUsers(users);
      alert("Signup successful!");
      signupForm.style.display = "none";
      loginForm.style.display = "block";
    };

    document.getElementById("showSignup").onclick = () => {
      loginForm.style.display = "none";
      signupForm.style.display = "block";
    };
    document.getElementById("showLogin").onclick = () => {
      signupForm.style.display = "none";
      loginForm.style.display = "block";
    };
  }

  // -------------------- DASHBOARD LOGIC --------------------
  if (document.getElementById("dashboard")) {
    if (!currentUser) {
      window.location.href = "auth.html";
      return;
    }

    document.getElementById("logoutBtn").onclick = () => {
      localStorage.removeItem("currentUser");
      window.location.href = "auth.html";
    };

    let tasks = JSON.parse(localStorage.getItem("tasks") || "[]").filter(t => t.user === currentUser);

    const saveTasks = () => {
      let allTasks = JSON.parse(localStorage.getItem("tasks") || "[]").filter(t => t.user !== currentUser);
      allTasks = allTasks.concat(tasks);
      localStorage.setItem("tasks", JSON.stringify(allTasks));
      renderTasks();
    };

    const popupMessages = ["Excellent!", "Well Done!", "Wonderful!", "Great Job!", "Superb!"];

    // Confetti
    const confettiCanvas = document.getElementById("confettiCanvas");
    const ctx = confettiCanvas.getContext("2d");
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    window.addEventListener("resize", () => {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    });

    class ConfettiParticle {
      constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * -confettiCanvas.height;
        this.size = Math.random() * 8 + 4;
        this.speed = Math.random() * 5 + 2;
        this.angle = Math.random() * 2 * Math.PI;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.tilt = Math.random() * 10 - 5;
      }
      update() {
        this.y += this.speed;
        this.x += Math.sin(this.angle);
        this.angle += 0.05;
        if (this.y > confettiCanvas.height) {
          this.y = -10;
          this.x = Math.random() * confettiCanvas.width;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.moveTo(this.x + this.tilt, this.y);
        ctx.lineTo(this.x + this.tilt + this.size, this.y + this.size);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size / 4;
        ctx.stroke();
      }
    }

    let confettiParticles = [];
    for (let i = 0; i < 150; i++) confettiParticles.push(new ConfettiParticle());
    let confettiActive = false;

    function animateConfetti() {
      if (!confettiActive) return;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiParticles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animateConfetti);
    }

    function showPopupRandom() {
      const popup = document.getElementById("popupMessage");
      const content = document.getElementById("popupContent");
      const msg = popupMessages[Math.floor(Math.random() * popupMessages.length)];
      content.textContent = msg;
      popup.style.display = "flex";
      confettiActive = true;
      animateConfetti();
      setTimeout(() => {
        popup.style.display = "none";
        confettiActive = false;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }, 2000);
    }

    function renderTasks() {
      const list = document.getElementById("taskList");
      list.innerHTML = "";
      let done = 0, pending = 0;

      tasks.forEach((t, i) => {
        const li = document.createElement("li");
        li.textContent = `${t.name} (${t.subject}) ⏰${t.time} [${t.date}]`;

        if (t.done) li.style.backgroundColor = "#4caf50";
        else if (t.priority === "High") li.style.backgroundColor = "#ff6b6b";
        else if (t.priority === "Medium") li.style.backgroundColor = "#eec458ef";
        else li.style.backgroundColor = "#a89382ff";

        const btnDone = document.createElement("button");
        btnDone.textContent = t.done ? "✅" : "⬜";
        btnDone.onclick = () => toggleDone(i);

        const btnEdit = document.createElement("button");
        btnEdit.textContent = "✏️";
        btnEdit.onclick = () => openEditModal(i);

        const btnDelete = document.createElement("button");
        btnDelete.textContent = "❌";
        btnDelete.onclick = () => deleteTask(i);

        const btnContainer = document.createElement("div");
        btnContainer.style.display = "flex";
        btnContainer.style.gap = "5px";
        btnContainer.appendChild(btnDone);
        btnContainer.appendChild(btnEdit);
        btnContainer.appendChild(btnDelete);

        li.appendChild(btnContainer);
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "10px";
        li.style.borderRadius = "12px";
        li.style.margin = "8px 0";

        list.appendChild(li);

        if (t.done) done++; else pending++;
      });

      document.getElementById("doneCount").textContent = done;
      document.getElementById("pendingCount").textContent = pending;
      const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
      document.getElementById("progressText").textContent = percent + "%";
      document.getElementById("progressFill").style.width = percent + "%";
    }

    window.toggleDone = (i) => { tasks[i].done = !tasks[i].done; saveTasks(); if (tasks[i].done) showPopupRandom(); };
    window.deleteTask = (i) => { tasks.splice(i, 1); saveTasks(); };

    const modal = document.getElementById("taskModal");
    let editIndex = null;
    function openEditModal(i) {
      editIndex = i;
      modal.style.display = "flex";
      document.getElementById("taskName").value = tasks[i].name;
      document.getElementById("taskSubject").value = tasks[i].subject;
      document.getElementById("taskDate").value = tasks[i].date;
      document.getElementById("taskTime").value = tasks[i].time;
      document.getElementById("taskPriority").value = tasks[i].priority;
    }

    document.getElementById("addTaskBtn").onclick = () => {
      editIndex = null;
      modal.style.display = "flex";
      document.getElementById("taskName").value = "";
      document.getElementById("taskSubject").value = "";
      document.getElementById("taskDate").value = "";
      document.getElementById("taskTime").value = "";
      document.getElementById("taskPriority").value = "Medium";
    };
    document.getElementById("closeTaskBtn").onclick = () => modal.style.display = "none";

    document.getElementById("saveTaskBtn").onclick = () => {
      const n = document.getElementById("taskName").value.trim();
      const s = document.getElementById("taskSubject").value.trim();
      const d = document.getElementById("taskDate").value;
      const t = document.getElementById("taskTime").value;
      const p = document.getElementById("taskPriority").value;
      if (!n || !s || !d || !t) return alert("Fill all fields");

      if (editIndex !== null) {
        tasks[editIndex] = { ...tasks[editIndex], name: n, subject: s, date: d, time: t, priority: p };
      } else {
        tasks.push({ name: n, subject: s, date: d, time: t, priority: p, done: false, user: currentUser });
      }
      modal.style.display = "none";
      saveTasks();
    };

    document.getElementById("modeToggle").onclick = () => document.body.classList.toggle("dark");
    document.getElementById("openCalendar").onclick = () => window.location.href = "calendar.html";

    renderTasks();
  }


  

});
