import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { FirebaseService } from 'src/firebase/firebase.service';
import { SubscribedTokens } from './entities/notification.entity';
import { MatchEntity } from '../matches/entities/matches.entity';
import { Repository } from 'typeorm';

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

function getFlag(teamName: string): string {
  if (!teamName) return '';
  return TEAM_FLAGS[teamName] || '';
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

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
    const twentyFiveMinsMs = 25 * 60 * 1000;

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

      const promises = tokens.map((t) =>
        this.firebase.send(t.token, title, body),
      );
      await Promise.allSettled(promises);

      // Mark as notified in DB
      match.isNotified = true;
      await this.matchRepo.save(match);
    }
  }

  async subcribe(token: string) {
    if (!token) return false;

    // Check if we already saved this token
    const existing = await this.tokenRepo.findOne({ where: { token } });

    if (!existing) {
      const newToken = this.tokenRepo.create({
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        token,
      });
      await this.tokenRepo.save(newToken);
      this.logger.log(`New FCM Token subscribed: ${token}`);
    }

    return true;
  }
  async sendTest(token: string) {
    return this.firebase.send(token, '⚽ FIFA TEST', 'Backend works');
  }
}
