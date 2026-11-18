You are working on my existing football companion application.

IMPORTANT:
The current application UI/design is already built. DO NOT throw away the existing design, visual language, components, or working pages.

Your task is to UPDATE and EXTEND the existing UI architecture so it can properly accommodate the expanded feature set described below.

For now, EVERYTHING MUST BE STATIC/MOCK DATA.

DO NOT implement real APIs, database integration, authentication, cron jobs, Firebase notifications, external API calls, or backend integration yet.

The goal of this task is to make the frontend UI completely ready for the future API integration.

==================================================
PROJECT VISION
==================================================

The application started as a FIFA World Cup companion.

It is now expanding into a football companion platform supporting:

1. FIFA World Cup
2. UEFA Champions League (UCL)
3. Premier League
4. La Liga
5. Bundesliga

The application should provide a consistent football experience across all competitions while allowing competition-specific features where necessary.

Think of this as:

"One football companion app for major competitions."

==================================================
PRIMARY OBJECTIVE
==================================================

Update the current UI so that the application can support:

- Multiple competitions
- Multiple seasons
- Fixtures
- Results
- Live matches
- Match centre
- Match events
- Lineups
- Formations
- Player information
- Team information
- Standings
- Knockout brackets
- Match statistics
- Player statistics
- Team statistics
- Stadiums
- News
- Highlights
- Favourite teams
- Favourite players
- Match notifications
- Competition history
- Tournament/season statistics

Everything should currently use local mock/static data.

The architecture must make replacing mock data with API data later straightforward.

==================================================
IMPORTANT DESIGN RULE
==================================================

DO NOT redesign the application from scratch.

First inspect the existing project carefully.

Understand:

- Current routes
- Current layouts
- Existing components
- Existing design system
- Existing Tailwind/shadcn components
- Existing responsive behavior
- Existing cards
- Existing navigation
- Existing typography
- Existing spacing
- Existing color system
- Existing dark mode
- Existing data structures

Reuse existing components wherever possible.

Only create new components when the existing components cannot reasonably support the new requirements.

Preserve the current visual identity.

Improve consistency where necessary, but do not unnecessarily change already-good UI.

==================================================
COMPETITION ARCHITECTURE
==================================================

Introduce a reusable competition-aware frontend architecture.

The UI should support:

World Cup
UCL
Premier League
La Liga
Bundesliga

Do NOT create five completely separate implementations.

Create reusable components and pages that receive competition-specific data.

Example conceptual structure:

Competition
    ↓
Season
    ↓
Competition Home
    ├── Matches
    ├── Standings
    ├── Teams
    ├── Players
    ├── Statistics
    ├── News
    └── Bracket / Knockout

==================================================
GLOBAL NAVIGATION
==================================================

Update the navigation to accommodate the expanded product.

Consider a structure similar to:

HOME

COMPETITIONS
    World Cup
    Champions League
    Premier League
    La Liga
    Bundesliga

MATCHES

TEAMS

PLAYERS

NEWS

FAVOURITES

Do not blindly copy this structure if the existing navigation can accommodate it more elegantly.

The navigation should remain simple and responsive.

Desktop:
- Full navigation
- Competition selector where appropriate

Mobile:
- Compact navigation
- Bottom navigation or existing mobile navigation pattern
- Easy access to Live, Matches and Favourites

==================================================
HOME PAGE
==================================================

Update the homepage to support multiple competitions.

The homepage should be an aggregated football dashboard.

Include sections such as:

1. Live Now
2. Today's Matches
3. Upcoming Matches
4. Favourite Teams
5. Competition shortcuts
6. Latest News
7. Top Players / Tournament Stats
8. Recently Finished Matches

Example:

LIVE NOW

Barcelona 2 - 1 Sevilla
LIVE 67'

UPCOMING

Arsenal vs Bayern
UCL

Real Madrid vs Atlético
La Liga

Bayern vs Dortmund
Bundesliga

Liverpool vs Chelsea
Premier League

Use static mock data.

==================================================
COMPETITION HOME PAGE
==================================================

Create a reusable Competition Overview page.

Example:

/competitions/world-cup
/competitions/ucl
/competitions/premier-league
/competitions/la-liga
/competitions/bundesliga

The exact routing should follow the existing project's conventions.

Competition page should contain:

- Competition header/hero
- Season selector
- Current matchday
- Next matches
- Recent results
- Standings preview
- Top scorers
- Latest news
- Teams
- Competition statistics
- Bracket when applicable

World Cup:

