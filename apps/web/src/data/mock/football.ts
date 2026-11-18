import { images } from "@/assets";
import type {
  BracketRound,
  Competition,
  FootballMatch,
  FootballNews,
  FootballPlayer,
  FootballTeam,
  Lineup,
  MatchEvent,
  MatchStat,
  Standing,
  Stadium,
} from "@/types/football";

export const competitions: Competition[] = [
  { id: "world-cup", name: "FIFA World Cup", shortName: "World Cup", region: "International", season: "2026", format: "Groups + knockout", accent: "emerald", hasBracket: true },
  { id: "ucl", name: "UEFA Champions League", shortName: "UCL", region: "Europe", season: "2026/27", format: "League phase + knockout", accent: "blue", hasBracket: true },
  { id: "premier-league", name: "Premier League", shortName: "Premier League", region: "England", season: "2026/27", format: "38 matchdays", accent: "violet", hasBracket: false },
  { id: "la-liga", name: "La Liga", shortName: "La Liga", region: "Spain", season: "2026/27", format: "38 matchdays", accent: "red", hasBracket: false },
  { id: "bundesliga", name: "Bundesliga", shortName: "Bundesliga", region: "Germany", season: "2026/27", format: "34 matchdays", accent: "amber", hasBracket: false },
];

const defaultLogo = images.teams.default;

