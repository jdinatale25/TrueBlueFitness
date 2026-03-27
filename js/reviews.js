/* ===================================================
   TRUE BLUE FITNESS — reviews.js
   Fetches live Google reviews via the Places API (New)
   and replaces the hardcoded testimonial cards.

   SETUP (one-time):
   1. Go to https://console.cloud.google.com
   2. Create a project and enable "Places API (New)"
   3. Create an API key — restrict it to your domain
      (e.g. truebluefitness.com) under "API restrictions"
   4. Find your Place ID:
      https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
      Search "True Blue Fitness Fort Worth" and copy the Place ID (starts with ChIJ...)
   5. Paste both values below and you're done.
   =================================================== */

(function () {
  'use strict';

  /* ---------- CONFIG — fill these in ---------- */
  var PLACE_ID = 'YOUR_PLACE_ID';  // e.g. 'ChIJN1t_tDeuEmsRUsoyG83frY4'
  var API_KEY  = 'YOUR_API_KEY';   // restrict this key to truebluefitness.com in Cloud Console

  /* ---------- Guard: don't run if not configured ---------- */
  if (PLACE_ID === 'YOUR_PLACE_ID' || API_KEY === 'YOUR_API_KEY') {
    console.info('True Blue Fitness: Google Places API not configured. Using hardcoded reviews.');
    return;
  }

  /* ---------- Selectors ---------- */
  var grid = document.querySelector('.testimonials-grid');
  if (!grid) return;

  /* ---------- Delay classes for staggered reveal ---------- */
  var delays = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3',
                '', 'reveal-delay-1', 'reveal-delay-2'];

  /* ---------- Safely escape user-generated text ---------- */
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- Google logo SVG (inline, matches existing cards) ---------- */
  var GOOGLE_SVG =
    '<svg width="12" height="12" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" ' +
    'aria-hidden="true" style="flex-shrink:0">' +
    '<path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 ' +
    '14.6 0 6.6 5.4 2.7 13.3l7.8 6.1C12.4 13 17.7 9.5 24 9.5z"/>' +
    '<path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5' +
    '-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>' +
    '<path fill="#FBBC05" d="M10.5 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.8' +
    '-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8-6.1z"/>' +
    '<path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 ' +
    '2.2-6.3 0-11.6-4.3-13.5-10l-8 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';

  /* ---------- Build a single review card ---------- */
  function buildCard(review, delayClass) {
    var name    = (review.authorAttribution && review.authorAttribution.displayName) || 'Anonymous';
    var initial = name.charAt(0).toUpperCase();
    var rating  = review.rating || 5;
    var text    = (review.text && review.text.text) || '';

    var stars = '';
    for (var i = 0; i < rating; i++) { stars += '<span>★</span>'; }

    return (
      '<div class="testimonial-card reveal ' + delayClass + '">' +
        '<div class="testimonial-stars">' + stars + '</div>' +
        '<p class="testimonial-quote">"' + escapeHtml(text) + '"</p>' +
        '<div class="testimonial-author">' +
          '<div class="author-avatar">' + escapeHtml(initial) + '</div>' +
          '<div>' +
            '<div class="author-name">' + escapeHtml(name) + '</div>' +
            '<div class="author-detail">' + GOOGLE_SVG + 'Google</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ---------- Trigger scroll reveal on newly injected cards ---------- */
  function revealNewCards() {
    var newCards = grid.querySelectorAll('.reveal');
    var windowBottom = window.scrollY + window.innerHeight;
    newCards.forEach(function (el) {
      var elTop = el.getBoundingClientRect().top + window.scrollY;
      if (windowBottom > elTop + 60) {
        el.classList.add('visible');
      }
    });
  }

  /* ---------- Fetch from Places API (New) and render ---------- */
  function loadReviews() {
    var url = 'https://places.googleapis.com/v1/places/' + encodeURIComponent(PLACE_ID);

    fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'reviews,rating,userRatingCount'
      }
    })
    .then(function (res) {
      if (!res.ok) { throw new Error('Places API responded with status ' + res.status); }
      return res.json();
    })
    .then(function (data) {
      if (!data.reviews || !data.reviews.length) {
        console.info('True Blue Fitness: No reviews returned from Places API.');
        return;
      }

      /* Update aggregate rating badge */
      var ratingNumEl  = document.querySelector('.google-rating-num');
      var ratingCountEl = document.querySelector('.google-count');
      if (ratingNumEl && data.rating !== undefined) {
        ratingNumEl.textContent = data.rating.toFixed(1);
      }
      if (ratingCountEl && data.userRatingCount !== undefined) {
        ratingCountEl.textContent = data.userRatingCount + ' Google reviews';
      }

      /* Render cards into grid */
      var html = '';
      data.reviews.forEach(function (review, i) {
        html += buildCard(review, delays[i % delays.length]);
      });
      grid.innerHTML = html;

      /* Re-run reveal animation for freshly injected cards */
      revealNewCards();
    })
    .catch(function (err) {
      /* Silently fall back to hardcoded reviews already in the DOM */
      console.warn('True Blue Fitness: Could not load live Google reviews.', err);
    });
  }

  /* ---------- Run ---------- */
  loadReviews();

})();
