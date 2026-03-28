/* ─────────────────────────────────────────
   Study Buddy — main.js
   ───────────────────────────────────────── */

// ─── 1. Scroll Reveal
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));


// ─── 2. Navbar shadow on scroll
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.style.boxShadow =
      window.scrollY > 40
        ? '0 4px 24px rgba(79,70,229,0.1)'
        : 'none';
  }
});


// ─── 3. Animated stat counters
function animateCount(id, target, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const increment = target / (duration / 16);
  const interval = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = Math.round(current);
    if (current >= target) clearInterval(interval);
  }, 16);
}

const statsSection = document.querySelector('.stats');

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount('s1', 87, 1200);
      animateCount('s2', 3,  800);
      animateCount('s3', 12, 1500);
      animateCount('s4', 100, 1000);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

if (statsSection) statsObserver.observe(statsSection);


// ─── 4. Progress bar animation
const progressSection = document.querySelector('.mockup-progress');

const progressObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = document.getElementById('mockProgressBar');
      if (bar) bar.style.width = '40%';
      progressObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

if (progressSection) progressObserver.observe(progressSection);