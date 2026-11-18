const fs = require('node:fs');
const routes = JSON.parse(fs.readFileSync('output/redesign/routes.json', 'utf8'));
for (let offset = 0; offset < routes.length; offset += 4) {
  const batch = routes.slice(offset, offset + 4);
  const code = `async (page) => {
    const routes = ${JSON.stringify(batch)};
    const results = [];
    for (const [name, route] of routes) {
      const errors = [];
      const onError = error => errors.push(error.message);
      page.on('pageerror', onError);
      try {
        await page.setViewportSize({ width: 1440, height: 1000 });
        const response = await page.goto('http://localhost:14000' + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.locator('main h1').first().waitFor({ timeout: 55000 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const desktop = await measure();
        await page.screenshot({ path: 'output/redesign/' + name + '-desktop.png', fullPage: true, animations: 'disabled' });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => window.scrollTo(0, 0));
        const mobile = await measure();
        await page.screenshot({ path: 'output/redesign/' + name + '-mobile.png', fullPage: true, animations: 'disabled' });
        results.push({ name, status: response?.status(), desktop, mobile, errors });
      } catch (error) { results.push({ name, failure: error.message, errors }); }
      page.off('pageerror', onError);
    }
    return results;
    async function measure() {
      return page.evaluate(() => {
        function scrolls(el) { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { if (['auto','scroll'].includes(getComputedStyle(p).overflowX) && p.scrollWidth > p.clientWidth + 1) return true; } return false; }
        const overflow = [...document.querySelectorAll('main *, .home-header *')].filter(el => !scrolls(el)).filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1); }).map(el => (el.className?.baseVal ?? el.className)).slice(0, 5);
        const headings = [...document.querySelectorAll('main h1')].map(el => el.textContent.trim());
        return { width: innerWidth, pageWidth: document.documentElement.scrollWidth, background: getComputedStyle(document.body).backgroundColor, headings, overflow, cards: document.querySelectorAll('.directory-card, .platform-match').length, rootFailure: headings.some(text => /Football data unavailable|Application error/.test(text)) };
      });
    }
  }`;
  fs.writeFileSync('output/redesign/qa-routes-' + (offset / 4 + 1) + '.js', code);
}
console.log('Prepared ' + Math.ceil(routes.length / 4) + ' desktop/mobile route batches.');
