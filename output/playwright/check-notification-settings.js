async (page) => {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  await page.getByRole("heading", { name: "Notification settings", exact: true }).waitFor();
  await page.getByText("Notifications are temporarily unavailable. Please try again later.", { exact: true }).waitFor();
  check(await page.getByRole("button", { name: "Enable browser notifications", exact: true }).isDisabled(), "Missing configuration should prevent unusable permission prompts");
  const previousPreferences = await page.evaluate(() => localStorage.getItem("football:preferences:v1"));
  const cdp = await page.context().newCDPSession(page);
  const { targetInfo } = await cdp.send("Target.getTargetInfo");
  try {
    await page.evaluate(() => {
      localStorage.setItem("football:preferences:v1", JSON.stringify({ version: 1, teamIds: [], notifications: { enabled: true } }));
      window.dispatchEvent(new Event("football:preferences"));
    });
    await cdp.send("Browser.setPermission", { permission: { name: "notifications" }, setting: "denied", origin: "http://localhost:14000", browserContextId: targetInfo.browserContextId });
    await page.getByRole("heading", { name: "Notifications are blocked", exact: true }).waitFor();
    check(await page.getByRole("heading", { name: "Alerts are enabled", exact: true }).count() === 0, "A stale preference incorrectly claimed alerts were enabled");
    await page.getByText(/Notifications are blocked. Open this site's browser settings/).waitFor();
    await page.screenshot({ path: "output/playwright/notification-blocked-mobile.png" });
    await page.getByRole("button", { name: "Disable alerts for this device", exact: true }).click();
    await page.context().grantPermissions(["notifications"], { origin: "http://localhost:14000" });
    await page.getByRole("button", { name: "Send dummy notification", exact: true }).click();
    await page.getByText("Dummy notification sent to this browser. Check your device's notifications.", { exact: true }).waitFor({ timeout: 25000 });
    const delivered = await page.evaluate(async () => {
      const worker = await navigator.serviceWorker.getRegistration("/");
      const notices = await worker.getNotifications({ tag: "football-local-test" });
      return { scope: worker.scope, active: !!worker.active, titles: notices.map(notice => notice.title) };
    });
    check(delivered.scope === "http://localhost:14000/", "Wrong worker scope");
    check(delivered.active && delivered.titles.includes("NinetyPlus - Test"), "The notification was not delivered");
    await page.getByRole("button", { name: "Send dummy notification" }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: "output/playwright/notification-worker-mobile.png" });
    return { configurationMessage: true, blockedPermission: true, stalePreferenceHandled: true, delivered };
  } finally {
    await cdp.detach();
    await page.evaluate(previous => {
      if (previous === null) localStorage.removeItem("football:preferences:v1");
      else localStorage.setItem("football:preferences:v1", previous);
      window.dispatchEvent(new Event("football:preferences"));
    }, previousPreferences);
  }
}
