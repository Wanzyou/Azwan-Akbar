(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fine = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- THEME ---------- */
  var themeBtn = $('#theme');
  var metaTheme = $('meta[name="theme-color"]');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    if (metaTheme) metaTheme.setAttribute('content', t === 'light' ? '#dbe5ff' : '#050816');
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
    var lang = l === 'en' ? 'en' : 'id';
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

  /* ---------- MOBILE / COMPACT NAV ---------- */
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
  window.addEventListener('resize', function () { if (window.innerWidth > 1080) toggleNav(false); });

  /* ---------- SCROLL SPY + REVEAL ---------- */
  var links = $$('a', nav);
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });

    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); }
      });
    }, { threshold: 0.05 });
    $$('.reveal').forEach(function (el) { rv.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- STARFIELD ---------- */
  var cv = $('#stars'), ctx = cv && cv.getContext ? cv.getContext('2d') : null;
  var stars = [], W = 0, H = 0, shoot = null, nextShoot = 0;

  function sizeStars() {
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    if (W && w === W && Math.abs(h - H) < 150) return; // ignore mobile URL-bar resize
    W = w; H = h;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(240, (W * H) / 7500));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + 0.25,
                   p: Math.random() * 6.28, s: Math.random() * 0.0018 + 0.0006, a: Math.random() * 0.55 + 0.35 });
    }
    drawStars(0);
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      var al = reduce ? st.a : st.a * (0.55 + 0.45 * Math.sin(t * st.s * 6 + st.p));
      ctx.globalAlpha = al;
      ctx.fillStyle = i % 9 === 0 ? '#bcd0ff' : '#ffffff';
      ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.2832); ctx.fill();
    }
    if (shoot) {
      var life = (t - shoot.t0) / shoot.dur;
      if (life >= 1) { shoot = null; }
      else {
        var x = shoot.x + shoot.dx * life, y = shoot.y + shoot.dy * life;
        var g = ctx.createLinearGradient(x, y, x - shoot.dx * 0.18, y - shoot.dy * 0.18);
        g.addColorStop(0, 'rgba(255,255,255,' + (1 - life) + ')');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - shoot.dx * 0.18, y - shoot.dy * 0.18); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    requestAnimationFrame(loop);
    if (document.hidden || root.getAttribute('data-theme') === 'light') return;
    if (!shoot && t > nextShoot) {
      shoot = { x: Math.random() * W * 0.7, y: Math.random() * H * 0.4, dx: 280 + Math.random() * 200, dy: 120 + Math.random() * 90, t0: t, dur: 900 };
      nextShoot = t + 6000 + Math.random() * 8000;
    }
    drawStars(t);
  }

  if (ctx) {
    sizeStars();
    window.addEventListener('resize', sizeStars);
    if (!reduce) { nextShoot = 3000; requestAnimationFrame(loop); }
  }

  /* ---------- PARALLAX (background planets) + 3D POINTER EFFECTS ---------- */
  var bgps = $$('.bgp'), mx = 0, my = 0, ticking = false;
  function par() {
    ticking = false;
    var sy = window.pageYOffset || 0;
    bgps.forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-depth')) || 0;
      var y = Math.max(-220, Math.min(220, -sy * d / 700)) + my * d;
      el.style.transform = 'translate3d(' + (mx * d).toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    });
  }
  function reqPar() { if (!ticking) { ticking = true; requestAnimationFrame(par); } }
  if (!reduce) {
    window.addEventListener('scroll', reqPar, { passive: true });
    par();
  }

  if (fine && !reduce) {
    var wrap = $('.planet-wrap');
    document.addEventListener('pointermove', function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (wrap) {
        wrap.style.setProperty('--mx', (mx * -26).toFixed(1) + 'px');
        wrap.style.setProperty('--my', (my * -20).toFixed(1) + 'px');
      }
      reqPar();
    }, { passive: true });

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

  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();