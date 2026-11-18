async (page) => {
  const errors = [], warnings = [];
  const onConsole = message => { if (message.type() === 'error') errors.push(message.text()); if (message.type() === 'warning') warnings.push(message.text()); };
  const onError = error => errors.push(error.message);
  page.on('console', onConsole);
  page.on('pageerror', onError);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  await page.locator('.dashboard-grid').waitFor();
  await page.locator('.dashboard-news-item').first().waitFor();
  await page.getByRole('button', { name: 'Open profile settings' }).click();
  await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor();
  const settingsDescription = await page.getByRole('dialog').getAttribute('aria-describedby');
  await page.getByRole('button', { name: 'Close settings' }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'output/playwright/home-1440.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'output/playwright/home-390.png', fullPage: true, animations: 'disabled' });
  const result = {
    errors, warnings, settingsDescription: Boolean(settingsDescription),
    liveMessage: await page.locator('.dashboard-live-empty').innerText(),
    upcomingTimes: await page.locator('.dashboard-upcoming time').allTextContents(),
    newsItems: await page.locator('.dashboard-news-item').count(),
    scorerRows: await page.locator('.dashboard-scorer-list li').count(),
  };
  page.off('console', onConsole);
  page.off('pageerror', onError);
  return result;
}
