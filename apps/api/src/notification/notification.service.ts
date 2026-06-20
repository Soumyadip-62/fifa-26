import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { FirebaseService } from 'src/firebase/firebase.service';
import { SubscribedTokens } from './entities/notification.entity';
import { MatchEntity } from '../matches/entities/matches.entity';
import { Repository } from 'typeorm';

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

    // 2. Find matches starting between 25 and 30 minutes from now (so we only notify once per match)
    const matchesToNotify = upcomingMatches.filter((m) => {
      if (!m.timestampUtc) return false;
      const matchTime = new Date(m.timestampUtc).getTime();
      const diff = matchTime - nowMs;
      return diff > twentyFiveMinsMs && diff <= thirtyMinsMs;
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
        hour: '2-digit',
        minute: '2-digit',
      });
      const title = `Next Match Starts at ${localTimeStr}! ⚽`;
      const body = `${match.homeTeam} vs ${match.awayTeam}`;

      this.logger.log(
        `Sending notification for: ${body} to ${tokens.length} users.`,
      );

      const promises = tokens.map((t) =>
        this.firebase.send(t.token, title, body),
      );
      await Promise.allSettled(promises);
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
