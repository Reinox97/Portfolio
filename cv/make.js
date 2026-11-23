const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + __dirname + '/cv.html'); await p.evaluate(() => document.fonts.ready);
  console.log('content mm', await p.evaluate(() => { const pg=document.querySelector('.page'), last=[...pg.querySelectorAll('.sec')].pop(); return ((last.getBoundingClientRect().bottom - pg.getBoundingClientRect().top)/96*25.4).toFixed(1); }));
  console.log('fonts', await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + f.weight).join(',')));
  await p.pdf({ path: 'Ifeoluwa-Olatunde-CV.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
