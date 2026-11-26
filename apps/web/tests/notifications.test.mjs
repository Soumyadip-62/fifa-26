import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import process from "node:process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

let nonce = 0;
async function source(path) {
  return ts.transpileModule(
    await readFile(new URL(`../src/${path}`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
}
const url = (code) =>
  `data:text/javascript;base64,${Buffer.from(`${code}\n// ${nonce++}`).toString("base64")}`;
const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

async function browser(run) {
  const names = [
    "window",
    "navigator",
    "Notification",
    "localStorage",
    "fetch",
    "setTimeout",
    "notificationMocks",
  ];
  const originals = names.map((name) => [
    name,
    Object.getOwnPropertyDescriptor(globalThis, name),
  ]);
  const key = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  const events = [];
  const notification = {
    permission: "default",
    requestPermission: () => {
      events.push("permission");
      notification.permission = "granted";
      return Promise.resolve("granted");
    },
  };
  const window = Object.assign(new EventTarget(), {
    isSecureContext: true,
    Notification: notification,
    PushManager: class {},
  });
  for (const [name, value] of Object.entries({
    window,
    navigator: { serviceWorker: {} },
    Notification: notification,
    localStorage: memoryStorage(),
  })) {
    Object.defineProperty(globalThis, name, {
      value,
      writable: true,
      configurable: true,
    });
  }
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY = "public-test-key";
  const permissionUrl = url(await source("lib/notification-permission.ts"));
  const permission = await import(permissionUrl);
  const preferences = () =>
    source("lib/preferences.ts").then(
      (code) =>
        import(
          url(
            code
              .replace(
                /import \{ useSyncExternalStore \} from "react";/,
                "const useSyncExternalStore = (_s, get) => get();",
              )
              .replace(
                '"./notification-permission"',
                JSON.stringify(permissionUrl),
              )
              .replace(
                /import \{ apiUrl \} from "\.\/api\/config";/,
                'const apiUrl = path => "https://backend.test" + path;',
              )
              .replace(
                /await import\([^)]*notificationService[^)]*\)/,
                "await Promise.resolve({ registerPush: globalThis.notificationMocks.registerPush })",
              ),
          )
        ),
    );
  try {
    await run({ permission, preferences, events, notification, window });
  } finally {
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
    if (key === undefined) delete process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    else process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY = key;
  }
}

test("Enable requests permission synchronously before SDK loading and saves only after subscription", () =>
  browser(async ({ preferences, events }) => {
    globalThis.notificationMocks = {
      registerPush: async () => {
        events.push("token");
        return "token";
      },
    };
    globalThis.fetch = async (_url, options) => {
      events.push("subscription");
      assert.equal(
        JSON.parse(options.body).preferences.notifications.enabled,
        true,
      );
      return {
        ok: true,
        json: async () => ({ id: "device", secret: "ownership" }),
      };
    };
    const p = await preferences();
    p.toggleFavourite("teamIds", "arsenal");
    const activation = p.enablePush();
    assert.deepEqual(events, ["permission"]);
    assert.equal(p.readPreferences().notifications.enabled, false);
    await activation;
    assert.deepEqual(events, ["permission", "token", "subscription"]);
    assert.equal(p.readPreferences().notifications.enabled, true);
    assert.deepEqual(p.readPreferences().teamIds, ["arsenal"]);
  }));

test("already granted permission is not requested again", () =>
  browser(async ({ permission, notification, events }) => {
    notification.permission = "granted";
    await permission.requestNotificationPermission();
    assert.deepEqual(events, []);
  }));

test("denied, dismissed, unavailable and insecure states do not activate delivery", () =>
  browser(async ({ permission, preferences, notification, window, events }) => {
    const p = await preferences();
    p.toggleFavourite("teamIds", "saved-team");
    notification.permission = "denied";
    await assert.rejects(p.enablePush(), /blocked.*browser settings/);
    assert.deepEqual(events, []);
    notification.permission = "default";
    notification.requestPermission = async () => "default";
    await assert.rejects(p.enablePush(), /not granted.*try again/);
    delete process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    assert.equal(permission.getNotificationAccess(), "unconfigured");
    await assert.rejects(p.enablePush(), /temporarily unavailable/);
    window.isSecureContext = false;
    await assert.rejects(p.enablePush(), /HTTPS/);
    window.isSecureContext = true;
    delete window.PushManager;
    await assert.rejects(p.enablePush(), /does not support/);
    assert.equal(p.readPreferences().notifications.enabled, false);
    assert.deepEqual(p.readPreferences().teamIds, ["saved-team"]);
  }));

test("token or backend failures preserve saved choices and never mark alerts enabled", () =>
  browser(async ({ preferences }) => {
    const p = await preferences();
    p.toggleFavourite("teamIds", "saved-team");
    globalThis.notificationMocks = {
      registerPush: async () => {
        throw new Error("Token failed");
      },
    };
    await assert.rejects(p.enablePush(), /Token failed/);
    globalThis.notificationMocks.registerPush = async () => "token";
    globalThis.fetch = async () => ({ ok: false });
    await assert.rejects(p.enablePush(), /could not be saved/);
    assert.equal(p.readPreferences().notifications.enabled, false);
    assert.deepEqual(p.readPreferences().teamIds, ["saved-team"]);
  }));

test("simultaneous device syncs reuse the ownership credential instead of creating duplicate devices", () =>
  browser(async ({ preferences }) => {
    const requests = [];
    globalThis.fetch = async (_url, options) => {
      requests.push(options);
      return {
        ok: true,
        json: async () => ({ id: "device", secret: "ownership" }),
      };
    };
    const p = await preferences();
    await Promise.all([
      p.syncDevice(p.readPreferences(), "token"),
      p.syncDevice(p.readPreferences(), "token"),
    ]);
    assert.deepEqual(
      requests.map((request) => request.method),
      ["POST", "PATCH"],
    );
    assert.equal(requests[1].headers["x-device-secret"], "ownership");
  }));

async function loadWorker() {
  return import(url(await source("lib/utils/notificationWorker.ts")));
}

test("worker registration explicitly uses root scope and waits for its own activation", () =>
  browser(async () => {
    const installing = Object.assign(new EventTarget(), {
      state: "installing",
    });
    const registration = Object.assign(new EventTarget(), {
      active: null,
      installing,
    });
    navigator.serviceWorker.register = async (path, options) => {
      assert.equal(path, "/firebase-messaging-sw.js");
      assert.deepEqual(options, { scope: "/" });
      setTimeout(() => {
        registration.active = installing;
        installing.dispatchEvent(new Event("statechange"));
      }, 0);
      return registration;
    };
    const worker = await loadWorker();
    assert.equal(await worker.getNotificationWorker(), registration);
  }));

test("worker install failures and stalled registrations return actionable errors", () =>
  browser(async () => {
    const worker = await loadWorker();
    navigator.serviceWorker.register = async () =>
      Object.assign(new EventTarget(), { active: null });
    await assert.rejects(worker.getNotificationWorker(), /failed to install/);
    const originalTimeout = setTimeout;
    globalThis.setTimeout = (callback, ms) =>
      originalTimeout(callback, Math.min(ms, 10));
    navigator.serviceWorker.register = () => new Promise(() => {});
    await assert.rejects(worker.getNotificationWorker(), /could not start/);
  }));

test("token reuse never bypasses revoked permission and Firebase receives the explicit worker", () =>
  browser(async ({ notification, permission }) => {
    notification.permission = "granted";
    const worker = { scope: "https://site.test/" };
    let tokenCalls = 0;
    globalThis.notificationMocks = {
      getNotificationAccess: permission.getNotificationAccess,
      notificationAccessMessage: permission.notificationAccessMessage,
      getFirebaseMessaging: async () => ({}),
      getNotificationWorker: async () => worker,
      withNotificationTimeout: (promise) => promise,
      getToken: async (_messaging, options) => {
        assert.equal(options.serviceWorkerRegistration, worker);
        tokenCalls++;
        return "current-token";
      },
    };
    const code = (await source("lib/utils/notificationService.ts")).replace(
      /import \{([^}]+)\} from "[^"]+";/g,
      (_line, names) => `const {${names}} = globalThis.notificationMocks;`,
    );
    const service = await import(url(code));
    const first = service.registerPush();
    assert.equal(service.registerPush(), first);
    await first;
    notification.permission = "denied";
    await assert.rejects(service.registerPush(), /blocked/);
    assert.equal(tokenCalls, 1);
  }));
