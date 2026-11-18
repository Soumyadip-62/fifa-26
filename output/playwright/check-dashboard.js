async (page) => {
  await page.locator('.dashboard-grid').waitFor();
  const results = [];
  for (const width of [360, 390, 430, 768, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('.dashboard-competition-list').evaluate(el => { el.scrollLeft = 0; });
    const measurement = await page.evaluate(() => {
      const overflow = [...document.querySelectorAll('.home-dashboard *, .home-header *, .home-bottom-nav *')]
        .filter(el => !el.closest('.dashboard-competition-list'))
        .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1); })
        .map(el => el.className?.baseVal ?? el.className).slice(0, 8);
      return {
        width: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        overflow,
        livePanelTop: Math.round(document.querySelector('.dashboard-live').getBoundingClientRect().top),
        heroHeight: Math.round(document.querySelector('.dashboard-hero').getBoundingClientRect().height),
        competitionCards: document.querySelectorAll('.dashboard-competition-card').length,
        obsoleteUpcoming: [...document.querySelectorAll('.dashboard-upcoming time')].some(el => Date.parse(el.dateTime) < Date.now()),
      };
    });
    await page.screenshot({ path: `output/playwright/home-${width}.png`, fullPage: true, animations: 'disabled' });
    results.push(measurement);
  }
  return results;
}
