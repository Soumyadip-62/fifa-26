import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/api/news.ts", import.meta.url),
  "utf8",
);
const compile = (text) =>
  ts.transpileModule(text, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
async function loadService() {
  const adapters = `const cache = (fn) => { const values=new Map(); return (...args)=>{const key=JSON.stringify(args); if(!values.has(key)) values.set(key,fn(...args)); return values.get(key);}; };
    const apiUrl = (path) => new URL(path, "http://backend.test").toString(); const mockNewsArticles=[];`;
  const code = compile(source)
    .replace(/import \{[^}]*\} from "@\/data\/mock\/news";/, "")
    .replace(/import \{[^}]*\} from "@\/lib\/api\/config";/, "")
    .replace('import { cache } from "react";', "");
  return import(
    `data:text/javascript;base64,${Buffer.from(adapters + code + `\n// ${Math.random()}`).toString("base64")}`
  );
}
const article = (competitionId = "premier-league") => ({
  id: "provider-id",
  competitionId,
  title: "A real football headline",
  description: "Publisher preview",
  image: "None",
  url: "https://www.publisher.example/football/story",
  published: "2026-10-19T06:00:00Z",
  category: ["sports"],
});

test("competition news uses the backend only, scopes IDs and preserves publisher links", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push(url);
    assert.equal(options.headers, undefined);
    assert.equal(options.cache, "no-store");
    return {
      ok: true,
      json: async () => ({
        news: [article(), article("ucl")],
        freshness: { stale: false, fetchedAt: "2026-10-19T06:10:00Z" },
      }),
    };
  };
  try {
    const service = await loadService();
    const feed = await service.getFootballNewsFeed("premier-league");
    assert.deepEqual(calls, [
      "http://backend.test/news/competitions/premier-league",
    ]);
    assert.equal(feed.articles[0].sourceUrl, article().url);
    assert.equal(feed.articles.length, 1);
    assert.equal(feed.articles[0].sourceName, "publisher.example");
    assert.equal(feed.articles[0].id, "premier-league:provider-id");
    assert.equal(
      feed.articles[0].imageUrl,
      "/assets/images/blogs/default-news.svg",
    );
    assert.equal(await service.getFootballNewsFeed("premier-league"), feed);
    assert.equal(calls.length, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test("home news loads the combined feed and exposes stale/partial failures without static replacements", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(url, "http://backend.test/news");
    return {
      ok: true,
      json: async () => ({
        news: [article("ucl"), article("la-liga")],
        freshness: { stale: true, fetchedAt: "2026-10-19T06:00:00Z" },
        errors: { bundesliga: "Unavailable" },
      }),
    };
  };
  try {
    const feed = await (await loadService()).getFootballNewsFeed();
    assert.equal(feed.articles.length, 2);
    assert.equal(feed.stale, true);
    assert.equal(feed.errors.bundesliga, "Unavailable");
    assert.notEqual(feed.articles[0].id, feed.articles[1].id);
  } finally {
    globalThis.fetch = original;
  }
});

test("empty feeds remain empty and provider failures stay distinguishable from empty news", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ news: [] }),
    });
    assert.deepEqual(
      (await (await loadService()).getFootballNewsFeed()).articles,
      [],
    );
    globalThis.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(
      (await loadService()).getFootballNewsFeed(),
      /temporarily unavailable/,
    );
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ invalid: [] }),
    });
    await assert.rejects(
      (await loadService()).getFootballNewsFeed(),
      /temporarily unavailable/,
    );
  } finally {
    globalThis.fetch = original;
  }
});