export const footballTeams: FootballTeam[] = [
  { id: "argentina", name: "Argentina", shortName: "ARG", country: "Argentina", city: "Buenos Aires", coach: "Lionel Scaloni", founded: 1893, competitionIds: ["world-cup"], logoUrl: images.teams.argentina, stadiumId: "metlife", position: 1, form: ["W", "W", "D", "W", "W"], stats: { played: 7, wins: 6, draws: 1, losses: 0, goals: 15, conceded: 4, cleanSheets: 4, xg: 13.8, possession: 59 } },
  { id: "france", name: "France", shortName: "FRA", country: "France", city: "Paris", coach: "Didier Deschamps", founded: 1919, competitionIds: ["world-cup"], logoUrl: images.teams.france, stadiumId: "metlife", position: 2, form: ["W", "W", "W", "D", "L"], stats: { played: 7, wins: 5, draws: 1, losses: 1, goals: 13, conceded: 5, cleanSheets: 3, xg: 12.2, possession: 55 } },
  { id: "arsenal", name: "Arsenal", shortName: "ARS", country: "England", city: "London", coach: "Mikel Arteta", founded: 1886, competitionIds: ["premier-league", "ucl"], logoUrl: defaultLogo, stadiumId: "emirates", position: 1, form: ["W", "W", "D", "W", "W"], stats: { played: 5, wins: 4, draws: 1, losses: 0, goals: 12, conceded: 4, cleanSheets: 3, xg: 10.8, possession: 62 } },
  { id: "chelsea", name: "Chelsea", shortName: "CHE", country: "England", city: "London", coach: "Enzo Maresca", founded: 1905, competitionIds: ["premier-league"], logoUrl: defaultLogo, stadiumId: "stamford-bridge", position: 4, form: ["W", "L", "W", "D", "W"], stats: { played: 5, wins: 3, draws: 1, losses: 1, goals: 10, conceded: 7, cleanSheets: 1, xg: 9.7, possession: 57 } },
  { id: "liverpool", name: "Liverpool", shortName: "LIV", country: "England", city: "Liverpool", coach: "Arne Slot", founded: 1892, competitionIds: ["premier-league", "ucl"], logoUrl: defaultLogo, stadiumId: "anfield", position: 2, form: ["W", "W", "W", "L", "W"], stats: { played: 5, wins: 4, draws: 0, losses: 1, goals: 11, conceded: 5, cleanSheets: 2, xg: 10.2, possession: 60 } },
  { id: "barcelona", name: "Barcelona", shortName: "BAR", country: "Spain", city: "Barcelona", coach: "Hansi Flick", founded: 1899, competitionIds: ["la-liga", "ucl"], logoUrl: defaultLogo, stadiumId: "camp-nou", position: 1, form: ["W", "W", "W", "D", "W"], stats: { played: 5, wins: 4, draws: 1, losses: 0, goals: 15, conceded: 5, cleanSheets: 2, xg: 13.1, possession: 65 } },
  { id: "atletico-madrid", name: "Atletico Madrid", shortName: "ATM", country: "Spain", city: "Madrid", coach: "Diego Simeone", founded: 1903, competitionIds: ["la-liga", "ucl"], logoUrl: defaultLogo, stadiumId: "metropolitano", position: 3, form: ["D", "W", "W", "W", "L"], stats: { played: 5, wins: 3, draws: 1, losses: 1, goals: 9, conceded: 5, cleanSheets: 2, xg: 8.4, possession: 52 } },
  { id: "real-madrid", name: "Real Madrid", shortName: "RMA", country: "Spain", city: "Madrid", coach: "Xabi Alonso", founded: 1902, competitionIds: ["la-liga", "ucl"], logoUrl: defaultLogo, stadiumId: "bernabeu", position: 2, form: ["W", "D", "W", "W", "W"], stats: { played: 5, wins: 4, draws: 1, losses: 0, goals: 13, conceded: 4, cleanSheets: 3, xg: 11.7, possession: 61 } },
  { id: "bayern-munich", name: "Bayern Munich", shortName: "BAY", country: "Germany", city: "Munich", coach: "Vincent Kompany", founded: 1900, competitionIds: ["bundesliga", "ucl"], logoUrl: defaultLogo, stadiumId: "allianz-arena", position: 1, form: ["W", "W", "W", "W", "D"], stats: { played: 5, wins: 4, draws: 1, losses: 0, goals: 16, conceded: 4, cleanSheets: 3, xg: 14.5, possession: 64 } },
  { id: "borussia-dortmund", name: "Borussia Dortmund", shortName: "BVB", country: "Germany", city: "Dortmund", coach: "Niko Kovac", founded: 1909, competitionIds: ["bundesliga", "ucl"], logoUrl: defaultLogo, stadiumId: "signal-iduna", position: 2, form: ["W", "D", "W", "W", "L"], stats: { played: 5, wins: 3, draws: 1, losses: 1, goals: 12, conceded: 7, cleanSheets: 1, xg: 10.9, possession: 56 } },
  { id: "inter-milan", name: "Inter Milan", shortName: "INT", country: "Italy", city: "Milan", coach: "Cristian Chivu", founded: 1908, competitionIds: ["ucl"], logoUrl: defaultLogo, stadiumId: "san-siro", position: 5, form: ["W", "D", "W", "L", "W"], stats: { played: 5, wins: 3, draws: 1, losses: 1, goals: 8, conceded: 4, cleanSheets: 3, xg: 8.9, possession: 54 } },
  { id: "bayer-leverkusen", name: "Bayer Leverkusen", shortName: "B04", country: "Germany", city: "Leverkusen", coach: "Kasper Hjulmand", founded: 1904, competitionIds: ["bundesliga"], logoUrl: defaultLogo, stadiumId: "bayarena", position: 3, form: ["W", "L", "D", "W", "W"], stats: { played: 5, wins: 3, draws: 1, losses: 1, goals: 10, conceded: 6, cleanSheets: 2, xg: 9.8, possession: 58 } },
];

