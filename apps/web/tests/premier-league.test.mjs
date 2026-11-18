import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import process from "node:process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Transpile isolated TypeScript modules in memory; no generated repo files or
// additional test framework. The service's Next/React cache adapters are mocked.
const source = await readFile(
  new URL("../src/lib/api/premier-league-mappers.ts", import.meta.url),
  "utf8",
);
const moduleUrl = (code) =>
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const compile = (code) =>
  ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const mappersUrl = moduleUrl(compile(source));
const {
  mapCompetition,
  mapTeam,
  mapMatches,
  mapMatchDetails,
  mapStandings,
  mapScorers,
  withForm,
  selectFixtures,
  selectResults,
} = await import(mappersUrl);
const team = (id) => ({
  id,
  name: `Team ${id}`,
  shortName: null,
  tla: `T${id}`,
  crest: null,
});
const competition = {
  name: "Premier League",
  emblem: null,
  area: { name: "England" },
  currentSeason: {
    startDate: "2026-08-21",
    endDate: "2027-05-30",
    currentMatchday: 6,
  },
};
const match = (
  id,
  status,
  day,
  home = 1,
  away = 2,
  homeScore = null,
  awayScore = null,
) => ({
  id,
  status,
  utcDate: `2026-10-${String(day).padStart(2, "0")}T12:00:00Z`,
  homeTeam: team(home),
  awayTeam: team(away),
  matchday: 6,
  stage: "REGULAR_SEASON",
  score: { fullTime: { home: homeScore, away: awayScore } },
});

const detail = () => ({
  ...match(123, "IN_PLAY", 1, 1, 2, 0, 1),
  minute: 67,
  injuryTime: 2,
  competition: { code: "PL", name: "Premier League", emblem: null },
  season: competition.currentSeason,
  venue: "Test stadium",
  attendance: 0,
  homeTeam: {
    ...team(1),
    coach: { name: "Home coach" },
    formation: "4-3-3",
    lineup: [{ name: "Home keeper", shirtNumber: 1 }],
    bench: [{ name: "Home substitute", shirtNumber: 12 }],
  },
  awayTeam: team(2),
});

test("match details preserve live scores, coaches and published lineups without inventing missing data", () => {
  const data = mapMatchDetails(detail());
  assert.equal(data.match.status, "live");
  assert.equal(data.match.minute, "67+2'");
  assert.equal(data.match.homeScore, 0);
  assert.equal(data.match.attendance, 0);
  assert.equal(data.stadium.name, "Test stadium");
  assert.equal(data.stadium.capacity, undefined);
  assert.equal(data.homeTeam.coach, "Home coach");
  assert.equal(data.awayTeam.coach, undefined);
  assert.equal(data.lineups.length, 1);
  assert.deepEqual(data.lineups[0].starters, ["1. Home keeper"]);
  assert.deepEqual(data.lineups[0].substitutes, ["12. Home substitute"]);
  assert.deepEqual(data.stats, []);
  assert.equal(
    mapMatchDetails({ ...detail(), status: "PAUSED" }).match.minute,
    "Half-time",
  );
  const unavailable = mapMatchDetails({
    ...detail(),
    venue: null,
    homeTeam: team(1),
  });
  assert.equal(unavailable.stadium.name, "Venue to be confirmed");
  assert.deepEqual(unavailable.lineups, []);
});

test("competition metadata and missing team crests remain truthful", () => {
  assert.equal(mapCompetition(competition).season, "2026/27");
  assert.equal(mapCompetition(competition).currentMatchday, 6);
  assert.equal(mapTeam(team(1)).logoUrl, "");
  assert.equal(mapTeam(team(1)).shortName, "T1");
  assert.throws(() =>
    mapCompetition({
      ...competition,
      currentSeason: { ...competition.currentSeason, startDate: "bad-date" },
    }),
  );
});

