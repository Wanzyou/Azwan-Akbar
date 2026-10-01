(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- THEME ---------- */
  var themeBtn = $('#theme');
  var metaTheme = $('meta[name="theme-color"]');
  var lang = 'id';

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    if (metaTheme) metaTheme.setAttribute('content', t === 'light' ? '#f4f5f9' : '#0a0f1e');
    store.set('theme', t);
  }
  setTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  themeBtn.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });

  /* ---------- LANGUAGE ---------- */
  var i18n = $$('[data-en]');
  i18n.forEach(function (el) { el.setAttribute('data-id', el.innerHTML.trim()); });
  var idBtn = $('#id-btn'), enBtn = $('#en-btn');

  function setLang(l) {
    lang = l === 'en' ? 'en' : 'id';
    root.lang = lang;
    i18n.forEach(function (el) { el.innerHTML = el.getAttribute('data-' + lang); });
    idBtn.setAttribute('aria-pressed', String(lang === 'id'));
    enBtn.setAttribute('aria-pressed', String(lang === 'en'));
    themeBtn.setAttribute('aria-label', lang === 'id' ? 'Ganti tema' : 'Toggle theme');
    store.set('lang', lang);
  }
  idBtn.addEventListener('click', function () { setLang('id'); });
  enBtn.addEventListener('click', function () { setLang('en'); });
  setLang(store.get('lang') === 'en' ? 'en' : 'id');

  /* ---------- MOBILE NAV ---------- */
  var nav = $('#nav'), burger = $('#burger');
  function toggleNav(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleNav(!nav.classList.contains('open'));
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { toggleNav(false); }); });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !nav.contains(e.target)) toggleNav(false);
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 860) toggleNav(false); });

  /* ---------- SCROLL SPY ---------- */
  var links = $$('a', nav);
  var sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });

    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    $$('.reveal').forEach(function (el) { rv.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 3D POINTER EFFECTS (desktop with mouse only) ---------- */
  if (fine && !reduce) {
    var hero = $('#home'), tilt = $('.tilt');
    if (hero && tilt) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.setProperty('--ry', (nx * 40).toFixed(1) + 'deg');
        tilt.style.setProperty('--rx', (-ny * 30).toFixed(1) + 'deg');
      });
      hero.addEventListener('pointerleave', function () {
        tilt.style.setProperty('--ry', '0deg');
        tilt.style.setProperty('--rx', '0deg');
      });
    }
    $$('.tilt-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ty', (x * 10).toFixed(1) + 'deg');
        card.style.setProperty('--tx', (-y * 10).toFixed(1) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--ty', '0deg');
        card.style.setProperty('--tx', '0deg');
      });
    });
  }

  /* ---------- IMAGE FALLBACK ---------- */
  $$('img[data-lightbox]').forEach(function (img) {
    function fail() {
      img.classList.add('is-broken');
      img.removeAttribute('data-lightbox');
      if (img.parentElement) img.parentElement.classList.add('broken');
    }
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail();
  });

  /* ---------- LIGHTBOX ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbClose = $('#lbClose'), lastFocus = null;

  function openLb(img) {
    lastFocus = document.activeElement;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    lbClose.focus();
  }
  function closeLb() {
    if (!lb.classList.contains('open')) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('img[data-lightbox]').forEach(function (img) {
    img.addEventListener('click', function () { openLb(img); });
  });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLb(); toggleNav(false); }
  });

  /* ---------- FOOTER YEAR ---------- */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();