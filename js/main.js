// ============================================
// ANCA RADA — Main JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile nav toggle ----
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks  = document.querySelector('.nav__links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
    // Close on link click (mobile)
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // ---- Active nav link ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ---- Voiceover player (placeholder UI) ----
  document.querySelectorAll('.audio-play-btn').forEach(btn => {
    let playing = false;
    btn.addEventListener('click', () => {
      playing = !playing;
      const bar = btn.closest('.card__audio')?.querySelector('.audio-bar__fill');
      const label = btn.closest('.card__audio')?.querySelector('.audio-label');
      btn.innerHTML = playing
        ? `<svg viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16"/><rect x="15" y="4" width="4" height="16"/></svg>`
        : `<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>`;
      if (label) label.textContent = playing ? 'Playing voiceover...' : 'Listen to this story';
      // Simulate progress
      if (playing && bar) {
        let pct = 0;
        const interval = setInterval(() => {
          pct += 0.5;
          bar.style.width = pct + '%';
          if (pct >= 100 || !playing) {
            clearInterval(interval);
            bar.style.width = '0%';
            playing = false;
            btn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>`;
            if (label) label.textContent = 'Listen to this story';
          }
        }, 100);
        btn._interval = interval;
      } else if (btn._interval) {
        clearInterval(btn._interval);
        if (bar) bar.style.width = '0%';
      }
    });
  });

  // ---- Blog filter tabs ----
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.blog-filters').querySelectorAll('.filter-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Filter logic: data-filter on btn, data-category on cards
      const filter = btn.dataset.filter;
      document.querySelectorAll('.card[data-category]').forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ---- Newsletter / notify form ----
  document.querySelectorAll('.newsletter-form, .book-notify').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        const btn = form.querySelector('button, .btn');
        if (btn) { btn.textContent = '✓ You\'re in!'; btn.style.background = '#6B7C4D'; }
        input.value = '';
      }
    });
  });

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
