import { Injectable } from '@nestjs/common';
import { Player } from 'src/teams/teams.service';

type PlayerResponse = {
  players: Player[];
};

@Injectable()
export class PlayersService {
  private readonly players: Player[] = [];
  private readonly apiurl = process.env.THESPORTSDB_API_URL;

  async findPLayerDataByID(id: string) {
    if (!this.apiurl) {
      throw new Error('API URL is not defined');
    }

    const url = new URL(`lookupplayer.php?id=${id}`, this.apiurl);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('Failed to fetch player data');
    }

    const data = (await response.json()) as PlayerResponse;
    return data.players[0];
  }
}