const playerImage = images.placeholders.player;
export const footballPlayers: FootballPlayer[] = [
  { id: "bukayo-saka", name: "Bukayo Saka", teamId: "arsenal", nationality: "England", position: "Forward", shirtNumber: 7, age: 25, height: "178 cm", preferredFoot: "Left", imageUrl: playerImage, stats: { appearances: 5, minutes: 438, goals: 4, assists: 3, shots: 18, shotsOnTarget: 11, passes: 241, passAccuracy: 88, tackles: 7, cards: 1 } },
  { id: "cole-palmer", name: "Cole Palmer", teamId: "chelsea", nationality: "England", position: "Midfielder", shirtNumber: 10, age: 24, height: "189 cm", preferredFoot: "Left", imageUrl: playerImage, stats: { appearances: 5, minutes: 450, goals: 5, assists: 2, shots: 20, shotsOnTarget: 12, passes: 266, passAccuracy: 86, tackles: 6, cards: 0 } },
  { id: "lamine-yamal", name: "Lamine Yamal", teamId: "barcelona", nationality: "Spain", position: "Forward", shirtNumber: 10, age: 19, height: "180 cm", preferredFoot: "Left", imageUrl: playerImage, stats: { appearances: 5, minutes: 421, goals: 4, assists: 4, shots: 19, shotsOnTarget: 10, passes: 284, passAccuracy: 89, tackles: 5, cards: 1 } },
  { id: "kylian-mbappe", name: "Kylian Mbappe", teamId: "real-madrid", nationality: "France", position: "Forward", shirtNumber: 10, age: 27, height: "178 cm", preferredFoot: "Right", imageUrl: playerImage, stats: { appearances: 5, minutes: 447, goals: 6, assists: 1, shots: 25, shotsOnTarget: 16, passes: 187, passAccuracy: 84, tackles: 2, cards: 0 } },
  { id: "harry-kane", name: "Harry Kane", teamId: "bayern-munich", nationality: "England", position: "Forward", shirtNumber: 9, age: 33, height: "188 cm", preferredFoot: "Right", imageUrl: playerImage, stats: { appearances: 5, minutes: 445, goals: 7, assists: 2, shots: 27, shotsOnTarget: 18, passes: 201, passAccuracy: 85, tackles: 2, cards: 0 } },
  { id: "julian-alvarez", name: "Julian Alvarez", teamId: "atletico-madrid", nationality: "Argentina", position: "Forward", shirtNumber: 19, age: 26, height: "170 cm", preferredFoot: "Right", imageUrl: playerImage, stats: { appearances: 5, minutes: 409, goals: 4, assists: 1, shots: 17, shotsOnTarget: 9, passes: 174, passAccuracy: 83, tackles: 8, cards: 1 } },
  { id: "declan-rice", name: "Declan Rice", teamId: "arsenal", nationality: "England", position: "Midfielder", shirtNumber: 41, age: 27, height: "185 cm", preferredFoot: "Right", imageUrl: playerImage, stats: { appearances: 5, minutes: 450, goals: 1, assists: 2, shots: 8, shotsOnTarget: 4, passes: 354, passAccuracy: 92, tackles: 16, cards: 1 } },
  { id: "manuel-neuer", name: "Manuel Neuer", teamId: "bayern-munich", nationality: "Germany", position: "Goalkeeper", shirtNumber: 1, age: 40, height: "193 cm", preferredFoot: "Right", imageUrl: playerImage, stats: { appearances: 5, minutes: 450, goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, passes: 182, passAccuracy: 91, tackles: 0, cards: 0 } },
];

