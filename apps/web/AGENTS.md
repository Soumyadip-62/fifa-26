# AGENTS.md — Frontend Instructions

## Project Context

This is the frontend application for a FIFA 26 / football stats platform.

The frontend should focus on:

- Match schedules
- Match details
- Team pages
- Player/stat pages later
- News/blog listing
- Blog details
- Historical football data
- Admin-facing frontend screens later

The backend/API will be handled separately. For now, build frontend features in a way that can easily connect to backend APIs later.


## Token Optimization / Caveman Mode

Use `CAVEMAN.md` when the user asks for token optimization, caveman mode, short agent mode, compressed prompts, code reviews, or repetitive implementation tasks.

Caveman mode means:

- Short replies
- No filler
- Few bullets
- Preserve code, commands, paths, env names, and API routes exactly
- Ask only when blocked
- Prefer minimal diffs over long explanations

Default for this project: `caveman-lite`.

Use normal explanations only when the user asks to learn, debug deeply, or understand concepts.

## Current Priority

Use Tailwind CSS and shadcn/ui for a cleaner frontend, but do not over-focus on advanced design right now.

Priority order:

1. Correct project structure
2. Clean reusable components
3. Proper routing
4. Good TypeScript types
5. API-ready data flow
6. Tailwind + shadcn/ui setup
7. Image-rich football UI basics
8. Loading, empty, and error states
9. Simple responsive layout
10. Basic but clean UI

Design polish, animations, and advanced styling can come later.

## Tech Assumptions

Use the existing frontend stack in the project. Do not introduce a new framework unless explicitly asked.

Expected frontend stack:

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Component-based architecture

Tailwind + shadcn/ui are the preferred styling/UI system for this project.
Do not introduce MUI, Chakra, Mantine, Bootstrap, or another component library unless explicitly requested.
Read `TAILWIND_SHADCN_SETUP.md` before adding or changing UI components.

## General Rules

- Do not rewrite unrelated files.
- Do not change backend code.
- Do not add backend logic inside frontend components.
- Do not hardcode API keys.
- Do not call third-party football APIs directly from client components unless explicitly requested.
- Keep external API calls behind frontend service functions or backend API routes.
- Prefer small, focused components.
- Prefer typed data models.
- Avoid giant files.
- Avoid unnecessary abstraction too early.
- Do not add heavy animations or complex UI libraries right now.
- Use shadcn/ui primitives for buttons, cards, badges, tables, skeletons, tabs, sheets, and common UI.
- Use Tailwind classes for spacing, layout, responsive behavior, and simple visual polish.
- Use `next/image` for team logos, player images, country flags, stadium images, and news covers.

## Frontend Folder Structure

Use this structure where possible:

```txt
src/
├─ app/
│  ├─ page.tsx
│  ├─ matches/
│  │  ├─ page.tsx
│  │  └─ [matchId]/
│  │     └─ page.tsx
│  ├─ teams/
│  │  ├─ page.tsx
│  │  └─ [teamId]/
│  │     └─ page.tsx
│  ├─ news/
│  │  ├─ page.tsx
│  │  └─ [slug]/
│  │     └─ page.tsx
│  ├─ history/
│  │  └─ page.tsx
│  └─ admin/
│     └─ page.tsx
│
├─ components/
│  ├─ ui/
│  ├─ layout/
│  ├─ matches/
│  ├─ teams/
│  ├─ players/
│  ├─ news/
│  ├─ history/
│  └─ common/
│
├─ features/
│  ├─ matches/
│  ├─ teams/
│  ├─ news/
│  └─ history/
│
├─ lib/
│  ├─ api/
│  ├─ constants/
│  ├─ utils/
│  └─ validations/
│
├─ types/
│  ├─ match.ts
│  ├─ team.ts
│  ├─ news.ts
│  └─ history.ts
│
└─ data/
   └─ mock/
```

## Component Rules

- Page files should stay thin.
- Put business/data display logic in feature folders.
- Put reusable UI pieces in `components/common`.
- Put route-specific components in their related feature/component folder.
- Components should be typed with explicit props.
- Avoid deeply nested prop drilling unless the data is simple.

Example:

