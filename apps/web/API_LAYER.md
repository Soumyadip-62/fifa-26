# API_LAYER.md

## Purpose

The frontend should not directly depend on third-party football APIs.

Use a frontend API layer so the UI can work with mock data now and real backend data later.

## Folder

```txt
src/lib/api/
```

Suggested files:

```txt
src/lib/api/matches.ts
src/lib/api/teams.ts
src/lib/api/news.ts
src/lib/api/history.ts
```

## Current Development Mode

If the backend is not ready, return mock data from the API layer.

Example:

```ts
import type { Match } from '@/types/match';
import { mockMatches } from '@/data/mock/matches';

export async function getMatches(): Promise<Match[]> {
  return mockMatches;
}
```

When backend is ready, replace the internals only:

```ts
import type { Match } from '@/types/match';

export async function getMatches(): Promise<Match[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch matches');
  }

  return res.json();
}
```

The components should not need to change when switching from mock data to backend data.

## API Function Rules

- API functions must be typed.
- API functions should throw clear errors.
- API functions should not expose raw response confusion to components.
- API functions should live outside UI components.
- API functions should be named clearly.

Examples:

```ts
getMatches()
getMatchById(matchId)
getTeams()
getTeamById(teamId)
getNewsArticles()
getNewsArticleBySlug(slug)
getTournamentHistory()
```

## Do Not Do This

Do not fetch directly inside deeply nested components:

```tsx
export function MatchCard() {
  useEffect(() => {
    fetch('https://external-football-api.com/...');
  }, []);
}
```

Do not expose API keys in frontend files.

Do not put football provider-specific logic inside components.