export const footballMatches: FootballMatch[] = [
  { id: "arsenal-chelsea-live", competitionId: "premier-league", season: "2026/27", homeTeamId: "arsenal", awayTeamId: "chelsea", stadiumId: "emirates", status: "live", kickoff: "2026-09-15T18:30:00.000Z", stage: "League", matchday: "Matchday 5", minute: "67'", homeScore: 2, awayScore: 1, referee: "Michael Oliver", attendance: 60244, summary: "Arsenal lead a fast London derby after Saka's second-half finish." },
  { id: "barcelona-atletico-live", competitionId: "la-liga", season: "2026/27", homeTeamId: "barcelona", awayTeamId: "atletico-madrid", stadiumId: "camp-nou", status: "live", kickoff: "2026-09-15T19:00:00.000Z", stage: "League", matchday: "Matchday 5", minute: "72'", homeScore: 3, awayScore: 0, referee: "Jesus Gil Manzano", attendance: 89420, summary: "Barcelona are controlling possession and carrying a three-goal advantage." },
  { id: "real-madrid-inter", competitionId: "ucl", season: "2026/27", homeTeamId: "real-madrid", awayTeamId: "inter-milan", stadiumId: "bernabeu", status: "upcoming", kickoff: "2026-09-16T19:00:00.000Z", stage: "League phase", matchday: "Matchday 1", referee: "TBD", summary: "Two European heavyweights open their league-phase campaigns in Madrid." },
  { id: "arsenal-bayern", competitionId: "ucl", season: "2026/27", homeTeamId: "arsenal", awayTeamId: "bayern-munich", stadiumId: "emirates", status: "upcoming", kickoff: "2026-09-17T19:00:00.000Z", stage: "League phase", matchday: "Matchday 1", referee: "TBD", summary: "Arsenal host Bayern in the headline fixture of the opening week." },
  { id: "bayern-dortmund", competitionId: "bundesliga", season: "2026/27", homeTeamId: "bayern-munich", awayTeamId: "borussia-dortmund", stadiumId: "allianz-arena", status: "upcoming", kickoff: "2026-09-19T16:30:00.000Z", stage: "League", matchday: "Matchday 6", summary: "Der Klassiker brings the top two together in Munich." },
  { id: "liverpool-arsenal", competitionId: "premier-league", season: "2026/27", homeTeamId: "liverpool", awayTeamId: "arsenal", stadiumId: "anfield", status: "finished", kickoff: "2026-09-12T17:30:00.000Z", stage: "League", matchday: "Matchday 4", homeScore: 1, awayScore: 2, referee: "Anthony Taylor", attendance: 61276, summary: "Arsenal held firm after taking the lead late at Anfield." },
  { id: "atletico-real", competitionId: "la-liga", season: "2026/27", homeTeamId: "atletico-madrid", awayTeamId: "real-madrid", stadiumId: "metropolitano", status: "finished", kickoff: "2026-09-11T19:00:00.000Z", stage: "League", matchday: "Matchday 4", homeScore: 1, awayScore: 1, referee: "Alejandro Hernandez", attendance: 68120, summary: "The Madrid derby ended level after a tense final half-hour." },
  { id: "dortmund-leverkusen", competitionId: "bundesliga", season: "2026/27", homeTeamId: "borussia-dortmund", awayTeamId: "bayer-leverkusen", stadiumId: "signal-iduna", status: "finished", kickoff: "2026-09-12T13:30:00.000Z", stage: "League", matchday: "Matchday 5", homeScore: 2, awayScore: 2, summary: "Four goals and a late equaliser shared the points in Dortmund." },
  { id: "argentina-france-final", competitionId: "world-cup", season: "2026", homeTeamId: "argentina", awayTeamId: "france", stadiumId: "metlife", status: "finished", kickoff: "2026-07-19T19:00:00.000Z", stage: "Final", matchday: "Final", homeScore: 2, awayScore: 1, referee: "Szymon Marciniak", attendance: 82500, summary: "Argentina claimed the trophy after a composed second-half performance." },
];

export const standings: Standing[] = footballTeams.flatMap((team) => team.competitionIds.map((competitionId) => ({
  competitionId,
  group: competitionId === "world-cup" ? "Group A" : undefined,
  teamId: team.id,
  position: team.position ?? 0,
  played: team.stats.played,
  won: team.stats.wins,
  drawn: team.stats.draws,
  lost: team.stats.losses,
  goalsFor: team.stats.goals,
  goalsAgainst: team.stats.conceded,
  points: team.stats.wins * 3 + team.stats.draws,
})));

export const matchEvents: MatchEvent[] = [
  { id: "e1", matchId: "arsenal-chelsea-live", minute: "12'", type: "goal", teamId: "arsenal", playerId: "bukayo-saka", label: "Goal", detail: "Bukayo Saka - low finish into the far corner" },
  { id: "e2", matchId: "arsenal-chelsea-live", minute: "34'", type: "yellow", teamId: "chelsea", label: "Yellow card", detail: "Moises Caicedo - late challenge" },
  { id: "e3", matchId: "arsenal-chelsea-live", minute: "45+2'", type: "period", label: "Half time", detail: "Arsenal 1-1 Chelsea" },
  { id: "e4", matchId: "arsenal-chelsea-live", minute: "61'", type: "substitution", teamId: "chelsea", label: "Substitution", detail: "Enzo Fernandez replaces Romeo Lavia" },
  { id: "e5", matchId: "arsenal-chelsea-live", minute: "64'", type: "var", teamId: "arsenal", label: "VAR check", detail: "Goal confirmed" },
  { id: "e6", matchId: "arsenal-chelsea-live", minute: "65'", type: "goal", teamId: "arsenal", playerId: "bukayo-saka", label: "Goal", detail: "Bukayo Saka - header from a right-wing cross" },
];

