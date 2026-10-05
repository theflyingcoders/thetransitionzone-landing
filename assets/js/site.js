// Front-end behaviour for every page: footer year, signup forms, ripple, floating button,
// filter chips, durability slider, selectable bag cards, reveal on scroll, #hash arrival. Each
// block does nothing when its elements are absent, so one file serves all pages. Without JS the
// page still reads and the forms still post.
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var target = document.getElementById(location.hash.slice(1)); // #hash target (blocks 7 and 8)

  // 0. Footer year
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // 1. Signup forms. Standard form POST to Formspree (script requests are blocked unless
  // reCAPTCHA is off on the form). On submit: point _next back at this form, carrying the
  // creator flag, and put the Join button in its loading state. The browser has already
  // validated the form, and the spinner stays until the page navigates away.
  $$('.email-form').forEach(function (form) {
    form.addEventListener('submit', function () {
      var creator = $('input[name="creator"]', form);
      var next = $('input[name="_next"]', form);
      var btn = $('button[type="submit"]', form);
      if (next) {
        var q = new URLSearchParams({ ok: '1' });
        if (creator && creator.checked) q.set('creator', '1');
        next.value = location.origin + '/?' + q + '#' + form.id;
      }
      if (btn) {
        btn.style.width = btn.offsetWidth + 'px';
        btn.style.height = btn.offsetHeight + 'px';
        void btn.offsetWidth;
        btn.setAttribute('aria-busy', 'true');
        btn.classList.add('loading');
        btn.style.width = btn.style.height = '';
      }
    });
  });
  // On return from Formspree, show the matching success message in every form.
  var back = new URLSearchParams(location.search);
  if (back.get('ok') === '1') {
    var creatorBack = back.get('creator') === '1';
    $$('.ok-msg').forEach(function (ok) {
      ok.hidden = false;
      ok.innerHTML = creatorBack
        ? "<strong>You're in, and flagged as a creator.</strong> Our team will reach out about partnership directly."
        : "<strong>You're in.</strong> We'll email you when we launch.";
    });
  }
  // Back/forward cache restores the page mid-spinner: reset it.
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    $$('.email-form .loading').forEach(function (b) {
      b.classList.remove('loading');
      b.removeAttribute('aria-busy');
    });
  });

  // 2. Ripple on press, on every .morph element
  if (!reduce) {
    document.addEventListener('pointerdown', function (e) {
      var host = e.target.closest('.morph');
      if (!host) return;
      var r = host.getBoundingClientRect();
      var d = Math.max(r.width, r.height) * 2.2;
      var dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
      host.appendChild(dot);
      dot.addEventListener('animationend', function () { dot.remove(); });
    });
  }

  // 3. Floating action button. Home page: shows while the hero form is out of view and the
  // final form is not on screen, then scrolls to the final form. Guide pages: shows after a
  // short scroll while the end-of-article box is off screen, then goes to the home signup.
  var fab = $('#fab');
  var heroForm = $('#signup');
  var finalCta = $('.final-cta');
  var guideCta = $('.guide-cta');
  var setFab = function (show) {
    fab.classList.toggle('show', show);
    fab.tabIndex = show ? 0 : -1;
    fab.setAttribute('aria-hidden', show ? 'false' : 'true');
  };
  var watch = function (el, threshold, cb) {
    new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, { threshold: threshold }).observe(el);
  };
  if (fab && 'IntersectionObserver' in window) {
    if (heroForm && finalCta) {
      var heroIn = true, finalIn = false;
      var update = function () { setFab(!heroIn && !finalIn); };
      watch(heroForm, 0, function (v) { heroIn = v; update(); });
      watch($('.email-form', finalCta), 0.1, function (v) { finalIn = v; update(); });
      fab.addEventListener('click', function () {
        var input = $('input[type="email"]', finalCta);
        var focus = function () { input.focus({ preventScroll: true }); };
        finalCta.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        if ('onscrollend' in window && !reduce) addEventListener('scrollend', focus, { once: true });
        else setTimeout(focus, reduce ? 0 : 700);
      });
    } else if (guideCta) {
      var ctaIn = false;
      var upd = function () { setFab(scrollY > 400 && !ctaIn); };
      watch(guideCta, 0.1, function (v) { ctaIn = v; upd(); });
      addEventListener('scroll', upd, { passive: true });
      fab.addEventListener('click', function () { location.href = '/#signup'; });
    }
  }

  // 4. Filter chips. The scores and texts come from data/answer_card.yaml and data/paddles.yaml,
  // which the page emits as JSON in #ac-data (the same data the rows were rendered from).
  var acData = $('#ac-data');
  var AC = acData ? JSON.parse(acData.textContent) : null;
  var chips = $('#ac-chips'), list = $('#ac-answers');
  if (chips && list && AC) {
    chips.hidden = false;
    chips.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip || chip.getAttribute('aria-pressed') === 'true') return;
      $$('.chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      sortBy(chip.dataset.attr, chip.textContent.trim().toLowerCase());
    });
  }
  // Re-rank the answer rows, then FLIP them from their old place to the new one.
  function sortBy(attr, label) {
    var rows = $$('.ac-step', list);
    var before = new Map(rows.map(function (r) { return [r, r.getBoundingClientRect().top]; }));
    rows.sort(function (a, b) { return AC.paddles[b.dataset.paddle][attr] - AC.paddles[a.dataset.paddle][attr]; });
    rows.forEach(function (row, i) {
      var d = AC.paddles[row.dataset.paddle];
      $('.step-title', row).textContent = d.name + ' · ' + d[attr].toFixed(1);
      $('.step-desc', row).textContent = attr === 'overall'
        ? d.pitch
        : AC.rank[i].replace('{a}', label) + ' ' + d.note + ' ' + d.price + '.';
      list.appendChild(row);
    });
    if (reduce) return;
    rows.forEach(function (row) {
      var dy = before.get(row) - row.getBoundingClientRect().top;
      if (!dy) return;
      row.style.transition = 'none';
      row.style.transform = 'translateY(' + dy + 'px)';
      void row.offsetWidth;
      row.style.transition = 'transform .56s var(--spring-soft)';
      row.style.transform = '';
      row.addEventListener('transitionend', function () { row.style.transition = ''; }, { once: true });
    });
  }

  // 5. Durability slider
  var slider = $('#own-months'), out = $('#own-out');
  if (slider && out) {
    var points = $$('.tl-point');
    slider.closest('.tl-slider').hidden = false;
    var paint = function () {
      var v = +slider.value;
      var text = v === 0 ? 'Day one' : 'Month ' + v;
      out.textContent = text;
      slider.setAttribute('aria-valuetext', text);
      slider.style.setProperty('--pct', (v / slider.max * 100) + '%');
      points.forEach(function (p) {
        var lit = +p.dataset.month <= v;
        p.classList.toggle('lit', lit);
        p.classList.toggle('dim', !lit);
      });
    };
    slider.addEventListener('input', paint);
    paint();
  }

  // 6. Selectable bag cards
  var cards = $$('.bag-card');
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      if (card.classList.contains('current')) return;
      cards.forEach(function (c) {
        c.classList.toggle('current', c === card);
        c.setAttribute('aria-pressed', c === card ? 'true' : 'false');
      });
      if (reduce) return;
      card.classList.remove('pop');
      void card.offsetWidth;
      card.classList.add('pop');
      card.addEventListener('animationend', function () { card.classList.remove('pop'); }, { once: true });
    });
  });

  // 7. Reveal on scroll. Once an element's entry transitions end (or are cancelled), drop the
  // reveal classes so its own hover and press transforms and transitions apply again. The #hash
  // target does not reveal: its entry transform would put block 8's re-align off.
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.add('in');
        Promise.allSettled(el.getAnimations().map(function (a) { return a.finished; })).then(function () {
          el.classList.remove('reveal', 'in');
          el.style.removeProperty('--d');
        });
      });
    }, { threshold: 0.12 });
    var seen = new Map();
    $$('.email-form, .answer-card, .review, .timeline, .bag-card, .compare, .guide-card, .guide-cta').forEach(function (el) {
      if (el === target) return;
      var parent = el.parentNode;
      var i = seen.get(parent) || 0;
      seen.set(parent, i + 1);
      el.style.setProperty('--d', Math.min(i, 4) * 70 + 'ms');
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // 8. Arrival on a #hash. The browser jumps to the target before the web fonts swap in, and
  // the swap moves the target. A smooth jump keeps its old end point and cannot be corrected
  // while it runs, so make the arrival instant, then align once more after the load event and
  // the fonts (CSS scroll-padding-top keeps the nav gap). Skip that if the visitor has scrolled
  // by hand. Read fonts.ready after load: before layout no font is pending, so it is resolved.
  if (target) {
    var root = document.documentElement.style;
    root.scrollBehavior = 'auto'; // beats html { scroll-behavior: smooth } until the re-align
    var byHand = false;
    var stop = function () { byHand = true; };
    var input = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    input.forEach(function (t) { addEventListener(t, stop, { capture: true, passive: true }); });
    new Promise(function (r) {
      if (document.readyState === 'complete') r(); else addEventListener('load', r, { once: true });
    }).then(function () { return document.fonts && document.fonts.ready; }).then(function () {
      input.forEach(function (t) { removeEventListener(t, stop, true); });
      if (!byHand) target.scrollIntoView({ block: 'start' });
      root.scrollBehavior = '';
    });
  }
})();
