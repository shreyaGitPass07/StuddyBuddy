# 📚 Study Buddy

A clean web app that helps college students manage assignments, personal tasks, and study progress in one place.

🔗 **Live:** https://studdybuddy-dashboard.netlify.app

## ✨ Features

- **Auth** – Sign up, log in, token-based session
- **Dashboard** – Summary cards and Chart.js charts (completed vs. pending)
- **College Assignments** – Add, edit, delete, mark complete, filter (All / Pending / Completed / Overdue), live deadline countdown, AI Help
- **Personal Tasks** – Separate to-do list for non-academic work (Not Implemented Yet)
- **Notifications** – Reminders and alerts page (Not Implemented Yet)
- **Profile** – Edit details, change password, log out everywhere, delete account
- **Responsive** – Collapsible sidebar on mobile

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (ES modules), Chart.js
- **Backend:**  Node.js + Express + MongoDB 
- **Hosting:** Netlify (frontend), Render (backend)


## 🔐 Auth Flow

1. Login returns a token, saved in `localStorage`.
2. Requests send `Authorization: Bearer <token>`.
3. `GET /api/auth/me` returns the current student.
4. Student info is cached locally so the appbar and sidebar load instantly.
5. Logout clears both the token and the cache.

> ⏳ On Render's free tier, the first request after idle time can take 30+ seconds.

## 👩‍💻 Author

Built by **Shreya Tiwari**
