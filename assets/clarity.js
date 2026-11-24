/* Microsoft Clarity (heatmaps and session replays). Plain-HTML version of @microsoft/clarity:
   this site has no bundler, so the official tag is loaded directly.
   It only runs once a project ID is set in assets/links.js (clarity: '...'). */
(function () {
  var id = window.IO_LINKS && window.IO_LINKS.clarity;
  if (!id || !/^[a-z0-9]+$/i.test(id)) return;
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', id);
})();
