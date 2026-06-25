import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { FirebaseService } from 'src/firebase/firebase.service';
import { SubscribedTokens } from './entities/notification.entity';
import { MatchEntity } from '../matches/entities/matches.entity';
import { Repository } from 'typeorm';

export type NotificationPreferences = {
  favoriteTeams?: string[];
  kickoff30?: boolean;
  kickoff10?: boolean;
  finalScore?: boolean;
  qualification?: boolean;
};

type TestNotificationType =
  | 'kickoff30'
  | 'kickoff10'
  | 'finalScore'
  | 'qualification';

const TEAM_FLAGS: Record<string, string> = {
  'Argentina': '🇦🇷',
  'Australia': '🇦🇺',
  'Austria': '🇦🇹',
  'Belgium': '🇧🇪',
  'Brazil': '🇧🇷',
  'Cameroon': '🇨🇲',
  'Canada': '🇨🇦',
  'Chile': '🇨🇱',
  'Colombia': '🇨🇴',
  'Costa Rica': '🇨🇷',
  'Croatia': '🇭🇷',
  'Denmark': '🇩🇰',
  'Ecuador': '🇪🇨',
  'Egypt': '🇪🇬',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Ghana': '🇬🇭',
  'Iran': '🇮🇷',
  'Italy': '🇮🇹',
  'Japan': '🇯🇵',
  'Mexico': '🇲🇽',
  'Morocco': '🇲🇦',
  'Netherlands': '🇳🇱',
  'Nigeria': '🇳🇬',
  'Peru': '🇵🇪',
  'Poland': '🇵🇱',
  'Portugal': '🇵🇹',
  'Qatar': '🇶🇦',
  'Saudi Arabia': '🇸🇦',
  'Senegal': '🇸🇳',
  'Serbia': '🇷🇸',
  'South Korea': '🇰🇷',
  'Spain': '🇪🇸',
  'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭',
  'Tunisia': '🇹🇳',
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'Uruguay': '🇺🇾',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿'
};

const TEST_NOTIFICATIONS: Record<
  TestNotificationType,
  { title: string; body: string }
> = {
  kickoff30: {
    title: '[TEST] Kickoff in 30 minutes',
    body: '🇦🇷 Argentina vs 🇧🇷 Brazil ⚽\n⏰ 08:30 PM IST',
  },
  kickoff10: {
    title: '[TEST] Kickoff in 10 minutes',
    body: 'Lineups ready. Match starts soon.',
  },
  finalScore: {
    title: '[TEST] Final score',
    body: '🇪🇸 Spain 3 - 2 Portugal 🇵🇹\nFull time',
  },
  qualification: {
    title: '[TEST] Qualification alert',
    body: '🇺🇸 United States qualified for the Round of 32.',
  },
};

function getFlag(teamName: string): string {
  if (!teamName) return '';
  return TEAM_FLAGS[teamName] || '';
}

function normalizeTeamName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizePreferences(
  preferences?: NotificationPreferences | null,
): Required<NotificationPreferences> {
  return {
    favoriteTeams: Array.isArray(preferences?.favoriteTeams)
      ? preferences.favoriteTeams
          .map((team) => team.trim())
          .filter(Boolean)
          .slice(0, 24)
      : [],
    kickoff30: preferences?.kickoff30 !== false,
    kickoff10: preferences?.kickoff10 === true,
    finalScore: preferences?.finalScore === true,
    qualification: preferences?.qualification === true,
  };
}

function tokenWantsMatch(
  preferences: NotificationPreferences | null | undefined,
  homeTeam: string,
  awayTeam: string,
) {
  const normalized = normalizePreferences(preferences);

  if (!normalized.kickoff30) return false;
  if (normalized.favoriteTeams.length === 0) return true;

  const teams = new Set([
    normalizeTeamName(homeTeam || ''),
    normalizeTeamName(awayTeam || ''),
  ]);

  return normalized.favoriteTeams.some((team) =>
    teams.has(normalizeTeamName(team)),
  );
}

