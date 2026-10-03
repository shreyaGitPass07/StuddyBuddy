/* ─────────────────────────────────────────────────────────────
   Study Buddy — assignments/assignments.js

   BACKEND FIELDS (from your MongoDB model):
     _id           → MongoDB auto-generated ID (used for update/delete)
     studentEmail  → student's email
     topic         → assignment title/topic
     description   → optional description
     lastDate      → due date (ISO string)
     status        → "pending" | "completed"
     createdAt     → auto (timestamps: true)

   API ROUTES (base: http://localhost:3000/api/assignments):
     GET    /:email   → getAssignments  — fetch all by student email
     POST   /create   → createAssignment
     PUT    /:id      → updateAssignment — uses MongoDB _id
     DELETE /:id      → deleteAssignment — uses MongoDB _id

   AUTH ROUTE:
     GET    /api/auth/me → returns logged-in student (token in header)
   ───────────────────────────────────────────────────────────── */

/* ═══════════════════════════════════
   CONFIG
═══════════════════════════════════ */
const API_BASE  = "http://localhost:3000/api/assignments";
const AUTH_BASE = "http://localhost:3000/api/auth";
const AI_BASE   = "http://localhost:3000/api/ai";

/* ═══════════════════════════════════
   STUDENT INFO
   Populated once at init via /api/auth/me.
   All other API calls wait until this is set.
═══════════════════════════════════ */
let studentInfo = null;

