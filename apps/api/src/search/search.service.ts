import { Injectable } from '@nestjs/common';
import { MatchesService } from '../matches/matches.service';

@Injectable()
export class SearchService {
  constructor(private readonly matchesService: MatchesService) {}

  searchMatchesByTeam(team: string) {
    const normalizedTeam = normalize(team);

    if (!normalizedTeam) {
      return [];
    }

    return this.matchesService
      .findAll()
      .filter(
        (match) =>
          normalize(match.homeTeam).includes(normalizedTeam) ||
          normalize(match.awayTeam).includes(normalizedTeam),
      );
  }
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
