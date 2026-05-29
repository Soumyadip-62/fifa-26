---
name: caveman-frontend-token-mode
description: Token-optimized agent instructions for the FIFA 26 frontend project. Use when working with frontend tasks, reviewing code, planning changes, or editing files.
---

# CAVEMAN.md — Token Optimization Mode

## Goal

Use fewer tokens. Keep meaning. No fluff.

This file controls agent behavior for frontend work in this repo.

## Mode

Default mode: `caveman-lite`.

Use compressed replies unless user asks for full explanation.

Allowed modes:

```txt
caveman-lite   = short but readable
caveman-full   = very short, fragments ok
normal         = normal explanation
```

## Trigger

When user says any of these, switch to compressed mode:

```txt
caveman
caveman mode
use caveman
token optimize
compress response
short agent mode
```

When user says any of these, switch back:

```txt
normal mode
verbose
explain fully
teach me
```

## Core Rules

- Fewer words.
- No greetings.
- No motivational filler.
- No long recap.
- No obvious explanations.
- No repeating user request.
- No design poetry.
- No “I will now...” unless needed.
- Prefer bullets.
- Prefer terse file paths.
- Prefer diffs/patches over paragraphs.
- Preserve code exactly.
- Preserve commands exactly.
- Preserve env names exactly.
- Preserve API paths exactly.
- Preserve file paths exactly.
- Ask only if blocked.
- Make best assumption when safe.

## Output Style

Bad:

```txt
Sure! I can help you implement this feature. First, we need to understand the existing structure and then carefully add the component in the correct location.
```

Good:

```txt
Plan:
- Check structure
- Add component
- Wire route
- Keep UI basic
```

## Frontend Work Rules

Priority:

```txt
1. Correct structure
2. Typed data
3. Working routes
4. API-ready services
5. Loading/error/empty states
6. Simple UI
7. Polish later
```

Do not over-design.

Avoid:

```txt
- heavy animations
- unnecessary libraries
- complex layout polish
- premature abstraction
- backend changes
- direct third-party API calls from client components
```

## Response Templates

### For implementation task

```txt
Plan:
- Files: ...
- Change: ...
- Risk: ...
```

Then do work.

### For review task

```txt
Findings:
- file:line — issue. fix.
- file:line — issue. fix.
```

### For bug task

```txt
Cause:
- ...

Fix:
- ...
```

### For command request

```bash
command here
```

No extra explanation unless needed.

### For architecture decision

```txt
Use: X
Why: short reason
Avoid: Y
Next: Z
```

## File Editing Rules

Before editing:

```txt
Need:
- target files
- current pattern
- minimal change
```

While editing:

```txt
- touch few files
- keep exports clean
- keep types explicit
- no unrelated refactor
```

After editing:

```txt
Done:
- file changed
- behavior added
- test/build note
```

## Next.js Rules

- Server component by default.
- Client component only for state/effects/events/browser APIs.
- Use `src/lib/api/*` for API calls.
- Use `src/types/*` for shared types.
- Use `src/data/mock/*` while backend absent.
- Pages stay thin.
- Feature logic goes under `src/features/*`.

## Mock Data Rule

Mock data allowed only here:

```txt
src/data/mock/
```

Components must consume service functions, not raw mock imports.

Good:

```ts
const matches = await getMatches();
```

Bad:

```ts
import { mockMatches } from '@/data/mock/matches';
```

inside page/component.

## API Layer Rule

Keep future backend shape stable:

```txt
src/lib/api/matches.ts
src/lib/api/teams.ts
src/lib/api/news.ts
src/lib/api/history.ts
```

Each function:

```txt
- typed return
- clear error
- mock fallback if backend missing
```

## Design Rule

Design now = basic readable UI.

Use:

```txt
- simple cards
- spacing
- readable text
- responsive grid
- loading skeleton/text
- empty state
- error state
```

Skip:

```txt
- pixel-perfect UI
- advanced animation
- custom theme system
- complex visual polish
```

## Token Budget Rules

For normal frontend task reply:

```txt
max 120-250 words
```

For bug fix summary:

```txt
max 80-150 words
```

For code output:

```txt
code only + tiny note
```

For big architecture:

```txt
max 400 words unless asked
```

## Commit Message Mode

When asked for commit message:

```txt
type(scope): short subject
```

Examples:

```txt
feat(matches): add match list page
fix(api): handle empty fixture response
refactor(types): split football models
```

Subject max 50 chars if possible.

## PR Review Mode

Use one-line comments:

```txt
L42: bug: match can be null. Add guard.
L88: type: avoid any. Use MatchStatus.
L120: structure: move API call to lib/api.
```

## Never Compress These

Do not caveman-compress:

```txt
- code
- commands
- JSON keys
- env variable names
- URLs
- file paths
- error messages
- database field names
- API route names
```

## Default Answer Shape

```txt
Plan:
- ...

Change:
- ...

Done:
- ...
```

Use only sections needed.


## UI Work Rule

For UI tasks, read `TAILWIND_SHADCN_SETUP.md`.
Use Tailwind + shadcn/ui.
No extra UI libs.
Keep output short.
