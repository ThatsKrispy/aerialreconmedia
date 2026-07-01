/* ========================================
   AERIAL RECON MEDIA — MAIN JS
   ======================================== */

(function() {
  'use strict';

  /* ---- MOBILE NAV ---- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on backdrop click
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) closeMobileNav();
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMobileNav);
    });
  }

  function closeMobileNav() {
    toggle.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---- DESKTOP SERVICES DROPDOWN ---- */
  /* Hover still works via CSS. This adds click support (so a tap or a
     click commits to opening it, rather than relying on hover alone)
     and keyboard/Escape support, then closes on outside click. */
  const dropdownParents = document.querySelectorAll('.has-dropdown');
  dropdownParents.forEach(parent => {
    const trigger = parent.querySelector(':scope > a');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = parent.classList.contains('open');
      dropdownParents.forEach(p => p.classList.remove('open'));
      if (!isOpen) parent.classList.add('open');
    });
  });
  document.addEventListener('click', (e) => {
    dropdownParents.forEach(p => {
      if (!p.contains(e.target)) p.classList.remove('open');
    });
  });

  /* ---- HERO BACKGROUND VIDEO — lazy inject after load ---- */
  /* The poster image paints instantly. We only attach the heavy Vimeo
     iframe once the page has finished loading (and skip it entirely on
     slow connections / reduced-motion), so it never blocks first paint. */
  const heroWrap = document.getElementById('heroVideoWrap');
  if (heroWrap && heroWrap.dataset.vimeoBg) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection;
    const slowNet = conn && (conn.saveData || /2g/.test(conn.effectiveType || ''));
    if (!prefersReduced && !slowNet) {
      const injectHeroVideo = () => {
        const id = heroWrap.dataset.vimeoBg;
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&dnt=1`;
        iframe.title = 'Aerial Recon Media showreel';
        iframe.allow = 'autoplay';
        iframe.addEventListener('load', () => {
          const poster = heroWrap.querySelector('.home-hero__poster');
          if (poster) {
            poster.style.transition = 'opacity 0.8s ease';
            poster.style.opacity = '0';
          }
        });
        heroWrap.appendChild(iframe);
      };
      if (document.readyState === 'complete') {
        setTimeout(injectHeroVideo, 200);
      } else {
        window.addEventListener('load', () => setTimeout(injectHeroVideo, 200));
      }
    }
  }


  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      header.style.boxShadow = window.scrollY > 40
        ? '0 4px 30px rgba(0,0,0,0.6)'
        : 'none';
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ---- ACTIVE NAV LINK ---- */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && path.includes(href) && href !== '/' && href !== 'index.html') {
      a.classList.add('active');
    }
    if ((path === '/' || path.endsWith('index.html')) && (href === '/' || href === './index.html' || href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---- VIDEO LIGHTBOX ---- */
  const modal    = document.getElementById('videoModal');
  const modalWrap = modal ? modal.querySelector('.video-modal__iframe-wrap') : null;
  const closeBtn  = modal ? modal.querySelector('.video-modal__close') : null;

  // Vimeo IDs map for all gallery thumbs (includes .video-thumb-hero)
  const thumbs = document.querySelectorAll('[data-vimeo]');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const vid = thumb.dataset.vimeo;
      openVideoModal(vid);
    });
  });

  function openVideoModal(vimeoId) {
    if (!modal || !modalWrap) return;
    modalWrap.innerHTML = `
      <div class="video-wrap">
        <iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1&dnt=1"
          allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
      </div>`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!modal || !modalWrap) return;
    modalWrap.innerHTML = '';
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeVideoModal();
    });
  }

  // Keyboard esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
      closeMobileNav && closeMobileNav();
      dropdownParents.forEach(p => p.classList.remove('open'));
    }
  });

  /* ---- SCROLL REVEAL ---- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(el => obs.observe(el));
  }

  /* ---- CONTACT FORM ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('formStatus');
      const btn = contactForm.querySelector('button[type="submit"]');
      const orig = btn.textContent;

      btn.textContent = 'Sending…';
      btn.disabled = true;

      // Build form data — point to Formspree or replace with real endpoint
      const data = new FormData(contactForm);
      const action = contactForm.getAttribute('action');

      if (!action || action === '#') {
        // Demo mode — show success after delay
        setTimeout(() => {
          status.className = 'form-status form-status--success';
          status.textContent = 'Thank you! We\'ll be in touch shortly.';
          contactForm.reset();
          btn.textContent = orig;
          btn.disabled = false;
        }, 900);
        return;
      }

      fetch(action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(res => {
        if (res.ok) {
          status.className = 'form-status form-status--success';
          status.textContent = 'Thank you! We\'ll be in touch shortly.';
          contactForm.reset();
        } else {
          throw new Error();
        }
      }).catch(() => {
        status.className = 'form-status form-status--error';
        status.textContent = 'Something went wrong. Please call us at (305) 507-5562.';
      }).finally(() => {
        btn.textContent = orig;
        btn.disabled = false;
      });
    });
  }


  /* Auto-refresh Google-style relative review dates from an anchor date.
     Each review span has data-ago="YYYY-MM-DD"; this recomputes "X ago"
     on every page load so testimonials never go stale. */
  (function refreshReviewDates(){
    var els = document.querySelectorAll('.js-ago[data-ago]');
    if (!els.length) return;
    var now = new Date();
    els.forEach(function(el){
      var d = new Date(el.getAttribute('data-ago') + 'T00:00:00');
      if (isNaN(d.getTime())) return;
      var days = Math.floor((now - d) / 86400000);
      var t;
      if (days < 1)        t = 'today';
      else if (days < 2)   t = 'yesterday';
      else if (days < 7)   t = days + ' days ago';
      else if (days < 30)  { var w = Math.floor(days / 7);  t = w + (w === 1 ? ' week ago'  : ' weeks ago'); }
      else if (days < 365) { var m = Math.floor(days / 30); t = m + (m === 1 ? ' month ago' : ' months ago'); }
      else                 { var y = Math.floor(days / 365); t = y + (y === 1 ? ' year ago'  : ' years ago'); }
      el.textContent = t;
    });
  })();

})();
