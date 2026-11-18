async (page) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:14000/teams/a6e4c9ef-3c39-5ff6-8d23-37faf57967cd');
  await page.getByRole('combobox', {name:'Season', exact:true}).locator('option').filter({hasText: /^2026$/}).waitFor({ state:'attached', timeout:15000 });
  const result = await page.evaluate(() => [...document.querySelectorAll('main h1,main h2,main strong,main select')].map(el => ({ text:el.textContent.trim().slice(0,40),font:getComputedStyle(el).fontFamily, heading:getComputedStyle(el).getPropertyValue('--font-heading'),weight:getComputedStyle(el).fontWeight })));
  await page.screenshot({ path:'output/redesign/preview-team.png', animations:'disabled' });
  return result;
}
