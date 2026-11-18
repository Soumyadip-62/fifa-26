import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/matches/fixture-order.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { orderFixtures, upcomingFixtures } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const fixture = (id, status, kickoff) => ({ match: { id, status, kickoff } });

test("next matches exclude overdue scheduled fixtures and show future kickoffs in order", () => {
  const now = Date.parse("2026-11-16T08:30:00Z");
  const stale = fixture("october", "upcoming", "2026-10-19T19:00:00Z");
  const later = fixture("later", "upcoming", "2026-11-21T15:00:00Z");
  const next = fixture("next", "upcoming", "2026-11-20T20:00:00Z");
  const items = [stale, later, next,
    fixture("invalid", "upcoming", "invalid"),
    fixture("live", "live", "2026-11-16T08:00:00Z"),
    fixture("postponed", "postponed", "2026-11-22T15:00:00Z"),
  ];
  assert.deepEqual(upcomingFixtures(items, now), [next, later]);
  assert.equal(items[0], stale);
  assert.equal(stale.match.status, "upcoming");
});

test("upcoming selection compares absolute kickoff times at the current-time boundary", () => {
  const now = Date.parse("2026-11-16T00:00:00+05:30");
  const past = fixture("past", "upcoming", "2026-11-15T18:29:59Z");
  const kickoff = fixture("now", "upcoming", "2026-11-15T18:30:00Z");
  assert.deepEqual(upcomingFixtures([past, kickoff], now), [kickoff]);
  assert.deepEqual(upcomingFixtures([past], now), []);
});

test("completed World Cup games cannot precede live and next league fixtures", () => {
  const items = [
    fixture("wc-june", "finished", "2026-06-11T19:00:00Z"),
    fixture("bundesliga-friday", "upcoming", "2026-10-23T18:30:00Z"),
    fixture("ucl-tuesday", "upcoming", "2026-10-20T16:45:00Z"),
    fixture("laliga-monday", "upcoming", "2026-10-19T19:00:00Z"),
    fixture("pl-live", "live", "2026-10-19T17:00:00Z"),
    fixture("pl-yesterday", "finished", "2026-10-18T15:30:00Z"),
  ];
  assert.deepEqual(orderFixtures(items).map(item => item.match.id), ["pl-live", "laliga-monday", "ucl-tuesday", "bundesliga-friday", "pl-yesterday", "wc-june"]);
  assert.equal(items[0].match.id, "wc-june");
});

test("finished-only views put the latest results first without changing scores or statuses", () => {
  const older = fixture("older", "finished", "2026-10-01T19:00:00Z");
  const latest = fixture("latest", "finished", "2026-10-18T19:00:00Z");
  const result = orderFixtures([older, latest]);
  assert.deepEqual(result, [latest, older]);
  assert.equal(result[0], latest);
});
