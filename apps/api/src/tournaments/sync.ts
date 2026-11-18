import 'reflect-metadata';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TournamentFixtureEntity,
  TournamentResourceCacheEntity,
  TournamentSeasonEntity,
} from './tournament.entities';
import { TournamentsModule } from './tournaments.module';
import { TournamentsService } from './tournaments.service';

// Avoid booting unrelated Firebase services or running scheduled jobs in the CLI.
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), 'apps/api/.env') });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        TournamentSeasonEntity,
        TournamentFixtureEntity,
        TournamentResourceCacheEntity,
      ],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    TournamentsModule,
  ],
})
class TournamentSyncModule {}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const allowed = new Set(['--competition', '--season']);
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    if (
      !allowed.has(args[index]) ||
      !args[index + 1] ||
      values.has(args[index])
    )
      throw new Error(
        'Usage: tournaments:sync [--competition premier-league|la-liga|ucl|bundesliga|all] [--season 2026]',
      );
    values.set(args[index], args[index + 1]);
  }
  const app = await NestFactory.createApplicationContext(TournamentSyncModule);
  try {
    const service = app.get(TournamentsService);
    const requested = values.get('--competition');
    const id =
      !requested || requested === 'all'
        ? undefined
        : service.tournamentId(requested);
    const results = await service.syncAll(
      id,
      service.seasonYear(values.get('--season')),
    );
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    if (results.some((result) => result.error)) process.exitCode = 1;
  } finally {
    await app.close();
  }
}
void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Tournament sync failed'}\n`,
  );
  process.exitCode = 1;
});
