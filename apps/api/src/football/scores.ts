import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { FootballService } from './football.service';
import { FootballJobs } from './football.jobs';
import { FootballDataClient } from '../football-data/football-data.client';
import { TournamentsService } from '../tournaments/tournaments.service';
import { NewsService } from '../news/news.service';
import {
  TournamentFixtureEntity,
  TournamentResourceCacheEntity,
  TournamentSeasonEntity,
} from '../tournaments/tournament.entities';
import { MatchEntity } from '../matches/entities/matches.entity';
import { TeamEntity } from '../teams/entitites/teams.entity';

async function main() {
  const db = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    entities: [
      TournamentFixtureEntity,
      TournamentResourceCacheEntity,
      TournamentSeasonEntity,
      MatchEntity,
      TeamEntity,
    ],
    synchronize: false,
  });
  await db.initialize();
  try {
    const client = new FootballDataClient(db),
      tournaments = new TournamentsService(db, client);
    const football = new FootballService(
      db,
      tournaments,
      new NewsService(db),
      client,
    );
    console.log(
      await new FootballJobs(db, football, tournaments, client).run(
        process.argv.includes('schedules') ? 'schedules' : 'scores',
      ),
    );
  } finally {
    await db.destroy();
  }
}
void main().catch(() => {
  console.error(
    'Football refresh failed; saved data retained. Check football_jobs for the failure.',
  );
  process.exitCode = 1;
});
