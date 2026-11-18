async (page) => {
  const pages = [
    ['matches', '/matches', 1440, 1000],
    ['team', '/teams/a6e4c9ef-3c39-5ff6-8d23-37faf57967cd', 1440, 1000],
    ['player', '/players/fa82c0c8-94f4-5c28-8910-c9a6976a8c2e', 390, 844],
  ];
  const result = [];
  for (const [name, route, width, height] of pages) {
    await page.setViewportSize({ width, height });
    await page.goto('http://localhost:14000' + route);
    await page.locator('main h1').first().waitFor();
    if (name === 'team') await page.getByRole('combobox').first().waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].filter(img => img.getBoundingClientRect().top < innerHeight).map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); })));
    });
    await page.screenshot({ path: 'output/redesign/preview-' + name + '.png', animations: 'disabled' });
    if (name === 'player') await page.screenshot({ path: 'output/redesign/player-detail-mobile.png', fullPage: true, animations: 'disabled' });
    result.push({ name, heading: await page.locator('main h1').first().innerText(), width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
  }
  return result;
}