async function fetchStudentInfo() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
    return null;
  }

  try {
    const res  = await fetch(`${AUTH_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.success) {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
      return null;
    }

    return data.student;
  } catch (err) {
    showToast("Could not reach server. Please try again.", "error");
    return null;
  }
}

/* ═══════════════════════════════════
   API CALLS
═══════════════════════════════════ */

async function fetchAssignments() {
  const res  = await fetch(`${API_BASE}/${studentInfo.email}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

async function apiCreate(payload) {
  const res  = await fetch(`${API_BASE}/create`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

async function apiUpdate(id, updates) {
  const res  = await fetch(`${API_BASE}/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

async function apiDelete(id) {
  const res  = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
}

/* ═══════════════════════════════════
   LOCAL STATE
═══════════════════════════════════ */
let assignments = [];

/* ═══════════════════════════════════
   HELPERS
═══════════════════════════════════ */

function isCompleted(a) {
  return a.status === "completed";
}

function isOverdue(a) {
  return !isCompleted(a) && new Date(a.lastDate).getTime() < Date.now();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getTimeLeft(a) {
  if (isCompleted(a)) return { label: "Completed ✓", cls: "time-left--done" };

  const diff = new Date(a.lastDate).getTime() - Date.now();
  if (diff <= 0) return { label: "Overdue", cls: "time-left--overdue" };

  const mins  = Math.floor(diff / 60000);
  const days  = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m     = mins % 60;

  const label = days > 0  ? `${days}d ${hours}h left`
              : hours > 0 ? `${hours}h ${m}m left`
              : `${m}m left`;

  const cls = days === 0 && hours < 6 ? "time-left--urgent"
            : days <= 1               ? "time-left--soon"
            : "time-left--ok";

  return { label, cls };
}

function escHtml(str = "") {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function showToast(msg, type = "success") {
  document.querySelector(".toast")?.remove();
  const t = document.createElement("div");
  t.className = `toast${type === "error" ? " toast-error" : ""}`;
  t.innerHTML = `<span>${type === "success" ? "✓" : "✕"}</span> ${msg}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 3000);
}

/* ═══════════════════════════════════
   MARKDOWN → HTML RENDERER
   Handles: headings, bold, italic,
   inline code, code blocks, tables,
   ordered/unordered lists, hr, line breaks
═══════════════════════════════════ */
function renderMarkdown(md = "") {
  let html = md;

  // Escape HTML first (but we need to preserve markdown chars)
  // Instead, we process markdown directly and escape as we go.

  // Code blocks (``` ... ```)
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => {
    return `<pre class="md-code-block"><code>${escHtml(code.trim())}</code></pre>`;
  });

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    return `<code class="md-inline-code">${escHtml(code)}</code>`;
  });

  // Tables (| col | col |)
  html = html.replace(/(\|.+\|\n?)+/g, (tableBlock) => {
    const rows = tableBlock.trim().split("\n").filter(r => r.trim());
    if (rows.length < 2) return tableBlock;

    const headerCells = rows[0].split("|").map(c => c.trim()).filter(Boolean);
    // rows[1] is the separator (--- line), skip it
    const bodyRows = rows.slice(2);

    const thead = `<thead><tr>${headerCells.map(c => `<th>${c}</th>`).join("")}</tr></thead>`;
    const tbody = bodyRows.map(row => {
      const cells = row.split("|").map(c => c.trim()).filter(Boolean);
      return `<tr>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
    }).join("");

    return `<table class="md-table"><${thead}<tbody>${tbody}</tbody></table>`;
  });

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3 class='md-h3'>$1</h3>");
  html = html.replace(/^## (.+)$/gm,  "<h2 class='md-h2'>$1</h2>");
  html = html.replace(/^# (.+)$/gm,   "<h1 class='md-h1'>$1</h1>");

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g,     "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g,         "<em>$1</em>");

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr class='md-hr' />");

  // Unordered lists
  html = html.replace(/(^[\*\-] .+(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map(line =>
      `<li>${line.replace(/^[\*\-] /, "")}</li>`
    ).join("");
    return `<ul class="md-ul">${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/(^\d+\. .+(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map(line =>
      `<li>${line.replace(/^\d+\. /, "")}</li>`
    ).join("");
    return `<ol class="md-ol">${items}</ol>`;
  });

  // Paragraphs — wrap lines not already in a block tag
  html = html.split("\n").map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (/^<(h[1-3]|ul|ol|li|pre|table|hr|thead|tbody|tr|th|td)/.test(trimmed)) return line;
    return `<p class="md-p">${line}</p>`;
  }).join("\n");

  return html;
}

/* ═══════════════════════════════════
   RENDER
═══════════════════════════════════ */
let activeFilter = "all";

function getFiltered() {
  return assignments.filter(a => {
    if (activeFilter === "all")       return true;
    if (activeFilter === "completed") return isCompleted(a);
    if (activeFilter === "pending")   return !isCompleted(a) && !isOverdue(a);
    if (activeFilter === "overdue")   return isOverdue(a);
    return true;
  });
}

function render() {
  const list     = document.getElementById("assignmentsList");
  const empty    = document.getElementById("emptyState");
  const counter  = document.getElementById("filterCount");
  const filtered = getFiltered();

  counter.textContent = `${filtered.length} assignment${filtered.length !== 1 ? "s" : ""}`;

  if (assignments.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  if (filtered.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);font-size:.9rem;">
        No assignments in this category.
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(cardHTML).join("");
  attachCardListeners();
}

function cardHTML(a) {
  const completed = isCompleted(a);
  const overdue   = isOverdue(a);
  const timeLeft  = getTimeLeft(a);

  const statusBadge = completed
    ? `<span class="badge badge--done">Done</span>`
    : overdue
      ? `<span class="badge badge--overdue">Overdue</span>`
      : `<span class="badge badge--pending">Pending</span>`;

  const descHtml = a.description
    ? `<p class="asgn-desc">${escHtml(a.description)}</p>` : "";

  const toggleBtn = completed
    ? `<button class="action-btn btn-undo" data-id="${a._id}" data-action="toggle">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M2 8a6 6 0 116 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M2 4v4h4"         stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>Undo
      </button>`
    : `<button class="action-btn btn-complete" data-id="${a._id}" data-action="toggle">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M2 8l4 4 8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>Mark Complete
      </button>`;

  return `
    <div class="asgn-card${completed ? " is-completed" : ""}${overdue ? " is-overdue" : ""}" data-id="${a._id}">
      <div class="asgn-body">
        <div class="asgn-top">
          <div class="asgn-check-wrap">
            <div class="asgn-checkbox${completed ? " checked" : ""}"
                 data-id="${a._id}" data-action="toggle" title="Toggle complete"></div>
          </div>
          <div class="asgn-meta">
            <p class="asgn-topic">${escHtml(a.topic)}</p>
            ${descHtml}
          </div>
          <div class="asgn-badges">${statusBadge}</div>
        </div>

        <div class="asgn-info">
          <div class="asgn-info-item">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.4"/>
              <path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            <span>Due: <strong>${formatDate(a.lastDate)}</strong></span>
          </div>
          <div class="asgn-info-item">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M8 4.5V8l2.5 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            <span class="time-left ${timeLeft.cls}">${timeLeft.label}</span>
          </div>
        </div>

        <div class="asgn-actions">
          ${toggleBtn}
          <button class="action-btn btn-edit"   data-id="${a._id}" data-action="edit">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>Edit
          </button>
          <button class="action-btn btn-ai"     data-id="${a._id}" data-action="ai">✦ AI Help</button>
          <button class="action-btn btn-delete" data-id="${a._id}" data-action="delete">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="3" y="4" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            </svg>Delete
          </button>
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════════════
   CARD EVENT LISTENERS
═══════════════════════════════════ */

function attachCardListeners() {
  document.querySelectorAll("[data-action]").forEach(el => {
    el.addEventListener("click", e => {
      const { action, id } = e.currentTarget.dataset;
      if (action === "toggle") toggleStatus(id);
      else if (action === "edit")   openModal(id);
      else if (action === "delete") handleDelete(id);
      else if (action === "ai")     openAI(id);
    });
  });
}

/* ═══════════════════════════════════
   CRUD
═══════════════════════════════════ */

async function toggleStatus(id) {
  const a = assignments.find(x => x._id === id);
  if (!a) return;

  const newStatus = isCompleted(a) ? "pending" : "completed";
  try {
    const updated = await apiUpdate(id, { status: newStatus });
    assignments = assignments.map(x => x._id === id ? updated : x);
    showToast(newStatus === "completed" ? "Marked complete! 🎉" : "Marked as pending.");
    render();
  } catch (err) {
    showToast("Could not update assignment.", "error");
  }
}

async function handleDelete(id) {
  if (!confirm("Delete this assignment? This cannot be undone.")) return;
  try {
    await apiDelete(id);
    assignments = assignments.filter(x => x._id !== id);
    showToast("Assignment deleted.");
    render();
  } catch (err) {
    showToast("Could not delete assignment.", "error");
  }
}

/* ═══════════════════════════════════
   ADD / EDIT MODAL
═══════════════════════════════════ */

const modal         = document.getElementById("assignmentModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const form          = document.getElementById("assignmentForm");
const fieldTopic    = document.getElementById("fieldTopic");
const fieldDesc     = document.getElementById("fieldDesc");
const fieldDue      = document.getElementById("fieldDue");
const editIdInput   = document.getElementById("editId");
const modalTitle    = document.getElementById("modalTitle");
const modalSub      = document.getElementById("modalSub");
const saveLabel     = document.getElementById("saveLabel");
const charCount     = document.getElementById("charCount");
const errTopic      = document.getElementById("errTopic");
const errDue        = document.getElementById("errDue");

function setMinDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  fieldDue.min = now.toISOString().slice(0, 16);
}

function openModal(editId = null) {
  setMinDate();
  errTopic.classList.remove("show");
  errDue.classList.remove("show");

  if (editId) {
    const a = assignments.find(x => x._id === editId);
    if (!a) return;
    modalTitle.textContent = "Edit Assignment";
    modalSub.textContent   = "Update the details below.";
    saveLabel.textContent  = "Save Changes";
    editIdInput.value      = editId;
    fieldTopic.value       = a.topic;
    fieldDesc.value        = a.description || "";
    charCount.textContent  = `${(a.description || "").length} / 500`;
    const d = new Date(a.lastDate);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    fieldDue.value = d.toISOString().slice(0, 16);
  } else {
    modalTitle.textContent = "New Assignment";
    modalSub.textContent   = "Fill in the details below.";
    saveLabel.textContent  = "Add Assignment";
    editIdInput.value      = "";
    form.reset();
    charCount.textContent  = "0 / 500";
  }

  modal.classList.add("show");
  modalBackdrop.classList.add("show");
  fieldTopic.focus();
}

function closeModal() {
  modal.classList.remove("show");
  modalBackdrop.classList.remove("show");
}

fieldDesc.addEventListener("input", () => {
  charCount.textContent = `${fieldDesc.value.length} / 500`;
});

document.getElementById("btnAddAssignment").addEventListener("click", () => openModal());
document.getElementById("btnAddEmpty")?.addEventListener("click",      () => openModal());
document.getElementById("modalClose").addEventListener("click",  closeModal);
document.getElementById("btnCancel").addEventListener("click",   closeModal);
modalBackdrop.addEventListener("click", closeModal);

form.addEventListener("submit", async e => {
  e.preventDefault();
  let valid = true;

  errTopic.classList.remove("show");
  errDue.classList.remove("show");

  if (!fieldTopic.value.trim()) {
    errTopic.textContent = "Please enter a topic.";
    errTopic.classList.add("show");
    valid = false;
  }
  if (!fieldDue.value) {
    errDue.textContent = "Please select a due date.";
    errDue.classList.add("show");
    valid = false;
  } else if (!editIdInput.value && new Date(fieldDue.value) <= new Date()) {
    errDue.textContent = "Due date must be in the future.";
    errDue.classList.add("show");
    valid = false;
  }
  if (!valid) return;

  const isEdit = !!editIdInput.value;

  try {
    if (isEdit) {
      const updated = await apiUpdate(editIdInput.value, {
        topic:       fieldTopic.value.trim(),
        description: fieldDesc.value.trim(),
        lastDate:    new Date(fieldDue.value).toISOString(),
      });
      assignments = assignments.map(x => x._id === editIdInput.value ? updated : x);
      showToast("Assignment updated! ✏️");
    } else {
      const created = await apiCreate({
        studentEmail: studentInfo.email,
        topic:        fieldTopic.value.trim(),
        description:  fieldDesc.value.trim(),
        lastDate:     new Date(fieldDue.value).toISOString(),
        status:       "pending",
      });
      assignments.unshift(created);
      showToast("Assignment added! 📋");
    }

    closeModal();
    render();
  } catch (err) {
    showToast("Something went wrong. Try again.", "error");
  }
});

/* ═══════════════════════════════════
   FILTER BUTTONS
═══════════════════════════════════ */

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

/* ═══════════════════════════════════
   AI MODAL
═══════════════════════════════════ */

const aiModal    = document.getElementById("aiModal");
const aiBackdrop = document.getElementById("aiBackdrop");
const aiChat     = document.getElementById("aiChat");
const aiInput    = document.getElementById("aiInput");
const aiSend     = document.getElementById("aiSend");
let currentAIAssignment = null;

function openAI(id) {
  const a = assignments.find(x => x._id === id);
  if (!a) return;
  currentAIAssignment = a;
  document.getElementById("aiAssignmentName").textContent = `📋 ${a.topic}`;

  aiChat.innerHTML = `
    <div class="ai-bubble ai-bubble--bot">
      <div class="ai-bubble-avatar">✦</div>
      <div class="ai-bubble-text">
        Hi${studentInfo?.name ? ` ${studentInfo.name.split(" ")[0]}` : ""}! I'm your Study Buddy AI.
        I can see you're working on <strong>"${escHtml(a.topic)}"</strong> — due on ${formatDate(a.lastDate)}.
        Ask me anything about it and I'll keep my answers short and to the point!
      </div>
    </div>`;

  aiModal.classList.add("show");
  aiBackdrop.classList.add("show");
  aiInput.focus();
}

function closeAI() {
  aiModal.classList.remove("show");
  aiBackdrop.classList.remove("show");
}

document.getElementById("aiClose").addEventListener("click", closeAI);
aiBackdrop.addEventListener("click", closeAI);

document.querySelectorAll(".ai-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    aiInput.value = chip.dataset.prompt;
    sendAIMessage();
  });
});

aiSend.addEventListener("click", sendAIMessage);
aiInput.addEventListener("keydown", e => { if (e.key === "Enter") sendAIMessage(); });

function appendBubble(htmlContent, role) {
  const div = document.createElement("div");
  div.className = `ai-bubble ai-bubble--${role}`;
  div.innerHTML = `
    <div class="ai-bubble-avatar">${role === "bot" ? "✦" : "ME"}</div>
    <div class="ai-bubble-text ai-bubble-text--${role}">${htmlContent}</div>`;
  aiChat.appendChild(div);
  aiChat.scrollTop = aiChat.scrollHeight;
}

function appendTyping() {
  const wrap = document.createElement("div");
  wrap.className = "ai-bubble ai-bubble--bot";
  wrap.id = "typingIndicator";
  wrap.innerHTML = `
    <div class="ai-bubble-avatar">✦</div>
    <div class="ai-typing"><span></span><span></span><span></span></div>`;
  aiChat.appendChild(wrap);
  aiChat.scrollTop = aiChat.scrollHeight;
}

function removeTyping() {
  document.getElementById("typingIndicator")?.remove();
}

/* ═══════════════════════════════════
   AI API CALL
   Builds a context-rich prompt using
   student info + assignment details,
   asks for a concise reply.
═══════════════════════════════════ */
async function sendAIMessage() {
  const msg = aiInput.value.trim();
  if (!msg || !currentAIAssignment) return;

  aiInput.value = "";

  // Show user bubble (escaped plain text)
  appendBubble(escHtml(msg), "user");
  appendTyping();

  const a = currentAIAssignment;

  // Build context-aware prompt
  const studentCtx = studentInfo
    ? `Student: ${studentInfo.name || "Unknown"} (${studentInfo.email}). `
    : "";
  const assignmentCtx =
    `Current assignment topic: "${a.topic}". ` +
    (a.description ? `Details: ${a.description}. ` : "") +
    `Due: ${formatDate(a.lastDate)}.`;

  const prompt =
    `You are Study Buddy, a smart and friendly AI assistant — like ChatGPT but built for students. ` +
    `You can help with anything: assignments, concepts, coding, math, writing, general knowledge, or just a casual chat.\n\n` +
    `Context (use only if relevant to the question): ${studentCtx}${assignmentCtx}\n\n` +
    `User: "${msg}"\n\n` +
    `Reply naturally and concisely. Keep it under 150 words unless the topic genuinely needs more. ` +
    `Skip unnecessary intros — just answer.`;

  try {
    const res = await fetch(AI_BASE, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ question: prompt }),
    });

    const data = await res.json();

    removeTyping();

    if (!data.success) {
      appendBubble("Sorry, I couldn't get a response. Please try again.", "bot");
      return;
    }

    // Render the markdown response as formatted HTML
    const renderedHTML = renderMarkdown(data.message);
    appendBubble(renderedHTML, "bot");

  } catch (err) {
    removeTyping();
    appendBubble("Network error — please check your connection and try again.", "bot");
  }
}

/* ═══════════════════════════════════
   KEYBOARD SHORTCUT
═══════════════════════════════════ */

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); closeAI(); }
});

/* ═══════════════════════════════════
   INIT
═══════════════════════════════════ */

async function init() {
  studentInfo = await fetchStudentInfo();
  if (!studentInfo) return;

  try {
    assignments = await fetchAssignments();
  } catch (err) {
    showToast("Could not load assignments.", "error");
    assignments = [];
  }

  render();
}

init();

// Re-render time-left labels every minute
setInterval(render, 60000);