import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatchesModule } from './matches/matches.module';
import { SearchModule } from './search/search.module';
import { NewsModule } from './news/news.module';
import { TeamsModule } from './teams/teams.module';
import { HistoryModule } from './history/history.module';
import { PlayersModule } from './players/players.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesModule } from './venues/venues.module';
import { PointsTableModule } from './points-table/points-table.module';
import { TeamEntity } from './teams/entitites/teams.entity';
import { MatchEntity } from './matches/entities/matches.entity';
import { HistoricalMatchEntity } from './history/entities/history.entity';
import { TournamentEntity } from './history/entities/tournament.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    MatchesModule,
    SearchModule,
    NewsModule,
    TeamsModule,
    HistoryModule,
    PlayersModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        TeamEntity,
        MatchEntity,
        HistoricalMatchEntity,
        TournamentEntity,
      ],
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    VenuesModule,
    PointsTableModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotificationService],
})
export class AppModule {}
