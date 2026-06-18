import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  //   private readonly token = '';

  @Cron(CronExpression.EVERY_30_MINUTES)
  sendNotifications() {
    this.logger.log('Sending notifications.....');
  }

  subcribe(token: string) {
    console.log(token);
    return true;
  }
  testNotification() {}
}
