async (page) => {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => localStorage.removeItem("football:website-tour:v1"));
  await page.reload();
  await page.getByRole("dialog", { name: "Welcome to NinetyPlus" }).waitFor();
  await page.evaluate(() => {
    window.__permissionRequests = 0;
    Notification.requestPermission = async () => { window.__permissionRequests++; return "default"; };
  });
  const before = await page.evaluate(() => localStorage.getItem("football:preferences:v1"));
  await page.screenshot({ path: "output/playwright/tour-welcome-mobile.png" });
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  const targets = [];
  for (let step = 0; step < 5; step++) {
    await page.getByText(`Step ${step + 1} of 5`, { exact: true }).waitFor();
    const target = await page.locator(".website-tour-highlight").evaluate(element => ({
      name: element.getAttribute("data-tour"),
      visible: element.getClientRects().length > 0,
    }));
    check(target.visible, `Step ${step + 1} has no visible target`);
    targets.push(target.name);
    for (let key = 0; key < 5; key++) {
      await page.keyboard.press("Tab");
      await page.waitForFunction(() => !!document.activeElement?.closest('[role="dialog"]'), { timeout: 1500 });
    }
    if (step === 3) {
      check(target.name === "saved", "Mobile favourites target is incorrect");
      await page.screenshot({ path: "output/playwright/tour-saved-mobile.png" });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForFunction(() => document.querySelector('.website-tour-highlight')?.getAttribute('data-tour') === 'settings');
      await page.screenshot({ path: "output/playwright/tour-settings-desktop.png" });
    }
    if (step === 4) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForFunction(() => document.querySelector('.website-tour-highlight')?.getAttribute('data-tour') === 'settings');
      await page.screenshot({ path: "output/playwright/tour-notifications-mobile.png" });
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await page.getByText("Step 4 of 5", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await page.getByText("Step 5 of 5", { exact: true }).waitFor();
    }
    await page.getByRole("button", { name: step === 4 ? "Finish" : "Next", exact: true }).click();
  }
  check(await page.evaluate(() => localStorage.getItem("football:website-tour:v1")) === "completed", "Completion was not stored");
  check(await page.evaluate(() => window.__permissionRequests) === 0, "The tour requested notification permission");
  check(await page.evaluate(() => localStorage.getItem("football:preferences:v1")) === before, "The tour changed preferences");
  await page.reload();
  await page.waitForTimeout(700);
  check(await page.getByRole("dialog").count() === 0, "The completed tour reopened on reload");
  await page.getByRole("button", { name: "Open profile settings" }).click();
  await page.getByRole("button", { name: "Replay website tour" }).click();
  await page.getByRole("dialog", { name: "Your matchday starts here" }).waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  check(await page.evaluate(() => localStorage.getItem("football:website-tour:v1")) === "skipped", "Escape dismissal was not stored");
  check(await page.getByRole("button", { name: "Open profile settings" }).evaluate(element => element === document.activeElement), "Focus did not return to Settings");
  await page.reload();
  await page.waitForTimeout(700);
  check(await page.getByRole("dialog").count() === 0, "Dismissed tour reopened");
  return { targets, completed: true, keyboardFocusTrapped: true, replayed: true, dismissedPersisted: true };
}
