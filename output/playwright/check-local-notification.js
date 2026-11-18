async (page) => {
  const origin = "http://localhost:14000";
  await page.context().grantPermissions(["notifications"], { origin });
  await page.getByRole("button", { name: "Send dummy notification" }).click();
  await page.getByText(
    "Dummy notification sent to this browser. Check your device's notifications.",
    { exact: true },
  ).waitFor({ timeout: 25000 });
  const delivered = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications({ tag: "football-local-test" });
    return {
      permission: Notification.permission,
      worker: registration.active?.scriptURL,
      notifications: notifications.map((notification) => ({
        title: notification.title,
        body: notification.body,
        tag: notification.tag,
      })),
    };
  });
  if (delivered.notifications.length !== 1) {
    throw new Error("The browser did not retain the dummy notification.");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Send dummy notification" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "output/playwright/local-notification-test.png" });

  return { delivered };
}
