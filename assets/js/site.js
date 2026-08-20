/* ==========================================================================
   Safari Explorers International — proposal build
   Vanilla JS. No dependencies, no build step.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. DEMO MODE
   --------------------------------------------------------------------------
   true  = forms are intercepted in the browser, validated, and redirected to
           thank-you/. NOTHING is submitted or stored anywhere.
   false = forms post natively. On Netlify the data-netlify attributes already
           on each <form> take over and submissions arrive in the Netlify
           dashboard with no other change required.

   To go live on Netlify: set this to false, deploy, done.
-------------------------------------------------------------------------- */
const DEMO_MODE = true;

/* --------------------------------------------------------------------------
   2. AVAILABILITY
   --------------------------------------------------------------------------
   Edit this single value to update availability everywhere on the site.
   `total` is the hard cap on group size and is a real operational limit.

   IMPORTANT: `remaining` is a factual claim about live bookings. Before this
   site is published it MUST be set to the true number of unbooked places.
   Publishing a number that is not real is both dishonest and, in several of
   the launch markets, unlawful. See README, outstanding decisions.
-------------------------------------------------------------------------- */
const PLACES = { total: 8, remaining: 4 };

(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  /* base path back to site root, set per page: "" or "../" */
  var BASE = document.body.getAttribute('data-base') || '';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     Proposal ribbon. Dismissal lives in this variable for the current
     page view only. Deliberately NOT persisted: the disclosure should
     come back on every page so it can never be permanently hidden.
  --------------------------------------------------------------- */
  var ribbonDismissed = false;
  var ribbon = document.querySelector('.ribbon');
  var ribbonClose = document.querySelector('.ribbon__close');
  if (ribbon && ribbonClose) {
    ribbonClose.addEventListener('click', function () {
      ribbonDismissed = true;
      ribbon.hidden = true;
    });
  }

  /* ---------------------------------------------------------------
     Mobile overlay menu
  --------------------------------------------------------------- */
  var menu = document.getElementById('menu');
  var menuOpen = document.querySelector('.nav-toggle');
  var menuClose = document.querySelector('.menu__close');
  var lastFocus = null;

  function openMenu() {
    if (!menu) return;
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.body.style.overflow = 'hidden';
    menuOpen.setAttribute('aria-expanded', 'true');
    var first = menu.querySelector('a, button');
    if (first) first.focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.hidden = true;
    document.body.style.overflow = '';
    menuOpen.setAttribute('aria-expanded', 'false');
    if (lastFocus) lastFocus.focus();
  }
  if (menuOpen) menuOpen.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && !menu.hidden) closeMenu();
  });
  /* keep focus inside the overlay while it is open */
  if (menu) {
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = menu.querySelectorAll('a, button');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
     Hero film

     The still image is the poster and the permanent fallback. The film is
     only loaded when it can be shown, and only fades in once it is actually
     playing, so a slow connection, a failed request or a browser that blocks
     autoplay all degrade to the still rather than to a black rectangle.

     Two encodes exist. Which one is fetched depends on how large the video
     has to be drawn, not on viewport width alone: the film is cropped to
     cover, so on a tall or portrait screen it is height that decides.
  --------------------------------------------------------------- */
  (function () {
    var hero = document.getElementById('hero');
    var video = document.getElementById('heroVideo');
    if (!hero || !video) return;

    var started = false;

    function pickSource() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var needed = Math.max(window.innerWidth, window.innerHeight * 16 / 9) * dpr;
      var c = navigator.connection;
      /* respect an explicit data-saver or a genuinely slow connection */
      if (c && (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || ''))) {
        return BASE + 'assets/video/hero-loop-720.mp4';
      }
      return BASE + 'assets/video/hero-loop-' + (needed >= 1500 ? '1080' : '720') + '.mp4';
    }

    function play() {
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* autoplay refused: poster stays */ });
    }

    function start() {
      if (started || reduceMotion) return;
      started = true;
      video.src = pickSource();
      video.load();
      play();
      video.addEventListener('playing', function () { hero.classList.add('video-on'); }, { once: true });
      video.addEventListener('error', function () { hero.classList.remove('video-on'); }, { once: true });
    }

    /* let the poster and the rest of the page land first */
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    /* stop decoding while the hero is off-screen or the tab is hidden */
    if ('IntersectionObserver' in window) {
      var heroIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!started) return;
          if (entry.isIntersecting) play();
          else video.pause();
        });
      }, { threshold: 0 });
      heroIo.observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (!started) return;
      if (document.hidden) video.pause(); else play();
    });

    /* honour a reduced-motion preference flipped mid-session, both ways */
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
      if (e.matches) { video.pause(); hero.classList.remove('video-on'); }
      else { reduceMotion = false; start(); }
    });
  })();

  /* ---------------------------------------------------------------
     Availability, rendered from PLACES
  --------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-places]'), function (el) {
    var kind = el.getAttribute('data-places');
    if (kind === 'total') el.textContent = String(PLACES.total);
    if (kind === 'remaining') el.textContent = String(PLACES.remaining);
    if (kind === 'sentence') {
      el.textContent = PLACES.total + ' places · ' + PLACES.remaining + ' remaining';
    }
    if (kind === 'dots') {
      el.innerHTML = '';
      var taken = PLACES.total - PLACES.remaining;
      for (var i = 0; i < PLACES.total; i++) {
        var d = document.createElement('span');
        d.className = 'places__dot' + (i < taken ? ' places__dot--taken' : '');
        el.appendChild(d);
      }
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', taken + ' of ' + PLACES.total + ' places taken');
    }
  });

  /* ---------------------------------------------------------------
     Accordions: open by default on desktop, closed on mobile.
     Only applied to groups marked data-acc-responsive.
  --------------------------------------------------------------- */
  var wide = window.matchMedia('(min-width: 900px)');
  function syncAccordions(mq) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-acc-responsive] details'), function (d) {
      if (!d.hasAttribute('data-user-toggled')) d.open = mq.matches;
    });
  }
  if (document.querySelector('[data-acc-responsive]')) {
    syncAccordions(wide);
    wide.addEventListener('change', syncAccordions);
    Array.prototype.forEach.call(document.querySelectorAll('[data-acc-responsive] details'), function (d) {
      d.addEventListener('toggle', function () { d.setAttribute('data-user-toggled', ''); });
    });
  }

  /* ---------------------------------------------------------------
     Multi-step form navigation
  --------------------------------------------------------------- */
  var stepForm = document.querySelector('[data-steps]');
  if (stepForm) {
    var panels = stepForm.querySelectorAll('[data-step-panel]');
    var markers = document.querySelectorAll('[data-step-marker]');
    var current = 0;

    function showStep(i) {
      current = i;
      Array.prototype.forEach.call(panels, function (p, n) { p.hidden = n !== i; });
      Array.prototype.forEach.call(markers, function (m, n) {
        if (n === i) m.setAttribute('aria-current', 'step');
        else m.removeAttribute('aria-current');
      });
      var h = panels[i].querySelector('legend');
      if (h) { panels[i].setAttribute('tabindex', '-1'); panels[i].focus(); }
    }
    showStep(0);

    stepForm.addEventListener('click', function (e) {
      var next = e.target.closest('[data-step-next]');
      var prev = e.target.closest('[data-step-prev]');
      if (next) {
        e.preventDefault();
        if (validateFields(panels[current])) showStep(Math.min(current + 1, panels.length - 1));
      }
      if (prev) { e.preventDefault(); showStep(Math.max(current - 1, 0)); }
    });
  }

  /* ---------------------------------------------------------------
     Validation
  --------------------------------------------------------------- */
  function fieldError(input, message) {
    var wrap = input.closest('.field');
    if (!wrap) return;
    var err = wrap.querySelector('.field__err');
    if (message) {
      wrap.classList.add('field--error');
      input.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = message; err.hidden = false; }
    } else {
      wrap.classList.remove('field--error');
      input.removeAttribute('aria-invalid');
      if (err) { err.hidden = true; err.textContent = ''; }
    }
  }

  function validateOne(input) {
    var v = (input.value || '').trim();
    var label = input.getAttribute('data-label') || 'This field';
    if (input.hasAttribute('required') && !v) {
      fieldError(input, label + ' is required.');
      return false;
    }
    if (v && input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      fieldError(input, 'Enter a valid email address, for example name@example.com');
      return false;
    }
    if (v && input.type === 'tel' && !/^[+0-9()\s-]{7,}$/.test(v)) {
      fieldError(input, 'Enter a phone number including country code, for example +65 8123 4567');
      return false;
    }
    fieldError(input, null);
    return true;
  }

  function validateFields(scope) {
    var inputs = scope.querySelectorAll('input:not([type=hidden]):not(.hp-input), select, textarea');
    var ok = true;
    var firstBad = null;
    Array.prototype.forEach.call(inputs, function (i) {
      if (!validateOne(i)) { ok = false; if (!firstBad) firstBad = i; }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  /* live-clear an error once the visitor fixes it */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.matches && t.matches('input, select, textarea')) {
      var wrap = t.closest('.field');
      if (wrap && wrap.classList.contains('field--error')) validateOne(t);
    }
  });

  /* ---------------------------------------------------------------
     Form submission

     DEMO_MODE true  -> validate, show a loading state, go to thank-you/
     DEMO_MODE false -> let the browser post the form to Netlify natively
  --------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-demo-form]'), function (form) {
    form.addEventListener('submit', function (e) {
      if (!DEMO_MODE) return; /* native POST to Netlify Forms */
      e.preventDefault();

      if (!validateFields(form)) return;

      /* honeypot: silently stop obvious bots */
      var hp = form.querySelector('.hp-input');
      if (hp && hp.value) return;

      var btn = form.querySelector('[type=submit]');
      if (btn) {
        btn.setAttribute('aria-busy', 'true');
        btn.dataset.label = btn.textContent;
        btn.textContent = 'Sending…';
      }
      var kind = form.getAttribute('data-demo-form') || 'application';
      window.setTimeout(function () {
        window.location.href = BASE + 'thank-you/index.html?from=' + encodeURIComponent(kind);
      }, 550);
    });
  });

  /* ---------------------------------------------------------------
     Thank-you page: reflect which form was sent
  --------------------------------------------------------------- */
  var kindOut = document.querySelector('[data-thanks-kind]');
  if (kindOut) {
    var params = new URLSearchParams(window.location.search);
    var from = params.get('from');
    var copy = {
      application: 'Your application has been received.',
      pack: 'Your request for the Parent Information Pack has been received.',
      school: 'Your school enquiry has been received.',
      call: 'Your request to speak to a founder has been received.'
    };
    kindOut.textContent = copy[from] || copy.application;
  }
})();
