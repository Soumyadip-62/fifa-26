import { DataSource } from 'typeorm';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as dotenv from 'dotenv';
import { TeamEntity } from 'src/teams/entitites/teams.entity';
import { HistoricalMatchEntity } from 'src/history/entities/history.entity';
import { TournamentEntity } from 'src/history/entities/tournament.entity';
import { MatchEntity } from 'src/matches/entities/matches.entity';

// Import Entities

// Load environment variables from .env
dotenv.config({ path: join(process.cwd(), '.env') });
dotenv.config({ path: join(process.cwd(), 'apps/api/.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [TeamEntity, MatchEntity, TournamentEntity, HistoricalMatchEntity],
  synchronize: true, // Auto-creates database tables based on entity definitions
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runSeed() {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();
  console.log('Connected to Neon Database.');

  const processDir = process.cwd();

  // 1. Seed Teams
  console.log('Seeding Teams...');
  const teamsPath = join(processDir, 'fifa-data', 'teams-data.json');
  if (existsSync(teamsPath)) {
    const teams = JSON.parse(readFileSync(teamsPath, 'utf8'));
    const teamRepo = AppDataSource.getRepository(TeamEntity);

    for (const team of teams) {
      const teamEntity = teamRepo.create({
        fifa_code: team.fifa_code,
        name: team.name,
        name_normalised: team.name_normalised || null,
        continent: team.continent,
        flag_icon: team.flag_icon,
        flag_unicode: team.flag_unicode,
        group: team.group || null,
        confed: team.confed,
        image_url: team.image_url || null,
        sportsdb_team_id: team.sportsdb_team_id,
      });
      await teamRepo.save(teamEntity);
    }
    console.log(`Successfully seeded ${teams.length} teams.`);
  }

  // 2. Seed Current Match Schedule (Group Stage + Qualifiers)
  console.log('Seeding Matches...');
  const matchRepo = AppDataSource.getRepository(MatchEntity);

  const schedules = [
    'group-stage-schedule.json',
    'qualifier-matches-schedule.json',
  ];

  let matchesSeededCount = 0;
  for (const scheduleFile of schedules) {
    const schedulePath = join(processDir, 'fifa-data', scheduleFile);
    if (existsSync(schedulePath)) {
      const schedule = JSON.parse(readFileSync(schedulePath, 'utf8'));
      const matches = schedule.matches || [];

      for (const match of matches) {
        const matchEntity = matchRepo.create({
          id: match.id,
          matchNumber: match.matchNumber || null,
          stage: match.stage || 'Group Stage',
          date: match.date,
          time: match.time || null,
          homeTeam:
            typeof match.homeTeam === 'object'
              ? match.homeTeam.name
              : match.homeTeam,
          awayTeam:
            typeof match.awayTeam === 'object'
              ? match.awayTeam.name
              : match.awayTeam,
          status: match.status,
          group: match.group || null,
          venue: match.venue || null,
          city: match.city || null,
          score: match.score || { home: null, away: null },
        });
        await matchRepo.save(matchEntity);
        matchesSeededCount++;
      }
    }
  }
  console.log(`Successfully seeded ${matchesSeededCount} scheduled matches.`);

  // 3. Seed Historic World Cups (worldcup-by-year)
  console.log('Seeding Historic World Cups...');
  const historyPath = join(processDir, 'fifa-data', 'worldcup-by-year');
  if (existsSync(historyPath)) {
    const tournamentRepo = AppDataSource.getRepository(TournamentEntity);
    const histMatchRepo = AppDataSource.getRepository(HistoricalMatchEntity);

    const dirs = readdirSync(historyPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => !isNaN(Number(name)));

    for (const yearDir of dirs) {
      const filePath = join(historyPath, yearDir, 'worldcup.json');
      if (existsSync(filePath)) {
        const data = JSON.parse(readFileSync(filePath, 'utf8'));

        // Save Tournament
        const tournament = tournamentRepo.create({ name: data.name });
        await tournamentRepo.save(tournament);

        // Save Matches for this Tournament
        const matches = data.matches || [];
        for (const match of matches) {
          const histMatch = histMatchRepo.create({
            num: match.num || null,
            round: match.round,
            date: match.date,
            time: match.time || null,
            team1: match.team1,
            team2: match.team2,
            score: match.score || null,
            goals1: match.goals1 || null,
            goals2: match.goals2 || null,
            group: match.group || null,
            ground: match.ground,
            tournament: tournament,
          });
          await histMatchRepo.save(histMatch);
        }
        console.log(
          `Seeded history for: ${data.name} (${matches.length} matches)`,
        );
      }
    }
  }

  console.log('Seeding complete! Closing database connection...');
  await AppDataSource.destroy();
  console.log('Database connection closed.');
}

runSeed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
