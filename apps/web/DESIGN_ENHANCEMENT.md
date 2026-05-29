# DESIGN_ENHANCEMENT.md


## Tailwind + shadcn/ui Enhancement Rules

Use Tailwind CSS and shadcn/ui for all design enhancement work.

Preferred shadcn components:

```txt
Card
Button
Badge
Avatar
Skeleton
Tabs
Table
Separator
Sheet
DropdownMenu
Input
```

Use Tailwind for page layout, responsive grids, spacing, and small visual adjustments.

Do not add another UI library.
Do not over-customize shadcn primitives.
Wrap shadcn components inside domain components instead of editing generated files.

Example:

```txt
components/ui/card.tsx              generated shadcn primitive
components/matches/MatchCard.tsx    football-specific card
```

## Purpose

Enhance the frontend visual experience without changing the core app architecture.

Current UI is basic. Improve visual quality by adding football-specific imagery, flags, player photos, team logos, better cards, and stronger screen composition.

Do not over-engineer. Do not rebuild the app from scratch. Improve existing screens step by step.

---

## Priority

Design improvement priority:

1. Add real visual identity to pages.
2. Use team flags, team logos, and player images where data allows.
3. Improve cards and list layouts.
4. Improve empty/loading/error states.
5. Keep the layout responsive and clean.
6. Avoid excessive animations and decoration.

---

## Design Direction

Use a modern football app style:

- Clean sports dashboard feel.
- Dark or neutral base sections are acceptable.
- Use football imagery as accents, not clutter.
- Prioritize readability over fancy visuals.
- Use consistent spacing, cards, and section headers.
- Design should feel like a live football tournament app.

Do not create a luxury landing page style unless explicitly asked.

---

## Visual Assets To Add

Use these asset types:

```txt
Team logos
Country flags
Player headshots
Stadium images
Football pitch background accents
Tournament/banner images
News/blog cover images
```

Preferred asset paths:

```txt
public/assets/images/teams/
public/assets/images/players/
public/assets/images/flags/
public/assets/images/stadiums/
public/assets/images/blogs/
public/assets/images/banners/
```

Example:

```txt
public/assets/images/flags/argentina.svg
public/assets/images/teams/argentina.png
public/assets/images/players/messi.png
public/assets/images/stadiums/metlife-stadium.jpg
public/assets/images/banners/world-cup-2026.jpg
```

If assets are not available yet, use local placeholder images from the same folder structure.

Do not hotlink random external images directly inside components.

---

## Asset Index Rule

If the project has an asset index file, register image paths there.

Preferred file:

```txt
src/assets/index.ts
```

Example:

```ts
export const images = {
  banners: {
    worldCup2026: '/assets/images/banners/world-cup-2026.jpg',
  },
  flags: {
    argentina: '/assets/images/flags/argentina.svg',
    brazil: '/assets/images/flags/brazil.svg',
    france: '/assets/images/flags/france.svg',
  },
  teams: {
    argentina: '/assets/images/teams/argentina.png',
    brazil: '/assets/images/teams/brazil.png',
    france: '/assets/images/teams/france.png',
  },
};
```

Use the asset index instead of hardcoding image paths repeatedly.

---

## Next Image Rule

Always use `next/image` for local images.

Example:

```tsx
import Image from 'next/image';

<Image
  src={team.logoUrl}
  alt={`${team.name} logo`}
  width={40}
  height={40}
/>
```

Add meaningful `alt` text.

Do not use plain `<img>` unless there is a very specific reason.

---

## Components To Create

Create reusable design components instead of repeating visual logic.

Recommended components:

```txt
src/components/common/AppImage.tsx
src/components/common/FlagIcon.tsx
src/components/common/TeamBadge.tsx
src/components/common/PlayerAvatar.tsx
src/components/common/StatCard.tsx
src/components/common/MatchCard.tsx
src/components/common/NewsCard.tsx
src/components/common/SectionHeader.tsx
src/components/common/EmptyState.tsx
src/components/common/LoadingState.tsx
```

Keep components simple.

---

## Team Badge

Use TeamBadge wherever a team is shown.

TeamBadge should support:

```txt
logo
team name
country flag
short code
optional ranking
```

Example layout:

```txt
[logo] Argentina
       [flag] ARG
```

Use it in:

```txt
Match cards
Team list
Team details page
Standings table
Stats page
```

---

## Flag Usage

Use flags to improve scannability.

Add flags in:

```txt
Country/team filters
Team detail header
Match cards
Standing rows
Player cards
History winners list
```

Keep flag sizes small:

```txt
16px - inline text
20px - table/list rows
24px - cards
32px - page headers
```