test("match statuses and absent scores are preserved", () => {
  const inputs = [
    "SCHEDULED",
    "TIMED",
    "IN_PLAY",
    "PAUSED",
    "FINISHED",
    "POSTPONED",
    "SUSPENDED",
    "CANCELLED",
    "AWARDED",
    "NEW_STATUS",
  ];
  const output = mapMatches(
    inputs.map((status, index) => match(index, status, 1)),
    "2026/27",
  );
  assert.deepEqual(
    output.map((item) => item.status),
    [
      "upcoming",
      "upcoming",
      "live",
      "live",
      "finished",
      "postponed",
      "suspended",
      "cancelled",
      "awarded",
      "unknown",
    ],
  );
  assert.equal(output[0].homeScore, null);
  assert.equal(output[0].homeTeamId, output[0].homeTeam.id);
});

test("fixtures exclude past dates and exceptional statuses; results sort newest first", () => {
  const raw = [
    match(1, "TIMED", 7),
    match(2, "POSTPONED", 2),
    match(3, "FINISHED", 5, 1, 2, 0, 0),
    match(4, "TIMED", 3),
    match(5, "TIMED", 2),
    match(6, "TIMED", 1),
    match(7, "TIMED", 4),
    match(8, "FINISHED", 1, 1, 2, 1, 0),
  ];
  const mapped = mapMatches(raw, "2026/27");
  assert.deepEqual(
    selectFixtures(mapped, Date.parse("2026-10-02T00:00:00Z")).map(
      (item) => item.id,
    ),
    ["5", "4", "7"],
  );
  assert.deepEqual(
    selectResults(mapped).map((item) => item.id),
    ["3", "8"],
  );
  assert.deepEqual(selectResults([]), []);
});

test("form uses the last five completed PL games, from each team's perspective", () => {
  const games = [
    match(0, "FINISHED", 1, 1, 2, 9, 0),
    match(1, "FINISHED", 2, 1, 2, 1, 0),
    match(2, "FINISHED", 3, 2, 1, 1, 0),
    match(3, "FINISHED", 4, 1, 2, 0, 0),
    match(4, "FINISHED", 5, 2, 1, 0, 2),
    match(5, "FINISHED", 6, 1, 2, 0, 1),
    match(6, "CANCELLED", 7),
    match(7, "FINISHED", 8),
  ];
  const teams = [mapTeam(team(1)), mapTeam(team(2)), mapTeam(team(3))];
  const formed = withForm(teams, mapMatches(games, "2026/27"));
  assert.deepEqual(formed[0].form, ["W", "L", "D", "W", "L"]);
  assert.deepEqual(formed[1].form, ["L", "W", "D", "L", "W"]);
  assert.deepEqual(formed[2].form, []);
  assert.deepEqual(teams[0].form, []);
});

test("standings join string team IDs and scorers retain nullable statistics", () => {
  const rows = [2, 1].map((position) => ({
    position,
    team: team(position),
    playedGames: 6,
    won: 4,
    draw: 1,
    lost: 1,
    points: 13,
    goalsFor: 12,
    goalsAgainst: 5,
  }));
  assert.deepEqual(
    mapStandings(rows).map((row) => row.position),
    [1, 2],
  );
  assert.equal(mapStandings(rows)[0].teamId, "1");
  const scorers = mapScorers(
    [1, 6, 3, 5, 2, 4].map((goals) => ({
      player: { id: goals, name: `Scorer ${goals}` },
      team: team(1),
      goals,
      assists: null,
      playedMatches: null,
    })),
  );
  assert.deepEqual(
    scorers.map((row) => row.goals),
    [6, 5, 4, 3, 2],
  );
  assert.equal(scorers[0].assists, null);
  assert.equal(scorers[0].playedMatches, null);
  assert.deepEqual(mapScorers([]), []);
});

const serviceSource = await readFile(
  new URL("../src/lib/api/premier-league.ts", import.meta.url),
  "utf8",
);
async function loadService() {
  const adapters = `
    const cache = (fn) => { const entries = new Map(); return (...args) => {
      const key = JSON.stringify(args); if (!entries.has(key)) entries.set(key, fn(...args)); return entries.get(key);
    }; };
    const apiUrl = (path) => { const base = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!base) throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
      return new URL(path, base).toString(); };
  `;
  const code = compile(serviceSource)
    .replace('import "server-only";', "")
    .replace('import { cache } from "react";', "")
    .replace('import { apiUrl } from "./config";', "")
    .replace('"./premier-league-mappers"', JSON.stringify(mappersUrl));
  return import(moduleUrl(adapters + code + `\n// instance ${Math.random()}`));
}

