/* Page transitions.
   Leaving a page: two white halves close over it and meet on a hairline (the loader, in reverse).
   Arriving: the next page starts closed and opens from the same seam.
   Load this in <head>, before anything else that animates. */
(function () {
  var d = document, r = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'io-pt';
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var incoming = !reduce && store.get(KEY) === '1';
  store.set(KEY, null);

  var css =
    '.pt{position:fixed;inset:0;z-index:150;pointer-events:none}' +
    '.pt.is-blocking{pointer-events:auto}' +
    '.pt-h{position:absolute;left:0;right:0;height:50%;background:#FFFFFF;will-change:transform}' +
    '.pt-t{top:0}.pt-b{bottom:0}' +
    '.pt-h::after{content:"";position:absolute;left:0;right:0;height:1px;background:#C6C5BF}' +
    '.pt-t::after{bottom:0}.pt-b::after{top:0}' +
    '.pt.is-opening .pt-h::after{animation:pt-line 850ms ease-in-out 420ms forwards}' +
    '@keyframes pt-line{to{opacity:0}}' +
    'html.pt-cover body{opacity:0}';
  var st = d.createElement('style'); st.textContent = css; d.head.appendChild(st);
  if (incoming) r.classList.add('pt-cover', 'pt-in');

  var EASE = 'cubic-bezier(.76,0,.24,1)';
  function curtain(closed) {
    var el = d.createElement('div'); el.className = 'pt'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="pt-h pt-t"></div><div class="pt-h pt-b"></div>';
    if (!closed) { el.firstChild.style.transform = 'translateY(-100%)'; el.lastChild.style.transform = 'translateY(100%)'; }
    d.body.appendChild(el); return el;
  }
  var wait = function (ms) { return new Promise(function (res) { setTimeout(res, ms); }); };

  var openResolve;
  var opened = new Promise(function (res) { openResolve = res; });
  window.IO_PT = { incoming: incoming, opened: opened, store: store };

  function open() {
    if (!incoming) { openResolve(); return; }
    var el = curtain(true);
    r.classList.remove('pt-cover');
    var fonts = d.fonts ? d.fonts.ready : Promise.resolve();
    Promise.race([fonts, wait(700)]).then(function () {
      var t = el.firstChild, b = el.lastChild, o = { duration: 1150, easing: EASE, fill: 'forwards' };
      var up = t.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], o);
      b.animate([{ transform: 'none' }, { transform: 'translateY(100%)' }], o);
      el.classList.add('is-opening');
      openResolve();
      up.finished.then(function () { el.remove(); r.classList.remove('pt-in'); }, function () { el.remove(); });
    });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', open); else open();
  // never leave a page covered
  setTimeout(function () { r.classList.remove('pt-cover'); openResolve(); }, 3000);

  var leaving = false;
  d.addEventListener('click', function (e) {
    if (reduce || leaving || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-soon')) return;
    var url; try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;   // same page: let anchors scroll
    e.preventDefault(); leaving = true;
    var el = curtain(false); el.classList.add('is-blocking');
    var o = { duration: 720, easing: EASE, fill: 'forwards' };
    el.firstChild.animate([{ transform: 'translateY(-100%)' }, { transform: 'none' }], o);
    el.lastChild.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], o).finished.then(function () {
      store.set(KEY, '1');
      location.href = url.href;
    });
  });
  // coming back with the browser's back button: drop any closed curtain
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    leaving = false;
    var els = d.querySelectorAll('.pt'); for (var i = 0; i < els.length; i++) els[i].remove();
    r.classList.remove('pt-cover', 'pt-in');
  });
})();
