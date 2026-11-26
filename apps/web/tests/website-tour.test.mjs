import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

let nonce = 0;
async function loadTour() {
  const code = ts.transpileModule(
    await readFile(
      new URL("../src/lib/website-tour.ts", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(`${code}\n//${nonce++}`).toString("base64")}`
  );
}

for (const outcome of ["skipped", "completed"]) {
  test(`tour ${outcome} persists across reloads and replay remains available`, async () => {
    const previous = globalThis.localStorage,
      previousWindow = globalThis.window;
    const values = new Map();
    globalThis.localStorage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    };
    globalThis.window = new EventTarget();
    try {
      const tour = await loadTour();
      assert.equal(tour.tourWasHandled(), false);
      tour.finishTour(outcome);
      assert.equal((await loadTour()).tourWasHandled(), true);
      assert.equal(values.get(tour.TOUR_STORAGE_KEY), outcome);
      let replayed = false;
      globalThis.window.addEventListener(tour.TOUR_REPLAY_EVENT, () => {
        replayed = true;
      });
      tour.replayWebsiteTour();
      assert.equal(replayed, true);
    } finally {
      globalThis.localStorage = previous;
      globalThis.window = previousWindow;
    }
  });
}

test("unavailable storage does not trap users in the tour", async () => {
  const previous = globalThis.localStorage;
  globalThis.localStorage = {
    getItem() {
      throw new Error("Unavailable");
    },
    setItem() {
      throw new Error("Unavailable");
    },
  };
  try {
    const tour = await loadTour();
    assert.equal(tour.tourWasHandled(), false);
    tour.finishTour("skipped");
    assert.equal(tour.tourWasHandled(), true);
  } finally {
    globalThis.localStorage = previous;
  }
});
