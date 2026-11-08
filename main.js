/* Abhijeet Gautam — portfolio interactions. Plain JS, no dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  $('#yr').textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  var burger = $('#burger'), list = $('#navLinks');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    list.classList.toggle('open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', list).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- hero portrait: 3D tilt ---------- */
  var tilt = $('#tilt'), tiltWrap = $('#tiltWrap');
  if (tilt && !reduce && fine) {
    tiltWrap.addEventListener('pointermove', function (e) {
      var r = tiltWrap.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      tilt.style.transition = 'transform .15s ease-out';
      tilt.style.transform = 'rotateY(' + ((x - .5) * 18) + 'deg) rotateX(' + ((.5 - y) * 14) + 'deg)';
      tilt.style.setProperty('--mx', x * 100 + '%'); tilt.style.setProperty('--my', y * 100 + '%');
    });
    tiltWrap.addEventListener('pointerleave', function () { tilt.style.transition = ''; tilt.style.transform = ''; });
  }

  /* ---------- scroll-driven: nav, laptop, hero tilt on touch ---------- */
  var nav = $('#nav'), show = $('#overview'), links = $$('#navLinks a'),
      secs = links.map(function (a) { return $(a.getAttribute('href')); }), ticking = false;

  function onScroll() {
    var y = window.scrollY, vh = window.innerHeight;
    nav.classList.toggle('scrolled', y > 8);
    if (show) { var sr = show.getBoundingClientRect(); nav.classList.toggle('dark', sr.top < 52 && sr.bottom > 52); }

    if (!reduce && show) {
      var r = show.getBoundingClientRect(), span = r.height - vh;
      var p = span > 0 ? clamp(-r.top / (span * .7), 0, 1) : 1;
      // ease-out so the lid settles softly
      p = 1 - Math.pow(1 - p, 2.2);
      show.style.setProperty('--p', p.toFixed(4));
    }

    if (tilt && !reduce && !fine) {
      var k = clamp(y / vh, 0, 1);
      tilt.style.transform = 'rotateY(' + (-8 + k * 16) + 'deg) rotateX(' + (4 - k * 10) + 'deg)';
    }

    var active = null;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * .35) active = links[i]; });
    links.forEach(function (a) { a.classList.toggle('on', a === active); });
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- work tiles: subtle 3D tilt on hover ---------- */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        var amt = r.width > 700 ? 3 : 6;
        c.style.transition = 'transform .12s ease-out, box-shadow .4s';
        c.style.transform = 'rotateY(' + (x * amt) + 'deg) rotateX(' + (-y * amt) + 'deg) translateZ(0)';
      });
      c.addEventListener('pointerleave', function () { c.style.transition = ''; c.style.transform = ''; });
    });
  }

  /* ---------- count-up ---------- */
  function countUp(el) {
    var end = +el.dataset.count, t0 = null, dur = 1300;
    if (reduce) { el.textContent = end; return; }
    el.textContent = '0';
    (function tick(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  /* ---------- small live widgets ---------- */
  function startDbs() {
    var s = $$('.dbs span'), i = 0;
    if (!s.length) return;
    s[0].classList.add('on');
    if (reduce) return;
    setInterval(function () { s[i].classList.remove('on'); i = (i + 1) % s.length; s[i].classList.add('on'); }, 1400);
  }
  function startUpload() {
    var bar = $('#upBar'), pct = $('#upPct'), steps = $$('.pipe li');
    if (!bar) return;
    if (reduce) { bar.style.width = '100%'; pct.textContent = '100%'; steps.forEach(function (s) { s.classList.add('done'); }); return; }
    var v = 0;
    (function loop() {
      v += 1 + Math.random() * 3;
      if (v >= 100) {
        v = 100;
        steps.forEach(function (s, i) { setTimeout(function () { s.classList.add('done'); }, i * 450); });
        setTimeout(function () { v = 0; steps.forEach(function (s) { s.classList.remove('done'); }); loop(); }, 3600);
      } else setTimeout(loop, 70);
      bar.style.width = v + '%'; pct.textContent = Math.floor(v) + '%';
    })();
  }

  /* ---------- reveal on scroll ---------- */
  $$('.race-bars i').forEach(function (b, i) { b.style.setProperty('--d', i * 50); });
  var once = { race: false, dbs: false, up: false };
  function fire(el) {
    el.classList.add('in');
    $$('[data-count]', el).forEach(countUp);
    $$('.race,.venn', el).forEach(function (n) { n.classList.add('in'); });
    if (!once.dbs && $('.dbs', el)) { once.dbs = true; startDbs(); }
    if (!once.up && $('.upload', el)) { once.up = true; startUpload(); }
  }
  var items = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) items.forEach(fire);
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sib = e.target.parentElement ? $$(':scope > .rv', e.target.parentElement) : [];
        e.target.style.transitionDelay = clamp(sib.indexOf(e.target), 0, 4) * 70 + 'ms';
        fire(e.target); io.unobserve(e.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- report builder demo (mirrors onto the laptop screen) ---------- */
  (function builder() {
    var FIELDS = [
      { k: 'scheme', l: 'Scheme', on: true },
      { k: 'cat', l: 'Category', on: true },
      { k: 'aum', l: 'AUM (₹ Cr)', on: true, num: 1 },
      { k: 'nav', l: 'NAV', on: false, num: 1 },
      { k: 'r1', l: '1Y return', on: true, num: 1, pct: 1 },
      { k: 'r3', l: '3Y CAGR', on: false, num: 1, pct: 1 },
      { k: 'er', l: 'Expense ratio', on: false, num: 1, pct: 1 }
    ];
    var DATA = [
      { scheme: 'Bluechip Growth Fund', cat: 'Equity', aum: 41250, nav: 92.41, r1: 18.6, r3: 15.2, er: 0.92 },
      { scheme: 'Midcap Opportunities', cat: 'Equity', aum: 18730, nav: 154.08, r1: 27.3, r3: 21.4, er: 1.05 },
      { scheme: 'Flexi Cap Fund', cat: 'Equity', aum: 29880, nav: 68.77, r1: 21.1, r3: 17.0, er: 0.84 },
      { scheme: 'Short Duration Debt', cat: 'Debt', aum: 9120, nav: 31.62, r1: 7.4, r3: 6.1, er: 0.38 },
      { scheme: 'Corporate Bond Fund', cat: 'Debt', aum: 15460, nav: 27.95, r1: 7.9, r3: 6.6, er: 0.33 },
      { scheme: 'Balanced Advantage', cat: 'Hybrid', aum: 22310, nav: 45.19, r1: 13.8, r3: 12.1, er: 0.71 },
      { scheme: 'Equity Savings Fund', cat: 'Hybrid', aum: 5480, nav: 21.36, r1: -1.2, r3: 8.4, er: 0.62 }
    ];
    var fieldsEl = $('#fields'), sheet = $('#sheet'), mini = $('#miniSheet'), cat = $('#fCat'), sort = $('#fSort'), count = $('#rbCount');
    if (!fieldsEl) return;

    FIELDS.forEach(function (f) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fld'; b.textContent = f.l;
      b.setAttribute('aria-pressed', f.on);
      b.addEventListener('click', function () {
        if (f.on && FIELDS.filter(function (x) { return x.on; }).length === 1) return;
        f.on = !f.on; b.setAttribute('aria-pressed', f.on); render(true);
      });
      fieldsEl.appendChild(b);
    });

    function rows() {
      var c = cat.value, s = sort.value;
      return DATA.filter(function (d) { return !c || d.cat === c; })
        .sort(function (a, b) { return s === 'er' ? a.er - b.er : b[s] - a[s]; });
    }
    function fmt(f, v) {
      if (f.k === 'aum') return v.toLocaleString('en-IN');
      if (f.pct) return v.toFixed(2) + '%';
      if (f.num) return v.toFixed(2);
      return v;
    }
    function table(cols, rs, anim) {
      var h = '<thead><tr>' + cols.map(function (f) { return '<th scope="col"' + (f.num ? ' class="num"' : '') + '>' + f.l + '</th>'; }).join('') + '</tr></thead><tbody>';
      rs.forEach(function (r, i) {
        h += '<tr' + (anim ? ' class="pop" style="animation-delay:' + i * 40 + 'ms"' : '') + '>' + cols.map(function (f) {
          var cls = f.num ? 'num' : '';
          if (f.k === 'r1' || f.k === 'r3') cls += r[f.k] >= 0 ? ' up' : ' dn';
          return '<td class="' + cls + '">' + fmt(f, r[f.k]) + '</td>';
        }).join('') + '</tr>';
      });
      return h + '</tbody>';
    }
    function render(anim) {
      var cols = FIELDS.filter(function (f) { return f.on; }), rs = rows();
      sheet.innerHTML = table(cols, rs, anim);
      if (mini) mini.innerHTML = table(cols, rs, false);
      count.textContent = rs.length + ' rows × ' + cols.length + ' columns';
    }
    cat.addEventListener('change', function () { render(true); });
    sort.addEventListener('change', function () { render(true); });
    render(false);

    var x = $('#xbtn'), xl = $('#xlabel');
    x.addEventListener('click', function () {
      if (x.disabled) return;
      x.disabled = true; xl.textContent = 'Building…';
      setTimeout(function () {
        var cols = FIELDS.filter(function (f) { return f.on; });
        var esc = function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
        var csv = [cols.map(function (f) { return esc(f.l); }).join(',')].concat(rows().map(function (r) {
          return cols.map(function (f) { return esc(r[f.k]); }).join(',');
        })).join('\r\n');
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
        a.download = 'custom-fund-report.csv'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
        xl.textContent = 'Downloaded ✓';
        setTimeout(function () { x.disabled = false; xl.textContent = 'Export to Excel'; }, 1800);
      }, 700);
    });
  })();

  /* ---------- copy email ---------- */
  var copyBtn = $('#copyMail'), ok = $('#copyOk'), mail = 'gautamabhijeet7@gmail.com';
  copyBtn.addEventListener('click', function () {
    var done = function () { ok.textContent = 'Copied ' + mail; setTimeout(function () { ok.textContent = ''; }, 2500); };
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(done, function () { ok.textContent = mail; });
    else ok.textContent = mail;
  });
})();
