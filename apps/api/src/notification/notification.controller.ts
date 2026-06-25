import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('subscribe')
  subscribe(
    @Body()
    body: {
      fcmToken: string;
      preferences?: {
        favoriteTeams?: string[];
        kickoff30?: boolean;
        kickoff10?: boolean;
        finalScore?: boolean;
        qualification?: boolean;
      };
    },
  ) {
    return this.notificationService.subcribe(body.fcmToken, body.preferences);
  }

  @Post('test')
  send(
    @Body()
    body: {
      token: string;
    },
  ) {
    return this.notificationService.sendTest(body.token);
  }

  @Post('test/today-matches')
  sendTodayMatchesTest() {
    return this.notificationService.sendTodayMatchNotificationsForTesting();
  }

  @Post('test/device')
  sendDeviceTests(
    @Body()
    body: {
      token: string;
      type?: 'kickoff30' | 'kickoff10' | 'finalScore' | 'qualification';
    },
  ) {
    return this.notificationService.sendDeviceTestNotifications(
      body.token,
      body.type,
    );
  }
}
