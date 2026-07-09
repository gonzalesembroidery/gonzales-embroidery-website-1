// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Header shadow/solid state on scroll
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Gallery filtering (only present on pages with .filter-btn)
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.g-item');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('hidden', !show);
      });
    });
  });
}

// Lightbox (works on any page that has .g-item + #lightbox)
const lightbox = document.getElementById('lightbox');
if (lightbox && galleryItems.length) {
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      const cap = item.querySelector('figcaption');
      lightboxCaption.textContent = cap ? cap.textContent : '';
      lightbox.classList.add('open');
    });
  });
  function closeLightbox(){ lightbox.classList.remove('open'); lightboxImg.src=''; }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

// Scroll reveal — applies to common repeating blocks across all pages
const revealSelectors = '.patch-card, .g-item, .step, .contact-card, .price-card, .tt-card, .video-card, .reveal';
const revealTargets = document.querySelectorAll(revealSelectors);
revealTargets.forEach(el => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('in'));
}

// Quote form -> send-quote.php backend, with mailto fallback
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  const statusEl = document.getElementById('formStatus');
  const submitBtn = quoteForm.querySelector('button[type="submit"]');

  const showStatus = (msg, ok) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.remove('ok', 'err');
    statusEl.classList.add('show', ok ? 'ok' : 'err');
  };

  const mailtoFallback = (data) => {
    const subject = encodeURIComponent(`Quote Request from ${data.get('name') || ''}`);
    const body = encodeURIComponent(
      `Name: ${data.get('name') || ''}\n` +
      `Email: ${data.get('email') || ''}\n` +
      `Company/Team: ${data.get('company') || ''}\n\n` +
      `Details:\n${data.get('details') || ''}`
    );
    window.location.href = `mailto:order@gonzalesembroidery.com?subject=${subject}&body=${body}`;
  };

  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(quoteForm);

    // Honeypot — if filled, silently pretend success (bot)
    if (data.get('website')) {
      quoteForm.reset();
      showStatus("Thanks! We'll be in touch shortly.", true);
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.7'; }

    try {
      const res = await fetch(quoteForm.getAttribute('action') || 'send-quote.php', {
        method: 'POST',
        body: data,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      let payload = null;
      try { payload = await res.json(); } catch (_) { /* non-JSON response */ }

      if (res.ok && payload && payload.ok) {
        quoteForm.reset();
        showStatus("Thanks! Your request is on its way — we'll reply by email shortly.", true);
      } else {
        throw new Error((payload && payload.error) || 'Server error');
      }
    } catch (err) {
      // Backend not available (e.g. static preview, PHP not enabled) — fall back to opening the visitor's email app
      showStatus("Couldn't reach our server, opening your email app instead...", false);
      mailtoFallback(data);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
    }
  });
}
