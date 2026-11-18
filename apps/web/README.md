This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

Premier League, La Liga, Champions League, and Bundesliga data comes from the
NestJS backend through `NEXT_PUBLIC_BACKEND_URL`. Do not configure a football
provider key in the web app. Schedule imports, provider credentials, throttling,
and persistent caches belong to `apps/api`.

Club fixtures on competition, home, live, matches, search, favourites, and profile
pages use the same saved schedules. Missing imports show competition errors;
mock club fixtures are not substituted. World Cup fixtures and unrelated static
profile, player, and stadium content retain their existing behavior.

Home, `/news`, and all five competition pages load current news from the backend.
Each competition has a separate feed; the home/newsroom feed combines and
deduplicates them. Provider credentials remain on the backend, with a shared
one-hour cache. News has independent loading, empty, error, and saved-data states.
Cards link to the original publisher and show source attribution. Run the news
service tests from `apps/web` with `node --test tests/news.test.mjs`.

The backend syncs schedules daily. Scores/statuses update when match details are
opened or during the daily sync; fixture lists do not poll the provider. Open
live detail pages refresh every minute through the backend's 60-second cache.
Standings and scorers use separate five-minute backend caches and are requested
only by sections that need them. Saved detail fallbacks show their timestamp.

Run the initial import before switching the deployed frontend to the new backend.
See [backend tournament setup](../api/README.md#tournament-data) for commands,
configuration, and deployment requirements.

Run the league normalization and service tests with
`node --test tests/premier-league.test.mjs` from `apps/web`.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


### Real football data and device preferences

All production sports loaders now call the Nest `/football` API, with publisher news fetched through Nest `/news`. The backend must have the additive schema and catalog/history backfill before deploying this frontend. Keep football provider secrets exclusively in the backend.

Favourites, saved matches, reminders and notification choices use one versioned device store. Existing named favourites migrate only through verified backend aliases. Browser permission is requested solely from an Enable notifications/admin test action. Set `NEXT_PUBLIC_FIREBASE_VAPID_KEY` at build time; anonymous backend updates use the issued device ownership credential. Login/cross-device synchronization is not included.

Fixture pages refresh while visible every 15 minutes; live match details use the short backend cache and refresh every minute. Imported seasons, nullable statistics, stale timestamps and unavailable sections are shown directly. News preview pages link to the original publisher and do not reproduce complete articles.

Verification: `node --test apps/web/tests/*.test.mjs`, `pnpm --filter web check-types`. Production scheduler/push activation is described in `apps/api/README.md`.
