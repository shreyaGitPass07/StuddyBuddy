/* ─────────────────────────────────────────
   Study Buddy — components/appbar.js
   Inject this on every authenticated page.
   Usage: <div id="appbar-root"></div>
          <script type="module" src="components/appbar.js"></script>
   ───────────────────────────────────────── */

   import { getInitials } from "../utils/getInitials.js";
   import { getCachedStudent, fetchFreshStudent } from "../utils/student.js";
   
   export let studentInfo = null;
   
   /* ═══════════════════════════════════════
      RENDER APPBAR
   ═══════════════════════════════════════ */
   function renderAppbar(student) {
     const initials = student.name ? getInitials(student.name) : "U";
   
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
   
     // Hamburger dobara wire karo (kyunki HTML naya bana hai)
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
   }
   
   /* ═══════════════════════════════════════
      INIT
   ═══════════════════════════════════════ */
   
   // 1) Turant: saved copy se appbar dikha do (server ka wait nahi)
   const cached = getCachedStudent();
   if (cached) {
     studentInfo = cached;
     renderAppbar(cached);
   }
   
   // 2) Peeche: server se confirm karo
   fetchFreshStudent().then((fresh) => {
     if (!fresh) return; // redirect ho chuka ya server slow hai
     studentInfo = fresh;
   
     // Pehli baar (cache nahi tha) ya naam badla ho tabhi dobara banao
     if (!cached || cached.name !== fresh.name) renderAppbar(fresh);
   });