export const matchStats: Record<string, MatchStat[]> = {
  "arsenal-chelsea-live": [
    { label: "Possession", home: 58, away: 42, suffix: "%" }, { label: "Shots", home: 15, away: 9 },
    { label: "Shots on target", home: 8, away: 4 }, { label: "Expected goals", home: 2.1, away: 1.0 },
    { label: "Passes", home: 482, away: 351 }, { label: "Pass accuracy", home: 89, away: 84, suffix: "%" },
    { label: "Fouls", home: 8, away: 12 }, { label: "Corners", home: 7, away: 3 },
    { label: "Offsides", home: 2, away: 1 }, { label: "Yellow cards", home: 1, away: 2 },
    { label: "Tackles", home: 14, away: 18 }, { label: "Saves", home: 3, away: 6 },
    { label: "Crosses", home: 19, away: 12 }, { label: "Big chances", home: 4, away: 2 },
  ],
};

export const lineups: Lineup[] = [
  { matchId: "arsenal-chelsea-live", teamId: "arsenal", formation: "4-3-3", coach: "Mikel Arteta", starters: ["David Raya", "Jurrien Timber", "William Saliba", "Gabriel", "Riccardo Calafiori", "Declan Rice", "Martin Odegaard", "Eberechi Eze", "Bukayo Saka", "Viktor Gyokeres", "Gabriel Martinelli"], substitutes: ["Kepa Arrizabalaga", "Ben White", "Jakub Kiwior", "Mikel Merino", "Noni Madueke", "Kai Havertz"] },
  { matchId: "arsenal-chelsea-live", teamId: "chelsea", formation: "4-2-3-1", coach: "Enzo Maresca", starters: ["Robert Sanchez", "Malo Gusto", "Wesley Fofana", "Levi Colwill", "Marc Cucurella", "Moises Caicedo", "Romeo Lavia", "Pedro Neto", "Cole Palmer", "Jamie Gittens", "Liam Delap"], substitutes: ["Filip Jorgensen", "Tosin Adarabioyo", "Reece James", "Enzo Fernandez", "Estevao", "Joao Pedro"] },
];

export const stadiums: Stadium[] = [
  { id: "metlife", name: "MetLife Stadium", city: "East Rutherford", country: "United States", capacity: 82500, homeTeamId: "argentina", imageUrl: images.stadiums.metlife },
  { id: "emirates", name: "Emirates Stadium", city: "London", country: "England", capacity: 60704, homeTeamId: "arsenal", imageUrl: images.stadiums.default },
  { id: "stamford-bridge", name: "Stamford Bridge", city: "London", country: "England", capacity: 40343, homeTeamId: "chelsea", imageUrl: images.stadiums.default },
  { id: "anfield", name: "Anfield", city: "Liverpool", country: "England", capacity: 61276, homeTeamId: "liverpool", imageUrl: images.stadiums.default },
  { id: "camp-nou", name: "Spotify Camp Nou", city: "Barcelona", country: "Spain", capacity: 99354, homeTeamId: "barcelona", imageUrl: images.banners.worldCup2026Alt3 },
  { id: "metropolitano", name: "Metropolitano", city: "Madrid", country: "Spain", capacity: 70460, homeTeamId: "atletico-madrid", imageUrl: images.stadiums.default },
  { id: "bernabeu", name: "Santiago Bernabeu", city: "Madrid", country: "Spain", capacity: 81044, homeTeamId: "real-madrid", imageUrl: images.stadiums.default },
  { id: "allianz-arena", name: "Allianz Arena", city: "Munich", country: "Germany", capacity: 75024, homeTeamId: "bayern-munich", imageUrl: images.stadiums.default },
  { id: "signal-iduna", name: "Signal Iduna Park", city: "Dortmund", country: "Germany", capacity: 81365, homeTeamId: "borussia-dortmund", imageUrl: images.stadiums.default },
  { id: "san-siro", name: "San Siro", city: "Milan", country: "Italy", capacity: 75817, homeTeamId: "inter-milan", imageUrl: images.stadiums.default },
  { id: "bayarena", name: "BayArena", city: "Leverkusen", country: "Germany", capacity: 30210, homeTeamId: "bayer-leverkusen", imageUrl: images.stadiums.default },
];

