import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import * as dotenv from 'dotenv';
import { TeamEntity } from '../teams/entitites/teams.entity';
import { MatchEntity } from '../matches/entities/matches.entity';
import { HistoricalMatchEntity } from '../history/entities/history.entity';
import { TournamentEntity } from '../history/entities/tournament.entity';
import { QualifiedTeamEntity } from '../points-table/entities/qualified-team.entity';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env') });
dotenv.config({ path: join(process.cwd(), 'apps/api/.env') });

const sourceUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const targetUrl = process.env.SUPABASE_DATABASE_URL || process.env.TARGET_DATABASE_URL;

export async function migrateDb() {
  console.log('=== Neon to Supabase DB Migration Script ===\n');

  if (!sourceUrl) {
    console.error('Error: Source DATABASE_URL (Neon) is missing.');
    process.exit(1);
  }

  if (!targetUrl) {
    console.log('Target SUPABASE_DATABASE_URL environment variable is not set yet.');
    console.log('Please add SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres to apps/api/.env');
    console.log('\nAlternatively, if you already updated DATABASE_URL in .env to your Supabase URL, you can run seed/update scripts directly:');
    console.log('  pnpm --filter api run db:seed');
    console.log('  pnpm --filter api run db:update-2026-history\n');
    return;
  }

  console.log('Connecting to Source Database (Neon)...');
  const sourceClient = new Client({
    connectionString: sourceUrl,
    ssl: { rejectUnauthorized: false },
  });
  await sourceClient.connect();
  console.log('Connected to Source DB.');

  console.log('Connecting to Target Database (Supabase) via TypeORM for table synchronization...');
  const targetDataSource = new DataSource({
    type: 'postgres',
    url: targetUrl,
    entities: [
      TeamEntity,
      MatchEntity,
      HistoricalMatchEntity,
      TournamentEntity,
      QualifiedTeamEntity,
    ],
    synchronize: true, // Automatically creates tables in Supabase
    ssl: { rejectUnauthorized: false },
  });
  await targetDataSource.initialize();
  console.log('Connected to Target DB and synchronized schema.\n');

  const tables = ['teams', 'matches', 'tournaments', 'historical_matches', 'qualified_teams'];

  const targetClient = new Client({
    connectionString: targetUrl,
    ssl: { rejectUnauthorized: false },
  });
  await targetClient.connect();

  for (const table of tables) {
    try {
      console.log(`Migrating table: "${table}"...`);
      const { rows } = await sourceClient.query(`SELECT * FROM "${table}"`);
      console.log(`Fetched ${rows.length} rows from Source DB.`);

      if (rows.length === 0) {
        continue;
      }

      const columns = Object.keys(rows[0]).map((col) => `"${col}"`).join(', ');

      // Disable constraints / truncate target table before bulk insert
      await targetClient.query(`TRUNCATE TABLE "${table}" CASCADE`);

      const chunkSize = 100;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const valueClauses: string[] = [];
        const paramValues: any[] = [];
        let paramIndex = 1;

        for (const row of chunk) {
          const rowPlaceholders: string[] = [];
          for (const key of Object.keys(row)) {
            const val = row[key];
            paramValues.push(typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
            rowPlaceholders.push(`$${paramIndex++}`);
          }
          valueClauses.push(`(${rowPlaceholders.join(', ')})`);
        }

        await targetClient.query(
          `INSERT INTO "${table}" (${columns}) VALUES ${valueClauses.join(', ')} ON CONFLICT DO NOTHING`,
          paramValues,
        );
      }

      const targetCount = await targetClient.query(`SELECT count(*) FROM "${table}"`);
      console.log(`Successfully migrated ${targetCount.rows[0].count} rows to Supabase for "${table}".\n`);
    } catch (err: any) {
      console.error(`Error migrating table "${table}":`, err.message);
    }
  }

  await sourceClient.end();
  await targetClient.end();
  await targetDataSource.destroy();

  console.log('=== Migration Complete! ===');
  console.log('Now update DATABASE_URL in apps/api/.env with your Supabase connection string.');
}

if (require.main === module) {
  migrateDb().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