test("individual match requests use the backend without credentials and handle unknown matches", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.NEXT_PUBLIC_BACKEND_URL;
  process.env.NEXT_PUBLIC_BACKEND_URL = "http://backend.test";
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers, undefined);
    assert.ok(url.startsWith("http://backend.test/tournaments/"));
    assert.equal(options.headers, undefined);
    if (url.endsWith("/404")) return { ok: false, status: 404 };
    if (url.endsWith("/429")) return { ok: false, status: 429 };
    return { ok: true, json: async () => detail() };
  };
  try {
    const service = await loadService();
    assert.equal(await service.getPremierLeagueMatch("bad-id"), null);
    assert.equal(calls, 0);
    assert.equal(
      (await service.getPremierLeagueMatch("123")).match.homeScore,
      0,
    );
    assert.equal(await service.getPremierLeagueMatch("404"), null);
    await assert.rejects(
      service.getPremierLeagueMatch("429"),
      /temporarily busy/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
    else process.env.NEXT_PUBLIC_BACKEND_URL = originalToken;
  }
});

test("server service pins one season, shares requests and isolates scorer failures", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.NEXT_PUBLIC_BACKEND_URL;
  process.env.NEXT_PUBLIC_BACKEND_URL = "http://backend.test";
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push(url);
    assert.equal(options.headers, undefined);
    assert.equal(options.cache, "no-store");
    if (url.includes("/scorers?")) return { ok: false, status: 403 };
    const body = url.endsWith("/premier-league")
      ? competition
      : url.includes("/teams?")
        ? { teams: [team(1), team(2)] }
        : url.includes("/matches?")
          ? { matches: [match(1, "TIMED", 2)] }
          : { standings: [{ type: "TOTAL", table: [] }] };
    return { ok: true, json: async () => body };
  };
  try {
    const service = await loadService();
    const [first, second] = await Promise.all([
      service.getPremierLeagueData(),
      service.getPremierLeagueData(),
    ]);
    assert.equal(first, second);
    const sections = await Promise.all([
      first.teams,
      first.matches,
      first.standings,
      first.scorers,
    ]);
    assert.equal(calls.length, 5);
    assert.ok(calls.slice(1).every((url) => url.includes("season=2026")));
    assert.equal(sections[0].data.length, 2);
    assert.equal(sections[1].data.length, 1);
    assert.equal(sections[2].error, null);
    assert.match(sections[3].error, /temporarily unavailable/);
    assert.ok(calls.every((url) => url.startsWith("http://backend.test/tournaments/")));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
    else process.env.NEXT_PUBLIC_BACKEND_URL = originalToken;
  }
});

test("missing credentials, auth failures, throttling and network errors have safe messages", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.NEXT_PUBLIC_BACKEND_URL;
  try {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    let service = await loadService();
    await assert.rejects(service.getPremierLeagueData(), /not configured/);
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://backend.test";
    for (const status of [401, 403, 429, 500]) {
      globalThis.fetch = async () => ({ ok: false, status });
      service = await loadService();
      await assert.rejects(
        service.getPremierLeagueData(),
        status === 429
          ? /temporarily busy/
          : status === 500
            ? /temporarily unavailable/
            : /temporarily unavailable/,
      );
    }
    globalThis.fetch = async () => {
      throw new Error("sensitive transport details");
    };
    service = await loadService();
    try {
      await service.getPremierLeagueData();
      assert.fail("expected rejection");
    } catch (error) {
      assert.equal(
        service.footballDataError(error),
        "Football data is temporarily unavailable.",
      );
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
    else process.env.NEXT_PUBLIC_BACKEND_URL = originalToken;
  }
});

