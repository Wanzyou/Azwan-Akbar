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
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !nav.contains(e.target)) toggleNav(false);
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080) toggleNav(false); });

  /* ---------- PAGES: satu layar per menu, tanpa scroll antar menu ---------- */
  var pages = $$('main > section[id]');
  var navLinks = $$('a', nav);
  var cur = -1;

  var dock = document.createElement('div');
  dock.className = 'dock';
  dock.setAttribute('aria-label', 'Pages');
  var dots = pages.map(function (p, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', p.id);
    b.addEventListener('click', function () { go(i, true); });
    dock.appendChild(b);
    return b;
  });
  document.body.appendChild(dock);

  function indexOf(id) {
    for (var i = 0; i < pages.length; i++) if (pages[i].id === id) return i;
    return -1;
  }

  function go(i, push) {
    if (i < 0 || i >= pages.length || i === cur) return;
    cur = i;
    pages.forEach(function (p, n) {
      var on = n === i;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-hidden', String(!on));
      if (on) p.scrollTop = 0;
    });
    var id = pages[i].id;
    navLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + id); });
    dots.forEach(function (d, n) { d.setAttribute('aria-current', String(n === i)); });
    if (push) { try { history.pushState(null, '', '#' + id); } catch (e) {} }
    toggleNav(false);
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var i = indexOf(a.getAttribute('href').slice(1));
      if (i < 0) return;
      e.preventDefault();
      go(i, true);
    });
  });
  window.addEventListener('hashchange', function () {
    var i = indexOf(location.hash.slice(1));
    if (i >= 0) go(i, false);
  });
  go(Math.max(0, indexOf(location.hash.slice(1))), false);

  /* ---------- STARFIELD + CONSTELLATION ---------- */
  var cv = $('#stars'), ctx = cv && cv.getContext ? cv.getContext('2d') : null;
  var stars = [], W = 0, H = 0, shoot = null, nextShoot = 0, px = -9999, py = -9999;
  var LINK = 150;

  function sizeStars() {
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    if (W && w === W && Math.abs(h - H) < 150) return;
    W = w; H = h;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(220, (W * H) / 7000));
    var nodes = Math.round(Math.min(130, (W * H) / 11000));
    stars = [];
    for (var i = 0; i < n; i++) {
      var node = i < nodes;
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: node ? Math.random() * 1 + 0.9 : Math.random() * 1.1 + 0.2,
        p: Math.random() * 6.28, s: Math.random() * 0.0018 + 0.0006, a: Math.random() * 0.5 + 0.35,
        node: node,
        vx: node ? (Math.random() - 0.5) * 0.12 : 0,
        vy: node ? (Math.random() - 0.5) * 0.12 : 0
      });
    }
    drawStars(0);
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    var i, j, a, b, dx, dy, d, st;
    for (i = 0; i < stars.length; i++) {
      st = stars[i];
      if (st.node && !reduce) {
        st.x += st.vx; st.y += st.vy;
        if (st.x < 0 || st.x > W) st.vx *= -1;
        if (st.y < 0 || st.y > H) st.vy *= -1;
      }
      ctx.globalAlpha = reduce ? st.a : st.a * (0.55 + 0.45 * Math.sin(t * st.s * 6 + st.p));
      ctx.fillStyle = st.node ? '#6ea8ff' : (i % 9 === 0 ? '#bcd0ff' : '#ffffff');
      ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.2832); ctx.fill();
    }
    ctx.lineWidth = 0.7;
    for (i = 0; i < stars.length; i++) {
      a = stars[i];
      if (!a.node) break;
      for (j = i + 1; j < stars.length; j++) {
        b = stars[j];
        if (!b.node) break;
        dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
        if (d < LINK * LINK) {
          ctx.globalAlpha = (1 - Math.sqrt(d) / LINK) * 0.5;
          ctx.strokeStyle = '#5f93ff';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      dx = a.x - px; dy = a.y - py; d = dx * dx + dy * dy;
      if (d < 180 * 180) {
        ctx.globalAlpha = (1 - Math.sqrt(d) / 180) * 0.55;
        ctx.strokeStyle = '#9fc2ff';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(px, py); ctx.stroke();
      }
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
    if (document.hidden) return;
    if (!shoot && t > nextShoot) {
      shoot = { x: Math.random() * W * 0.7, y: Math.random() * H * 0.4, dx: 280 + Math.random() * 200, dy: 120 + Math.random() * 90, t0: t, dur: 900 };
      nextShoot = t + 7000 + Math.random() * 9000;
    }
    drawStars(t);
  }

  if (ctx) {
    sizeStars();
    window.addEventListener('resize', sizeStars);
    if (!reduce) { nextShoot = 3000; requestAnimationFrame(loop); }
  }

  /* ---------- POINTER PARALLAX + CARD TILT ---------- */
  var bgps = $$('.bgp'), mx = 0, my = 0, ticking = false;
  function par() {
    ticking = false;
    bgps.forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-depth')) || 0;
      el.style.transform = 'translate3d(' + (mx * d).toFixed(1) + 'px,' + (my * d).toFixed(1) + 'px,0)';
    });
  }
  function reqPar() { if (!ticking) { ticking = true; requestAnimationFrame(par); } }

  if (fine && !reduce) {
    var wrap = $('.planet-wrap');
    document.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (wrap) {
        wrap.style.setProperty('--mx', (mx * -26).toFixed(1) + 'px');
        wrap.style.setProperty('--my', (my * -20).toFixed(1) + 'px');
      }
      reqPar();
    }, { passive: true });
    document.addEventListener('pointerleave', function () { px = py = -9999; });

    $$('.tilt-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ty', (x * 8).toFixed(1) + 'deg');
        card.style.setProperty('--tx', (-y * 8).toFixed(1) + 'deg');
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
    lbClose.focus();
  }
  function closeLb() {
    if (!lb.classList.contains('open')) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('img[data-lightbox]').forEach(function (img) {
    img.addEventListener('click', function () { openLb(img); });
  });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLb(); toggleNav(false); return; }
    if (lb.classList.contains('open')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') go(cur + 1, true);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(cur - 1, true);
  });
})();