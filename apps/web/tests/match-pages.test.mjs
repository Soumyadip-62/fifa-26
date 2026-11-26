import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadPageClient() {
  const source = await readFile(
    new URL("../src/lib/api/match-pages.ts", import.meta.url),
    "utf8",
  );
  const code = ts
    .transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext },
    })
    .outputText.replace(
      'import { apiUrl } from "./config";',
      "const apiUrl = (path) => `https://backend.test${path}`;",
    );
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}

test("match page requests carry tournament, filters and page without requesting other pages", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(new URL(url));
    return { ok: true, json: async () => ({ data: [] }) };
  };
  try {
    const { getMatchPage } = await loadPageClient();
    const base = {
      competition: "premier-league",
      status: "finished",
      stage: "REGULAR_SEASON",
      day: "all",
      q: "Arsenal",
      limit: 24,
    };
    await getMatchPage({ ...base, page: 1 });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].pathname, "/football/matches");
    assert.equal(calls[0].searchParams.get("competition"), "premier-league");
    assert.equal(calls[0].searchParams.get("status"), "finished");
    assert.equal(calls[0].searchParams.get("q"), "Arsenal");
    assert.equal(calls[0].searchParams.get("page"), "1");
    await getMatchPage({ ...base, competition: "la-liga", page: 2 });
    assert.equal(calls.length, 2);
    assert.equal(calls[1].searchParams.get("competition"), "la-liga");
    assert.equal(calls[1].searchParams.get("page"), "2");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
