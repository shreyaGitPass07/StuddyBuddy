/* ─────────────────────────────────────────
   Study Buddy — components/sidebar.js
   Inject this on every authenticated page.
   Usage: <div id="sidebar-root"></div>
          <div id="sidebarOverlay" class="sidebar-overlay"></div>
          <script type="module" src="components/sidebar.js"></script>
   ───────────────────────────────────────── */

   import { getInitials } from "../utils/getInitials.js";
   import { getCachedStudent, fetchFreshStudent } from "../utils/student.js";
   
   /* ═══════════════════════════════════════
      SVG ICONS
   ═══════════════════════════════════════ */
   function iconDashboard() {
     return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="10.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="1.5" y="10.5" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="10.5" y="10.5" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>`;
   }
   function iconAssignments() {
     return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13.5 2.25H15a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 15.75v-12a1.5 1.5 0 011.5-1.5h1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="5.25" y="1.5" width="7.5" height="3" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M5.25 9.75h7.5M5.25 12.75h4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
   }
   function iconTasks() {
     return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6.75 9l1.5 1.5 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="1.5" y="1.5" width="15" height="15" rx="2.5" stroke="currentColor" stroke-width="1.5"/></svg>`;
   }
   function iconNotifications() {
     return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5A5.25 5.25 0 003.75 6.75c0 3.75-1.5 4.5-1.5 4.5h13.5s-1.5-.75-1.5-4.5A5.25 5.25 0 009 1.5z" stroke="currentColor" stroke-width="1.5"/><path d="M10.3 15a1.5 1.5 0 01-2.6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
   }
   function iconProfile() {
     return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M2.25 16.5c0-3.728 3.022-6.75 6.75-6.75s6.75 3.022 6.75 6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
   }
   function iconLogout() {
     return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6.75 15.75H3.75a1.5 1.5 0 01-1.5-1.5V3.75a1.5 1.5 0 011.5-1.5h3M12 12.75L15.75 9 12 5.25M15.75 9H6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
   }
   
   /* ═══════════════════════════════════════
      NAV ITEM BUILDER
   ═══════════════════════════════════════ */
   function navItem(currentPage, { href, icon, label, badge }) {
     const active    = currentPage === href ? "active" : "";
     const badgeHtml = badge ? `<span class="sidebar-badge">${badge}</span>` : "";
     return `
       <li>
         <a href="${href}" class="sidebar-link ${active}">
           <span class="sidebar-link-icon">${icon}</span>
           <span class="sidebar-link-label">${label}</span>
           ${badgeHtml}
         </a>
       </li>`;
   }
   
   /* ═══════════════════════════════════════
      LOGOUT HANDLER
   ═══════════════════════════════════════ */
   function handleLogout() {
     localStorage.removeItem("token");
     localStorage.removeItem("studentInfo"); // saved copy bhi hatao
     window.location.href = "signin.html";
   }
   
   /* ═══════════════════════════════════════
      RENDER SIDEBAR
   ═══════════════════════════════════════ */
   function renderSidebar(studentInfo) {
     const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
     const initials    = studentInfo.name ? getInitials(studentInfo.name) : "U";
     const college     = studentInfo.college || "";
     const year        = studentInfo.Year    || "";
   
     // Subtitle — e.g. "Delhi University · 2nd Year"
     const roleParts = [college, year].filter(Boolean);
     const roleText  = roleParts.length ? roleParts.join(" · ") : "Student";
   
     const navLinks = [
       { href: "dashboard.html",     icon: iconDashboard(),     label: "Dashboard" },
       { href: "assignments.html",   icon: iconAssignments(),   label: "College Assignments" },
       { href: "tasks.html",         icon: iconTasks(),         label: "Personal Tasks" },
       { href: "notifications.html", icon: iconNotifications(), label: "Notifications", badge: 3 },
       { href: "profile.html",       icon: iconProfile(),       label: "Profile" },
     ];
   
     const html = `
       <aside class="sidebar" id="sidebar">
         <div class="sidebar-inner">
   
           <div class="sidebar-top">
             <div class="sidebar-user">
               <div class="sidebar-avatar">${initials}</div>
               <div class="sidebar-user-info">
                 <p class="sidebar-user-name">${studentInfo.name}</p>
                 <p class="sidebar-user-role">${roleText}</p>
               </div>
             </div>
           </div>
   
           <nav class="sidebar-nav">
             <p class="sidebar-nav-label">Menu</p>
             <ul>
               ${navLinks.map(link => navItem(currentPage, link)).join("")}
             </ul>
           </nav>
   
           <div class="sidebar-bottom">
             <button class="sidebar-link sidebar-logout" id="sidebarLogoutBtn">
               <span class="sidebar-link-icon">${iconLogout()}</span>
               <span class="sidebar-link-label">Logout</span>
             </button>
           </div>
   
         </div>
       </aside>
     `;
   
     const root = document.getElementById("sidebar-root");
     if (root) root.innerHTML = html;
   
     // Logout button dobara wire karo (kyunki HTML naya bana hai)
     document.getElementById("sidebarLogoutBtn")
       ?.addEventListener("click", handleLogout);
   }
   
   /* ═══════════════════════════════════════
      OVERLAY CLICK — sirf ek baar wire hota hai
   ═══════════════════════════════════════ */
   const overlay = document.getElementById("sidebarOverlay");
   if (overlay) {
     overlay.addEventListener("click", () => {
       const sidebar   = document.getElementById("sidebar");
       const hamburger = document.getElementById("hamburgerBtn");
       if (sidebar)   sidebar.classList.remove("open");
       if (hamburger) hamburger.classList.remove("active");
       overlay.classList.remove("show");
     });
   }
   
   /* ═══════════════════════════════════════
      INIT
   ═══════════════════════════════════════ */
   
   // 1) Turant: saved copy se sidebar dikha do (server ka wait nahi)
   const cached = getCachedStudent();
   if (cached) renderSidebar(cached);
   
   // 2) Peeche: server se confirm karo
   fetchFreshStudent().then((fresh) => {
     if (!fresh) return; // redirect ho chuka ya server slow hai
   
     // Pehli baar ya data badla ho tabhi dobara banao
     if (!cached || JSON.stringify(cached) !== JSON.stringify(fresh)) {
       renderSidebar(fresh);
     }
   });