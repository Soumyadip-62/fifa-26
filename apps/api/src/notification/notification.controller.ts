import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('subscribe')
  subscribe(@Body() body: { fcmToken: string }) {
    return this.notificationService.subcribe(body.fcmToken);
  }

  @Post('test')
  testSendNotification(
    @Body() body: { token: string; title: string; body: string },
  ) {
    return this.notificationService;
  }
}
