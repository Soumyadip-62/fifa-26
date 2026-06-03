import { Controller, Get, Param } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get(':id')
  async getPlayerByID(@Param('id') id: string) {
    return this.playersService.findPLayerDataByID(id);
  }
}
