import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player } from 'src/teams/teams.service';

@Module({
  controllers: [PlayersController],
  providers: [PlayersService],
})
export class PlayersModule {
  private readonly player: Player[] = [];
  private readonly apiurl = process.env.THESPORTSDB_API_URL;
}
