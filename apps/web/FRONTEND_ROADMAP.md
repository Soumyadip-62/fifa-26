# FRONTEND_ROADMAP.md

## Goal

Build the frontend for a FIFA 26 / football stats platform in small, practical stages.

The current goal is not visual perfection. The goal is to create a clean frontend foundation that can connect to the backend later.

## Phase 1 — Frontend Foundation

- [ ] Confirm frontend framework and folder structure
- [ ] Set up route structure
- [ ] Create shared layout
- [ ] Create basic navigation
- [ ] Create reusable common components
- [ ] Add frontend domain types
- [ ] Add mock data files
- [ ] Add API service layer using mock data first

Important pages:

- [ ] Home page
- [ ] Matches page
- [ ] Match details page
- [ ] Teams page
- [ ] Team details page
- [ ] News/blog listing page
- [ ] News/blog details page
- [ ] History page

## Phase 2 — Match Experience

- [ ] Build match card component
- [ ] Build match list component
- [ ] Add match filters by date/status/team
- [ ] Add match details layout
- [ ] Show home team, away team, score, status, venue, date
- [ ] Add simple empty states
- [ ] Add simple error states

## Phase 3 — Teams

- [ ] Build team card component
- [ ] Build teams list page
- [ ] Build team details page
- [ ] Show team logo, name, country, group, basic stats
- [ ] Link matches to teams

## Phase 4 — News and Blogs

- [ ] Build news card component
- [ ] Build news listing page
- [ ] Build blog/article details page
- [ ] Add category/tag display
- [ ] Add published date formatting
- [ ] Keep CMS/admin features separate for later

## Phase 5 — History

- [ ] Build World Cup history page
- [ ] Show previous winners
- [ ] Show host countries
- [ ] Show finals/results
- [ ] Add static historical data from local JSON or mock files

## Phase 6 — Backend API Integration Later

- [ ] Replace mock API functions with real backend calls
- [ ] Add environment-based API base URL
- [ ] Add proper loading state
- [ ] Add retry/error behavior if needed
- [ ] Validate frontend types against backend response shape

## Phase 7 — Design Polish Later

Do this only after functionality is stable:

- [ ] Better visual hierarchy
- [ ] Better spacing and typography
- [ ] Responsive refinements
- [ ] Skeleton loaders
- [ ] Subtle animations
- [ ] Better cards/tables
- [ ] Dark mode if needed

## Current Rule

Functionality first. Design later.


## UI Setup Milestone

- [ ] Confirm Tailwind CSS is installed and working
- [ ] Initialize shadcn/ui
- [ ] Add required shadcn components only
- [ ] Add `cn()` utility if missing
- [ ] Create ImageWithFallback
- [ ] Add TeamLogo component
- [ ] Add CountryFlag component
- [ ] Add PlayerAvatar component
- [ ] Upgrade match cards with logos/status badges
- [ ] Upgrade team cards with flags/logos
- [ ] Upgrade news cards with cover images
