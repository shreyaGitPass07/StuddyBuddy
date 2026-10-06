const AUTH_BASE = "https://studdybuddy-sghs.onrender.com/api/auth";
const CACHE_KEY = "studentInfo";

// Browser mein saved copy nikalo (turant milti hai)
export function getCachedStudent() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

// Server se fresh info lao
async function doFetch() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "signin.html";
    return null;
  }

  try {
    const res = await fetch(`${AUTH_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.success) {
      localStorage.removeItem("token");
      localStorage.removeItem(CACHE_KEY);
      window.location.href = "signin.html";
      return null;
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(data.student));
    return data.student;
  } catch {
    return null; // server slow/down ho to saved copy hi chalegi
  }
}

// Ek page pe sirf ek hi baar server ko call jaye (appbar + sidebar dono use karein)
let pending = null;
export function fetchFreshStudent() {
  if (!pending) pending = doFetch();
  return pending;
}