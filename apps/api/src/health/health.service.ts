import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async check() {
    const checks = {
      database: await this.checkDatabase(),
      firebase: this.checkFirebaseConfig(),
      footballData: {
        ok: Boolean(process.env.FOOTBALL_DATA_API_KEY),
      },
    };
    const ok = Object.values(checks).every((check) => check.ok);

    return {
      ok,
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  private async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private checkFirebaseConfig() {
    const ok = Boolean(
      process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY,
    );

    return { ok };
  }
}
