import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

// create type for teams
export type Team = {
  //    create type from below object
  name: string;
  continent: string;
  flag_icon: string;
  flag_unicode: string;
  fifa_code: string;
  group: string;
  confed: string;
  image_url: string | null;
  sportsdb_team_id: string;
};

@Injectable()
export class TeamsService {
  private readonly teams: Team[] = [];

  constructor() {
    const teamsPath = join(process.cwd(), 'fifa-data', 'teams-data.json');
    const teams = JSON.parse(readFileSync(teamsPath, 'utf8')) as Team[];

    this.teams = teams;
  }
  getTeams() {
    return this.teams;
  }
}
