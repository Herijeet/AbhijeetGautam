/* Abhijeet Gautam — portfolio interactions. Plain JS, no dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  $('#yr').textContent = new Date().getFullYear();

  /* ---------- hero headline reveal + rotating word ---------- */
  var h1 = $('#h1');
  $$('.w', h1).forEach(function (w, i) { w.style.transitionDelay = (120 + i * 110) + 'ms'; });
  requestAnimationFrame(function () { h1.classList.add('go'); });

  var rot = $('#rot');
  if (rot && !reduce) {
    var words = $$(':scope > span', rot), wi = 0;
    setInterval(function () {
      var cur = words[wi], next = words[(wi + 1) % words.length];
      cur.classList.remove('cur-w'); cur.classList.add('out');
      next.classList.remove('out'); next.classList.add('cur-w');
      setTimeout(function () { cur.classList.remove('out'); }, 700);
      wi = (wi + 1) % words.length;
    }, 2400);
  }

  /* ---------- service-mesh canvas behind the hero ---------- */
  (function mesh() {
    var cv = $('#mesh'); if (!cv) return;
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, nodes = [], packets = [], mouse = { x: -9999, y: -9999 }, running = true, LINK;

    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, Math.max(34, W * H / 16000)));
      LINK = Math.min(170, Math.max(110, W / 9));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({ x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
          r: Math.random() < .12 ? 2.6 : 1.4, hub: Math.random() < .12 });
      }
      packets = [];
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180) { a.x -= dx / d * .6; a.y -= dy / d * .6; }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            var o = 1 - Math.sqrt(d) / LINK;
            ctx.strokeStyle = 'rgba(139,108,255,' + (o * .28) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            if (packets.length < 26 && Math.random() < .0009) packets.push({ a: a, b: b, t: 0, s: .008 + Math.random() * .012 });
          }
        }
      }
      for (i = packets.length - 1; i >= 0; i--) {
        var p = packets[i]; p.t += p.s;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        var px = p.a.x + (p.b.x - p.a.x) * p.t, py = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.fillStyle = 'rgba(77,227,208,.95)';
        ctx.shadowColor = 'rgba(77,227,208,.9)'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(px, py, 1.8, 0, 6.283); ctx.fill();
        ctx.shadowBlur = 0;
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.fillStyle = a.hub ? 'rgba(77,227,208,.85)' : 'rgba(200,205,230,.45)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(step);
    }

    size();
    if (reduce) { running = false; step(); return; }
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 150); });
    cv.parentElement.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    cv.parentElement.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    // pause when the hero is off screen
    new IntersectionObserver(function (en) {
      var vis = en[0].isIntersecting;
      if (vis && !running) { running = true; requestAnimationFrame(step); }
      running = vis;
    }).observe(cv);
    requestAnimationFrame(step);
  })();

  /* ---------- custom cursor ---------- */
  if (fine && !reduce) {
    var cur = $('#cur'), dot = $('#curDot'), mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      document.body.classList.add('has-cur');
    }, { passive: true });
    document.addEventListener('pointerleave', function () { document.body.classList.remove('has-cur'); });
    (function follow() {
      cx += (mx - cx) * .18; cy += (my - cy) * .18;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(follow);
    })();
    $$('a,button,select,.fld').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cur.classList.add('big'); });
      el.addEventListener('pointerleave', function () { cur.classList.remove('big'); });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) {
    $$('.mag').forEach(function (b) {
      var label = b.querySelector('span');
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = 'translate(' + x * .25 + 'px,' + y * .35 + 'px)';
        if (label) label.style.transform = 'translate(' + x * .1 + 'px,' + y * .12 + 'px)';
      });
      b.addEventListener('pointerleave', function () {
        b.style.transition = 'transform .5s cubic-bezier(.2,.75,.25,1),background .3s,border-color .3s,box-shadow .3s';
        b.style.transform = ''; if (label) { label.style.transition = 'transform .5s'; label.style.transform = ''; }
        setTimeout(function () { b.style.transition = ''; if (label) label.style.transition = ''; }, 500);
      });
    });
  }

  /* ---------- card spotlight ---------- */
  if (fine) {
    $$('.card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--x', (e.clientX - r.left) + 'px');
        c.style.setProperty('--y', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* ---------- portrait tilt ---------- */
  var frame = $('#frame');
  if (frame && fine && !reduce) {
    var port = $('#port');
    port.addEventListener('pointermove', function (e) {
      var r = port.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      frame.style.transform = 'perspective(900px) rotateY(' + ((x - .5) * 14) + 'deg) rotateX(' + ((.5 - y) * 14) + 'deg)';
      frame.style.setProperty('--mx', x * 100 + '%'); frame.style.setProperty('--my', y * 100 + '%');
    });
    port.addEventListener('pointerleave', function () { frame.style.transform = ''; });
  }

  /* ---------- reveal, counters, bars ---------- */
  function countUp(el) {
    var end = +el.dataset.count, t0 = null, dur = 1400;
    if (reduce) { el.textContent = end; return; }
    (function tick(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(tick);
    })(performance.now());
  }
  function fire(el) {
    el.classList.add('in');
    $$('[data-count]', el).forEach(countUp);
    if (el.hasAttribute('data-bars')) $$('.bars i', el).forEach(function (b, i) {
      setTimeout(function () { b.style.height = b.dataset.h + '%'; }, i * 60);
    });
  }
  var items = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) items.forEach(fire);
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sib = e.target.parentElement ? $$(':scope > .rv', e.target.parentElement) : [];
        e.target.style.transitionDelay = Math.min(Math.max(sib.indexOf(e.target), 0), 5) * 80 + 'ms';
        fire(e.target); io.unobserve(e.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- scroll: progress, nav pill, timeline ---------- */
  var prog = $('#prog'), links = $$('#navList a'), pill = $('.pill-bg'),
      secs = links.map(function (a) { return $(a.getAttribute('href')); }),
      tlList = $('#tlList'), tlLine = $('#tlLine'), tlItems = $$('#tlList li'), ticking = false;

  function movePill(a) {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1; pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';

    var active = null;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * .4) active = links[i]; });
    links.forEach(function (a) { a.classList.toggle('on', a === active); });
    movePill(active);

    if (tlList) {
      var r = tlList.getBoundingClientRect(), mid = innerHeight * .6;
      var len = Math.max(0, Math.min(r.height - 12, mid - r.top));
      tlLine.style.height = len + 'px';
      tlItems.forEach(function (li) { li.classList.toggle('lit', li.getBoundingClientRect().top + 8 < mid); });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- report builder demo ---------- */
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
    var fieldsEl = $('#fields'), sheet = $('#sheet'), cat = $('#fCat'), sort = $('#fSort'), count = $('#rbCount');
    if (!fieldsEl) return;

    FIELDS.forEach(function (f) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fld'; b.textContent = f.l;
      b.setAttribute('aria-pressed', f.on);
      b.addEventListener('click', function () {
        if (f.on && FIELDS.filter(function (x) { return x.on; }).length === 1) return; // keep at least one
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
    function render(anim) {
      var cols = FIELDS.filter(function (f) { return f.on; }), rs = rows();
      var html = '<thead><tr><th class="rn"></th>' + cols.map(function (f) { return '<th scope="col">' + f.l + '</th>'; }).join('') + '</tr></thead><tbody>';
      rs.forEach(function (r, i) {
        html += '<tr' + (anim ? ' class="pop"' : '') + ' style="--d:' + i + '"><td class="rn">' + (i + 1) + '</td>' + cols.map(function (f) {
          var cls = f.num ? 'num' : '';
          if (f.k === 'r1' || f.k === 'r3') cls += r[f.k] >= 0 ? ' up' : ' dn';
          return '<td class="' + cls + '">' + fmt(f, r[f.k]) + '</td>';
        }).join('') + '</tr>';
      });
      sheet.innerHTML = html + '</tbody>';
      if (anim) $$('tr.pop td', sheet).forEach(function (td) { td.style.animationDelay = (+td.parentNode.style.getPropertyValue('--d') * 45) + 'ms'; });
      count.textContent = rs.length + ' rows × ' + cols.length + ' columns';
    }
    cat.addEventListener('change', function () { render(true); });
    sort.addEventListener('change', function () { render(true); });
    render(false);

    var x = $('#xbtn'), xl = $('#xlabel');
    x.addEventListener('click', function () {
      if (x.classList.contains('busy')) return;
      x.classList.add('busy'); xl.textContent = 'Building…';
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
        setTimeout(function () { x.classList.remove('busy'); xl.textContent = 'Export to Excel'; }, 1800);
      }, 1100);
    });
  })();

  /* ---------- copy email ---------- */
  var copyBtn = $('#copyMail'), ok = $('#copyOk');
  copyBtn.addEventListener('click', function () {
    var mail = 'gautamabhijeet7@gmail.com';
    var done = function () { ok.textContent = 'Copied ' + mail; setTimeout(function () { ok.textContent = ''; }, 2500); };
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(done, function () { ok.textContent = mail; });
    else ok.textContent = mail;
  });
})();
