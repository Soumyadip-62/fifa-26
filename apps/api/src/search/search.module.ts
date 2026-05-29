import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [MatchesModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
