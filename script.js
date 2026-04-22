/* ═══════════════════════════════════════════════════════════════════
   MALINKA SUPERMARCHÉ — script.js
   Settings panel, animations, nav, interactions
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── DEFAULTS ─── */
  const DEFAULTS = {
    theme:      'light',
    primary:    '#D41854',
    secondary:  '#FF4D7D',
    animations: true,
    density:    'comfortable',
    radius:     12,
    font:       'syne',
  };

  /* ─── STORAGE HELPERS ─── */
  const store = {
    get(key) {
      try { return JSON.parse(localStorage.getItem('malinka_' + key)); }
      catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem('malinka_' + key, JSON.stringify(value)); }
      catch { /* quota or private mode */ }
    },
    getAll() {
      const s = {};
      for (const k in DEFAULTS) s[k] = this.get(k) ?? DEFAULTS[k];
      return s;
    },
    clear() {
      for (const k in DEFAULTS) localStorage.removeItem('malinka_' + k);
    },
  };

  /* ─── ELEMENT REFS ─── */
  const html       = document.documentElement;
  const body       = document.body;
  const navHeader  = document.getElementById('navHeader');
  const panel      = document.getElementById('settingsPanel');
  const overlay    = document.getElementById('settingsOverlay');
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsClose  = document.getElementById('settingsClose');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const themeToggle  = document.getElementById('themeToggle');
  const animToggle   = document.getElementById('animToggle');
  const primaryInput    = document.getElementById('primaryColor');
  const secondaryInput  = document.getElementById('secondaryColor');
  const radiusSlider    = document.getElementById('radiusSlider');
  const radiusValue     = document.getElementById('radiusValue');
  const settingsReset   = document.getElementById('settingsReset');
  const yearSpan        = document.getElementById('currentYear');

  /* ─── APPLY SETTINGS ─── */
  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const n = parseInt(clean, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(', ');
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeToggle?.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
  }

  function applyPrimary(color) {
    const root = document.documentElement.style;
    root.setProperty('--color-primary', color);
    root.setProperty('--color-primary-rgb', hexToRgb(color));
    // Darken for hover state (naive approach: apply 15% darkening via filter approximation)
    root.setProperty('--color-primary-dark', darken(color, 0.15));
    root.setProperty('--color-primary-light', lighten(color, 0.1));
    if (primaryInput) primaryInput.value = color;
    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }

  function applySecondary(color) {
    const root = document.documentElement.style;
    root.setProperty('--color-secondary', color);
    root.setProperty('--color-secondary-rgb', hexToRgb(color));
    if (secondaryInput) secondaryInput.value = color;
  }

  function applyAnimations(enabled) {
    html.setAttribute('data-animations', String(enabled));
    animToggle?.setAttribute('aria-checked', String(enabled));
  }

  function applyDensity(density) {
    html.setAttribute('data-density', density);
    document.querySelectorAll('.density-option').forEach(btn => {
      const isActive = btn.dataset.density === density;
      btn.classList.toggle('density-option--active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function applyRadius(px) {
    document.documentElement.style.setProperty('--radius-base', px + 'px');
    if (radiusSlider) radiusSlider.value = px;
    if (radiusValue)  radiusValue.textContent = px + 'px';
  }

  function applyFont(font) {
    html.setAttribute('data-font', font);
    document.querySelectorAll('.font-option').forEach(btn => {
      const isActive = btn.dataset.font === font;
      btn.classList.toggle('font-option--active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function applyAll(settings) {
    applyTheme(settings.theme);
    applyPrimary(settings.primary);
    applySecondary(settings.secondary);
    applyAnimations(settings.animations);
    applyDensity(settings.density);
    applyRadius(settings.radius);
    applyFont(settings.font);
  }

  /* ─── COLOR MATH HELPERS ─── */
  function darken(hex, amount) {
    const [r, g, b] = hexToRgb(hex).split(', ').map(Number);
    const d = Math.round(amount * 255);
    return rgbToHex(Math.max(0, r - d), Math.max(0, g - d), Math.max(0, b - d));
  }

  function lighten(hex, amount) {
    const [r, g, b] = hexToRgb(hex).split(', ').map(Number);
    const d = Math.round(amount * 255);
    return rgbToHex(Math.min(255, r + d), Math.min(255, g + d), Math.min(255, b + d));
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  /* ─── SETTINGS PANEL ─── */
  function openPanel() {
    panel?.classList.add('open');
    overlay?.classList.add('open');
    panel?.setAttribute('aria-hidden', 'false');
    settingsToggle?.setAttribute('aria-expanded', 'true');
    // Trap focus inside panel
    panel?.querySelector('.settings-close')?.focus();
  }

  function closePanel() {
    panel?.classList.remove('open');
    overlay?.classList.remove('open');
    panel?.setAttribute('aria-hidden', 'true');
    settingsToggle?.setAttribute('aria-expanded', 'false');
    settingsToggle?.focus();
  }

  settingsToggle?.addEventListener('click', openPanel);
  settingsClose?.addEventListener('click', closePanel);
  overlay?.addEventListener('click', closePanel);

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel?.classList.contains('open')) closePanel();
  });

  /* ─── THEME TOGGLE ─── */
  themeToggle?.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    store.set('theme', next);
  });

  /* ─── ANIMATIONS TOGGLE ─── */
  animToggle?.addEventListener('click', () => {
    const isOn = animToggle.getAttribute('aria-checked') === 'true';
    applyAnimations(!isOn);
    store.set('animations', !isOn);
  });

  /* ─── COLOR INPUTS ─── */
  primaryInput?.addEventListener('input', e => {
    applyPrimary(e.target.value);
    store.set('primary', e.target.value);
  });

  secondaryInput?.addEventListener('input', e => {
    applySecondary(e.target.value);
    store.set('secondary', e.target.value);
  });

  /* Color presets */
  document.querySelectorAll('.color-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const color  = btn.dataset.color;
      const target = btn.dataset.target;
      if (target === 'primary') {
        applyPrimary(color);
        store.set('primary', color);
      } else {
        applySecondary(color);
        store.set('secondary', color);
      }
      // Highlight active preset
      const group = btn.closest('.settings-color-presets');
      group?.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ─── RADIUS SLIDER ─── */
  radiusSlider?.addEventListener('input', e => {
    const val = parseInt(e.target.value);
    applyRadius(val);
    store.set('radius', val);
  });

  /* ─── DENSITY ─── */
  document.querySelectorAll('.density-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const density = btn.dataset.density;
      applyDensity(density);
      store.set('density', density);
    });
  });

  /* ─── FONT ─── */
  document.querySelectorAll('.font-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const font = btn.dataset.font;
      applyFont(font);
      store.set('font', font);
    });
  });

  /* ─── RESET ─── */
  settingsReset?.addEventListener('click', () => {
    store.clear();
    applyAll(DEFAULTS);
    // Reset color preset highlights
    document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
  });

  /* ─── MOBILE MENU ─── */
  function closeMobileMenu() {
    menuToggle?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      menuToggle.classList.add('open');
      mobileMenu?.classList.add('open');
      mobileMenu?.setAttribute('aria-hidden', 'false');
      menuToggle.setAttribute('aria-expanded', 'true');
    }
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ─── STICKY NAV SCROLL BEHAVIOR ─── */
  let lastScrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY;
    if (navHeader) {
      if (scrollY > 60) {
        navHeader.classList.add('scrolled');
      } else {
        navHeader.classList.remove('scrolled');
      }
    }
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  /* ─── SMOOTH SCROLL ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(html).getPropertyValue('--nav-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─── INTERSECTION OBSERVER FOR ANIMATIONS ─── */
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function observeAnimatable() {
    document.querySelectorAll(
      '.animate-up, .animate-fade, .animate-right, .animate-card'
    ).forEach(el => observer.observe(el));
  }

  observeAnimatable();

  /* ─── CATEGORY CHIPS ACTIVE STATE ─── */
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.cat-chip').forEach(c => {
        c.style.removeProperty('border-color');
        c.style.removeProperty('background');
        c.style.removeProperty('color');
      });
      this.style.borderColor = 'var(--color-primary)';
      this.style.background  = 'rgba(var(--color-primary-rgb), 0.1)';
      this.style.color       = 'var(--color-primary)';
    });
  });

  /* ─── FOOTER YEAR ─── */
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* ─── PRODUCT CARDS PARALLAX TILT (subtle, desktop only) ─── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerWidth > 1024) {
    document.querySelectorAll('.product-card, .review-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
        card.style.transition = 'transform 0.1s ease';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'all var(--t-base)';
      });
    });
  }

  /* ─── GALLERY IMAGE LIGHTBOX (simple) ─── */
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length) {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Visionneuse d\'image');
    lightbox.style.cssText = `
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(0,0,0,0.92); backdrop-filter: blur(12px);
      display: none; align-items: center; justify-content: center;
      padding: 2rem; cursor: zoom-out;
    `;

    const lbImg = document.createElement('img');
    lbImg.style.cssText = `
      max-width: 90vw; max-height: 88vh; border-radius: 12px;
      box-shadow: 0 20px 80px rgba(0,0,0,0.6);
      object-fit: contain;
      animation: lb-in 0.3s cubic-bezier(0.22,1,0.36,1) both;
    `;

    const lbClose = document.createElement('button');
    lbClose.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    lbClose.setAttribute('aria-label', 'Fermer la visionneuse');
    lbClose.style.cssText = `
      position: absolute; top: 1.5rem; right: 1.5rem;
      width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
      border-radius: 50%; background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2); cursor: pointer;
    `;

    // Style animation
    const styleTag = document.createElement('style');
    styleTag.textContent = '@keyframes lb-in { from { opacity:0; transform: scale(0.92); } to { opacity:1; transform: scale(1); } }';
    document.head.appendChild(styleTag);

    lightbox.appendChild(lbImg);
    lightbox.appendChild(lbClose);
    document.body.appendChild(lightbox);

    function openLightbox(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLightbox() {
      lightbox.style.display = 'none';
      lbImg.src = '';
      document.body.style.overflow = '';
    }

    galleryItems.forEach(item => {
      item.style.cursor = 'zoom-in';
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Agrandir l\'image');

      const handler = () => {
        const img = item.querySelector('img');
        if (img) openLightbox(img.src, img.alt);
      };

      item.addEventListener('click', handler);
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
    });

    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    lbClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox(); });
  }

  /* ─── HERO CTA RIPPLE ─── */
  document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top  - size / 2}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        pointer-events: none;
        transform: scale(0);
        animation: ripple 0.5s ease-out forwards;
      `;
      if (!document.getElementById('ripple-style')) {
        const rs = document.createElement('style');
        rs.id = 'ripple-style';
        rs.textContent = '@keyframes ripple { to { transform: scale(1); opacity: 0; } }';
        document.head.appendChild(rs);
      }
      this.style.position = 'relative';
      this.style.overflow  = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ─── COUNTER ANIMATION for hero stats ─── */
  function animateCounter(el, target, duration = 1500) {
    const isFloat = target.toString().includes('.');
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = isFloat
        ? (target * ease).toFixed(1)
        : Math.round(target * ease);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  // Observe hero stats
  const statNums = document.querySelectorAll('.hero-stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        const text = entry.target.textContent.replace(/[^\d.]/g, '');
        const target = parseFloat(text);
        if (!isNaN(target) && target > 0) {
          const plus = entry.target.querySelector('.hero-stat-plus');
          entry.target.textContent = '';
          animateCounter(entry.target, target);
          if (plus) entry.target.appendChild(plus);
        }
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statObserver.observe(el));

  /* ─── ACTIVE NAV LINK on scroll ─── */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) current = section.id;
    });
    navLinks.forEach(link => {
      link.style.color = link.getAttribute('href') === '#' + current
        ? 'var(--color-primary)'
        : '';
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ─── INIT ─── */
  function init() {
    // Load saved settings
    const saved = store.getAll();
    applyAll(saved);

    // Update color inputs
    if (primaryInput)   primaryInput.value   = saved.primary;
    if (secondaryInput) secondaryInput.value = saved.secondary;

    // Trigger initial animations for above-fold elements
    requestAnimationFrame(() => {
      document.querySelectorAll('.hero .animate-up, .hero .animate-fade').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 200 + i * 120);
      });
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Prevent FOUC
  document.documentElement.style.visibility = 'visible';

})();
