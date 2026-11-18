const path = require('node:path');
const { createRequire } = require('node:module');
const apiRequire = createRequire(path.resolve('apps/api/package.json'));
apiRequire('dotenv').config({ path: 'apps/api/.env', quiet: true });
const { Client } = apiRequire('pg');

async function main() {
  const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    options: '-c default_transaction_read_only=on -c statement_timeout=10000',
  });
  await db.connect();
  try {
    await db.query('BEGIN READ ONLY');
    const time = await db.query('SELECT now() AS observed_at');
    const fixtures = await db.query(`
      SELECT "competitionId", season, count(*)::int AS fixtures,
        sum(octet_length(payload::text))::bigint AS stored_json_bytes,
        bool_or(status IN ('IN_PLAY','PAUSED','SUSPENDED') OR
          (kickoff BETWEEN now()-interval '48 hours' AND now()+interval '20 minutes'
           AND status IN ('SCHEDULED','TIMED'))) AS due_now
      FROM tournament_fixtures GROUP BY "competitionId",season
      ORDER BY "competitionId",season`);
    const tables = await db.query(`
      SELECT key, octet_length(payload::text) AS stored_json_bytes
      FROM tournament_resource_cache WHERE key LIKE '%:standings'
      ORDER BY key`);
    const worldCup = await db.query(`
      SELECT count(*)::int AS stored_matches,
        count(*) FILTER (WHERE "statusCode" IN ('IN_PLAY','PAUSED','SUSPENDED') OR
          ("timestampUtc"::timestamptz BETWEEN now()-interval '48 hours' AND now()+interval '20 minutes'
           AND status IN ('scheduled','upcoming')))::int AS due_now
      FROM matches`);
    const jobs = await db.query(`
      SELECT name,"lastStartedAt","lastSuccessAt","lastError",result
      FROM football_jobs WHERE name='scores'`);
    await db.query('ROLLBACK');
    console.log(JSON.stringify({
      configuredDatabaseOnly: true,
      observedAt: time.rows[0].observed_at,
      fixtures: fixtures.rows,
      standings: tables.rows,
      worldCup: worldCup.rows[0],
      lastScoreJob: jobs.rows[0],
    }, null, 2));
  } finally {
    await db.end();
  }
}
main().catch((error) => {
  console.error('Read-only cron measurement failed:', error.code || error.name);
  process.exitCode = 1;
});
