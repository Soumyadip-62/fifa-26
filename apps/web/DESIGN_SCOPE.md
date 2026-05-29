# DESIGN_SCOPE.md

## Current Design Approach

Design is intentionally low priority at this stage.

The frontend should look clean, usable, and sports-app-like, but not polished or over-engineered.

Use Tailwind CSS and shadcn/ui as the default design system.

## What To Focus On

- Clear layout
- Readable text
- Simple shadcn cards
- Simple Tailwind grids
- Team logos
- Country flags
- Player images
- News/blog cover images
- Basic responsive behavior
- Good spacing
- Clear navigation
- Accessible links and buttons

## What To Avoid For Now

- Complex animations
- Fancy hover effects
- Heavy visual systems
- Advanced theming
- Pixel-perfect screens
- Large design refactors
- Installing extra UI libraries beyond shadcn/ui without permission
- Spending too much time on colors, shadows, gradients, or decorative details

## Acceptable UI Quality

The UI is acceptable if:

- The user can understand the page quickly
- Data is easy to scan
- Routes are easy to navigate
- The app works on desktop and mobile widths
- Loading, empty, and error states are present where needed

## Later Design Polish

Only after functionality is stable:

- Improve spacing scale
- Improve typography
- Add skeleton loaders
- Improve cards/tables
- Add subtle transitions
- Add dark mode if needed
- Add better empty states
- Add richer match detail visuals


## Tailwind + shadcn Boundary

Use Tailwind for:

```txt
spacing
layout
grid/flex
responsive behavior
simple borders/shadows
text sizing
image positioning
```

Use shadcn/ui for:

```txt
Button
Card
Badge
Avatar
Skeleton
Tabs
Table
Sheet
DropdownMenu
Input
```

Do not custom-build these from scratch unless there is a strong reason.

## Visual Asset Requirement

The UI should not look like plain text lists.

Add visual context where data supports it:

```txt
team logo in match/team cards
flag beside country/team country
player image or avatar in player cards
cover image in news/blog cards
stadium image in match details when available
```

Use placeholder images when real image URLs are missing.
