import { Controller, Get } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('finals')
  getAllFinals() {
    return this.historyService.getAllFinals();
  }
}