```tsx
export type MatchCardProps = {
  match: Match;
};

export function MatchCard({ match }: MatchCardProps) {
  return <article>{match.homeTeam.name} vs {match.awayTeam.name}</article>;
}
```

## Page Rules

Each page should include:

- Clear page title
- Main content area
- Loading state when needed
- Empty state when data is missing
- Error state when API fails

Avoid making pages visually complex at this stage.

## Data Fetching Rules

For now, prefer one of these patterns depending on the project setup:

### Server component fetching

Use this when data can be fetched on the server:

```tsx
const matches = await getMatches();
```

### Client component fetching

Use this only when the page needs client-side interactivity:

```tsx
'use client';
```

Do not make a component client-side unless it needs state, effects, browser APIs, or event handlers.

## API Service Rules

Create API helper functions under:

```txt
src/lib/api/
```

Example:

```txt
src/lib/api/matches.ts
src/lib/api/teams.ts
src/lib/api/news.ts
src/lib/api/history.ts
```

API functions should return typed data.

Example:

```ts
import type { Match } from '@/types/match';

export async function getMatches(): Promise<Match[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches`);

  if (!res.ok) {
    throw new Error('Failed to fetch matches');
  }

  return res.json();
}
```

If backend is not ready, use mock data behind the same function shape.

Do this:

```ts
export async function getMatches(): Promise<Match[]> {
  return mockMatches;
}
```

Do not scatter mock data directly inside components.

## Mock Data Rules

Store mock data in:

```txt
src/data/mock/
```

Suggested files:

```txt
src/data/mock/matches.ts
src/data/mock/teams.ts
src/data/mock/news.ts
src/data/mock/history.ts
```

Mock data should match the TypeScript types that real API data will use later.

## TypeScript Rules

Use clear domain types.

Required initial types:

- Match
- Team
- Player
- NewsArticle
- BlogPost
- TournamentHistory
- MatchStatus

Prefer readable names over clever generic types.

Avoid `any` unless absolutely necessary. If the API shape is unknown, use `unknown` and map it into a known type.

## Styling Rules

Design is not the main focus right now.

Use simple layout and spacing:

- Clear sections
- Cards for repeated data
- Basic responsive grid
- Simple typography hierarchy
- Accessible buttons and links

Avoid:

- Complex animations
- Pixel-perfect polishing
- Overly decorative UI
- Large visual rewrites
- Adding new design systems without permission

## Accessibility Rules

Even with basic design, keep accessibility reasonable:

- Use semantic HTML where possible
- Use `button` for actions
- Use `a` or Next `Link` for navigation
- Add alt text for meaningful images
- Do not use clickable `div`s
- Keep readable contrast

## Routing Rules

Suggested public routes:

```txt
/
/matches
/matches/[matchId]
/teams
/teams/[teamId]
/news
/news/[slug]
/history
```

Suggested admin routes later:

```txt
/admin
/admin/blogs
/admin/blogs/new
/admin/blogs/[blogId]/edit
```

Do not build admin functionality unless requested.

## Environment Variables

Use environment variables for API base URLs.

Example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Do not expose private API keys through `NEXT_PUBLIC_` variables.

## Error Handling

Every API function should handle non-OK responses.

Every data-heavy page should show a useful fallback if data fails to load.

Basic states to include:

- Loading
- Empty
- Error
- Success

## Git / Code Change Rules

Before making changes:

- Inspect existing folder structure
- Follow existing naming conventions
- Reuse existing components when possible
- Avoid unrelated refactors

After making changes:

- Ensure TypeScript passes
- Ensure imports are correct
- Ensure no unused components are left behind
- Ensure pages render without backend dependency when using mock data

## What Not To Do

- Do not add Redis logic in frontend.
- Do not add PostgreSQL code in frontend.
- Do not add cron job logic in frontend.
- Do not add secret football API keys in frontend.
- Do not overbuild UI polish now.
- Do not introduce global state unless needed.
- Do not create massive reusable abstractions too early.

## Definition of Done

A frontend task is done when:

- Route/page exists
- Components are split cleanly
- Types are defined
- Data comes from API helper or mock layer
- Loading/empty/error states are handled when applicable
- No unrelated files are changed
- UI is simple, usable, and responsive enough