- Groups
- Group standings
- Knockout bracket

UCL:

- League Phase standings
- Matchdays
- Knockout phase
- Bracket

Premier League:

- League table
- Fixtures
- Results

La Liga:

- League table
- Fixtures
- Results

Bundesliga:

- League table
- Fixtures
- Results

==================================================
MATCHES PAGE
==================================================

Create/update the Matches experience.

Users should be able to browse:

- Today
- Tomorrow
- Previous days
- Upcoming days

Add filters:

Competition
Stage
Team
Status

Example:

ALL
LIVE
UPCOMING
FINISHED

Competition filter:

All
World Cup
UCL
Premier League
La Liga
Bundesliga

Use static data.

Make the filtering functional on the frontend.

==================================================
MATCH CENTRE
==================================================

This is one of the most important pages.

Create a comprehensive Match Details / Match Centre UI.

Example:

/matches/[matchId]

Structure:

MATCH HEADER

Team A
logo
score

Team B
logo
score

LIVE / HT / FT / UPCOMING

Competition
Stage
Date
Kickoff
Stadium

Tabs:

Overview
Lineups
Stats
Events
News
Highlights

==================================================
MATCH OVERVIEW
==================================================

Include:

- Score
- Match status
- Competition
- Date/time
- Stadium
- Referee
- Attendance where available
- Match summary
- Key moments
- Current score

For upcoming matches:

- Countdown
- Match information
- Expected/confirmed lineup placeholder
- Reminder button

For live matches:

- Live minute
- Current score
- Live events
- Live statistics

For finished matches:

- Final score
- Full match events
- Final statistics
- Highlights
- Match report

==================================================
MATCH EVENTS
==================================================

Create a proper event timeline.

Examples:

12'
GOAL
Player Name

34'
YELLOW CARD
Player Name

45+2'
HALF TIME

61'
SUBSTITUTION

78'
VAR CHECK

90+5'
FULL TIME

Make event types visually distinct.

Use static data.

==================================================
LINEUPS
==================================================

Create a complete lineup UI.

Include:

- Starting XI
- Substitutes
- Formation
- Coach
- Player shirt numbers
- Player positions

Example:

BRAZIL
4-3-3

GK
Player

DEFENDERS
Player
Player
Player
Player

MIDFIELDERS
Player
Player
Player

FORWARDS
Player
Player
Player

Create a football-pitch visual if it fits naturally with the existing design.

The pitch should be responsive.

Also provide a list/table version below or as an alternative view.

==================================================
MATCH STATISTICS
==================================================

Create a comprehensive match statistics section.

Include mock values for:

- Possession
- Shots
- Shots on target
- Expected goals
- Passes
- Pass accuracy
- Fouls
- Corners
- Offsides
- Yellow cards
- Red cards
- Tackles
- Saves
- Crosses
- Big chances

Use attractive visual comparison components.

Do not overcomplicate the UI.

==================================================
STANDINGS
==================================================

Create reusable standings components.

League competitions:

Position
Team
Played
Won
Draw
Lost
GF
GA
GD
Points

World Cup:

Group tables.

UCL:

League Phase table.

Make rows interactive so clicking a team navigates to the team page.

Include:

- Form indicators
- Qualification/relegation indicators where applicable
- Current position highlight
- Expand/collapse on mobile if needed

Use static data.

==================================================
KNOCKOUT BRACKET
==================================================

Create a reusable knockout bracket component.

It must support:

World Cup:

Round of 32
Round of 16
Quarter-finals
Semi-finals
Third-place match
Final

UCL:

Knockout Play-offs
Round of 16
Quarter-finals
Semi-finals
Final

The bracket should be responsive.

Desktop:
- Horizontal tournament bracket

Mobile:
- Scrollable bracket or vertically stacked rounds

Each match card should display:

Team
Score
Status
Aggregate score where applicable

For future API integration, do not hardcode bracket logic directly into UI components.

Use structured mock data.

==================================================
TEAM PAGES
==================================================

Create reusable Team Profile pages.

Example:

/teams/arsenal
/teams/barcelona
/teams/bayern

Team page should contain:

TEAM HEADER

Logo
Team name
Country
Competition
Coach

Tabs:

Overview
Matches
Squad
Stats
News

Overview:

- Next match
- Recent results
- Current position
- Form
- Team statistics

Squad:

Goalkeepers
Defenders
Midfielders
Forwards

Team statistics:

- Matches
- Wins
- Draws
- Losses
- Goals
- Goals conceded
- Clean sheets
- xG
- Possession

