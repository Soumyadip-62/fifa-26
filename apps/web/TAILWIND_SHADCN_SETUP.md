# TAILWIND_SHADCN_SETUP.md

## Purpose

Use Tailwind CSS and shadcn/ui as the frontend styling system.

Goal: improve UI quality without spending too much time on custom design.

Use shadcn/ui for accessible, consistent primitives.
Use Tailwind for layout, spacing, responsive styles, and small visual adjustments.

## Install / Setup Commands

Run from the monorepo root unless noted.

### Existing Next.js frontend app

```bash
cd apps/web
npx shadcn@latest init
```

When prompted, use project defaults unless the existing project requires otherwise.
Recommended answers:

```txt
Style: New York
Base color: Neutral
CSS variables: yes
React Server Components: yes
Use src directory: yes
Import alias: @/*
Components path: src/components/ui
Utils path: src/lib/utils
```

If Tailwind is not already installed in the web app:

```bash
cd apps/web
npm install tailwindcss @tailwindcss/postcss postcss
```

Then ensure the global stylesheet imports Tailwind:

```css
@import "tailwindcss";
```

If the project was created with `create-next-app --tailwind`, do not reinstall Tailwind unless config is missing or broken.

## First shadcn Components To Add

Add only what is needed. Do not install the full registry.

```bash
cd apps/web
npx shadcn@latest add button card badge separator skeleton avatar input tabs table dropdown-menu sheet
```

Use these components for:

```txt
button          actions, links that behave like buttons
card            match cards, team cards, player cards, news cards
badge           match status, competition, position, country
separator       section dividers
skeleton        loading states
avatar          players, team logos fallback
input           search/filter fields later
tabs            stats/history sections later
table           standings/stat tables
dropdown-menu   filters later
sheet           mobile nav later
```

## Folder Rules

Keep generated shadcn components here:

```txt
src/components/ui/
```

Keep app/domain components separate:

```txt
src/components/common/
src/components/matches/
src/components/teams/
src/components/players/
src/components/news/
src/components/history/
```

Do not edit shadcn components unless required.
Prefer wrapping them in domain components.

Good:

```txt
src/components/ui/card.tsx
src/components/matches/MatchCard.tsx
```

Avoid:

```txt
src/components/ui/match-card.tsx
```

## Styling Rules

Use Tailwind classes directly for simple layout and component styling.

Use `cn()` for conditional classes.

```tsx
import { cn } from '@/lib/utils';

<div className={cn('rounded-xl border p-4', isLive && 'border-red-500')} />
```

Keep class names readable.
Break complex UI into smaller components instead of huge class strings.

## Image Rules

Use `next/image` for all local and remote images.

Use these image types:

```txt
team logo
country flag
player image
stadium image
blog/news cover image
competition logo
```

Recommended asset folders:

```txt
public/assets/images/teams/
public/assets/images/players/
public/assets/images/flags/
public/assets/images/stadiums/
public/assets/images/news/
public/assets/images/placeholders/
```

Use placeholder images when real API images are missing.
Never leave broken image URLs in UI.

## Football UI Patterns

### Match Card

Use:

```txt
Card
Badge
TeamLogo
CountryFlag optional
MatchStatusBadge
```

Must show:

```txt
home team logo + name
away team logo + name
match date/time
venue if available
status badge
score if match started/completed
```

### Team Card

Use:

```txt
Card
team logo
country flag
team name
country
short stats row if available
```

### Player Card

Use:

```txt
Card
Avatar or Image
player name
position badge
team logo
country flag
key stat
```

### News Card

Use:

```txt
Card
cover image
source badge
published date
headline
short excerpt
```

## Design Level

Design should be better than plain HTML but not over-polished.

Target style:

```txt
clean sports dashboard
mobile-first
card-based
image-rich
good spacing
simple colors
clear hierarchy
```

Avoid:

```txt
heavy animations
complex gradients everywhere
random colors
custom component library rewrites
pixel-perfect design rabbit hole
```

## Responsive Rules

Use mobile-first Tailwind classes.

Common layouts:

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />
```

```tsx
<section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" />
```

## Loading / Empty / Error States

Use shadcn Skeleton for loading cards.
Use simple reusable states:

```txt
EmptyState
ErrorState
LoadingState
```

All data pages should have these states.

## Implementation Order

1. Initialize shadcn.
2. Confirm Tailwind works.
3. Add first shadcn components.
4. Create shared visual helpers:
   - TeamLogo
   - CountryFlag
   - PlayerAvatar
   - MatchStatusBadge
   - ImageWithFallback
5. Upgrade match cards.
6. Upgrade team cards.
7. Upgrade news cards.
8. Upgrade player/stat cards later.

## Agent Rules

- Do not install extra UI libraries unless asked.
- Do not replace shadcn with another UI system.
- Do not add MUI.
- Do not use inline styles.
- Do not over-design pages.
- Prefer shadcn primitives over handmade buttons/cards/badges.
- Keep frontend-only scope.
- Do not touch backend code.