Do not use oversized flags as backgrounds unless the page specifically needs a hero section.

---

## Player Images

Use player images in:

```txt
Top scorers
Player cards
Team squad section
Match lineup preview
Player detail page later
```

Player image rules:

- Use circular or rounded avatar style.
- Keep consistent size.
- Add fallback initials if image is missing.
- Do not break layout if image fails.

Recommended sizes:

```txt
Avatar small: 32x32
Avatar medium: 48x48
Avatar large: 72x72
Feature player: 120x120
```

---

## Page-Specific Enhancements

### Home Page

Improve with:

```txt
Hero banner for FIFA / World Cup 2026
Featured match card
Upcoming matches section
Top teams section with logos and flags
Latest news cards with cover images
Small stats summary cards
```

Avoid too many sections at once. Keep the first fold clean.

Suggested structure:

```txt
Hero Section
Featured Match
Upcoming Matches
Top Teams
Latest News
```

---

### Matches Page

Improve with:

```txt
Date grouped match list
Team logos
Country flags
Venue/stadium image thumbnail if available
Match status badge
Score display
Competition round label
```

Match card should show:

```txt
Date + time
Round/stage
Home team logo + name
Away team logo + name
Score or kickoff time
Venue
Status badge
```

---

### Match Details Page

Improve with:

```txt
Large match header
Team logos and flags
Score block
Venue image
Match stats cards
Timeline/events section
Lineup placeholder section
Head-to-head mini section
```

Do not implement advanced live visualizations yet unless data exists.

---

### Teams Page

Improve with:

```txt
Team grid cards
Team logo
Country flag
Group/region info
Short stats preview
Search/filter bar
```

Team card should be compact and clickable.

---

### Team Details Page

Improve with:

```txt
Team hero header
Logo + flag
Key stats
Recent matches
Squad/player preview
Tournament history
```

---

### Stats Page

Improve with:

```txt
Stat summary cards
Top scorers with player images
Top teams with logos
Standings table with flags
Simple charts later only if useful
```

Do not add complex chart work now unless requested.

---

### History Page

Improve with:

```txt
World Cup winners timeline
Winner flags
Host country flags
Final match cards
Classic matches section
```

Use flags and small imagery to make history easier to scan.

---

### Blogs / News Page

Improve with:

```txt
Cover image cards
Category badges
Author/date metadata
Featured article card
Grid layout for articles
```

If cover image is missing, use a default football/news placeholder.

---

## Loading States

Use skeletons or simple loading cards.

Do not show plain text only:

```txt
Loading...
```

Preferred:

```txt
Card skeleton
Avatar skeleton
Image placeholder skeleton
```

---

## Empty States

Create useful empty states.

Examples:

```txt
No matches found
No news available yet
No players added for this team
No historical records found
```

Include a small visual icon or image placeholder.

---

## Error States

Keep errors user-friendly.

Example:

```txt
Could not load matches. Try again later.
```

Do not expose raw API/server errors in the UI.

---

## Responsive Rules

Mobile first.

Use layouts like:

```txt
Mobile: 1 column
Tablet: 2 columns
Desktop: 3-4 columns where suitable
```

Cards should not become too wide on desktop.

Use max-width containers for readable pages.

---

## Design Restraints

Do not spend too much time on:

```txt
Complex animations
Advanced micro-interactions
Custom chart design
Pixel-perfect landing page visuals
Heavy glassmorphism everywhere
Too many gradients
```

Allowed:

```txt
Subtle hover effects
Rounded cards
Soft shadows
Light gradients in hero/headers
Status badges
Clean grid layouts
```

---

## Accessibility

Required:

```txt
Meaningful image alt text
Readable contrast
Keyboard-friendly clickable cards
Visible focus states
No text baked into images unless decorative
```

---

## Data Fallback Rules

If an image field is missing:

```txt
Team logo missing -> use default team placeholder
Flag missing -> hide flag or use neutral globe icon
Player image missing -> use initials/avatar fallback
Blog image missing -> use default blog cover
Stadium image missing -> use gradient/placeholder
```

Never allow broken images in the UI.

---

## Implementation Order

Recommended order:

```txt
1. Add asset folder structure
2. Add placeholder images/icons
3. Create TeamBadge
4. Create PlayerAvatar
5. Create MatchCard
6. Create NewsCard
7. Improve Home page
8. Improve Matches page
9. Improve Teams page
10. Improve Stats and History pages
```

---

## Caveman Summary

```txt
Goal: make UI less basic.
Add: images, flags, team logos, player avatars.
Create reusable components.
Use next/image.
No hotlink random images.
No overdesign.
Mobile first.
No broken images.
```