==================================================
PLAYER PAGES
==================================================

Create reusable player profile pages.

Include:

- Player photo
- Name
- Nationality
- Flag
- Position
- Shirt number
- Club
- Age
- Height
- Preferred foot

Statistics:

- Appearances
- Minutes
- Goals
- Assists
- Shots
- Shots on target
- Passes
- Pass accuracy
- Tackles
- Cards

Include recent matches.

Use static mock data.

==================================================
PLAYER STATISTICS
==================================================

Create competition-level statistics pages.

Categories:

Top Scorers
Assists
Appearances
Minutes
Clean Sheets
Cards
Shots
Passes
etc.

Allow filtering by:

Competition
Season
Team

==================================================
STADIUM PAGES
==================================================

Create reusable stadium pages.

Include:

- Stadium artwork/photo
- Stadium name
- City
- Country
- Capacity
- Home team
- Upcoming matches
- Previous matches

Use static data.

==================================================
NEWS
==================================================

Create a reusable news experience.

Include:

- Featured article
- Latest news
- Competition filters
- Team filters
- News cards
- Article detail page

Categories:

World Cup
UCL
Premier League
La Liga
Bundesliga
Teams
Players
Transfers
Match Reports

Static content only.

Do not integrate a news API.

==================================================
HIGHLIGHTS
==================================================

Create a Highlights section on Match Centre.

For now use:

- Mock thumbnail
- Mock title
- Duration
- "Watch Highlights" button

Use placeholder video URLs/data if necessary.

Do not implement external video API integration.

==================================================
FAVOURITES
==================================================

Create a favourites experience.

Users should be able to conceptually favourite:

- Teams
- Players
- Competitions
- Matches

For now this can use local/static state.

No authentication or backend persistence.

Example:

MY TEAMS

⭐ Arsenal
⭐ Barcelona
⭐ Bayern Munich

MY PLAYERS

⭐ Mbappé
⭐ Lamine Yamal

==================================================
NOTIFICATIONS UI
==================================================

DO NOT implement real push notifications yet.

Create the UI for notification preferences.

Example:

NOTIFICATION SETTINGS

Match Starting
[ON]

Lineups Available
[ON]

Goals
[ON]

Cards
[OFF]

Substitutions
[OFF]

Half Time
[ON]

Full Time
[ON]

Highlights Available
[ON]

News
[ON]

Also support team-specific notification preferences.

Example:

Arsenal
☑ Match starting
☑ Lineups
☑ Goals
☑ Full time

This UI will later connect to Firebase/FCM.

==================================================
SEARCH
==================================================

If the current application does not already have a strong search experience, create one.

Search across:

- Teams
- Players
- Competitions
- Matches
- News

Use static mock data.

Example:

Search "Real"

Results:

Real Madrid
Real Betis
Real Sociedad

==================================================
LIVE EXPERIENCE
==================================================

Create a dedicated Live page.

Example:

LIVE

Premier League

🔴 Arsenal 2 - 1 Chelsea
67'

La Liga

🔴 Barcelona 3 - 0 Sevilla
72'

UCL

No live matches

The UI should make live matches immediately recognizable.

Use mock data.

==================================================
RESPONSIVE DESIGN
==================================================

Everything must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

Pay special attention to:

- Tables
- Match cards
- Brackets
- Lineup pitch
- Navigation
- Filters
- Statistics
- Team/player headers

Do not allow horizontal overflow unless intentionally used for things such as the knockout bracket.

==================================================
DESIGN SYSTEM
==================================================

Continue using the project's existing:

- Tailwind CSS
- shadcn/ui
- Existing components
- Existing tokens
- Existing typography
- Existing colors

Do not introduce another UI library.

Use reusable components.

Examples:

CompetitionCard
MatchCard
TeamBadge
TeamLogo
PlayerCard
PlayerAvatar
CompetitionBadge
LiveIndicator
MatchEvent
MatchTimeline
Lineup
Formation
StandingsTable
Bracket
StatComparison
NewsCard
StadiumCard
NotificationToggle
FilterBar
SeasonSelector

Only create components that are actually needed.

==================================================
MOCK DATA ARCHITECTURE
==================================================

Do NOT scatter mock data throughout components.

Create a centralized mock data layer.

Example:

src/
  data/
    competitions.ts
    seasons.ts
    teams.ts
    players.ts
    matches.ts
    lineups.ts
    events.ts
    standings.ts
    statistics.ts
    stadiums.ts
    news.ts
    notifications.ts
    brackets.ts