test("fixture-only requests never fetch teams, statistics, scorers, or details", async () => {
  const originalFetch = globalThis.fetch;
  const originalBase = process.env.NEXT_PUBLIC_BACKEND_URL;
  process.env.NEXT_PUBLIC_BACKEND_URL = "http://backend.test";
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    assert.ok(url.endsWith("/premier-league") || url.endsWith("/matches?season=2026"));
    return { ok: true, json: async () => url.endsWith("/premier-league") ? competition : { matches: [match(1, "TIMED", 1)] } };
  };
  try {
    const service = await loadService();
    const [first, second] = await Promise.all([service.getLeagueFixtures("premier-league"), service.getLeagueFixtures("premier-league")]);
    assert.equal(first, second);
    assert.equal(first.matches.length, 1);
    assert.equal(calls.length, 2);
    const pageData = await service.getPremierLeagueData();
    await pageData.matches;
    assert.equal(calls.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
    else process.env.NEXT_PUBLIC_BACKEND_URL = originalBase;
  }
});

test("unannounced knockout teams retain separate placeholder identities", () => {
  const [fixture] = mapMatches([{ ...match(1, "SCHEDULED", 1), homeTeam: { ...team(null), name: null, shortName: null, tla: null }, awayTeam: { ...team(null), name: null, shortName: null, tla: null } }], "2026/27", "ucl");
  assert.equal(fixture.homeTeam.name, "Team to be confirmed");
  assert.notEqual(fixture.homeTeamId, fixture.awayTeamId);
  assert.equal(fixture.homeTeamId, fixture.homeTeam.id);
});

test("La Liga mappings preserve league identity and Spanish metadata", () => {
  const league = mapCompetition(
    { ...competition, name: "Primera Division", area: { name: "Spain" } },
    "la-liga",
  );
  assert.equal(league.id, "la-liga");
  assert.equal(league.shortName, "La Liga");
  const [fixture] = mapMatches(
    [match(456, "FINISHED", 1, 1, 2, 2, 0)],
    league.season,
    "la-liga",
  );
  assert.equal(fixture.competitionId, "la-liga");
  assert.equal(fixture.homeTeam.country, "Spain");
  const details = mapMatchDetails({
    ...detail(),
    competition: { code: "PD", name: "Primera Division", emblem: null },
  });
  assert.equal(details.match.competitionId, "la-liga");
  assert.equal(details.competition.region, "Spain");
  assert.equal(details.homeTeam.country, "Spain");
  assert.equal(
    mapStandings([{ position: 1, team: team(1) }], "la-liga")[0].competitionId,
    "la-liga",
  );
});

test("UCL mappings preserve competition identity and individual club countries", () => {
  const league = mapCompetition(
    { ...competition, name: "UEFA Champions League", area: { name: "Europe" } },
    "ucl",
  );
  assert.equal(league.id, "ucl");
  assert.equal(league.shortName, "UCL");
  assert.equal(league.format, "League phase + knockout");
  const raw = {
    ...match(789, "FINISHED", 1, 1, 2, 2, 0),
    stage: "LEAGUE_STAGE",
    homeTeam: { ...team(1), area: { name: "Spain" } },
    awayTeam: { ...team(2), area: { name: "Germany" } },
  };
  const [fixture] = mapMatches([raw], league.season, "ucl");
  assert.equal(fixture.competitionId, "ucl");
  assert.equal(fixture.homeTeam.country, "Spain");
  assert.equal(fixture.awayTeam.country, "Germany");
  assert.equal(fixture.stage, "LEAGUE_STAGE");
  const details = mapMatchDetails({
    ...detail(),
    ...raw,
    competition: { code: "CL", name: league.name, emblem: null },
  });
  assert.equal(details.match.competitionId, "ucl");
  assert.equal(details.competition.region, "Europe");
  assert.equal(details.homeTeam.country, "Spain");
  assert.equal(details.awayTeam.country, "Germany");
  assert.equal(
    mapStandings([{ position: 1, team: team(1) }], "ucl")[0].competitionId,
    "ucl",
  );
});

