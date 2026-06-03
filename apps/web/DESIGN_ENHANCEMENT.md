# UI Readability and Animation Improvements

## Major Changes

* Replace the **Michroma** font with **Poppins** for body text, paragraph text, descriptions, labels, and general readable content.
* Keep the **Orbitron** font only for headings, hero titles, section titles, and major visual headings.
* Improve overall text readability across the app.
* Reduce font sizes on mobile screens where the current text feels too large or difficult to scan.
* Increase spacing across pages, sections, cards, and components to make the layout feel cleaner and less cramped.
* Review all pages and adjust typography, line-height, spacing, and alignment where needed.
* Make paragraph-heavy sections easier to read with proper text width, line-height, and spacing.
* Add a **Read More / Show Less** feature wherever long paragraphs or descriptions are shown.
* Ensure text remains readable in both light mode and dark mode.
* Avoid over-styling typography. Keep it clean, modern, and user-friendly.

## Font Usage Rules

Use **Poppins** for:

```txt
body text
paragraphs
descriptions
labels
buttons
cards
metadata
navigation items
table content
form text
```

Use **Orbitron** only for:

```txt
page headings
section headings
hero titles
stat highlights
important sports-style titles
```

Do not use Orbitron for long text or paragraph content.

## Responsive Typography

Review mobile screens carefully.

On mobile:

* Reduce oversized headings.
* Keep paragraph text readable.
* Avoid text overflow.
* Keep line-height comfortable.
* Ensure cards and sections do not feel crowded.
* Maintain clear visual hierarchy.

Suggested approach:

```txt
mobile headings: smaller and tighter
desktop headings: larger and more expressive
paragraphs: readable, not too small
line-height: comfortable for scanning
```

## Spacing Improvements

Increase and normalize spacing across:

```txt
pages
sections
cards
grids
headers
match cards
team cards
player cards
news/blog cards
detail pages
```

Focus on:

* Consistent section gaps
* Better card padding
* Better grid spacing
* Cleaner vertical rhythm
* Better spacing between headings and content
* Proper spacing between images, text, badges, and actions

Avoid random spacing values unless required.

## Read More Feature

Wherever long descriptions or paragraphs are displayed, add a simple **Read More / Show Less** behavior.

Use this for:

```txt
team descriptions
player bios
news excerpts
blog previews
match descriptions
stadium descriptions
tournament/history content
```

Default behavior:

* Show a short preview first.
* Add a “Read More” button/link.
* Expand the full text on click.
* Add “Show Less” after expanding.
* Keep the interaction simple and accessible.

## Animation Improvements

Install Motion:

```bash
pnpm add motion
```

Use Motion for subtle and meaningful UI animations.

Go through all pages and identify which sections can benefit from light animation.

Good places to add animation:

```txt
hero section
page sections
match cards
team cards
player cards
news/blog cards
stats cards
tabs
empty states
loading states
```

## Animation Direction

Keep animations simple, smooth, and beautiful.

Use subtle effects such as:

```txt
fade in
slight slide up
small scale on hover
soft staggered card reveal
smooth tab/content transition
```

Avoid making the app animation-heavy.

Do not add:

```txt
excessive bouncing
large scaling
infinite motion
distracting effects
slow animations
animations on every tiny element
```

Animations should improve the experience, not distract from the data.

## Implementation Rules

* Do not change existing functionality.
* Do not change API logic or data structure.
* Do not rewrite pages from scratch.
* Improve the existing UI gradually.
* Keep components reusable and maintainable.
* Use Tailwind CSS for layout, spacing, typography, and responsive styling.
* Use shadcn/ui components where already used or appropriate.
* Use Motion only where it adds value.
* Ensure all updated sections remain responsive.
* Ensure all updated sections remain dark-mode friendly.

## Expected Output

After completing the changes, provide:

```txt
files changed
font changes made
spacing/readability improvements
mobile typography fixes
read more sections added
animation changes added
any assumptions or pending improvements
```

  
