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

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    VenuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
