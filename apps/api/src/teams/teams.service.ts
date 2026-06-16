import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { URL } from 'url';
import { TeamEntity } from './entitites/teams.entity';
import { Repository } from 'typeorm';

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

// create player type
export type Player = {
  id: string;
  name: string;
  position: string;
  age: number;
  nationality: string;
  team: Team;
  idPlayer: string;
  idTeam: string;
  idTeam2: string | null;
  idTeamNational: string | null;
  idAPIfootball: string | null;
  idPlayerManager: string | null;
  idWikidata: string | null;
  idTransferMkt: string | null;
  idESPN: string | null;
  strNationality: string | null;
  strPlayer: string;
  strPlayerAlternate: string | null;
  strTeam: string | null;
  strTeam2: string | null;
  strSport: string;
  intSoccerXMLTeamID: string | null;
  dateBorn: string | null;
  dateDied: string | null;
  strNumber: string | null;
  dateSigned: string | null;
  strSigning: string | null;
  strWage: string | null;
  strOutfitter: string | null;
  strKit: string | null;
  strAgent: string | null;
  strBirthLocation: string | null;
  strDeathLocation: string | null;
  strEthnicity: string | null;
  strStatus: string | null;
  strDescriptionEN: string | null;
  strDescriptionDE: string | null;
  strDescriptionFR: string | null;
  strDescriptionCN: string | null;
  strDescriptionIT: string | null;
  strDescriptionJP: string | null;
  strDescriptionRU: string | null;
  strDescriptionES: string | null;
  strDescriptionPT: string | null;
  strDescriptionSE: string | null;
  strDescriptionNL: string | null;
  strDescriptionHU: string | null;
  strDescriptionNO: string | null;
  strDescriptionIL: string | null;
  strDescriptionPL: string | null;
  strGender: string | null;
  strSide: string | null;
  strPosition: string | null;
  strCollege: string | null;
  strFacebook: string | null;
  strWebsite: string | null;
  strTwitter: string | null;
  strInstagram: string | null;
  strYoutube: string | null;
  strHeight: string | null;
  strWeight: string | null;
  intLoved: string | null;
  strThumb: string | null;
  strPoster: string | null;
  strCutout: string | null;
  strCartoon: string | null;
  strRender: string | null;
  strBanner: string | null;
  strFanart1: string | null;
  strFanart2: string | null;
  strFanart3: string | null;
  strFanart4: string | null;
  strCreativeCommons: string | null;
  strLocked: string | null;
  strLastName: string | null;
};

type Response = {
  players: Player[];
};

@Injectable()
export class TeamsService {
  private readonly apiurl = process.env.THESPORTSDB_API_URL;

  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
  ) {}
  async getTeams() {
    return this.teamRepository.find();
  }
  async getTeamPlayersById(id: string): Promise<Response | undefined> {
    if (!this.apiurl) {
      return Promise.reject(new Error('API URL is not defined'));
    }

    const url = new URL(`lookup_all_players.php?id=${id}`, this.apiurl);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`News API request failed with status ${response.status}`);
    }

    const data: unknown = await response.json();

    return data as Response;
  }
  async getTeamDataById(id: string): Promise<Response | undefined> {
    if (!this.apiurl) {
      return Promise.reject(new Error('API URL is not defined'));
    }

    const url = new URL(`lookupteam.php?id=${id}`, this.apiurl);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`News API request failed with status ${response.status}`);
    }

    const data: unknown = await response.json();

    return data as Response;
  }
}
