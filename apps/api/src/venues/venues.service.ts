import { Injectable } from '@nestjs/common';

@Injectable()
export class VenuesService {
  private readonly apiUrl = process.env.THESPORTSDB_API_URL || 'https://www.thesportsdb.com/api/v1/json/123/';

  async searchVenues(name: string) {
    const url = new URL('searchvenues.php', this.apiUrl);
    url.searchParams.set('v', name);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SportsDB API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async lookupVenue(id: string) {
    const url = new URL('lookupvenue.php', this.apiUrl);
    url.searchParams.set('id', id);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SportsDB API request failed: ${response.statusText}`);
    }
    return response.json();
  }
}
