/* ─────────────────────────────────────────
   Study Buddy — dashboard/dashboard.js
   ───────────────────────────────────────── */

   const API_BASE = "https://studdybuddy-sghs.onrender.com/api";

   // ─── Auth guard ───────────────────────────────────────────────
   // Call this first — if no token, redirect immediately
   function getTokenOrRedirect() {
     const token = localStorage.getItem("token");
     if (!token) {
       window.location.href = "/login.html";
       return null;
     }
     return token;
   }
   
   // ─── Fetch current logged-in student from /me ─────────────────
   async function getMe(token) {
     const res = await fetch(`${API_BASE}/auth/me`, {
       headers: { Authorization: `Bearer ${token}` }
     });
   
     // Token expired or invalid → redirect to login
     if (res.status === 401 || res.status === 403) {
       localStorage.removeItem("token");
       window.location.href = "/login.html";
       return null;
     }
   
     const data = await res.json();
     return data.student; // { name, email, ... }
   }
   
   // ─── Fetch assignment stats for a student ────────────────────
   async function getAssignmentStats(userId, token) {
     const res = await fetch(`${API_BASE}/assignments/stats/${userId}`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     const data = await res.json();
     return {
       assignments: data.data, // { total, completed, pending }
       tasks: data.data
     };
   }
   
   // ─── Live date display ────────────────────────────────────────
   function setDate() {
     const el = document.getElementById("dashDate");
     if (!el) return;
     el.textContent = new Date().toLocaleDateString("en-IN", {
       weekday: "long", day: "numeric", month: "long", year: "numeric"
     });
   }
   
   // ─── Populate stat cards ──────────────────────────────────────
   function populateCard(prefix, data) {
     const { total, completed, pending } = data;
     const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
   
     const totalEl     = document.getElementById(`${prefix}Total`);
     const completedEl = document.getElementById(`${prefix}Completed`);
     const pendingEl   = document.getElementById(`${prefix}Pending`);
     const fillEl      = document.getElementById(`${prefix}ProgressFill`);
     const pctEl       = document.getElementById(`${prefix}ProgressPct`);
   
     if (totalEl)     totalEl.textContent     = total;
     if (completedEl) completedEl.textContent = completed;
     if (pendingEl)   pendingEl.textContent   = pending;
   
     setTimeout(() => {
       if (fillEl) fillEl.style.width = pct + "%";
       if (pctEl)  pctEl.textContent  = pct + "% done";
     }, 300);
   }
   
   // ─── Shared Chart.js options ──────────────────────────────────
   const sharedChartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     animation: { duration: 900, easing: "easeOutQuart" },
     plugins: {
       legend: { display: false },
       tooltip: {
         backgroundColor: "#fff",
         titleColor: "#0F0E2A",
         bodyColor: "#4B5563",
         borderColor: "#EEF0F8",
         borderWidth: 1,
         padding: 10,
         cornerRadius: 10,
         callbacks: {
           label: ctx => ` ${ctx.parsed.y} ${ctx.dataset.label.toLowerCase()}`
         }
       }
     },
     scales: {
       x: {
         grid: { display: false },
         border: { display: false },
         ticks: { color: "#9CA3AF", font: { size: 12, family: "DM Sans" } }
       },
       y: {
         beginAtZero: true,
         grid: { color: "#F3F4F6" },
         border: { display: false, dash: [4, 4] },
         ticks: { color: "#9CA3AF", font: { size: 11, family: "DM Sans" }, stepSize: 2, precision: 0 }
       }
     },
     barPercentage: 0.55,
     categoryPercentage: 0.65
   };
   
   // ─── Assignments Chart ────────────────────────────────────────
   function initAssignmentsChart(assignments) {
     const ctx = document.getElementById("assignmentsChart");
     if (!ctx) return;
     new Chart(ctx, {
       type: "bar",
       data: {
         labels: ["Completed", "Pending"],
         datasets: [{
           label: "Assignments",
           data: [assignments.completed, assignments.pending],
           backgroundColor: ["#4F46E5", "#C7D2FE"],
           borderRadius: 8,
           borderSkipped: false,
           hoverBackgroundColor: ["#3730A3", "#A5B4FC"]
         }]
       },
       options: sharedChartOptions
     });
   }
   
   // ─── Tasks Chart ──────────────────────────────────────────────
   function initTasksChart(tasks) {
     const ctx = document.getElementById("tasksChart");
     if (!ctx) return;
     new Chart(ctx, {
       type: "bar",
       data: {
         labels: ["Completed", "Pending"],
         datasets: [{
           label: "Tasks",
           data: [tasks.completed, tasks.pending],
           backgroundColor: ["#7C3AED", "#DDD6FE"],
           borderRadius: 8,
           borderSkipped: false,
           hoverBackgroundColor: ["#5B21B6", "#C4B5FD"]
         }]
       },
       options: sharedChartOptions
     });
   }
   
   // ─── Scroll reveal ────────────────────────────────────────────
   function initScrollReveal() {
     const reveals = document.querySelectorAll(".reveal");
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(e => {
         if (e.isIntersecting) {
           e.target.classList.add("visible");
           observer.unobserve(e.target);
         }
       });
     }, { threshold: 0.1 });
     reveals.forEach(el => observer.observe(el));
   }
   
   // ─── MAIN — single async entry point ─────────────────────────
   // Everything runs here in the correct order:
   // 1. Check token
   // 2. Get student info
   // 3. Fetch stats using student's email
   // 4. Render everything
   
   async function init() {
     // 1. Guard — exits if no token
     const token = getTokenOrRedirect();
     if (!token) return;
   
     // 2. Get student — exits if token invalid
     const student = await getMe(token);
     if (!student) return;
   
     // 3. Set greeting now that we have the name
     const greetEl = document.querySelector(".dash");
     if (greetEl) {
       greetEl.textContent = `Good morning, ${student.name} 👋 Here's your study overview for today.`;
     }
   
     // 4. Set date
     setDate();
   
     // 5. Fetch stats using student's email
     const dashboardData = await getAssignmentStats(student.email, token);
   
     // 6. Populate cards
     populateCard("a", dashboardData.assignments);
     populateCard("t", dashboardData.tasks);
   
     // 7. Render charts
     initAssignmentsChart(dashboardData.assignments);
     initTasksChart(dashboardData.tasks);
   
     // 8. Scroll reveal
     initScrollReveal();
   }
   
   init();