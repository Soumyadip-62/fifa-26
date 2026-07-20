import { Body, Controller, Headers, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { assertAdminSecret } from '../common/admin-auth';

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
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body()
    body: {
      token: string;
    },
  ) {
    assertAdminSecret(headers);
    return this.notificationService.sendTest(body.token);
  }

  @Post('test/today-matches')
  sendTodayMatchesTest(
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    assertAdminSecret(headers);
    return this.notificationService.sendTodayMatchNotificationsForTesting();
  }

  @Post('test/device')
  sendDeviceTests(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body()
    body: {
      token: string;
      type?: 'kickoff30' | 'kickoff10' | 'finalScore' | 'qualification';
    },
  ) {
    assertAdminSecret(headers);
    return this.notificationService.sendDeviceTestNotifications(
      body.token,
      body.type,
    );
  }
}
