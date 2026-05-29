# FRONTEND_TYPES.md

## Purpose

Use stable TypeScript types for frontend development before the backend is fully connected.

These types should represent what the UI needs, not necessarily the exact raw third-party API response.

## Match Types

```ts
export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'finished'
  | 'postponed'
  | 'cancelled';

export type MatchTeam = {
  id: string;
  name: string;
  logoUrl?: string;
  country?: string;
};

export type MatchScore = {
  home: number | null;
  away: number | null;
};

export type Match = {
  id: string;
  tournament: string;
  stage?: string;
  group?: string;
  date: string;
  venue?: string;
  city?: string;
  status: MatchStatus;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: MatchScore;
};
```

## Team Types

```ts
export type Team = {
  id: string;
  name: string;
  country: string;
  logoUrl?: string;
  group?: string;
  coach?: string;
  fifaRanking?: number;
};
```

## News Types

```ts
export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  source?: string;
  author?: string;
  publishedAt: string;
  tags?: string[];
};
```

## History Types

```ts
export type TournamentHistory = {
  id: string;
  year: number;
  host: string;
  winner: string;
  runnerUp?: string;
  thirdPlace?: string;
  finalScore?: string;
  summary?: string;
};
```

## Type Rules

- Do not use raw third-party API response types directly in UI components.
- Map backend or external responses into frontend-friendly types.
- Keep IDs as strings in the frontend.
- Use `null` for known empty values.
- Use optional fields only when the field may not exist.
