const fs=require('node:fs');
const file='apps/api/README.md'; let s=fs.readFileSync(file,'utf8');
s=s.replace('The API syncs current seasons at **02:00 UTC (07:30 IST)** daily.', 'The API syncs current-season fixtures and official standings **hourly, at five minutes past the hour (UTC)**.');
const start=s.indexOf('### Production activation');
if(start<0)throw Error('Missing operations section');
s=s.slice(0,start)+`### Automatic provider synchronization

The normal data path is football-data.org -> Nest jobs -> PostgreSQL -> Nest read endpoints -> Next.js. Reading from the database is intentional; it holds the latest validated provider responses. Provider credentials stay in Nest. The frontend does not import fixture or table samples.

With \`FOOTBALL_SCHEDULER=process\` (the Render default), the running backend:

- Imports all four club schedules plus the 2026 World Cup schedule, refreshes their official standings, and rebuilds the catalog hourly at minute 05 UTC.
- Refreshes active/recently due fixtures and their official standings every five minutes. Scheduled games within the previous 48 hours are included to recover missed full-time updates.
- Starts a background catch-up import after boot when schedules have not succeeded within an hour. A 15-minute startup retry interval prevents restart loops exhausting the provider quota.

These jobs also run in production. Database advisory locks prevent duplicate execution across instances. The shared provider quota applies to every request. Schedule imports upsert new fixtures and corrections without deleting history; a bad provider response never replaces a good table. Partial failures are recorded per competition in \`football_jobs.result\`, with \`lastError\`; successful competitions remain updated. Both World Cup standings endpoints use the same persisted official response. They no longer calculate a substitute from JSON or saved results.

Run \`pnpm --filter api football:sync\` for an immediate complete schedule-and-table sync, or \`pnpm --filter api football:scores\` for active fixtures and tables. Inspect protected \`GET /football/admin/status\` for last success, partial failures, configured scheduler and cadence.

A process scheduler needs a running API. Render free services can sleep. For unattended execution while the app sleeps, use the optional Supabase scheduler:

1. Deploy Nest and the existing migrations; configure \`FOOTBALL_SCHEDULER=supabase\`, \`FOOTBALL_SCHEDULER_SECRET\`, and the frontend backend URL. This disables in-process polling.
2. Create Vault secrets \`football_api_url\` (confirmed HTTPS backend URL) and \`football_scheduler_secret\` matching the backend credential. Apply \`src/football/supabase-cron.sql\`; jobs are initially disabled.
3. Verify protected job endpoints, then activate only \`football-scores\` and \`football-schedules\`. Their cadences match the process scheduler. Do not enable both scheduler modes.
4. Check \`net._http_response\` for transport failures and \`football_jobs\` for outcomes. Free-plan provider delays and cold starts still apply.

Data synchronization never requires push activation. Keep \`FOOTBALL_PUSH_ENABLED=false\` and reminder cron disabled unless notification delivery has separately been configured and tested. Device delivery remains opt-in with retries, reschedule cancellation and invalid-token cleanup.

Missing provider statistics, lineups and media remain unavailable rather than invented. Historical archives remain the existing supplied project records.
`.replaceAll('\`','`');
fs.writeFileSync(file,s);
