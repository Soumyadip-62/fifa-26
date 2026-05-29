import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('matches')
  searchMatchesByTeam(@Query('team') team = '') {
    return this.searchService.searchMatchesByTeam(team);
  }
}
