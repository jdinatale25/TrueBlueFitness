/* ===================================================
   TRUE BLUE FITNESS — main.js
   Scroll animations, nav behavior, progress bar, mobile nav
   =================================================== */

(function () {
  'use strict';

  /* ---------- Progress Bar ---------- */
  const progressBar = document.getElementById('progress-bar');

  function updateProgressBar() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ---------- Nav scroll shadow ---------- */
  const mainNav = document.getElementById('main-nav');

  function updateNav() {
    if (!mainNav) return;
    if (window.scrollY > 24) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }
  }

  /* ---------- Float CTA ---------- */
  const floatCta = document.getElementById('float-cta');

  function updateFloatCta() {
    if (!floatCta) return;
    if (window.scrollY > 400) {
      floatCta.classList.add('visible');
    } else {
      floatCta.classList.remove('visible');
    }
  }

  /* ---------- Scroll Reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  function revealOnScroll() {
    const windowBottom = window.scrollY + window.innerHeight;
    revealEls.forEach(function (el) {
      const elTop = el.getBoundingClientRect().top + window.scrollY;
      if (windowBottom > elTop + 60) {
        el.classList.add('visible');
      }
    });
  }

  /* ---------- Mobile Nav ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  function closeNav() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.querySelectorAll('span').forEach(function (s) {
      s.style.transform = '';
      s.style.opacity = '';
    });
  }

  if (navToggle && navLinks) {
    // Set initial ARIA state
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'nav-links');

    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      const spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    // Close nav on link click (mobile)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Close nav on outside click / tap
    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('open') &&
          !navToggle.contains(e.target) &&
          !navLinks.contains(e.target)) {
        closeNav();
      }
    });

    // Close nav on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeNav();
        navToggle.focus();
      }
    });

    // Close nav if window is resized above hamburger breakpoint
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        closeNav();
      }
    }, { passive: true });
  }

  /* ---------- Contact Form (placeholder behavior) ---------- */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // NOTE: Replace this with your actual form submission logic
      // (e.g., Tally embed, Netlify Forms, Formspree, Zapier webhook)
      contactForm.style.display = 'none';
      if (formSuccess) {
        formSuccess.style.display = 'block';
      }
    });
  }

  /* ---------- Scroll handler (throttled) ---------- */
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateProgressBar();
        updateNav();
        updateFloatCta();
        revealOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  /* ---------- Init ---------- */
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', revealOnScroll, { passive: true });

  // Run once on load
  updateProgressBar();
  updateNav();
  updateFloatCta();
  revealOnScroll();

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      var answer = this.nextElementSibling;

      // Close all others
      document.querySelectorAll('.faq-question').forEach(function(other) {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.classList.remove('open');
      });

      // Toggle current
      if (!expanded) {
        this.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });

})();
