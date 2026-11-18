// Read-only architecture evidence. No provider calls, writes to the database, or Nest bootstrap.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '../..');
const apiRequire = createRequire(path.join(root, 'apps/api/package.json'));
const dotenv = apiRequire('dotenv');
const { Client } = apiRequire('pg');
const local = dotenv.parse(fs.readFileSync(path.join(root, 'apps/api/.env')));
const configured = (key) => Boolean(process.env[key] || local[key]);

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || local.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    statement_timeout: 15000,
  });
  try {
    await client.connect();
    await client.query('BEGIN TRANSACTION READ ONLY');
    const tables = await client.query(`SELECT table_name, column_name, data_type
      FROM information_schema.columns WHERE table_schema='public'
      AND (table_name IN ('matches','tournament_fixtures','tournament_resource_cache','football_catalog')
        OR table_name ILIKE '%provider%' OR table_name ILIKE '%mapping%')
      ORDER BY table_name, ordinal_position`);
    const seasons = await client.query(`SELECT "competitionId", season, count(*)::int AS fixtures,
      count(*) FILTER (WHERE status='FINISHED')::int AS completed,
      count(*) FILTER (WHERE status IN ('IN_PLAY','PAUSED'))::int AS live
      FROM tournament_fixtures GROUP BY "competitionId",season ORDER BY "competitionId",season DESC`);
    const candidates = await client.query(`SELECT DISTINCT ON ("competitionId") id,
      "competitionId",season,kickoff,status,payload->'homeTeam' AS "homeTeam",
      payload->'awayTeam' AS "awayTeam",score FROM tournament_fixtures
      WHERE "competitionId" IN ('la-liga','premier-league') AND status='FINISHED'
      ORDER BY "competitionId", (id=564746) DESC,kickoff DESC`);
    const providerIds = await client.query(`SELECT DISTINCT jsonb_object_keys(payload->'providerIds') AS provider
      FROM football_catalog WHERE jsonb_typeof(payload->'providerIds')='object' ORDER BY provider`);
    await client.query('ROLLBACK');
    const report = {
      inspectedAt: new Date().toISOString(),
      databaseAccess: 'read-only transaction; no Nest bootstrap',
      apiFootballConfigured: configured('API_FOOTBALL_API_KEY') || configured('APISPORTS_API_KEY') || configured('RAPIDAPI_KEY'),
      apiFootballCallsConsumed: 0,
      seasons: seasons.rows,
      completedPocCandidates: candidates.rows,
      catalogProviderKeys: providerIds.rows.map(row => row.provider),
      columns: tables.rows,
    };
    fs.writeFileSync(path.join(__dirname, 'database-audit.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({
      report: 'output/api-football-poc/database-audit.json',
      configured: report.apiFootballConfigured,
      seasons: report.seasons,
      candidates: report.completedPocCandidates.map(({id,competitionId,season,kickoff,homeTeam,awayTeam}) => ({id,competitionId,season,kickoff,home:homeTeam.name,away:awayTeam.name})),
      providerCalls: 0,
    }, null, 2));
  } finally {
    await client.end();
  }
}
main().catch(error => {
  // Never print connection errors, URLs, environment values or authentication headers.
  console.error('Read-only database inspection failed (' + (error.code || 'unknown') + ').');
  process.exitCode = 1;
});
