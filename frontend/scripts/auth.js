/* ─────────────────────────────────────────
   Study Buddy — auth.js
   Handles both signup.html and login.html
   ───────────────────────────────────────── */

// ─── Detect which page we're on
const isSignup = !!document.getElementById('signupForm');
const isLogin  = !!document.getElementById('loginForm');

// ─── Helpers ───────────────────────────────────────────────

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  input.classList.add('is-error');
  input.classList.remove('is-success');
  error.textContent = '⚠ ' + message;
  error.classList.add('visible');
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  input.classList.remove('is-error');
  error.textContent = '';
  error.classList.remove('visible');
}

function markSuccess(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.remove('is-error');
  input.classList.add('is-success');
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}


function setLoading(loading) {
  const btn     = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');
  if (!btn) return;
  btn.disabled = loading;
  btnText.style.display  = loading ? 'none'  : 'inline';
  spinner.classList.toggle('hidden', !loading);
}

// ─── Password toggle ────────────────────────────────────────

const togglePwBtn = document.getElementById('togglePw');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');

const eyeOpen  = `<path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>`;
const eyeSlash = `<path d="M1 1l14 14M6.5 6.6A3 3 0 0010.4 10M3.4 3.5C2.1 4.8 1 6.4 1 8s2.5 5 7 5c1.5 0 2.9-.4 4.1-1M6 3.2C6.6 3.1 7.3 3 8 3c4.5 0 7 5 7 5s-.7 1.4-1.9 2.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`;

if (togglePwBtn && passwordInput) {
  togglePwBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    eyeIcon.innerHTML = isHidden ? eyeSlash : eyeOpen;
  });
}

// ─── Password strength (signup only) ───────────────────────

if (isSignup && passwordInput) {
  const strengthBar   = document.getElementById('strengthBar');
  const strengthFill  = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');

  const levels = [
    { label: 'Too weak',  color: '#EF4444', width: '20%' },
    { label: 'Weak',      color: '#F97316', width: '40%' },
    { label: 'Fair',      color: '#EAB308', width: '60%' },
    { label: 'Strong',    color: '#22C55E', width: '80%' },
    { label: 'Very strong', color: '#10B981', width: '100%' },
  ];

  function getStrength(pw) {
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    if (!val) {
      strengthBar.classList.remove('visible');
      strengthLabel.classList.remove('visible');
      return;
    }
    strengthBar.classList.add('visible');
    strengthLabel.classList.add('visible');
    const level = levels[getStrength(val)];
    strengthFill.style.width      = level.width;
    strengthFill.style.background = level.color;
    strengthLabel.textContent     = level.label;
    strengthLabel.style.color     = level.color;
  });
}

// ─── Live validation ────────────────────────────────────────

// Name (signup only)
const nameInput = document.getElementById('name');
if (nameInput) {
  nameInput.addEventListener('blur', () => {
    const val = nameInput.value.trim();
    if (!val)             showError('name', 'nameError', 'Please enter your full name.');
    else if (val.length < 2) showError('name', 'nameError', 'Name must be at least 2 characters.');
    else { clearError('name', 'nameError'); markSuccess('name'); }
  });
  nameInput.addEventListener('input', () => clearError('name', 'nameError'));
}

// Email
const emailInput = document.getElementById('email');
if (emailInput) {
  emailInput.addEventListener('blur', () => {
    const val = emailInput.value.trim();
    if (!val)                 showError('email', 'emailError', 'Please enter your email address.');
    else if (!isValidEmail(val)) showError('email', 'emailError', 'Please enter a valid email address.');
    else { clearError('email', 'emailError'); markSuccess('email'); }
  });
  emailInput.addEventListener('input', () => clearError('email', 'emailError'));
}

// Password
if (passwordInput) {
  passwordInput.addEventListener('blur', () => {
    const val = passwordInput.value;
    if (!val) showError('password', 'passwordError', 'Please enter a password.');
    else if (isSignup && val.length < 8) showError('password', 'passwordError', 'Password must be at least 8 characters.');
    else if (isLogin  && val.length < 1) showError('password', 'passwordError', 'Please enter your password.');
    else { clearError('password', 'passwordError'); markSuccess('password'); }
  });
  passwordInput.addEventListener('input', () => clearError('password', 'passwordError'));
}

// ─── SIGNUP form submit 
// ─────────────────────────────────────



if (isSignup) {
  const form = document.getElementById('signupForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let valid = true;

    if (!name || name.length < 2) {
      showError('name', 'nameError', 'Please enter your full name.');
      valid = false;
    } else {
      clearError('name', 'nameError');
      markSuccess('name');
    }

    if (!email || !isValidEmail(email)) {
      showError('email', 'emailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError('email', 'emailError');
      markSuccess('email');
    }

    if (!password || password.length < 8) {
      showError('password', 'passwordError', 'Password must be at least 8 characters.');
      valid = false;
    } else {
      clearError('password', 'passwordError');
      markSuccess('password');
    }

    if (!valid) return;

    // Simulate API call

    

    
    const API_BASE = "http://localhost:3000/api";
    const response = await fetch(`${API_BASE}/register`,{
      method : "POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify({
        name,
        email,
        password 
      })
    })
    
    const data = await response.json();
    console.log(data);

    if (!data.success){
      showToast(data.message, "error");
      return;
    }

    showToast('Account created! Welcome to Study Buddy 🎉');

    


    /*
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);

    showToast('Account created! Welcome to Study Buddy 🎉');

    */

    // Redirect to login after a short delay (wire up your backend here)
    setTimeout(() => {
      window.location.href = 'signin.html';
    }, 2000);
  });
}

// ─── LOGIN form submit ──────────────────────────────────────

if (isLogin) {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let valid = true;

    if (!email || !isValidEmail(email)) {
      showError('email', 'emailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError('email', 'emailError');
      markSuccess('email');
    }

    if (!password) {
      showError('password', 'passwordError', 'Please enter your password.');
      valid = false;
    } else {
      clearError('password', 'passwordError');
      markSuccess('password');
    }

    if (!valid) return;

    // Simulate API call

    
    const API_BASE = "http://localhost:3000/api";

    const response = await fetch(`${API_BASE}/login`, {
      method : "POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify({
        email,
        password
      })
    })

  

    const data = await response.json();

    if (!data.success){
      showToast(data.message, "error")
      return;
    }

    showToast('Logged in successfully! Welcome back 👋');

    // Redirect to your dashboard here
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
  });
}