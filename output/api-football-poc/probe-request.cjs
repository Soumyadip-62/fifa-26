// Manual server-side PoC requests only. Not imported by Nest or the frontend.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const apiRequire = createRequire(path.resolve(__dirname, '../../apps/api/package.json'));
const local = apiRequire('dotenv').parse(fs.readFileSync(path.resolve(__dirname, '../../apps/api/.env')));
const env = key => process.env[key] || local[key];
const key = env('API_FOOTBALL_API_KEY');
const resource = process.argv[2];
if (!key || !/^\/(?:status|leagues|fixtures(?:\/(?:events|statistics|lineups|players))?)(?:\?|$)/.test(resource || '')) {
  console.error('Configure API_FOOTBALL_API_KEY and supply an allowed PoC resource path.');
  process.exit(1);
}
const rapid = env('API_FOOTBALL_AUTH_MODE') === 'rapidapi';
const host = rapid ? 'api-football-v1.p.rapidapi.com' : 'v3.football.api-sports.io';
const base = rapid ? `https://${host}/v3` : `https://${host}`;
const ledgerFile = path.join(__dirname, 'request-ledger.json');
const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : [];
const fingerprint = crypto.createHash('sha256').update(host + resource).digest('hex').slice(0, 14);
const responseFile = path.join(__dirname, `response-${fingerprint}.json`);
const redact = value => JSON.parse(JSON.stringify(value).split(key).join('[REDACTED]'));

async function main() {
  if (fs.existsSync(responseFile)) {
    console.log(JSON.stringify({ cached: true, file: responseFile, ...JSON.parse(fs.readFileSync(responseFile, 'utf8')).summary }));
    return;
  }
  if (ledger.length >= 30) throw new Error('PoC request ceiling reached.');
  const previous = ledger.at(-1);
  if (previous?.headers?.['x-ratelimit-requests-remaining'] === '0') throw new Error('Daily provider quota exhausted.');
  if (previous?.status === 429) throw new Error('Provider rate limited the PoC; no automatic retries.');
  const wait = previous ? Math.max(0, Date.parse(previous.at) + 6500 - Date.now()) : 0;
  if (wait) await new Promise(resolve => setTimeout(resolve, wait));
  const entry = { at: new Date().toISOString(), host, resource, attempted: true };
  ledger.push(entry);
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n');
  try {
    const response = await fetch(base + resource, {
      headers: rapid ? { 'x-rapidapi-key': key, 'x-rapidapi-host': host } : { 'x-apisports-key': key },
      signal: AbortSignal.timeout(20000),
      redirect: 'error',
    });
    entry.status = response.status;
    entry.headers = Object.fromEntries(['date', 'retry-after', 'x-ratelimit-requests-limit', 'x-ratelimit-requests-remaining', 'x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset'].map(name => [name, response.headers.get(name)]).filter(([, value]) => value !== null));
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { invalidJson: true }; }
    if (resource === '/status') body = { ...body, response: { subscription: body.response?.subscription, requests: body.response?.requests } };
    body = redact(body);
    const summary = { resource, status: response.status, errors: body.errors ?? body.message ?? null, results: body.results ?? null, headers: entry.headers,
      ...(resource === '/status' ? { account: body.response } : {}),
      structure: Array.isArray(body.response) ? body.response.slice(0, 3).map(row => ({keys: Object.keys(row), league: row.league, country: row.country, seasons: row.seasons?.map(s => ({year:s.year,coverage:s.coverage})),fixture:row.fixture,teams:row.teams})) : null };
    fs.writeFileSync(responseFile, JSON.stringify({ fetchedAt: new Date().toISOString(), summary, body }, null, 2) + '\n');
    entry.file = path.basename(responseFile);
    console.log(JSON.stringify({ cached: false, file: responseFile, ...summary }));
  } catch {
    entry.networkError = true;
    console.error('Provider request failed; no credentials or raw network errors logged.');
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n');
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
