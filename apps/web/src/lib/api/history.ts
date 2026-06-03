import { mockTournamentHistory } from "@/data/mock/history";
import type { TournamentHistory, GoalScorer } from "@/types/history";
import { apiUrl } from "./config";

type ApiFinalMatch = {
  year: number;
  tournament: string;
  match: {
    round: string;
    date: string;
    team1: string;
    team2: string;
    score?: {
      ft: [number, number];
      ht?: [number, number];
      et?: [number, number];
      p?: [number, number];
    };
    goals1?: {
      name: string;
      minute: number;
      offset?: number;
      owngoal?: boolean;
      penalty?: boolean;
    }[];
    goals2?: {
      name: string;
      minute: number;
      offset?: number;
      owngoal?: boolean;
      penalty?: boolean;
    }[];
    ground: string;
  };
};

const yearToHostMap: Record<number, string> = {
  1930: "Uruguay",
  1934: "Italy",
  1938: "France",
  1950: "Brazil",
  1954: "Switzerland",
  1958: "Sweden",
  1962: "Chile",
  1966: "England",
  1970: "Mexico",
  1974: "West Germany",
  1978: "Argentina",
  1982: "Spain",
  1986: "Mexico",
  1990: "Italy",
  1994: "United States",
  1998: "France",
  2002: "South Korea / Japan",
  2006: "Germany",
  2010: "South Africa",
  2014: "Brazil",
  2018: "Russia",
  2022: "Qatar",
  2026: "Canada / Mexico / United States",
};

const customSummaries: Record<number, string> = {
  2022: "Argentina won their third world title after a dramatic final against France.",
  2018: "France lifted the trophy for the second time with a young, balanced squad.",
  2014: "Germany won the final in Rio through Mario Gotze's extra-time goal.",
  2010: "Spain won their first World Cup title after Andres Iniesta scored the winning goal in extra time against Netherlands.",
  2006: "Italy won their fourth world title in a penalty shootout after a 1-1 draw against France.",
  2002: "Brazil claimed their fifth world title as Ronaldo scored twice in the final against Germany.",
  1998: "France became champions on home soil, defeating Brazil 3-0 in the final at Stade de France.",
  1994: "Brazil won their fourth world title after defeating Italy in the first-ever World Cup final penalty shootout.",
  1990: "West Germany won their third World Cup title, defeating Argentina 1-0 in Rome.",
  1986: "Argentina lifted the trophy for the second time, inspired by Diego Maradona, beating West Germany 3-2 in the final.",
  1950: "Uruguay won their second World Cup title by defeating the hosts Brazil in the decisive final match of the round-robin group.",
};

function mapMatchToHistory(item: ApiFinalMatch): TournamentHistory {
  const { year, match } = item;
  const host = yearToHostMap[year] || match.ground.split(",").pop()?.trim() || "Unknown";

  let winner = "TBD";
  let runnerUp = "TBD";
  let finalScore = "";
  let winnerGoals: GoalScorer[] = [];
  let runnerUpGoals: GoalScorer[] = [];

  if (match.score) {
    const { ft, et, p } = match.score;

    if (p) {
      if (p[0] > p[1]) {
        winner = match.team1;
        runnerUp = match.team2;
        winnerGoals = match.goals1 || [];
        runnerUpGoals = match.goals2 || [];
      } else {
        winner = match.team2;
        runnerUp = match.team1;
        winnerGoals = match.goals2 || [];
        runnerUpGoals = match.goals1 || [];
      }
      const scoreT1 = et ? et[0] : ft[0];
      const scoreT2 = et ? et[1] : ft[1];
      finalScore = `${scoreT1}-${scoreT2}, ${winner} won ${p[0]}-${p[1]} on penalties`;
    } else if (et) {
      if (et[0] > et[1]) {
        winner = match.team1;
        runnerUp = match.team2;
        winnerGoals = match.goals1 || [];
        runnerUpGoals = match.goals2 || [];
      } else {
        winner = match.team2;
        runnerUp = match.team1;
        winnerGoals = match.goals2 || [];
        runnerUpGoals = match.goals1 || [];
      }
      finalScore = `${et[0]}-${et[1]} after extra time`;
    } else {
      if (ft[0] > ft[1]) {
        winner = match.team1;
        runnerUp = match.team2;
        winnerGoals = match.goals1 || [];
        runnerUpGoals = match.goals2 || [];
      } else {
        winner = match.team2;
        runnerUp = match.team1;
        winnerGoals = match.goals2 || [];
        runnerUpGoals = match.goals1 || [];
      }
      finalScore = `${ft[0]}-${ft[1]}`;
    }
  } else {
    winner = match.team1.startsWith("W") ? "TBD" : match.team1;
    runnerUp = match.team2.startsWith("W") ? "TBD" : match.team2;
  }

  const summaryFallback = winner !== "TBD" && runnerUp !== "TBD"
    ? `${winner} won the World Cup in ${year} after defeating ${runnerUp} with a score of ${finalScore}.`
    : `The ${year} FIFA World Cup tournament.`;

  const summary = customSummaries[year] || summaryFallback;

  return {
    id: `${year}-${host.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    year,
    host,
    winner,
    runnerUp,
    finalScore,
    summary,
    winnerGoals,
    runnerUpGoals,
  };
}

export async function getTournamentHistory(): Promise<TournamentHistory[]> {
  try {
    const response = await fetch(apiUrl("/history/finals"));

    if (!response.ok) {
      throw new Error("Failed to fetch tournament history");
    }

    const rawData = (await response.json()) as ApiFinalMatch[];

    const uniqueYears = Array.from(new Set(rawData.map((item) => item.year)));

    const mappedItems = uniqueYears
      .map((year) => {
        const yearItems = rawData.filter((item) => item.year === year);
        let selectedItem = yearItems[0];

        if (year === 1950) {
          const decisiveMatch = yearItems.find(
            (item) =>
              (item.match.team1 === "Uruguay" && item.match.team2 === "Brazil") ||
              (item.match.team1 === "Brazil" && item.match.team2 === "Uruguay"),
          );
          if (decisiveMatch) {
            selectedItem = decisiveMatch;
          }
        }

        if (!selectedItem) {
          return null;
        }

        return mapMatchToHistory(selectedItem);
      })
      .filter((item): item is TournamentHistory => item !== null);

    return mappedItems.sort((a, b) => b.year - a.year);
  } catch (error) {
    console.error("Error fetching tournament history:", error);
    return mockTournamentHistory;
  }
}
