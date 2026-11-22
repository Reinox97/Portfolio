/* Shared behaviour for the inner pages. The home page keeps its own script (loader, pinned screens). */
(() => {
  const root = document.documentElement;
  const anim = root.classList.contains('anim');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ── Links from assets/links.js ── */
  const LINKS = window.IO_LINKS || { email: '', linkedin: '', cv: '' };
  $$('[data-link]').forEach(a => {
    const v = LINKS[a.dataset.link];
    if (!v) { a.setAttribute('data-soon', ''); a.removeAttribute('target'); return; }
    const k = a.dataset.link;
    a.href = k === 'email' ? 'mailto:' + v : k === 'phone' ? 'tel:' + v.replace(/\s/g, '') : v;
    if (k !== 'email' && k !== 'phone') { a.target = '_blank'; a.rel = 'noopener'; }
  });

  /* ── Copy buttons (contact page) ── */
  const copyText = t => navigator.clipboard && window.isSecureContext ? navigator.clipboard.writeText(t) : new Promise((res, rej) => {
    const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); ok ? res() : rej();
  });
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
    const label = btn.querySelector('span'), what = btn.closest('.ct-row')?.querySelector('.ct-lab')?.lastChild.textContent.trim() || 'Text';
    copyText(btn.dataset.copy).then(() => {
      btn.classList.add('done'); label.textContent = 'Copied';
      const t = document.getElementById('toast'); t.textContent = what + ' copied'; t.classList.add('on');
      clearTimeout(btn._t); btn._t = setTimeout(() => { btn.classList.remove('done'); label.textContent = 'Copy'; t.classList.remove('on'); }, 1800);
    }, () => {});
  }));

  /* ── Local time in Lagos ── */
  const clocks = $$('[data-clock]');
  if (clocks.length) {
    let fmt; try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
    const tick = () => clocks.forEach(c => { c.textContent = fmt ? fmt.format(new Date()) : ''; });
    tick(); setInterval(tick, 15000);
  }

  /* ── "Coming soon" toast ── */
  const toast = $('#toast'); let toastT;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-soon]'); if (!a) return;
    e.preventDefault();
    toast.textContent = 'Coming soon';
    toast.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 1800);
  });

  /* ── Header: tucks away going down, returns going up ── */
  const hdr = $('#hdr');
  let lastY = window.scrollY, travel = 0, ticking = false;
  const pars = $$('[data-par]');
  function onScroll() {
    const y = window.scrollY, vh = window.innerHeight, d = y - lastY;
    travel = (d > 0) === (travel > 0) ? travel + d : d;
    if (y < 140 || travel < -12) hdr.classList.remove('is-hidden');
    else if (travel > 40) hdr.classList.add('is-hidden');
    hdr.classList.toggle('is-floating', y > 140);
    root.style.setProperty('--hdr-off', hdr.classList.contains('is-hidden') ? '0px' : hdr.offsetHeight + 'px');
    lastY = y;
    if (anim) pars.forEach(img => {              // a slow drift inside the frame
      const r = img.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.setProperty('--py', (clamp(p, -1, 1) * -r.height * 0.035).toFixed(1) + 'px');
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ── Text splitting: each word rises from a mask, line by line ── */
  function split(el) {
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
          w.append(i); frag.append(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && !ch.classList.contains('keep')) walk(ch);
    });
    walk(el);
    const dot = el.querySelector(':scope > .keep'), last = $$('.wi', el).pop();
    if (dot && last) last.append(dot);
  }
  function setLines(el) {
    let top = null, l = -1;
    $$('.w', el).forEach(w => {
      const t = w.getBoundingClientRect().top;
      if (top === null || Math.abs(t - top) > 6) { l++; top = t; }
      w.firstChild.style.setProperty('--l', l);
    });
  }

  /* ── Counters ── */
  function countUp(el) {
    if (el._counted) return; el._counted = true;
    const to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (!anim) return;
    el.style.display = 'inline-block'; el.style.minWidth = el.offsetWidth + 'px';
    el.textContent = pre + (0).toFixed(dec) + suf;
    setTimeout(() => {
      const t0 = performance.now(), dur = +el.dataset.dur || 1600;
      (function tick(now) {
        const p = clamp((now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = pre + (to * e).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, 250);
  }

  /* ── Cursor badge ── */
  const cur = $('#cursor'), curLabel = cur && cur.firstElementChild;
  if (cur && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let tx = -200, ty = -200, x = tx, y = ty, s = 0, ts = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2; s += (ts - s) * 0.18;
      cur.style.setProperty('--x', x.toFixed(1) + 'px'); cur.style.setProperty('--y', y.toFixed(1) + 'px'); cur.style.setProperty('--s', s.toFixed(3));
      raf = (ts > 0 || s > 0.01) ? requestAnimationFrame(loop) : 0;
      if (!raf) cur.style.setProperty('--s', 0);
    };
    $$('[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', e => {
        curLabel.textContent = el.dataset.cursor; ts = 1;
        if (s < 0.02) { x = tx = e.clientX; y = ty = e.clientY; }
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
      el.addEventListener('pointerleave', () => { ts = 0; });
    });
    window.addEventListener('scroll', () => { ts = 0; }, { passive: true });
    document.addEventListener('pointerdown', () => { ts = 0; });
  }

  /* ── Lightbox: open any screen full size ── */
  let lb = null;
  function closeLb() {
    if (!lb) return; const el = lb; lb = null;
    el.classList.remove('on');
    const img = $('img', el);
    (anim ? img.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.96)', opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' }).finished : Promise.resolve())
      .then(() => el.remove());
    document.body.style.overflow = '';
  }
  $$('[data-zoom]').forEach(el => {
    el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Open full size: ' + ($('img', el).alt || 'image'));
    const openLb = () => {
      const src = $('img', el);
      lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
      lb.innerHTML = `<img src="${src.currentSrc || src.src}" alt="${src.alt.replace(/"/g, '&quot;')}"><button class="lb-x" type="button" aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l10 10M13 3L3 13"/></svg></button>`;
      document.body.append(lb); document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => lb.classList.add('on'));
      if (anim) {
        const from = src.getBoundingClientRect(), big = $('img', lb), to = big.getBoundingClientRect();
        const sx = from.width / to.width, dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top + from.height / 2 - (to.top + to.height / 2);
        big.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${sx})` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
      lb.addEventListener('click', closeLb);
      $('.lb-x', lb).focus({ preventScroll: true });
    };
    el.addEventListener('click', openLb);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); } });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* ── Settlement lifecycle: a batch moves through the four states, again and again ── */
  $$('[data-cycle]').forEach(box => {
    const sts = $$('.st', box), links = $$('.link-l', box);
    let i = -1, timer = 0, running = false;
    const paint = () => {
      sts.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); });
      links.forEach((l, k) => l.classList.toggle('done', k < i));
    };
    const rest = () => {                         // the still picture: a batch aggregating, the goal lit at the end
      sts.forEach((s, k) => { s.classList.toggle('on', k === 0); s.classList.toggle('done', k === sts.length - 1); });
      links.forEach(l => l.classList.remove('done'));
    };
    const step = () => {
      i = i >= sts.length - 1 ? 0 : i + 1; paint();
      timer = setTimeout(step, i === sts.length - 1 ? 2600 : 1400);
    };
    if (!anim) return;
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !running) { running = true; i = -1; timer = setTimeout(step, 1100); }
      else if (!e.isIntersecting && running) { running = false; clearTimeout(timer); rest(); }
    }), { threshold: 0.3 }).observe(box);
  });

  /* ── Risk as layers: hover a tier and its ring answers (and the other way round) ── */
  $$('[data-tiers]').forEach(wrap => {
    const list = $('.tier-list', wrap), rings = $('.rings', wrap);
    const set = key => {
      list.classList.toggle('has-on', !!key); rings.classList.toggle('has-on', !!key);
      $$('[data-tier]', wrap).forEach(el => el.classList.toggle('on', el.dataset.tier === key));
    };
    $$('[data-tier]', wrap).forEach(el => {
      el.addEventListener('pointerenter', () => set(el.dataset.tier));
      el.addEventListener('pointerleave', () => set(null));
    });
  });

  /* ── Reveals ── */
  function reveal(el) {
    el.classList.add('in');
    $$('[data-count]', el).forEach(countUp);
    if (el.matches('.rings')) setTimeout(() => el.classList.add('settled'), 1400);
  }
  function start() {
    root.classList.add('ready');
    $$('[data-hero]').forEach(reveal);
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    $$('[data-r]:not([data-hero])').forEach(el => io.observe(el));
  }

  if (!anim) { root.classList.add('ready'); $$('[data-r]').forEach(el => el.classList.add('in')); $$('.rings').forEach(r => r.classList.add('settled')); return; }

  $$('.split').forEach(split);
  const lines = () => $$('.split').forEach(el => { const box = el.closest('[data-r]'); if (!box || !box.classList.contains('in')) setLines(el); });
  window.addEventListener('resize', lines);

  (async () => {
    await Promise.race([document.fonts ? document.fonts.ready : wait(0), wait(1200)]);
    lines();
    if (window.IO_PT) { await window.IO_PT.opened; if (window.IO_PT.incoming) await wait(180); }
    start();
  })().catch(() => { root.classList.add('ready'); $$('[data-r]').forEach(el => el.classList.add('in')); });
})();
