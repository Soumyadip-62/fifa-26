import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { getMessaging } from 'firebase-admin/messaging';
import { FootballService } from './football.service';
import {
  TournamentsService,
  validateMatch,
} from '../tournaments/tournaments.service';
import { FootballDataClient } from '../football-data/football-data.client';
import type { ProviderMatch } from '../tournaments/provider.types';
import type {
  DevicePreferences,
  FootballMatch,
} from '../../../../packages/football-contracts';

export function deliveryEvents(
  match: FootballMatch,
  p: DevicePreferences,
  now: number,
): string[] {
  if (!p.notifications.enabled) return [];
  const followed =
    p.matchIds.includes(match.id) ||
    p.teamIds.some(
      (id) => id === match.homeTeamId || id === match.awayTeamId,
    ) ||
    p.competitionIds.includes(match.competitionId);
  const explicit = p.reminders[match.id] ?? [];
  const events: string[] = [];
  if (match.status === 'upcoming')
    for (const offset of [30, 10]) {
      const due = Date.parse(match.kickoff) - offset * 60000;
      if (
        (explicit.includes(offset) ||
          (followed &&
            p.notifications[offset === 30 ? 'kickoff30' : 'kickoff10'])) &&
        now >= due &&
        now < due + 120000 &&
        now < Date.parse(match.kickoff)
      )
        events.push(`kickoff${offset}`);
    }
  if (
    match.status === 'finished' &&
    followed &&
    p.notifications.finalScore &&
    match.homeScore != null &&
    match.awayScore != null &&
    now - Date.parse(match.kickoff) < 86400000
  )
    events.push('finalScore');
  return events;
}
@Injectable()
export class FootballJobs implements OnApplicationBootstrap {
  private readonly logger = new Logger(FootballJobs.name);
  constructor(
    private readonly db: DataSource,
    private readonly football: FootballService,
    private readonly tournaments: TournamentsService,
    private readonly provider: FootballDataClient,
  ) {}
  onApplicationBootstrap() {
    // Recover missed imports after downtime without delaying HTTP startup.
    if (process.env.FOOTBALL_SCHEDULER === 'supabase') return;
    void this.catchUp().catch((error: unknown) =>
      this.logger.warn(
        error instanceof Error
          ? error.message
          : 'Football startup sync failed.',
      ),
    );
  }
  async catchUp() {
    const rows = await this.db.query<Array<{ fresh: boolean }>>(
      `SELECT ("lastSuccessAt">now()-interval '1 hour' OR "lastStartedAt">now()-interval '15 minutes') AS fresh FROM football_jobs WHERE name='schedules'`,
    );
    if (!rows[0]?.fresh) await this.run('schedules');
  }
  @Cron('0 5 * * * *', { timeZone: 'UTC', waitForCompletion: true })
  async scheduledSchedules() {
    if (process.env.FOOTBALL_SCHEDULER === 'supabase') return;
    try {
      await this.run('schedules');
      this.logger.log('Scheduled football schedules refresh completed.');
    } catch (error) {
      this.logger.warn(
        error instanceof Error ? error.message : 'Schedule refresh failed.',
      );
    }
  }
  @Cron('0 */5 * * * *', { timeZone: 'UTC', waitForCompletion: true })
  async localScores() {
    if (process.env.FOOTBALL_SCHEDULER === 'supabase') return;
    try {
      await this.run('scores');
      this.logger.log('Local score refresh completed.');
    } catch (error) {
      this.logger.warn(
        error instanceof Error ? error.message : 'Local score refresh failed.',
      );
    }
  }
  async run(
    name: 'scores' | 'schedules' | 'reminders' | 'backfill',
    args?: { competition?: string; season?: number },
  ) {
    const runner = this.db.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    const lock = (await runner.query(
      'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',
      [`football:job:${name}`],
    )) as Array<{ locked: boolean }>;
    if (!lock[0]?.locked) {
      await runner.rollbackTransaction();
      await runner.release();
      return { skipped: true };
    }
    let result: unknown;
    try {
      await this.db.query(
        'INSERT INTO football_jobs(name,"lastStartedAt") VALUES($1,now()) ON CONFLICT(name) DO UPDATE SET "lastStartedAt"=now()',
        [name],
      );
      if (name === 'backfill') result = await this.football.backfill();
      else if (name === 'schedules') {
        const outcomes =
          args?.competition === 'world-cup'
            ? []
            : await this.tournaments.syncAll(
                args?.competition && args.competition !== 'all'
                  ? this.tournaments.tournamentId(args.competition)
                  : undefined,
                args?.season,
              );
        const wc =
          args?.competition && !['all', 'world-cup'].includes(args.competition)
            ? { skipped: true }
            : await this.refreshWorldCup(false).catch(() => ({
                error: 'World Cup import failed; saved data retained.',
              }));
        const tables = await this.refreshTables(
          outcomes
            .filter((r) => !r.skipped && !r.error)
            .map((r) => ({
              competition: String(r.id),
              season: Number(r.season),
            })),
          !('skipped' in wc),
          args?.season,
        );
        const catalog = await this.football.backfill();
        result = { outcomes, wc, tables, catalog };
        if (
          outcomes.some((r) => r.error) ||
          'error' in wc ||
          tables.some((r) => r.error)
        )
          throw new ServiceUnavailableException(
            'Some competition imports failed. Successful imports and previous data were retained.',
          );
      } else if (name === 'scores') {
        const outcomes = await this.tournaments.refreshActive();
        const wc = await this.refreshWorldCup(true).catch(() => ({
          error: 'World Cup refresh failed; saved fixtures retained.',
        }));
        const tables = await this.refreshTables(
          outcomes
            .filter((r) => !r.error)
            .map((r) => ({
              competition: String(r.competitionId),
              season: Number(r.season),
            })),
          !('skipped' in wc),
        );
        result = { outcomes, wc, tables };
        if (
          outcomes.some((r) => r.error) ||
          'error' in wc ||
          tables.some((r) => r.error)
        )
          throw new ServiceUnavailableException(
            'Some score updates failed; previous scores were retained.',
          );
      } else result = await this.reminders();
      await this.db.query(
        'UPDATE football_jobs SET "lastSuccessAt"=now(),"lastError"=NULL,result=$2 WHERE name=$1',
        [name, JSON.stringify(result)],
      );
      await runner.commitTransaction();
      return result;
    } catch (error) {
      await this.db.query(
        'UPDATE football_jobs SET "lastError"=$2,result=$3 WHERE name=$1',
        [
          name,
          error instanceof Error ? error.message : 'Job failed',
          JSON.stringify(result ?? null),
        ],
      );
      throw error;
    } finally {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      await runner.release();
    }
  }
  async refreshTables(
    competitions: Array<{ competition: string; season: number }>,
    worldCup: boolean,
    worldCupSeason = 2026,
  ) {
    const results: Array<{
      competition: string;
      season: number;
      fetchedAt?: string;
      error?: string;
    }> = [];
    const targets = [
      ...competitions,
      ...(worldCup
        ? [{ competition: 'world-cup', season: worldCupSeason }]
        : []),
    ];
    for (const target of targets) {
      try {
        const id =
          target.competition === 'world-cup'
            ? 'world-cup'
            : this.tournaments.tournamentId(target.competition);
        const table = await this.tournaments.resource(
          id,
          'standings',
          target.season,
          true,
        );
        if (table.freshness.stale)
          throw new Error(
            'Official table refresh failed; saved table retained.',
          );
        results.push({ ...target, fetchedAt: table.freshness.fetchedAt });
      } catch (error) {
        results.push({
          ...target,
          error:
            error instanceof Error ? error.message : 'Table refresh failed.',
        });
      }
    }
    return results;
  }
  async refreshWorldCup(activeOnly: boolean) {
    if (activeOnly) {
      const due = await this.db.query<Array<{ id: string }>>(
        `SELECT id FROM matches WHERE ("statusCode" IN ('IN_PLAY','PAUSED','SUSPENDED') OR ("timestampUtc"::timestamptz BETWEEN now()-interval '48 hours' AND now()+interval '20 minutes' AND status IN ('scheduled','upcoming'))) LIMIT 1`,
      );
      if (!due.length) return { skipped: true };
    }
    const observedAt = new Date();
    const body = await this.provider.get<{ matches: ProviderMatch[] }>(
      '/competitions/WC/matches?season=2026',
      { queueTimeoutMs: 120000 },
    );
    if (!Array.isArray(body.matches) || !body.matches.length)
      throw new ServiceUnavailableException('World Cup refresh failed.');
    const seen = new Set<number>();
    for (const m of body.matches) {
      validateMatch(m);
      if (
        m.competition?.code !== 'WC' ||
        m.season?.startDate.slice(0, 4) !== '2026' ||
        seen.has(m.id)
      )
        throw new ServiceUnavailableException('Invalid World Cup response.');
      seen.add(m.id);
    }
    await this.db.transaction(async (manager) => {
      for (const m of body.matches) {
        const saved = await manager.query<Array<{ key: string }>>(
          `INSERT INTO tournament_resource_cache(key,payload,"fetchedAt","expiresAt") VALUES($1,$2,$3,$3::timestamptz+interval '60 seconds') ON CONFLICT(key) DO UPDATE SET payload=EXCLUDED.payload,"fetchedAt"=EXCLUDED."fetchedAt","expiresAt"=EXCLUDED."expiresAt" WHERE tournament_resource_cache."fetchedAt"<=EXCLUDED."fetchedAt" AND (tournament_resource_cache.payload->>'lastUpdated' IS NULL OR EXCLUDED.payload->>'lastUpdated' IS NULL OR (tournament_resource_cache.payload->>'lastUpdated')::timestamptz <= (EXCLUDED.payload->>'lastUpdated')::timestamptz) RETURNING key`,
          [`wc:match:${m.id}`, m, observedAt],
        );
        if (!saved.length) continue;
        await manager.query(
          `INSERT INTO matches(id,"timestampUtc","dateUtc","timeUtc","statusCode",status,score,"homeTeam","awayTeam","footballDataorgHomeTeamId","footballDataorgAwayTeamId",stage,"group",matchday,season,"homeTeamBadgeUrl","awayTeamBadgeUrl",timezone) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) ON CONFLICT(id) DO UPDATE SET "timestampUtc"=EXCLUDED."timestampUtc","dateUtc"=EXCLUDED."dateUtc","timeUtc"=EXCLUDED."timeUtc","statusCode"=EXCLUDED."statusCode",status=EXCLUDED.status,score=EXCLUDED.score,"homeTeam"=EXCLUDED."homeTeam","awayTeam"=EXCLUDED."awayTeam","footballDataorgHomeTeamId"=EXCLUDED."footballDataorgHomeTeamId","footballDataorgAwayTeamId"=EXCLUDED."footballDataorgAwayTeamId",stage=EXCLUDED.stage,"group"=EXCLUDED."group",matchday=EXCLUDED.matchday,season=EXCLUDED.season,"homeTeamBadgeUrl"=EXCLUDED."homeTeamBadgeUrl","awayTeamBadgeUrl"=EXCLUDED."awayTeamBadgeUrl"`,
          [
            String(m.id),
            m.utcDate,
            m.utcDate.slice(0, 10),
            m.utcDate.slice(11, 19),
            m.status,
            m.status === 'FINISHED'
              ? 'finished'
              : ['IN_PLAY', 'PAUSED'].includes(m.status)
                ? 'live'
                : ['SCHEDULED', 'TIMED'].includes(m.status)
                  ? 'scheduled'
                  : m.status.toLowerCase(),
            {
              ...m.score,
              home: m.score.fullTime.home,
              away: m.score.fullTime.away,
            },
            m.homeTeam.name,
            m.awayTeam.name,
            m.homeTeam.id,
            m.awayTeam.id,
            m.stage,
            typeof m.group === 'string' ? m.group : null,
            m.matchday,
            '2026',
            m.homeTeam.crest,
            m.awayTeam.crest,
            'UTC',
          ],
        );
      }
    });
    return { fixtures: body.matches.length };
  }
  async reminders() {
    // Activation is deliberately separate from deploying the code.
    if (process.env.FOOTBALL_PUSH_ENABLED !== 'true')
      return { enabled: false, sent: 0 };
    const data = await this.football.snapshot(),
      now = Date.now();
    const devices = await this.db.query<
      Array<{ id: string; preferences: DevicePreferences }>
    >(
      "SELECT id,preferences FROM football_devices WHERE token IS NOT NULL AND preferences->'notifications'->>'enabled'='true'",
    );
    for (const d of devices)
      for (const m of data.matches)
        for (const event of deliveryEvents(m, d.preferences, now)) {
          const key = `${d.id}:${m.id}:${event}:${event === 'finalScore' ? 'final' : m.kickoff}`;
          await this.db.query(
            'INSERT INTO football_deliveries(id,"deviceId","matchId",event,kickoff) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING',
            [key, d.id, m.id, event, m.kickoff],
          );
        }
    let sent = 0,
      failed = 0;
    for (let i = 0; i < 25; i++) {
      const outcome = await this.db.transaction(async (manager) => {
        const due = await manager.query<
          Array<{
            id: string;
            deviceId: string;
            matchId: string;
            event: string;
            kickoff: Date;
            attempts: number;
            token: string | null;
            preferences: DevicePreferences;
          }>
        >(
          `SELECT d.*,v.token,v.preferences FROM football_deliveries d JOIN football_devices v ON v.id=d."deviceId" WHERE d.status='pending' AND d."nextAttemptAt"<=now() AND d.attempts<5 ORDER BY d."nextAttemptAt" LIMIT 1 FOR UPDATE OF d SKIP LOCKED`,
        );
        const d = due[0];
        if (!d) return 'empty';
        const m = data.matches.find((m) => m.id === d.matchId);
        const final = d.event === 'finalScore';
        const stillFollowed =
          m &&
          (d.preferences.matchIds.includes(m.id) ||
            d.preferences.teamIds.some(
              (id) => id === m.homeTeamId || id === m.awayTeamId,
            ) ||
            d.preferences.competitionIds.includes(m.competitionId));
        const offset = d.event === 'kickoff30' ? 30 : 10;
        const subscribed = final
          ? stillFollowed && d.preferences.notifications.finalScore
          : d.preferences.reminders[d.matchId]?.includes(offset) ||
            (stillFollowed &&
              d.preferences.notifications[
                offset === 30 ? 'kickoff30' : 'kickoff10'
              ]);
        if (
          !m ||
          !d.token ||
          !d.preferences.notifications.enabled ||
          !subscribed ||
          (final
            ? m.status !== 'finished'
            : m.kickoff !== d.kickoff.toISOString() ||
              m.status !== 'upcoming' ||
              Date.parse(m.kickoff) <= now) ||
          Date.now() - d.kickoff.getTime() > 86400000
        ) {
          await manager.query(
            "UPDATE football_deliveries SET status='cancelled' WHERE id=$1",
            [d.id],
          );
          return 'cancelled';
        }
        const home =
            data.teams.find((t) => t.id === m.homeTeamId)?.name ?? 'Home team',
          away =
            data.teams.find((t) => t.id === m.awayTeamId)?.name ?? 'Away team';
        try {
          const base = process.env.FRONTEND_URL;
          if (!base) throw new Error('FRONTEND_URL is not configured');
          const link = new URL(
            `/matches/${encodeURIComponent(m.id)}`,
            base,
          ).toString();
          await getMessaging().send({
            token: d.token,
            notification: {
              title: final
                ? `${home} ${m.homeScore}–${m.awayScore} ${away}`
                : `${home} vs ${away}`,
              body: final ? 'Full-time result' : `Kickoff in ${offset} minutes`,
            },
            webpush: { fcmOptions: { link } },
            data: { matchId: m.id, event: d.event, url: link },
          });
          await manager.query(
            'UPDATE football_deliveries SET status=\'sent\',attempts=attempts+1,"sentAt"=now() WHERE id=$1',
            [d.id],
          );
          return 'sent';
        } catch (error) {
          const code = (error as { code?: string }).code ?? 'delivery-failed';
          const invalid = [
            'messaging/registration-token-not-registered',
            'messaging/invalid-registration-token',
          ].includes(code);
          if (invalid)
            await manager.query(
              'UPDATE football_devices SET token=NULL WHERE id=$1',
              [d.deviceId],
            );
          await manager.query(
            `UPDATE football_deliveries SET attempts=attempts+1,status=$2,"lastError"=$3,"nextAttemptAt"=now()+($4*interval '1 second') WHERE id=$1`,
            [
              d.id,
              invalid || d.attempts >= 4 ? 'failed' : 'pending',
              code,
              Math.min(3600, 60 * 2 ** d.attempts),
            ],
          );
          return 'failed';
        }
      });
      if (outcome === 'empty') break;
      if (outcome === 'sent') sent++;
      if (outcome === 'failed') failed++;
    }
    return { enabled: true, sent, failed };
  }
  async status() {
    return {
      jobs: await this.db.query<Array<Record<string, unknown>>>(
        'SELECT * FROM football_jobs ORDER BY name',
      ),
      seasons: await this.db.query<Array<Record<string, unknown>>>(
        'SELECT "competitionId",season,"lastSyncedAt" FROM tournament_seasons ORDER BY "competitionId",season DESC',
      ),
      deliveries: await this.db.query<Array<Record<string, unknown>>>(
        'SELECT status,count(*)::int FROM football_deliveries GROUP BY status',
      ),
      providers: {
        footballData: {
          configured: Boolean(process.env.FOOTBALL_DATA_API_KEY),
          requestsPerMinute: Number(
            process.env.FOOTBALL_DATA_REQUESTS_PER_MINUTE ?? 8,
          ),
        },
        sportsdb: { configured: Boolean(process.env.THESPORTSDB_API_KEY) },
        sportmonks: {
          available: false,
          reason:
            'Existing subscription does not cover supported competitions.',
        },
      },
      pushEnabled: process.env.FOOTBALL_PUSH_ENABLED === 'true',
      scheduler: process.env.FOOTBALL_SCHEDULER ?? 'process',
      cadence: {
        schedules: 'hourly',
        activeScoresAndTables: 'every 5 minutes',
        startupCatchUp: true,
      },
    };
  }
}