export const footballNews: FootballNews[] = [
  { id: "n1", slug: "arsenal-set-the-early-pace", title: "Arsenal set the early pace in England", excerpt: "A balanced midfield and sharper pressing have put Arsenal on top after five rounds.", body: "Arsenal's strong opening has been built on control without the ball and faster attacks after turnovers. The next stretch brings league and European tests, giving the squad an early measure of its depth.", competitionId: "premier-league", teamId: "arsenal", category: "Teams", publishedAt: "2026-09-15T09:00:00.000Z", imageUrl: images.blogs.teamsWatch },
  { id: "n2", slug: "league-phase-night-in-madrid", title: "League phase returns under the lights in Madrid", excerpt: "Real Madrid and Inter headline the opening Champions League matchday.", body: "The new league-phase campaign begins with a heavyweight meeting at the Bernabeu. Both teams enter in good domestic form and will expect the midfield battle to set the tone.", competitionId: "ucl", teamId: "real-madrid", category: "Preview", publishedAt: "2026-09-14T14:30:00.000Z", imageUrl: images.blogs.fixtures },
  { id: "n3", slug: "yamal-driving-barcelona-forward", title: "Yamal is driving Barcelona forward", excerpt: "Barcelona's right side continues to produce goals, assists, and decisive moments.", body: "Lamine Yamal has started the season with confidence. His timing between the lines and direct running have made him central to Barcelona's attacking structure.", competitionId: "la-liga", teamId: "barcelona", category: "Players", publishedAt: "2026-09-13T11:15:00.000Z", imageUrl: images.blogs.default },
  { id: "n4", slug: "der-klassiker-form-guide", title: "Der Klassiker: the form guide", excerpt: "Bayern and Dortmund arrive with only two points separating them.", body: "The first Klassiker of the season brings together the league's two most productive attacks. Bayern have controlled matches with the ball while Dortmund have been dangerous in transition.", competitionId: "bundesliga", teamId: "bayern-munich", category: "Preview", publishedAt: "2026-09-12T16:00:00.000Z", imageUrl: images.banners.qfStadium },
  { id: "n5", slug: "argentina-lift-world-cup", title: "Argentina lift the 2026 World Cup", excerpt: "A measured 2-1 final victory over France sealed another global title.", body: "Argentina managed the decisive moments in a tight final at MetLife Stadium. The champions combined patient possession with disciplined defending to protect their lead.", competitionId: "world-cup", teamId: "argentina", category: "Match Reports", publishedAt: "2026-07-20T08:00:00.000Z", imageUrl: images.banners.worldCupTrophy },
];

export const brackets: Partial<Record<"world-cup" | "ucl", BracketRound[]>> = {
  "world-cup": [
    { name: "Round of 16", matches: [{ id: "wc-r16-1", homeTeamId: "argentina", awayTeamId: "france", homeScore: 2, awayScore: 1, status: "finished" }, { id: "wc-r16-2", homeTeamId: "brazil", awayTeamId: "england", status: "upcoming" }] },
    { name: "Quarter-finals", matches: [{ id: "wc-qf-1", homeTeamId: "argentina", awayTeamId: "brazil", status: "upcoming" }] },
    { name: "Semi-finals", matches: [{ id: "wc-sf-1", homeTeamId: "argentina", awayTeamId: "france", status: "upcoming" }] },
    { name: "Final", matches: [{ id: "wc-final", homeTeamId: "argentina", awayTeamId: "france", status: "upcoming" }] },
  ],
  ucl: [
    { name: "Knockout play-offs", matches: [{ id: "ucl-po-1", homeTeamId: "atletico-madrid", awayTeamId: "inter-milan", homeScore: 2, awayScore: 2, status: "finished", aggregate: "3-2 agg" }, { id: "ucl-po-2", homeTeamId: "borussia-dortmund", awayTeamId: "liverpool", status: "upcoming" }] },
    { name: "Round of 16", matches: [{ id: "ucl-r16-1", homeTeamId: "real-madrid", awayTeamId: "atletico-madrid", status: "upcoming" }] },
    { name: "Quarter-finals", matches: [{ id: "ucl-qf-1", homeTeamId: "arsenal", awayTeamId: "bayern-munich", status: "upcoming" }] },
    { name: "Semi-finals", matches: [{ id: "ucl-sf-1", homeTeamId: "barcelona", awayTeamId: "real-madrid", status: "upcoming" }] },
    { name: "Final", matches: [{ id: "ucl-final", homeTeamId: "arsenal", awayTeamId: "barcelona", status: "upcoming" }] },
  ],
};
