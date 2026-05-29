# FRONTEND_STRUCTURE.md

## Recommended Structure

```txt
src/
├─ app/
│  ├─ page.tsx
│  ├─ layout.tsx
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
│  └─ history/
│     └─ page.tsx
│
├─ components/
│  ├─ ui/
│  │  ├─ button.tsx
│  │  ├─ card.tsx
│  │  ├─ badge.tsx
│  │  ├─ skeleton.tsx
│  │  └─ avatar.tsx
│  ├─ common/
│  │  ├─ EmptyState.tsx
│  │  ├─ ErrorState.tsx
│  │  ├─ LoadingState.tsx
│  │  └─ SectionHeader.tsx
│  ├─ layout/
│  │  ├─ Header.tsx
│  │  ├─ Footer.tsx
│  │  └─ AppShell.tsx
│  ├─ matches/
│  │  ├─ MatchCard.tsx
│  │  ├─ MatchList.tsx
│  │  └─ MatchStatusBadge.tsx
│  ├─ teams/
│  │  ├─ TeamCard.tsx
│  │  ├─ TeamList.tsx
│  │  └─ TeamLogo.tsx
│  ├─ players/
│  │  ├─ PlayerCard.tsx
│  │  └─ PlayerAvatar.tsx
│  ├─ news/
│  │  ├─ NewsCard.tsx
│  │  └─ NewsList.tsx
│  └─ history/
│     └─ HistoryTimeline.tsx
│
├─ data/
│  └─ mock/
│     ├─ matches.ts
│     ├─ teams.ts
│     ├─ news.ts
│     └─ history.ts
│
├─ features/
│  ├─ matches/
│  │  ├─ MatchesPage.tsx
│  │  └─ MatchDetailsPage.tsx
│  ├─ teams/
│  │  ├─ TeamsPage.tsx
│  │  └─ TeamDetailsPage.tsx
│  ├─ news/
│  │  ├─ NewsPage.tsx
│  │  └─ NewsDetailsPage.tsx
│  └─ history/
│     └─ HistoryPage.tsx
│
├─ lib/
│  ├─ api/
│  │  ├─ matches.ts
│  │  ├─ teams.ts
│  │  ├─ news.ts
│  │  └─ history.ts
│  ├─ constants/
│  └─ utils/
│     ├─ formatDate.ts
│     ├─ imageFallbacks.ts
│     └─ cn.ts
│
└─ types/
   ├─ match.ts
   ├─ team.ts
   ├─ news.ts
   └─ history.ts
```

## File Responsibility

### `app/`

Contains routes only. Keep page files thin.

Good:

```tsx
import { MatchesPage } from '@/features/matches/MatchesPage';

export default function Page() {
  return <MatchesPage />;
}
```

Avoid putting large UI logic directly inside `app/**/page.tsx`.

### `features/`

Contains feature-level page compositions.

Examples:

- `MatchesPage`
- `MatchDetailsPage`
- `TeamsPage`
- `NewsPage`

### `components/`

Contains reusable UI components.

Use `components/ui/` only for shadcn/ui generated primitives.
Use domain folders for domain-specific components.
Use `common/` only for truly reusable app-level UI.

Do not place football-specific components inside `components/ui/`.

Good:

```txt
components/ui/card.tsx
components/matches/MatchCard.tsx
components/teams/TeamLogo.tsx
components/common/ImageWithFallback.tsx
```

### `lib/api/`

Contains frontend API functions.

These functions may use mock data first and real API calls later.

### `types/`

Contains domain TypeScript types.

Keep these types frontend-friendly and stable.

### `data/mock/`

Contains mock data used before backend integration.

Mock data must match frontend types.


## Tailwind + shadcn/ui Structure

Preferred UI system:

```txt
Tailwind CSS = layout, spacing, responsive styles, small visual polish
shadcn/ui = accessible primitives and reusable UI base
```

Generated shadcn components live in:

```txt
src/components/ui/
```

Shared helper utilities live in:

```txt
src/lib/utils/cn.ts
src/lib/utils/imageFallbacks.ts
```

Recommended football visual components:

```txt
src/components/common/ImageWithFallback.tsx
src/components/teams/TeamLogo.tsx
src/components/common/CountryFlag.tsx
src/components/players/PlayerAvatar.tsx
src/components/matches/MatchStatusBadge.tsx
```

Recommended public assets:

```txt
public/assets/images/teams/
public/assets/images/players/
public/assets/images/flags/
public/assets/images/stadiums/
public/assets/images/news/
public/assets/images/placeholders/
```
