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

@Module({
  imports: [MatchesModule, SearchModule, NewsModule, TeamsModule, HistoryModule, PlayersModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