function parseMatchDate(timestampUtc: string | null | undefined) {
  if (!timestampUtc) return null;

  const timestamp = /[zZ]|[+-]\d{2}:?\d{2}$/.test(timestampUtc)
    ? timestampUtc
    : `${timestampUtc}Z`;
  const date = new Date(timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateKey(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly testNotificationTimeZone = 'Asia/Kolkata';

  constructor(
    private readonly firebase: FirebaseService,
    @InjectRepository(SubscribedTokens)
    private readonly tokenRepo: Repository<SubscribedTokens>,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  sendNotifications() {
    this.logger.log('Keeping the server alive.....');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendMatchNotification() {
    this.logger.log('Checking for matches starting in 30 minutes...');

    // 1. Get all matches
    const upcomingMatches = await this.matchRepo.find();

    const nowMs = Date.now();
    const thirtyMinsMs = 30 * 60 * 1000;
    // 2. Find matches starting within 30 minutes from now that haven't been notified yet
    const matchesToNotify = upcomingMatches.filter((m) => {
      if (!m.timestampUtc) return false;
      if (m.isNotified) return false; // Skip if already notified
      const matchTime = new Date(m.timestampUtc).getTime();
      const diff = matchTime - nowMs;
      // Notify if the match is starting within the next 30 minutes, or if it already started but wasn't notified yet
      // To prevent notifying for super old matches if the server was down, we only notify if it's within the last hour or next 30 minutes
      return diff > -3600000 && diff <= thirtyMinsMs;
    });

    if (matchesToNotify.length === 0) {
      return;
    }

    // 3. Fetch all subscribed tokens
    const tokens = await this.tokenRepo.find();
    if (tokens.length === 0) return;

    // 4. Send notifications
    for (const match of matchesToNotify) {
      const matchDate = match.timestampUtc ? new Date(match.timestampUtc) : new Date();
      const localTimeStr = matchDate.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      });
      const title = `🚨 Match Kickoff in 30 Mins!`;
      const homeFlag = getFlag(match.homeTeam);
      const awayFlag = getFlag(match.awayTeam);
      const homeDisplay = homeFlag ? `${homeFlag} ${match.homeTeam}` : match.homeTeam;
      const awayDisplay = awayFlag ? `${awayFlag} ${match.awayTeam}` : match.awayTeam;
      
      const body = `${homeDisplay} vs ${awayDisplay} ⚽\n⏰ ${localTimeStr} IST`;

      this.logger.log(
        `Sending notification for: ${body} to ${tokens.length} users.`,
      );

      const targetTokens = tokens.filter((token) =>
        tokenWantsMatch(token.preferences, match.homeTeam, match.awayTeam),
      );

      if (targetTokens.length === 0) {
        this.logger.log(`No matching notification preferences for ${body}.`);
        continue;
      }

      const promises = targetTokens.map((t) =>
        this.firebase.send(t.token, title, body),
      );
      await Promise.allSettled(promises);

      // Mark as notified in DB
      match.isNotified = true;
      await this.matchRepo.save(match);
    }
  }

  async sendTodayMatchNotificationsForTesting() {
    this.logger.log('Sending test notifications for today matches...');

    const tokens = await this.tokenRepo.find();
    if (tokens.length === 0) {
      this.logger.warn('No subscribed tokens found for today match test.');
      return { sent: 0, matches: 0, tokens: 0 };
    }

    const todayKey = getDateKey(new Date(), this.testNotificationTimeZone);
    const matches = (await this.matchRepo.find()).filter((match) => {
      const matchDate = parseMatchDate(match.timestampUtc);

      return (
        matchDate &&
        getDateKey(matchDate, this.testNotificationTimeZone) === todayKey
      );
    });

    if (matches.length === 0) {
      this.logger.warn(`No matches found for today (${todayKey}).`);
      return { sent: 0, matches: 0, tokens: tokens.length, today: todayKey };
    }

    let sent = 0;

    for (const match of matches) {
      const matchDate = parseMatchDate(match.timestampUtc) || new Date();
      const localTimeStr = matchDate.toLocaleTimeString('en-US', {
        timeZone: this.testNotificationTimeZone,
        hour: '2-digit',
        minute: '2-digit',
      });
      const homeFlag = getFlag(match.homeTeam);
      const awayFlag = getFlag(match.awayTeam);
      const homeDisplay = homeFlag ? `${homeFlag} ${match.homeTeam}` : match.homeTeam;
      const awayDisplay = awayFlag ? `${awayFlag} ${match.awayTeam}` : match.awayTeam;
      const title = '[TEST] Today Match Alert';
      const body = `${homeDisplay} vs ${awayDisplay} ⚽\n⏰ ${localTimeStr} IST`;

      const targetTokens = tokens.filter((token) =>
        tokenWantsMatch(token.preferences, match.homeTeam, match.awayTeam),
      );

      const results = await Promise.allSettled(
        targetTokens.map((token) => this.firebase.send(token.token, title, body)),
      );
      sent += results.filter((result) => result.status === 'fulfilled').length;
    }

    return {
      sent,
      matches: matches.length,
      tokens: tokens.length,
      today: todayKey,
    };
  }

  async subcribe(token: string, preferences?: NotificationPreferences | null) {
    if (!token) return false;

    const normalizedPreferences = normalizePreferences(preferences);

    // Check if we already saved this token
    const existing = await this.tokenRepo.findOne({ where: { token } });

    if (existing) {
      existing.preferences = normalizedPreferences;
      await this.tokenRepo.save(existing);
    } else {
      const newToken = this.tokenRepo.create({
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        token,
        preferences: normalizedPreferences,
      });
      await this.tokenRepo.save(newToken);
      this.logger.log(`New FCM Token subscribed: ${token}`);
    }

    return true;
  }
  async sendTest(token: string) {
    return this.firebase.send(token, '⚽ FIFA TEST', 'Backend works');
  }

  async sendDeviceTestNotifications(token: string, type?: TestNotificationType) {
    if (!token) {
      return { sent: 0, token: false };
    }

    const entries = type
      ? [[type, TEST_NOTIFICATIONS[type]] as const]
      : (Object.entries(TEST_NOTIFICATIONS) as [
          TestNotificationType,
          { title: string; body: string },
        ][]);

    const results = await Promise.allSettled(
      entries.map(([notificationType, notification]) =>
        this.firebase.send(
          token,
          notification.title,
          `${notification.body}\nType: ${notificationType}`,
        ),
      ),
    );

    return {
      sent: results.filter((result) => result.status === 'fulfilled').length,
      total: entries.length,
      token: true,
      types: entries.map(([notificationType]) => notificationType),
    };
  }
}