test("UCL service requests CL endpoints and supports numeric match details", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.NEXT_PUBLIC_BACKEND_URL;
  process.env.NEXT_PUBLIC_BACKEND_URL = "http://backend.test";
  const calls = [];
  const metadata = {
    ...competition,
    code: "CL",
    name: "UEFA Champions League",
    area: { name: "Europe" },
  };
  globalThis.fetch = async (url) => {
    calls.push(url);
    const body = url.endsWith("/ucl")
      ? metadata
      : url.endsWith("/matches/789")
        ? { ...detail(), competition: metadata }
        : url.includes("/teams?")
          ? { teams: [team(1), team(2)] }
          : url.includes("/matches?")
            ? { matches: [match(789, "TIMED", 2)] }
            : url.includes("/scorers?")
              ? { scorers: [] }
              : { standings: [{ type: "TOTAL", table: [] }] };
    return { ok: true, json: async () => body };
  };
  try {
    const service = await loadService();
    const data = await service.getPremierLeagueData("ucl");
    const sections = await Promise.all([
      data.teams,
      data.matches,
      data.standings,
      data.scorers,
    ]);
    assert.equal(data.competition.id, "ucl");
    assert.ok(sections.every((section) => section.error === null));
    assert.equal(sections[1].data[0].competitionId, "ucl");
    assert.equal(calls.length, 5);
    assert.ok(calls.every((url) => url.includes("/tournaments/ucl")));
    assert.ok(calls.slice(1).every((url) => url.includes("season=2026")));
    const details = await service.getPremierLeagueMatch("789");
    assert.equal(details.competition.id, "ucl");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
    else process.env.NEXT_PUBLIC_BACKEND_URL = originalToken;
  }
});

test("Bundesliga mappings preserve German competition and team metadata", () => {
  const league = mapCompetition(
    { ...competition, name: "Bundesliga", area: { name: "Germany" } },
    "bundesliga",
  );
  assert.equal(league.id, "bundesliga");
  assert.equal(league.shortName, "Bundesliga");
  assert.equal(league.region, "Germany");
  assert.equal(league.accent, "amber");
  assert.equal(league.hasBracket, false);
  const [fixture] = mapMatches(
    [match(456, "FINISHED", 1, 1, 2, 2, 0)],
    league.season,
    "bundesliga",
  );
  assert.equal(fixture.competitionId, "bundesliga");
  assert.equal(fixture.homeTeam.country, "Germany");
  assert.equal(fixture.awayTeam.country, "Germany");
  const details = mapMatchDetails({
    ...detail(),
    competition: { code: "BL1", name: "Bundesliga", emblem: null },
  });
  assert.equal(details.match.competitionId, "bundesliga");
  assert.equal(details.competition.region, "Germany");
  assert.equal(details.homeTeam.country, "Germany");
  assert.equal(details.awayTeam.country, "Germany");
  assert.equal(
    mapStandings([{ position: 1, team: team(1) }], "bundesliga")[0]
      .competitionId,
    "bundesliga",
  );
});

test("Bundesliga service requests BL1 endpoints and supports numeric match details", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.NEXT_PUBLIC_BACKEND_URL;
  process.env.NEXT_PUBLIC_BACKEND_URL = "http://backend.test";
  const calls = [];
  const metadata = {
    ...competition,
    code: "BL1",
    name: "Bundesliga",
    area: { name: "Germany" },
  };
  globalThis.fetch = async (url) => {
    calls.push(url);
    const body = url.endsWith("/bundesliga")
      ? metadata
      : url.endsWith("/matches/789")
        ? { ...detail(), competition: metadata }
        : url.includes("/teams?")
          ? { teams: [team(1), team(2)] }
          : url.includes("/matches?")
            ? { matches: [match(789, "TIMED", 2)] }
            : url.includes("/scorers?")
              ? { scorers: [] }
              : { standings: [{ type: "TOTAL", table: [] }] };
    return { ok: true, json: async () => body };
  };
  try {
    const service = await loadService();
    const data = await service.getPremierLeagueData("bundesliga");
    const sections = await Promise.all([
      data.teams,
      data.matches,
      data.standings,
      data.scorers,
    ]);
    assert.equal(data.competition.id, "bundesliga");
    assert.ok(sections.every((section) => section.error === null));
    assert.equal(sections[1].data[0].competitionId, "bundesliga");
    assert.equal(calls.length, 5);
    assert.ok(calls.every((url) => url.includes("/tournaments/bundesliga")));
    assert.ok(calls.slice(1).every((url) => url.includes("season=2026")));
    const details = await service.getPremierLeagueMatch("789");
    assert.equal(details.competition.id, "bundesliga");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
    else process.env.NEXT_PUBLIC_BACKEND_URL = originalToken;
  }
});
