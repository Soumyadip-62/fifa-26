import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class PointsTableService {
  private cache: any = null;
  private lastFetched = 0;
  private readonly CACHE_TTL = 60 * 1000; // 1 minute cache

  async getStandings(): Promise<any> {
    const now = Date.now();
    if (this.cache && now - this.lastFetched < this.CACHE_TTL) {
      return this.cache;
    }

    try {
      const apiKey = process.env.FOOTBALL_DATA_API_KEY;
      const response = await fetch(
        'https://api.football-data.org/v4/competitions/WC/standings',
        {
          headers: {
            'X-Auth-Token': apiKey || '',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Football-data.org API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache = data;
      this.lastFetched = now;
      return data;
    } catch (error) {
      console.error(
        'Error fetching standings from football-data.org API, falling back to local calculation:',
        error,
      );
      return this.calculateLocalStandings();
    }
  }

  private calculateLocalStandings(): any {
    try {
      const teamsPath = join(process.cwd(), 'fifa-data', 'teams-data.json');
      const teams = JSON.parse(readFileSync(teamsPath, 'utf8'));

      const schedulePath = join(process.cwd(), 'fifa-data', 'group-stage-schedule.json');
      const schedule = JSON.parse(readFileSync(schedulePath, 'utf8'));

      // Group teams by their group field (A-L)
      const groups: Record<string, any[]> = {};
      teams.forEach((team: any) => {
        const groupLetter = team.group;
        if (groupLetter) {
          const groupName = `Group ${groupLetter}`;
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push({
            team: {
              id: parseInt(team.sportsdb_team_id) || Math.floor(Math.random() * 10000),
              name: team.name,
              shortName: team.name,
              tla: team.fifa_code || team.name.slice(0, 3).toUpperCase(),
              crest: team.image_url || '',
            },
            playedGames: 0,
            form: null,
            won: 0,
            draw: 0,
            lost: 0,
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
          });
        }
      });

      // Calculate table stats from matches
      const matches = schedule.matches || [];
      matches.forEach((match: any) => {
        // Only count finished group stage matches
        const isGroupStage = match.stage === 'Group Stage' || match.group;
        const isFinished = match.status === 'finished';
        const hasScore = match.score && match.score.home !== null && match.score.away !== null;

        if (isGroupStage && isFinished && hasScore && match.group) {
          const groupName = `Group ${match.group}`;
          const groupTable = groups[groupName];

          if (groupTable) {
            const homeTeamEntry = groupTable.find(
              (entry) => entry.team.name.toLowerCase() === match.homeTeam.toLowerCase(),
            );
            const awayTeamEntry = groupTable.find(
              (entry) => entry.team.name.toLowerCase() === match.awayTeam.toLowerCase(),
            );

            if (homeTeamEntry && awayTeamEntry) {
              const homeScore = match.score.home;
              const awayScore = match.score.away;

              homeTeamEntry.playedGames += 1;
              awayTeamEntry.playedGames += 1;

              homeTeamEntry.goalsFor += homeScore;
              homeTeamEntry.goalsAgainst += awayScore;

              awayTeamEntry.goalsFor += awayScore;
              awayTeamEntry.goalsAgainst += homeScore;

              if (homeScore > awayScore) {
                homeTeamEntry.won += 1;
                homeTeamEntry.points += 3;
                awayTeamEntry.lost += 1;
              } else if (homeScore < awayScore) {
                awayTeamEntry.won += 1;
                awayTeamEntry.points += 3;
                homeTeamEntry.lost += 1;
              } else {
                homeTeamEntry.draw += 1;
                homeTeamEntry.points += 1;
                awayTeamEntry.draw += 1;
                awayTeamEntry.points += 1;
              }
            }
          }
        }
      });

      // Finalize and sort standings in each group
      const standings = Object.keys(groups)
        .sort()
        .map((groupName) => {
          const table = groups[groupName];

          table.forEach((entry) => {
            entry.goalDifference = entry.goalsFor - entry.goalsAgainst;
          });

          // Sort by points desc -> goalDifference desc -> goalsFor desc -> name asc
          table.sort((a, b) => {
            if (b.points !== a.points) {
              return b.points - a.points;
            }
            if (b.goalDifference !== a.goalDifference) {
              return b.goalDifference - a.goalDifference;
            }
            if (b.goalsFor !== a.goalsFor) {
              return b.goalsFor - a.goalsFor;
            }
            return a.team.name.localeCompare(b.team.name);
          });

          // Add positions
          table.forEach((entry, index) => {
            entry.position = index + 1;
          });

          return {
            stage: 'ALL',
            type: 'TOTAL',
            group: groupName,
            table,
          };
        });

      return {
        filters: { season: '2026' },
        area: { id: 2267, name: 'World', code: 'INT', flag: null },
        competition: {
          id: 2000,
          name: 'FIFA World Cup',
          code: 'WC',
          type: 'CUP',
          emblem: 'https://crests.football-data.org/wm26.png',
        },
        season: {
          id: 2398,
          startDate: '2026-06-11',
          endDate: '2026-07-19',
          currentMatchday: 1,
          winner: null,
        },
        standings,
      };
    } catch (err) {
      console.error('Failed to calculate local standings:', err);
      return {
        filters: { season: '2026' },
        standings: [],
      };
    }
  }
}
