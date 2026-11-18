import {
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TournamentResourceCacheEntity } from '../tournaments/tournament.entities';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
const BUDGET_KEY = '__football_data_budget';

@Injectable()
export class FootballDataClient {
  private readonly pending = new Map<string, Promise<unknown>>();

  constructor(private readonly db: DataSource) {}

  get<T>(
    path: string,
    options: { unfoldLineups?: boolean; queueTimeoutMs?: number } = {},
  ): Promise<T> {
    if (!/^\/(competitions|matches)\//.test(path) || path.includes('://')) {
      throw new Error('Unsupported football-data resource');
    }
    const key = `${path}:${Boolean(options.unfoldLineups)}`;
    const existing = this.pending.get(key);
    if (existing) return existing as Promise<T>;
    const request = this.request<T>(path, options).finally(() =>
      this.pending.delete(key),
    );
    this.pending.set(key, request);
    return request;
  }

  // A database-backed request slot shares the API-key budget across processes,
  // including the import CLI and existing World Cup endpoints.
  private async reserveSlot(timeoutMs: number) {
    const configured = Number(
      process.env.FOOTBALL_DATA_REQUESTS_PER_MINUTE ?? 8,
    );
    const perMinute =
      Number.isFinite(configured) && configured > 0
        ? Math.min(configured, 60)
        : 8;
    const deadline = Date.now() + timeoutMs;
    while (true) {
      const waitMs = await this.db.transaction(async (manager) => {
        await manager.query(
          "SELECT pg_advisory_xact_lock(hashtext('football-data:budget'))",
        );
        const repository = manager.getRepository(TournamentResourceCacheEntity);
        const state = await repository.findOneBy({ key: BUDGET_KEY });
        const now = Date.now();
        const nextAt = Math.max(
          Number(state?.payload.nextAt ?? 0),
          Number(state?.payload.cooldownUntil ?? 0),
        );
        if (nextAt > now) return nextAt - now;
        await repository.save({
          key: BUDGET_KEY,
          payload: { nextAt: now + Math.ceil(60_000 / perMinute) },
          fetchedAt: new Date(now),
          expiresAt: new Date(now + 60_000),
        });
        return 0;
      });
      if (!waitMs) return;
      if (Date.now() + waitMs > deadline)
        throw new ServiceUnavailableException(
          'Football data is temporarily busy. Please try again shortly.',
        );
      await sleep(waitMs);
    }
  }

  private async cooldown(retryAfter: string | null) {
    const seconds = Number(retryAfter);
    const delay =
      retryAfter && Number.isFinite(seconds)
        ? Math.max(1_000, seconds * 1_000)
        : Math.max(60_000, Date.parse(retryAfter ?? '') - Date.now() || 0);
    await this.db.transaction(async (manager) => {
      await manager.query(
        "SELECT pg_advisory_xact_lock(hashtext('football-data:budget'))",
      );
      const repository = manager.getRepository(TournamentResourceCacheEntity);
      const state = await repository.findOneBy({ key: BUDGET_KEY });
      const until = Math.max(
        Date.now() + delay,
        Number(state?.payload.cooldownUntil ?? 0),
      );
      await repository.save({
        key: BUDGET_KEY,
        payload: { ...state?.payload, cooldownUntil: until },
        fetchedAt: new Date(),
        expiresAt: new Date(until),
      });
    });
  }

  private async request<T>(
    path: string,
    options: { unfoldLineups?: boolean; queueTimeoutMs?: number },
  ): Promise<T> {
    const token = process.env.FOOTBALL_DATA_API_KEY;
    if (!token)
      throw new ServiceUnavailableException('Football data is not configured.');
    await this.reserveSlot(options.queueTimeoutMs ?? 20_000);
    try {
      const response = await fetch(`https://api.football-data.org/v4${path}`, {
        headers: {
          'X-Auth-Token': token,
          ...(options.unfoldLineups ? { 'X-Unfold-Lineups': 'true' } : {}),
        },
        signal: AbortSignal.timeout(15_000),
      });
      if (response.status === 429) {
        await this.cooldown(response.headers.get('Retry-After'));
        throw new HttpException(
          'Football data is temporarily busy. Please try again shortly.',
          429,
        );
      }
      if (response.status === 404)
        throw new HttpException('Match data was not found.', 404);
      if (response.status === 401 || response.status === 403)
        throw new ServiceUnavailableException(
          'Football data access is unavailable.',
        );
      if (!response.ok)
        throw new ServiceUnavailableException(
          'Football data is temporarily unavailable.',
        );
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException(
        'Football data is temporarily unavailable.',
      );
    }
  }
}
