/* Google Analytics 4 (gtag.js), following Google's "Set up Analytics for a website" guide.
   Runs once a measurement ID (G-XXXXXXXXXX) is set as ga4 in assets/links.js. */
(function () {
  var id = window.IO_LINKS && window.IO_LINKS.ga4;
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return;
  var s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id);
})();
