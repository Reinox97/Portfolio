/* Mobile menu: builds the sheet from the header's own links, so every page stays in sync. */
(() => {
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.hdr .nav');
  if (!btn || !nav) return;
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EXPO = 'cubic-bezier(.16,1,.3,1)', INOUT = 'cubic-bezier(.76,0,.24,1)';
  const ARROW = '<svg class="mn-arr" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11h14M12.5 5.5L18 11l-5.5 5.5"/></svg>';
  const OUT = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3 9L9 3M4 3h5v5"/></svg>';
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── Build ── */
  const items = [...nav.querySelectorAll('a')].map((a, k) => {
    const soon = a.hasAttribute('data-soon'), cur = a.hasAttribute('aria-current');
    return `<li><a href="${esc(a.getAttribute('href'))}"${soon ? ' data-soon' : ''}${cur ? ' aria-current="page"' : ''}>` +
      `<span class="mn-n">${String(k + 1).padStart(2, '0')}</span>` +
      `<span class="mn-m"><span class="mn-t">${esc(a.textContent.trim())}${cur ? '<i class="dot" aria-hidden="true"></i>' : ''}</span></span>` +
      (soon ? '<span class="mn-soon">Soon</span>' : ARROW) + '</a></li>';
  }).join('');
  const logo = document.querySelector('.hdr .logo');
  const menu = document.createElement('div');
  menu.className = 'menu'; menu.id = 'menu'; menu.hidden = true;
  menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-label', 'Menu');
  menu.innerHTML = `
    <div class="menu-bg"></div><div class="menu-line"></div>
    <div class="menu-top sec"><div class="menu-top-in">
      <span class="m-rise"><a class="logo" href="${esc(logo ? logo.getAttribute('href') : '/')}" aria-label="Ifeoluwa Olatunde, home">IO<i></i></a></span>
      <span class="m-rise"><button class="menu-x" type="button">Close<span class="menu-x-i" aria-hidden="true"><i></i><i></i></span></button></span>
    </div></div>
    <nav class="menu-nav sec" aria-label="Menu"><ol>${items}</ol></nav>
    <div class="menu-foot sec">
      <p class="mf-l m-rise">Get in touch</p>
      <div class="mf-links m-rise">
        <a data-mlink="email" href="#contact">Email ${OUT}</a>
        <a data-mlink="linkedin" href="#contact">LinkedIn ${OUT}</a>
        <a data-mlink="cv" href="#contact">CV ${OUT}</a>
      </div>
      <p class="mf-meta m-rise"><span>Lagos, Nigeria</span><span class="mf-time"><i></i><span></span> WAT</span></p>
    </div>`;
  document.body.append(menu);
  btn.setAttribute('aria-controls', 'menu'); btn.setAttribute('aria-expanded', 'false');

  // contact links come from assets/links.js; empty ones say "Coming soon"
  const LINKS = window.IO_LINKS || {};
  menu.querySelectorAll('[data-mlink]').forEach(a => {
    const v = LINKS[a.dataset.mlink];
    if (!v) { a.setAttribute('data-soon', ''); return; }
    a.href = a.dataset.mlink === 'email' ? 'mailto:' + v : v;
    if (a.dataset.mlink !== 'email') { a.target = '_blank'; a.rel = 'noopener'; }
  });

  // local time in Lagos
  const timeEl = menu.querySelector('.mf-time > span');
  let fmt; try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
  const tick = () => { if (fmt) timeEl.textContent = fmt.format(new Date()); else timeEl.parentNode.hidden = true; };
  let clock = 0;

  const bg = menu.querySelector('.menu-bg'), line = menu.querySelector('.menu-line');
  const links = [...menu.querySelectorAll('.mn-t')], rows = [...menu.querySelectorAll('.menu-nav li')];
  const extras = [...menu.querySelectorAll('.mn-n, .mn-arr, .mn-soon')];
  const rises = [...menu.querySelectorAll('.m-rise')];

  // the sheet swallows scroll and keys so the page behind doesn't move
  ['wheel', 'touchstart', 'touchmove', 'touchend'].forEach(t => menu.addEventListener(t, e => e.stopPropagation(), { passive: true }));
  menu.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {                         // keep focus inside the sheet
      const f = [...menu.querySelectorAll('a[href], button')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  let open = false, anims = [];
  const run = (el, kf, o) => { const a = el.animate(kf, Object.assign({ fill: 'both' }, o)); anims.push(a); return a; };
  const stop = () => { anims.forEach(a => a.cancel()); anims = []; };

  function show() {
    if (open) return; open = true;
    stop(); menu.hidden = false; root.classList.add('menu-lock');
    btn.setAttribute('aria-expanded', 'true');
    tick(); clock = setInterval(tick, 15000);
    if (!reduce) {
      run(line, [{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1 }], { duration: 380, easing: EXPO });
      run(bg, [{ clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)' }], { duration: 820, delay: 300, easing: INOUT });
      run(line, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 700, easing: 'ease-out' });
      rises.slice(0, 2).forEach((el, k) => run(el, [{ opacity: 0, transform: 'translateY(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 620 + k * 60, easing: EXPO }));
      links.forEach((el, k) => run(el, [{ transform: 'translateY(110%)' }, { transform: 'none' }], { duration: 1000, delay: 560 + k * 70, easing: EXPO }));
      rows.forEach((el, k) => ['::after'].concat(k ? [] : ['::before']).forEach(pe => {
        try { run(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1100, delay: 600 + k * 70, easing: INOUT, pseudoElement: pe }); } catch (e) {}
      }));
      extras.forEach(el => run(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 900, easing: 'ease' }));
      rises.slice(2).forEach((el, k) => run(el, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 860 + k * 70, easing: EXPO }));
    }
    const first = menu.querySelector('.menu-nav a');
    setTimeout(() => first && first.focus({ preventScroll: true }), reduce ? 0 : 500);
  }

  function close(instant) {
    if (!open) return; open = false;
    btn.setAttribute('aria-expanded', 'false');
    clearInterval(clock);
    const done = () => { stop(); menu.hidden = true; root.classList.remove('menu-lock'); };
    if (reduce || instant) { done(); btn.focus({ preventScroll: true }); return; }
    root.classList.remove('menu-lock');             // the page can move again straight away
    stop();
    [...links, ...rises, ...extras].forEach(el => run(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in' }));
    run(line, [{ opacity: 0, transform: 'scaleX(1)' }, { opacity: 1, transform: 'scaleX(1)' }], { duration: 200, delay: 420 });
    run(bg, [{ clipPath: 'inset(0% 0 0% 0)' }, { clipPath: 'inset(50% 0 50% 0)' }], { duration: 560, delay: 80, easing: INOUT });
    run(line, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 360, delay: 640, easing: INOUT }).finished
      .then(done, () => {});
    btn.focus({ preventScroll: true });
  }

  btn.addEventListener('click', () => (open ? close() : show()));
  menu.querySelector('.menu-x').addEventListener('click', () => close());

  // following a link: same-page anchors close the sheet first; other pages keep it up under the page transition
  menu.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-soon')) return;
    let url; try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    const samePage = url.origin === location.origin && url.pathname === location.pathname;
    if (samePage) close(true);
  });

  // growing past the breakpoint closes it
  const mq = window.matchMedia('(min-width: 761px)');
  const onMq = () => { if (mq.matches) close(true); };
  mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
  window.addEventListener('pageshow', e => { if (e.persisted) close(true); });
})();
