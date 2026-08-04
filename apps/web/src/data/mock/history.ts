import type { TournamentHistory } from "@/types/history";

export const mockTournamentHistory: TournamentHistory[] = [
  {
    id: "2026-canada-mexico-united-states",
    year: 2026,
    host: "Canada / Mexico / United States",
    winner: "Spain",
    runnerUp: "Argentina",
    thirdPlace: "France",
    finalScore: "1-0 after extra time",
    summary: "Spain won their second World Cup title after defeating Argentina 1-0 in extra time with a goal by Ferran Torres in the 106th minute at MetLife Stadium.",
    winnerGoals: [
      { name: "Ferran Torres", minute: 106 },
    ],
    runnerUpGoals: [],
  },
  {
    id: "2022-qatar",
    year: 2022,
    host: "Qatar",
    winner: "Argentina",
    runnerUp: "France",
    thirdPlace: "Croatia",
    finalScore: "3-3, Argentina won 4-2 on penalties",
    summary: "Argentina won their third world title after a dramatic final against France.",
  },
  {
    id: "2018-russia",
    year: 2018,
    host: "Russia",
    winner: "France",
    runnerUp: "Croatia",
    thirdPlace: "Belgium",
    finalScore: "4-2",
    summary: "France lifted the trophy for the second time with a young, balanced squad.",
  },
  {
    id: "2014-brazil",
    year: 2014,
    host: "Brazil",
    winner: "Germany",
    runnerUp: "Argentina",
    thirdPlace: "Netherlands",
    finalScore: "1-0 after extra time",
    summary: "Germany won the final in Rio through Mario Gotze's extra-time goal.",
  },
];
