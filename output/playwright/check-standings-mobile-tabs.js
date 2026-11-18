async (page) => {
  const results = [];
  for (const width of [320, 360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const nav = page.getByRole("navigation", { name: "Standings competitions" });
    results.push(await nav.evaluate((el) => ({
      width: innerWidth,
      scrolls: el.scrollWidth > el.clientWidth,
      rows: new Set([...el.children].map((a) => a.getBoundingClientRect().top)).size,
      tabs: [...el.children].map((a) => ({
        text: a.textContent,
        height: a.getBoundingClientRect().height,
        visible: a.getBoundingClientRect().right <= innerWidth,
      })),
    })));
    if (width === 390) {
      await page.screenshot({ path: "output/playwright/standings-mobile-tabs.png" });
    }
  }
  return results;
}
