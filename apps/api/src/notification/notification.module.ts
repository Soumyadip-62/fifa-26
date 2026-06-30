import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscribedTokens } from './entities/notification.entity';
import { MatchEntity } from '../matches/entities/matches.entity';
import { TeamEntity } from '../teams/entitites/teams.entity';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  imports: [
    FirebaseModule,
    TypeOrmModule.forFeature([SubscribedTokens, MatchEntity, TeamEntity]),
  ],
})
export class NotificationModule {}
