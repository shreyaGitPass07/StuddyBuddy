/* ─────────────────────────────────────────
   Study Buddy — profile/profile.js

   Auth: Token stored in localStorage("token")
   Student data fetched fresh from API on every load.

   API ROUTES USED:
     GET   /api/auth/me            → fetch logged-in student
     PATCH /api/auth/update/:id    → update profile fields
     DELETE /api/auth/:id          → delete account
   ───────────────────────────────────────── */

   const AUTH_BASE = "http://localhost:3000/api/auth";

   /* ═══════════════════════════════════════
      FETCH STUDENT INFO FROM API
   ═══════════════════════════════════════ */
   
   let studentInfo = null;
   
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
         // Token invalid or expired
         localStorage.removeItem("token");
         window.location.href = "login.html";
         return null;
       }
   
       return data.student;
     } catch (err) {
       showToast("Could not reach server. Please try again.", "error");
       return null;
     }
   }
   
   /* ═══════════════════════════════════════
      HELPERS
   ═══════════════════════════════════════ */


   async function fetchAssignmentStats(email) {
    try {
      const res  = await fetch(`http://localhost:3000/api/assignments/stats/${email}`);
      const data = await res.json();
      if (!data.success) return;
  
      document.getElementById("statAssignments").textContent = data.data.total;
      document.getElementById("statCompleted").textContent   = data.data.completed;
      document.getElementById("statTasks").textContent       = data.data.pending;
    } catch {
      // silently fail — stats are non-critical
    }
  }
   
   function getInitials(name) {
     if (!name) return "?";
     const parts = name.trim().split(" ").filter(Boolean);
     if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
     return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
   }
   
   function formatJoinDate(iso) {
     if (!iso) return "Unknown";
     return new Date(iso).toLocaleDateString("en-IN", {
       day: "numeric", month: "long", year: "numeric",
     });
   }
   
   function showToast(msg, type = "success") {
     document.querySelector(".toast")?.remove();
     const t = document.createElement("div");
     t.className = `toast${type === "error" ? " toast-error" : ""}`;
     t.innerHTML = `<span>${type === "success" ? "✓" : "✕"}</span> ${msg}`;
     document.body.appendChild(t);
     requestAnimationFrame(() => t.classList.add("show"));
     setTimeout(() => {
       t.classList.remove("show");
       setTimeout(() => t.remove(), 400);
     }, 3000);
   }
   
   function setLoading(btnEl, spinnerId, loading) {
     const spinner = document.getElementById(spinnerId);
     btnEl.disabled = loading;
     if (spinner) spinner.classList.toggle("hidden", !loading);
   }
   
   /* ═══════════════════════════════════════
      POPULATE UI FROM studentInfo
   ═══════════════════════════════════════ */
   
   function populateProfile(info) {
     const name     = info.name    || "Student";
     const email    = info.email   || "—";
     const college  = info.college || "Not set";
     const year     = info.Year    || "Not set";
     const joined   = formatJoinDate(info.createdAt);
     const initials = getInitials(name);
   
     // Avatar section
     document.getElementById("avatarInitials").textContent = initials;
     document.getElementById("displayName").textContent    = name;
     document.getElementById("displayEmail").textContent   = email;
     document.getElementById("collegeText").textContent    = college;
     document.getElementById("yearText").textContent       = year;
     document.getElementById("displayJoined").textContent  = `Member since ${joined}`;
   
     // Info grid (view mode)
     document.getElementById("viewName").textContent    = name;
     document.getElementById("viewEmail").textContent   = email;
     document.getElementById("viewCollege").textContent = college;
     document.getElementById("viewYear").textContent    = year;
     document.getElementById("viewJoined").textContent  = joined;
   
     // Quick stats — these come from the backend ideally,
     // but kept as-is since assignment/task counts aren't part of auth API
     // REPLACE with this
      fetchAssignmentStats(info.email);
   
     // Sync appbar avatar initials if present (rendered by appbar.js)
     const appbarAvatarEl = document.querySelector(".appbar-avatar span");
     if (appbarAvatarEl) appbarAvatarEl.textContent = initials;
   
     // Sync sidebar name if present (rendered by sidebar.js)
     const sidebarNameEl = document.querySelector(".sidebar-user-name");
     if (sidebarNameEl) sidebarNameEl.textContent = name;
     const sidebarRoleEl = document.querySelector(".sidebar-user-role");
     if (sidebarRoleEl && (college !== "Not set" || year !== "Not set")) {
       sidebarRoleEl.textContent = `${college !== "Not set" ? college.split(" ").slice(0, 2).join(" ") : ""} · ${year !== "Not set" ? year : ""}`.replace(/^·\s*|\s*·\s*$/, "");
     }
   }
   
   /* ═══════════════════════════════════════
      EDIT PROFILE — SHOW / HIDE
   ═══════════════════════════════════════ */
   
   const viewCard = document.getElementById("viewCard");
   const editCard = document.getElementById("editCard");
   
   document.getElementById("btnEdit").addEventListener("click", () => {
     document.getElementById("editName").value    = studentInfo.name    || "";
     document.getElementById("editEmail").value   = studentInfo.email   || "";
     document.getElementById("editCollege").value = studentInfo.college || "";
   
     const yearSelect  = document.getElementById("editYear");
     const currentYear = studentInfo.Year || "";
     for (const opt of yearSelect.options) {
       if (opt.value === currentYear) { opt.selected = true; break; }
     }
   
     viewCard.classList.add("hidden");
     editCard.classList.remove("hidden");
     document.getElementById("editName").focus();
   });
   
   document.getElementById("btnDiscard").addEventListener("click", () => {
     editCard.classList.add("hidden");
     viewCard.classList.remove("hidden");
     clearFormErrors();
   });
   
   /* ═══════════════════════════════════════
      EDIT FORM VALIDATION & SUBMIT
   ═══════════════════════════════════════ */
   
   function clearFormErrors() {
     ["errName", "errEmail"].forEach(id => {
       const el = document.getElementById(id);
       if (el) { el.textContent = ""; el.classList.remove("show"); }
     });
   }
   
   function showFieldError(id, msg) {
     const el = document.getElementById(id);
     if (el) { el.textContent = msg; el.classList.add("show"); }
   }
   
   function isValidEmail(val) {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
   }
   
   document.getElementById("editForm").addEventListener("submit", async (e) => {
     e.preventDefault();
     clearFormErrors();
   
     const name    = document.getElementById("editName").value.trim();
     const email   = document.getElementById("editEmail").value.trim();
     const college = document.getElementById("editCollege").value.trim();
     const year    = document.getElementById("editYear").value;
   
     let valid = true;
   
     if (!name || name.length < 2) {
       showFieldError("errName", "Please enter a valid full name.");
       valid = false;
     }
     if (!email || !isValidEmail(email)) {
       showFieldError("errEmail", "Please enter a valid email address.");
       valid = false;
     }
     if (!valid) return;
   
     const btn = document.getElementById("btnSave");
     setLoading(btn, "saveSpinner", true);
   
     try {
       const token = localStorage.getItem("token");
   
       const res = await fetch(`${AUTH_BASE}/update/${studentInfo._id}`, {
         method:  "PATCH",
         headers: {
           "Content-Type":  "application/json",
           "Authorization": `Bearer ${token}`,
         },
         body: JSON.stringify({ name, email, college, Year: year }),
       });
   
       const data = await res.json();
   
       if (!res.ok) {
         showToast(data.message || "Update failed.", "error");
         return;
       }
   
       // Update in-memory studentInfo with fresh data from server
       studentInfo = data.student || data;
   
       // Refresh UI with updated data
       populateProfile(studentInfo);
   
       // REPLACE with
      showToast("Profile updated successfully! ✓");
      setTimeout(() => window.location.reload(), 500);
   
     } catch {
       showToast("Something went wrong. Please try again.", "error");
     } finally {
       setLoading(btn, "saveSpinner", false);
     }
   });
   
   /* ═══════════════════════════════════════
      CHANGE PASSWORD
   ═══════════════════════════════════════ */
   
   const pwForm      = document.getElementById("pwForm");
   const btnTogglePw = document.getElementById("btnTogglePw");
   const btnCancelPw = document.getElementById("btnCancelPw");
   
   btnTogglePw.addEventListener("click", () => {
     pwForm.classList.toggle("hidden");
     if (!pwForm.classList.contains("hidden")) {
       pwForm.reset();
       clearPwErrors();
       document.getElementById("pwCurrent").focus();
     }
   });
   
   btnCancelPw.addEventListener("click", () => {
     pwForm.classList.add("hidden");
     pwForm.reset();
     clearPwErrors();
   });
   
   function clearPwErrors() {
     ["errPwCurrent", "errPwNew", "errPwConfirm"].forEach(id => {
       const el = document.getElementById(id);
       if (el) { el.textContent = ""; el.classList.remove("show"); }
     });
   }
   
   pwForm.addEventListener("submit", async (e) => {
     e.preventDefault();
     clearPwErrors();
   
     const current = document.getElementById("pwCurrent").value;
     const newPw   = document.getElementById("pwNew").value;
     const confirm = document.getElementById("pwConfirm").value;
   
     let valid = true;
   
     if (!current) {
       const el = document.getElementById("errPwCurrent");
       el.textContent = "Please enter your current password.";
       el.classList.add("show");
       valid = false;
     }
     if (!newPw || newPw.length < 8) {
       const el = document.getElementById("errPwNew");
       el.textContent = "New password must be at least 8 characters.";
       el.classList.add("show");
       valid = false;
     }
     if (newPw !== confirm) {
       const el = document.getElementById("errPwConfirm");
       el.textContent = "Passwords do not match.";
       el.classList.add("show");
       valid = false;
     }
     if (!valid) return;
   
     const btn = e.submitter;
     if (btn) btn.disabled = true;
     document.getElementById("pwSpinner").classList.remove("hidden");
   
     try {
       // ─── REPLACE WITH YOUR REAL API CALL ──────────────────
       // const res = await fetch(`${AUTH_BASE}/change-password`, {
       //   method: "PUT",
       //   headers: {
       //     "Content-Type":  "application/json",
       //     "Authorization": `Bearer ${localStorage.getItem("token")}`,
       //   },
       //   body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
       // });
       // if (!res.ok) {
       //   const data = await res.json();
       //   if (data.field === "current") {
       //     const el = document.getElementById("errPwCurrent");
       //     el.textContent = data.message;
       //     el.classList.add("show");
       //   } else {
       //     showToast(data.message || "Update failed.", "error");
       //   }
       //   return;
       // }
       // ────────────────────────────────────────────────────────
   
       await new Promise(r => setTimeout(r, 1000)); // remove when real API is wired
       pwForm.classList.add("hidden");
       pwForm.reset();
       showToast("Password updated successfully! 🔒");
   
     } catch {
       showToast("Something went wrong. Please try again.", "error");
     } finally {
       if (btn) btn.disabled = false;
       document.getElementById("pwSpinner").classList.add("hidden");
     }
   });
   
   /* ═══════════════════════════════════════
      DANGER ZONE
   ═══════════════════════════════════════ */
   
   document.getElementById("btnLogoutAll").addEventListener("click", () => {
     if (!confirm("This will log you out of all devices. Continue?")) return;
   
     // ─── REPLACE WITH YOUR REAL API CALL ──────────────────
     // await fetch(`${AUTH_BASE}/logout-all`, {
     //   method: "POST",
     //   headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
     // });
     // ────────────────────────────────────────────────────────
   
     localStorage.removeItem("token");
     showToast("Logged out of all devices.");
     setTimeout(() => { window.location.href = "login.html"; }, 1500);
   });
   
   document.getElementById("btnDeleteAccount").addEventListener("click", async () => {
     const confirmed = confirm(
       "⚠️ Are you absolutely sure?\n\nThis will permanently delete your account and all your data. This cannot be undone."
     );
     if (!confirmed) return;
   
     const doubleCheck = prompt("Type DELETE to confirm account deletion:");
     if (doubleCheck !== "DELETE") {
       showToast("Account deletion cancelled.", "error");
       return;
     }
   
     try {
       const token = localStorage.getItem("token");
   
       const res  = await fetch(`${AUTH_BASE}/${studentInfo._id}`, {
         method:  "DELETE",
         headers: { Authorization: `Bearer ${token}` },
       });
       const data = await res.json();
   
       if (!res.ok) {
         showToast(data.message || "Delete failed.", "error");
         return;
       }
   
       localStorage.clear();
       showToast("Account deleted. Goodbye 👋");
       setTimeout(() => { window.location.href = "index.html"; }, 1800);
   
     } catch {
       showToast("Server error. Unable to delete account.", "error");
     }
   });
   
   /* ═══════════════════════════════════════
      INIT — authenticate first, then render
   ═══════════════════════════════════════ */
   
   async function init() {
     // Step 1: Verify token and get fresh student data from server
     studentInfo = await fetchStudentInfo();
     if (!studentInfo) return; // fetchStudentInfo already redirected to login
   
     // Step 2: Render profile with real data
     populateProfile(studentInfo);
   }
   
   init();