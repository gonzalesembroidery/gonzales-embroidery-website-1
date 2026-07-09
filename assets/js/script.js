// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
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

// Gallery filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.g-item');
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

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = item.querySelector('figcaption').textContent;
    lightbox.classList.add('open');
  });
});
function closeLightbox(){ lightbox.classList.remove('open'); lightboxImg.src=''; }
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// Scroll reveal
const revealTargets = document.querySelectorAll('.patch-card, .g-item, .step, .contact-card');
revealTargets.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach(el => io.observe(el));

// Quote form -> mailto
const quoteForm = document.getElementById('quoteForm');
quoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(quoteForm);
  const name = data.get('name');
  const email = data.get('email');
  const details = data.get('details');
  const subject = encodeURIComponent(`Quote Request from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nDetails:\n${details}`);
  window.location.href = `mailto:order@gonzalesembroidery.com?subject=${subject}&body=${body}`;
});