Use TypeScript types/interfaces.

Example conceptual model:

Competition
Season
Team
Player
Match
MatchEvent
Lineup
Standing
MatchStats
TeamStats
PlayerStats
Stadium
NewsArticle
Bracket
NotificationPreference

The exact structure should follow the existing project architecture.

==================================================
FUTURE API COMPATIBILITY
==================================================

This is extremely important.

Build the frontend as if APIs will be connected later.

Components should consume structured data.

Avoid doing things like:

const teamName = "Arsenal";

directly inside UI components.

Instead:

const team = mockTeams.find(...)

Components should receive data through props.

Example:

<MatchCard match={match} />

<StandingsTable standings={standings} />

<TeamHeader team={team} />

<Lineup lineup={lineup} />

Later the mock repository can simply be replaced with API calls.

==================================================
ROUTING
==================================================

Add/update routes based on the existing routing architecture.

Conceptually:

/
 /competitions
 /competitions/world-cup
 /competitions/ucl
 /competitions/premier-league
 /competitions/la-liga
 /competitions/bundesliga

 /matches
 /matches/[id]

 /teams
 /teams/[id]

 /players
 /players/[id]

 /standings

 /statistics

 /news
 /news/[slug]

 /stadiums
 /stadiums/[id]

 /live

 /favourites

 /settings/notifications

Do not duplicate pages unnecessarily.

Dynamic routes should consume mock data based on IDs/slugs.

==================================================
DATA RELATIONSHIPS
==================================================

Make the mock data relational.

For example:

Match:

{
  id,
  competitionId,
  seasonId,
  homeTeamId,
  awayTeamId,
  stadiumId,
  status,
  kickoff,
  homeScore,
  awayScore
}

Then resolve:

homeTeamId → Team
awayTeamId → Team
stadiumId → Stadium
competitionId → Competition

Do not duplicate complete team objects into every match unless necessary.

This will make future API integration much easier.

==================================================
UX REQUIREMENTS
==================================================

The application should feel like a real football product.

Important UX details:

- Clear live indicators
- Strong score hierarchy
- Team logos
- Country flags
- Competition badges
- Match status
- Form indicators
- Interactive rows/cards
- Useful empty states
- Loading/skeleton states where appropriate
- Error states where appropriate
- Hover states
- Mobile-friendly interactions
- Accessible buttons
- Keyboard navigation where appropriate

Do not add animations everywhere.

Use subtle transitions only where they improve the experience.

==================================================
WHAT NOT TO DO
==================================================

DO NOT:

- Implement real APIs
- Add API keys
- Add database calls
- Add Prisma
- Add authentication
- Add Firebase
- Add FCM
- Add cron jobs
- Add external news APIs
- Add real-time WebSockets
- Replace the existing design
- Rewrite the application unnecessarily
- Introduce a new UI framework
- Create duplicate components
- Hardcode data inside UI components

==================================================
IMPLEMENTATION PROCESS
==================================================

Before changing code:

1. Inspect the entire existing frontend structure.
2. Identify existing reusable components.
3. Identify current routes.
4. Identify current data structures.
5. Identify what can be reused.
6. Identify what needs to be added.
7. Create a concise implementation plan.

Then implement the changes incrementally.

Priority order:

PHASE 1
- Competition architecture
- Global navigation
- Home page
- Matches
- Competition pages

PHASE 2
- Match Centre
- Events
- Lineups
- Match statistics

PHASE 3
- Standings
- Brackets
- Teams
- Players

PHASE 4
- News
- Highlights
- Stadiums
- Tournament statistics

PHASE 5
- Favourites
- Notification preferences
- Search
- Live page

==================================================
FINAL QUALITY CHECK
==================================================

Before finishing:

- Run TypeScript checks.
- Run linting.
- Run the production build.
- Fix all errors.
- Check every route.
- Check mobile responsiveness.
- Check desktop responsiveness.
- Check navigation.
- Check dynamic routes.
- Check all mock data relationships.
- Check that no API calls were accidentally introduced.
- Check that there are no broken images.
- Check that there are no console errors.

Most importantly:

THE RESULT SHOULD LOOK LIKE A COMPLETE, PRODUCTION-READY FOOTBALL COMPANION UI EVEN THOUGH ALL DATA IS CURRENTLY STATIC.

The backend/API layer will be implemented separately later.

Do not stop after creating a few screens.

Update the existing application comprehensively so the UI architecture is ready for:

WORLD CUP + UCL + PREMIER LEAGUE + LA LIGA + BUNDESLIGA.