import { Controller, Get, Param } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getLatestNews() {
    return this.newsService.getLatestNews();
  }

  @Get('competitions/:competitionId')
  getCompetitionNews(@Param('competitionId') id: string) {
    return this.newsService.getCompetitionNews(id);
  }

  @Get(':keywords')
  getNewsByKeywords(@Param('keywords') keywords: string) {
    return this.newsService.getNewsByKeywords(keywords);
  }
}
