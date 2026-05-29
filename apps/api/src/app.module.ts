import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatchesModule } from './matches/matches.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [MatchesModule, SearchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
