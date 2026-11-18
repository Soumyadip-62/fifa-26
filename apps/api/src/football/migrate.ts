import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const db = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    ssl: { rejectUnauthorized: false },
  });
  await db.initialize();
  const runner = db.createQueryRunner();
  await runner.connect();
  try {
    await runner.startTransaction();
    await runner.query(
      "SELECT pg_advisory_xact_lock(hashtext('football:migrate:v1'))",
    );
    await runner.query(readFileSync(join(__dirname, 'schema.sql'), 'utf8'));
    await runner.commitTransaction();
    console.log(
      'Football schema v1 applied. Existing football tables retained.',
    );
  } catch (error) {
    if (runner.isTransactionActive) await runner.rollbackTransaction();
    throw error;
  } finally {
    await runner.release();
    await db.destroy();
  }
}
void main().catch(() => {
  console.error('Football migration failed. Check database access.');
  process.exitCode = 1;
});
