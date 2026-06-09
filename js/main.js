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

  // ---- Voiceover player ----
  // Buttons with data-audio="audio/filename.mp3" use real ElevenLabs audio.
  // Buttons without data-audio are silently inert until audio is added.
  const PLAY_ICON  = `<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>`;
  const PAUSE_ICON = `<svg viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16"/><rect x="15" y="4" width="4" height="16"/></svg>`;

  let activeAudio = null;
  let activeBtn   = null;

  function resetPlayer(btn, audio, bar, label) {
    audio.pause();
    audio.currentTime = 0;
    btn.innerHTML = PLAY_ICON;
    if (bar)   bar.style.width = '0%';
    if (label) label.textContent = 'Listen to this story';
  }

  document.querySelectorAll('.audio-play-btn[data-audio]').forEach(btn => {
    const audio  = new Audio(btn.dataset.audio);
    const wrap   = btn.closest('.card__audio') || btn.parentElement;
    const bar    = wrap.querySelector('.audio-bar__fill');
    const label  = wrap.querySelector('.audio-label');

    audio.addEventListener('timeupdate', () => {
      if (bar && audio.duration) {
        bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
      }
    });

    audio.addEventListener('ended', () => {
      resetPlayer(btn, audio, bar, label);
      activeAudio = null;
      activeBtn   = null;
    });

    btn.addEventListener('click', () => {
      // Stop any other playing track
      if (activeAudio && activeAudio !== audio) {
        const prevWrap  = activeBtn.closest('.card__audio') || activeBtn.parentElement;
        const prevBar   = prevWrap.querySelector('.audio-bar__fill');
        const prevLabel = prevWrap.querySelector('.audio-label');
        resetPlayer(activeBtn, activeAudio, prevBar, prevLabel);
      }

      if (audio.paused) {
        audio.play();
        btn.innerHTML = PAUSE_ICON;
        if (label) label.textContent = 'Playing...';
        activeAudio = audio;
        activeBtn   = btn;
      } else {
        resetPlayer(btn, audio, bar, label);
        activeAudio = null;
        activeBtn   = null;
      }
    });
  });

  // ---- Blog: infinite scroll + filter tabs ----
  const blogGrid = document.querySelector('.cards-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (blogGrid && filterBtns.length) {
    const INITIAL = 9;
    const BATCH = 6;

    const allCards = () => Array.from(blogGrid.querySelectorAll('article.card'));

    function resetPagination() {
      allCards().forEach((c, i) => c.classList.toggle('scroll-hidden', i >= INITIAL));
    }

    function revealMore() {
      Array.from(blogGrid.querySelectorAll('article.card.scroll-hidden'))
        .slice(0, BATCH)
        .forEach(c => c.classList.remove('scroll-hidden'));
    }

    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    blogGrid.insertAdjacentElement('afterend', sentinel);

    new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) revealMore(); },
      { rootMargin: '300px' }
    ).observe(sentinel);

    if (!new URLSearchParams(window.location.search).get('country')) {
      resetPagination();
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        allCards().forEach(c => c.classList.remove('scroll-hidden'));
        allCards().forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });

        if (filter === 'all') resetPagination();
      });
    });
  }

  // ---- Newsletter / notify form ----
  const SUBSCRIBE_URL = 'https://crimson-scene-cb02.anca-rada.workers.dev';
  document.querySelectorAll('.newsletter-form, .book-notify').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button, .btn');
      if (!input || !input.value) return;

      const originalText = btn ? btn.textContent : '';
      if (btn) { btn.textContent = 'Subscribing…'; btn.disabled = true; }

      try {
        const res = await fetch(SUBSCRIBE_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: input.value }),
        });
        if (res.ok) {
          if (btn) { btn.textContent = '✓ You\'re in!'; btn.style.background = '#6B7C4D'; }
          input.value = '';
        } else {
          throw new Error('failed');
        }
      } catch {
        if (btn) { btn.textContent = 'Try again'; btn.disabled = false; btn.style.background = ''; }
        setTimeout(() => { if (btn) { btn.textContent = originalText; btn.disabled = false; } }, 3000);
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
