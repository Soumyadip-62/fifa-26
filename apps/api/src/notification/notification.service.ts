import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly firebase: FirebaseService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  sendNotifications() {
    this.logger.log('Keeping the server alive.....');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendMatchNotification() {
    console.log('inside test notification');

    return await this.firebase.send(
      'cXIVtr16WmD2qfCS_x37iS:APA91bEfNYgi5Ki31tzm4Hl8NZf12ds-rqZctHohjSaLgRFVseEiRi4DTfDHdNDAHfxu0vmRJNVzfAAOWB9-TKCZSfdrbJACRlVq8x6FThdIHx2dWd9piMI',
      'Match Starts in Next 30 Mins',
      'Arg vs Bra',
    );
  }

  subcribe(token: string) {
    console.log(token);
    return true;
  }
  async sendTest(token: string) {
    return this.firebase.send(token, '⚽ FIFA TEST', 'Backend works');
  }
}
