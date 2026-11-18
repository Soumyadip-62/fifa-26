async (page) => {
  const routes = ["/", "/competitions", "/matches", "/live", "/teams", "/players",
    "/standings", "/statistics", "/news", "/favourites", "/search", "/stadiums",
    "/settings/notifications", "/admin", "/competitions/premier-league",
    "/competitions/la-liga", "/competitions/ucl", "/competitions/bundesliga"];
  const results = [];
  const requests = [];
  page.on("request", (request) => {
    if (request.url().includes("localhost:10000")) requests.push(request.url());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of routes) {
    await page.goto("http://localhost:14000" + route, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.locator("main h1").first().waitFor({ timeout: 55000 });
    const state = await page.evaluate(() => ({
      title: document.title,
      worldCupText: /world\s*cup/i.test(document.body.innerText),
      removedLinks: [...document.querySelectorAll("a[href],option[value]")]
        .map((element) => element.getAttribute("href") || element.getAttribute("value"))
        .filter((url) => /world-cup|^\/history$|^\/points-table$|knockout-matches/.test(url)),
    }));
    results.push({ route, ...state });
    if (["/", "/competitions", "/standings"].includes(route)) {
      await page.screenshot({ path: "output/playwright/world-cup-paused-" + (route === "/" ? "home" : route.slice(1)) + ".png", fullPage: true });
    }
  }
  const disabled = [];
  for (const route of ["/competitions/world-cup", "/history", "/points-table", "/matches/knockout-matches"]) {
    const response = await page.goto("http://localhost:14000" + route, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.getByRole("heading", { name: "Page not found" }).waitFor();
    disabled.push({ route, status: response.status(), notFound: true });
  }
  await page.goto("http://localhost:14000/standings", { waitUntil: "domcontentloaded" });
  await page.getByRole("navigation", { name: "Standings competitions" }).waitFor();
  const tabs = [];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    tabs.push(await page.getByRole("navigation", { name: "Standings competitions" }).evaluate((element) => ({
      width: innerWidth, count: element.children.length,
      rows: new Set([...element.children].map((a) => a.getBoundingClientRect().top)).size,
      scrolls: element.scrollWidth > element.clientWidth,
    })));
  }
  return { pages: results, disabled, tabs,
    worldCupRequests: requests.filter((url) => /world-cup|\/matches$|\/history/.test(url)) };
}
