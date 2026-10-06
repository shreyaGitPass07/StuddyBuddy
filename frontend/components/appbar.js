/* ─────────────────────────────────────────
   Study Buddy — components/appbar.js
   Inject this on every authenticated page.
   Usage: <div id="appbar-root"></div>
          <script src="components/appbar.js"></script>
   ───────────────────────────────────────── */

   import { getInitials } from "../utils/getInitials.js";

   const AUTH_BASE = "https://studdybuddy-sghs.onrender.com/api/auth";
   
   /* ═══════════════════════════════════════
      FETCH STUDENT — shared so other modules
      on the same page can import if needed
   ═══════════════════════════════════════ */
   export let studentInfo = null;
   
   async function fetchStudentInfo() {
     const token = localStorage.getItem("token");
   
     if (!token) {
       window.location.href = "login.html";
       return null;
     }
   
     try {
       const res  = await fetch(`${AUTH_BASE}/me`, {
         headers: { Authorization: `Bearer ${token}` },
       });
       const data = await res.json();
   
       if (!data.success) {
         localStorage.removeItem("token");
         window.location.href = "login.html";
         return null;
       }
   
       return data.student;
     } catch {
       // Network error — still redirect so page doesn't hang
       window.location.href = "login.html";
       return null;
     }
   }
   
   /* ═══════════════════════════════════════
      INIT
   ═══════════════════════════════════════ */
   (async function () {
     studentInfo = await fetchStudentInfo();
     if (!studentInfo) return; // already redirected
   
     const initials = studentInfo.name ? getInitials(studentInfo.name) : "U";
   
     const html = `
       <header class="appbar" id="appbar">
         <div class="appbar-left">
           <button class="hamburger" id="hamburgerBtn" aria-label="Toggle sidebar">
             <span></span><span></span><span></span>
           </button>
           <a href="dashboard.html" class="appbar-brand">
             <span class="appbar-logo-icon">📚</span>
             <span class="appbar-brand-name">Study Buddy</span>
           </a>
         </div>
   
         <div class="appbar-right">
           <button class="appbar-icon-btn" title="Notifications" onclick="window.location.href='notifications.html'">
             <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
               <path d="M9 1.5A5.25 5.25 0 003.75 6.75c0 3.75-1.5 4.5-1.5 4.5h13.5s-1.5-.75-1.5-4.5A5.25 5.25 0 009 1.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
               <path d="M10.3 15a1.5 1.5 0 01-2.6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
             </svg>
             <span class="notif-badge">3</span>
           </button>
   
           <div class="appbar-avatar" id="appbarAvatar" title="Profile" onclick="window.location.href='profile.html'">
             <span>${initials}</span>
           </div>
         </div>
       </header>
     `;
   
     const root = document.getElementById("appbar-root");
     if (root) root.innerHTML = html;
   
     // Wire hamburger after HTML is injected
     const hamburger = document.getElementById("hamburgerBtn");
     if (hamburger) {
       hamburger.addEventListener("click", () => {
         const sidebar = document.getElementById("sidebar");
         const overlay = document.getElementById("sidebarOverlay");
         if (sidebar) sidebar.classList.toggle("open");
         if (overlay) overlay.classList.toggle("show");
         hamburger.classList.toggle("active");
       });
     }
   })();