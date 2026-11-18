<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Football news

`NEWS_API_URL` and `NEWS_API_TOKEN` stay in the backend environment. News uses the
configured Currents search API with separate English sports/news queries for
World Cup, Premier League, La Liga, Champions League, and Bundesliga. See the
[provider search documentation](https://currentsapi.services/en/docs/search).

- `GET /news` combines the competition feeds, sorts newest first, deduplicates
  publisher URLs, and reports unavailable competitions in `errors`.
- `GET /news/competitions/:competitionId` returns one competition's feed. The
  supported IDs match the tournament slugs, plus `world-cup`.
- The existing `GET /news/:keywords` search route remains available.

Responses use `{ news, freshness: { fetchedAt, stale } }`. Feeds share a one-hour
PostgreSQL cache across visits and backend instances. Refreshes are deduplicated
with transaction advisory locks. Failed refreshes preserve saved stories for up
to 24 hours and mark them stale; missing feeds return 503 rather than mock news.
An empty provider result is a valid empty feed. Provider rate-limit responses
trigger a cooldown. No additional database table or scheduled job is needed.

Home, newsroom, and all competition pages consume these backend feeds. Cards
show headline previews, publisher attribution, dates, and links to the original
articles; full article text is not synthesized from the preview. Provider news
images use a local fallback if missing or unavailable.

Run `pnpm --filter api exec jest --runInBand src/news` and, from `apps/web`,
`node --test tests/news.test.mjs` to validate the integration.

## Tournament data

Configure `DATABASE_URL` and `FOOTBALL_DATA_API_KEY` only on the backend.
`FOOTBALL_DATA_REQUESTS_PER_MINUTE` defaults to `8`; set it within your provider
subscription's limit. All football-data.org requests, including existing World
Cup requests, share a PostgreSQL-backed budget and rate-limit cooldown.

From the repository root, import current seasons with:

```sh
pnpm --filter api tournaments:sync
pnpm --filter api tournaments:sync --competition premier-league --season 2026
```

The optional competition is `premier-league`, `la-liga`, `ucl`, `bundesliga`, or
`all`. Season is the starting year. The command creates the three additive
`tournament_*` tables using the existing TypeORM synchronization convention,
prints per-competition fixture counts, and exits unsuccessfully if any import
fails. It does not boot Firebase or start application cron jobs. Existing World
Cup and historical tables are untouched.

The API syncs current-season fixtures and official standings **hourly, at five minutes past the hour (UTC)**. Dates, newly
announced knockout fixtures, and scores are upserted atomically per competition.
Previous seasons and fixtures absent from later responses are retained. Syncs
and cache refreshes use PostgreSQL transaction advisory locks, including with
transaction-mode connection poolers. Failed imports preserve the last successful
data and `lastSyncedAt`. Logs report counts and failures without provider keys.

Public routes:

```text
GET /tournaments
GET /tournaments/:id
GET /tournaments/:id/teams
GET /tournaments/:id/matches
GET /tournaments/:id/standings
GET /tournaments/:id/scorers
GET /tournaments/matches/:matchId
```

Competition routes accept `?season=2026`. Omitting it selects the latest imported
season. Metadata, teams, and fixture reads never import missing data or contact
the provider. Unimported seasons return 503; unsupported competitions and unknown
match IDs return 404; malformed season queries return 400. Standings/scorers
cache for five minutes. Details cache for 60 seconds and update the saved fixture.
Cached provider responses include `freshness: { fetchedAt, stale }`; expired data
is retained and served with `stale: true` when refresh fails. Without saved data,
provider errors return a controlled error. Null scores and unannounced teams
remain unknown rather than being fabricated.

Rollout: deploy the backend, run the import, inspect `/tournaments` and each
`/matches` route for counts and timestamps, then deploy the frontend with its
backend URL. Remove `FOOTBALL_DATA_API_KEY` from the frontend hosting environment.
The Render blueprint declares the provider key as a backend secret.

Cron requires the API process to be running. The existing Render free service
can sleep; for execution at the scheduled time, run the import command from an
external daily scheduler with the same backend environment, or use an always-on
API instance. Database locks coordinate external imports with application cron.

Focused validation:

```sh
pnpm --filter api exec jest --runInBand src/tournaments src/football-data src/matches/matches.service.spec.ts src/points-table/points-table.service.spec.ts
pnpm --filter api check-types
```

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Unified football data and operations

`/football/snapshot` is a database-only read model over club fixtures, stored World Cup matches, and the catalog. Shared DTOs live in `packages/football-contracts/index.d.ts`. Missing sports statistics use null; unsupported sections return availability metadata. No production frontend loader imports sample sports data.

Apply the additive schema before deploying code, then backfill existing payloads and archives:

```sh
pnpm --filter api football:migrate
pnpm --filter api football:backfill
```

Both commands are idempotent. Existing fixture/history tables are preserved. The new catalog, aliases, competition/season memberships, archives, devices, deliveries and job status tables have RLS enabled without public policies. Only the Nest backend database role accesses them. Backfill also runs after schedule imports. Exact provider references and unique verified aliases resolve profiles; unknown aliases and fictional fixtures return 404.

Public endpoints:

- `GET /football/competitions`, `/competitions/:id/seasons`, `/competitions/:id/standings`, `/competitions/:id/scorers`, `/competitions/:id/bracket`.
- `GET /football/snapshot` and `/matches` accept `competition` and starting-year `season`. Unimported seasons return an explicit per-competition unavailable state and never initiate imports.
- `GET /football/matches/:id` refreshes stored details through the shared client with a 60-second cache. Saved details remain available with stale metadata on failure. Database-only fixture views never request individual details, standings or scorers.
- `GET /football/teams`, `/players`, `/stadiums` accept `competition`, `season`, `q`, `page` (starting at 1), `pageSize` (1?100). `/:id` resolves profiles/aliases. SportsDB enrichment only uses verified IDs and caches results for 24 hours; no fuzzy person matching.
- `GET /football/search?q=...` searches real catalogs, saved fixtures and cached news, with the same filters and pagination. `GET /football/news`, `/articles/:id`, `/history`, `/history/:year` serve cached publisher previews and imported archives from PostgreSQL.
- `POST /football/devices` issues a random anonymous ownership secret. `PATCH /football/devices/:id` requires `x-device-secret`. Secrets are hashed at rest; token ownership cannot be overwritten by another registration.

The admin page has competition imports, backfill, provider configuration and last-success/failure status. All admin mutations require `ADMIN_SECRET`; an unset secret denies administrative access. `GET /football/admin/status` also requires the secret. Provider credentials, push tokens and ownership secrets are not returned by status endpoints.

### Automatic provider synchronization

`GET /football/matches/:id` adds nullable `score.fullTime`, `score.halfTime`, `score.winner`, `score.duration`, structured `referees`, and `venue` metadata while retaining `match.homeScore`, `match.awayScore`, `match.referee` and the existing `stadium` object. `match.attendance` is a number or explicit null. Score pairs preserve each unknown side as null; result winners and played minutes are never inferred. Venue placeholders are rejected, and known stored match venues identify `source: "database"`; a club's home ground is never substituted for an unknown match venue. Match-level availability includes `available`, `pending`, `unavailable`, and `not_applicable` (cancelled fixtures without applicable play data). Existing listing responses and JSONB storage are unchanged. Duration values describe provider result categories, such as regular time or extra time, rather than elapsed minutes.

Match news uses `GET /football/matches/:id/news`. It searches Currents for both confirmed opponents (including common name variants) in a window around the fixture date, with a maximum four-day span. Future fixtures search up to the current time. Results require match context; old meetings, unrelated opponents and transfer-only headlines are excluded. Finished fixtures rank post-match reports before previews. Results are persisted per fixture, kickoff and match phase for ten minutes; empty coverage retries after one minute. Provider failures retain saved results with stale metadata. Match-news article links resolve through `/football/articles/:id`, using stored publisher previews and source URLs. No fixture search is seeded with hardcoded headlines.

The normal data path is football-data.org -> Nest jobs -> PostgreSQL -> Nest read endpoints -> Next.js. Reading from the database is intentional; it holds the latest validated provider responses. Provider credentials stay in Nest. The frontend does not import fixture or table samples.

With `FOOTBALL_SCHEDULER=process` (the Render default), the running backend:

- Imports all four club schedules plus the 2026 World Cup schedule, refreshes their official standings, and rebuilds the catalog hourly at minute 05 UTC.
- Refreshes active/recently due fixtures and their official standings every five minutes. Scheduled games within the previous 48 hours are included to recover missed full-time updates.
- Starts a background catch-up import after boot when schedules have not succeeded within an hour. A 15-minute startup retry interval prevents restart loops exhausting the provider quota.

These jobs also run in production. Database advisory locks prevent duplicate execution across instances. The shared provider quota applies to every request. Schedule imports upsert new fixtures and corrections without deleting history; a bad provider response never replaces a good table. Partial failures are recorded per competition in `football_jobs.result`, with `lastError`; successful competitions remain updated. Both World Cup standings endpoints use the same persisted official response. They no longer calculate a substitute from JSON or saved results.

Run `pnpm --filter api football:sync` for an immediate complete schedule-and-table sync, or `pnpm --filter api football:scores` for active fixtures and tables. Inspect protected `GET /football/admin/status` for last success, partial failures, configured scheduler and cadence.

A process scheduler needs a running API. Render free services can sleep. For unattended execution while the app sleeps, use the optional Supabase scheduler:

1. Deploy Nest and the existing migrations; configure `FOOTBALL_SCHEDULER=supabase`, `FOOTBALL_SCHEDULER_SECRET`, and the frontend backend URL. This disables in-process polling.
2. Create Vault secrets `football_api_url` (confirmed HTTPS backend URL) and `football_scheduler_secret` matching the backend credential. Apply `src/football/supabase-cron.sql`; jobs are initially disabled.
3. Verify protected job endpoints, then activate only `football-scores` and `football-schedules`. Their cadences match the process scheduler. Do not enable both scheduler modes.
4. Check `net._http_response` for transport failures and `football_jobs` for outcomes. Free-plan provider delays and cold starts still apply.

Data synchronization never requires push activation. Keep `FOOTBALL_PUSH_ENABLED=false` and reminder cron disabled unless notification delivery has separately been configured and tested. Device delivery remains opt-in with retries, reschedule cancellation and invalid-token cleanup.

Missing provider statistics, lineups and media remain unavailable rather than invented. Historical archives remain the existing supplied project records.
