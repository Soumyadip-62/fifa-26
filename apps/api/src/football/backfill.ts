import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { FootballService } from './football.service';
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
    const service = new FootballService(
      db,
      new TournamentsService(db, new FootballDataClient(db)),
      new NewsService(db),
      new FootballDataClient(db),
    );
    console.log(await service.backfill());
  } finally {
    await db.destroy();
  }
}
void main().catch(() => {
  console.error('Football backfill failed; existing records retained.');
  process.exitCode = 1;
});
