import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { DataSource } from 'typeorm';
import type { DevicePreferences } from '../../../../packages/football-contracts';

const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export function credentialMatches(actual: string, expected: string) {
  const a = Buffer.from(hash(actual)),
    b = Buffer.from(hash(expected));
  return timingSafeEqual(a, b);
}
export function validatePreferences(value: unknown): DevicePreferences {
  const p = value as DevicePreferences;
  if (
    !p ||
    p.version !== 1 ||
    !p.notifications ||
    typeof p.notifications.enabled !== 'boolean' ||
    !['kickoff30', 'kickoff10', 'finalScore'].every(
      (k) => typeof p.notifications[k] === 'boolean',
    )
  )
    throw new BadRequestException('Invalid notification preferences.');
  for (const k of ['teamIds', 'playerIds', 'competitionIds', 'matchIds'])
    if (
      !Array.isArray(p[k]) ||
      p[k].length > 1000 ||
      !p[k].every(
        (v: unknown) => typeof v === 'string' && v.length > 0 && v.length < 120,
      )
    )
      throw new BadRequestException('Invalid favourite IDs.');
  if (
    !p.reminders ||
    Array.isArray(p.reminders) ||
    typeof p.reminders !== 'object' ||
    Object.keys(p.reminders).length > 1000 ||
    !Object.entries(p.reminders).every(
      ([k, v]) =>
        k.length < 120 &&
        Array.isArray(v) &&
        v.length <= 2 &&
        v.every((n) => n === 10 || n === 30),
    )
  )
    throw new BadRequestException('Invalid reminder offsets.');
  return {
    version: 1,
    teamIds: [...new Set(p.teamIds)],
    playerIds: [...new Set(p.playerIds)],
    competitionIds: [...new Set(p.competitionIds)],
    matchIds: [...new Set(p.matchIds)],
    reminders: p.reminders,
    notifications: {
      enabled: p.notifications.enabled,
      kickoff30: p.notifications.kickoff30,
      kickoff10: p.notifications.kickoff10,
      finalScore: p.notifications.finalScore,
    },
  };
}
@Injectable()
export class FootballDevices {
  constructor(private readonly db: DataSource) {}
  async register(value: unknown, token: unknown) {
    const preferences = validatePreferences(value);
    this.validateToken(token);
    const id = randomUUID(),
      secret = randomBytes(32).toString('base64url');
    try {
      await this.db.query(
        'INSERT INTO football_devices(id,"secretHash",token,preferences) VALUES($1,$2,$3,$4)',
        [id, hash(secret), token, preferences],
      );
    } catch (error) {
      if ((error as { code: string }).code === '23505')
        throw new ConflictException(
          'This push token is already registered. Use this device’s saved ownership credential.',
        );
      throw error;
    }
    return { id, secret };
  }
  validateToken(token: unknown) {
    if (
      token !== null &&
      (typeof token !== 'string' || token.length < 20 || token.length > 4096)
    )
      throw new BadRequestException('Invalid push token.');
  }
  async update(id: string, secret: string, value: unknown, token: unknown) {
    if (!/^[0-9a-f-]{36}$/i.test(id))
      throw new UnauthorizedException('Invalid device.');
    const records = await this.db.query<Array<{ secretHash: string }>>(
      'SELECT "secretHash" FROM football_devices WHERE id=$1',
      [id],
    );
    if (
      !records[0] ||
      !secret ||
      !credentialMatches(hash(secret), records[0].secretHash)
    )
      throw new UnauthorizedException('Invalid device ownership credential.');
    const preferences = validatePreferences(value);
    this.validateToken(token);
    try {
      await this.db.query(
        'UPDATE football_devices SET preferences=$2,token=$3,"updatedAt"=now() WHERE id=$1',
        [id, preferences, token],
      );
    } catch (error) {
      if ((error as { code: string }).code === '23505')
        throw new ConflictException(
          'Push token belongs to a different device registration.',
        );
      throw error;
    }
    return { id, updated: true };
  }
}
