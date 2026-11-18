const fs = require('node:fs');
const path = 'apps/api/src/points-table/points-table.service.ts';
let s = fs.readFileSync(path, 'utf8');
const start = s.indexOf('  async getStandings(): Promise<any> {');
const end = s.indexOf('  // @Cron', start);
if (start < 0 || end < 0) throw Error('Standings method not found');
s = s.slice(0, start) + `  async getStandings(): Promise<any> {
    const data = await this.tournaments.resource('world-cup', 'standings', 2026);
    this.enrichStandings(data);
    await this.enrichStandingsWithQualifications(data);
    return data;
  }

` + s.slice(end);
const fallback = s.indexOf('  private calculateLocalStandings(): any {');
if (fallback < 0) throw Error('Static fallback not found');
s = s.slice(0, fallback) + '}\n';
s = s.replace(/  private cache: any = null;\r?\n  private lastFetched = 0;\r?\n  private readonly CACHE_TTL = 60 \* 1000;[^\r\n]*\r?\n/, '');
s = s.replace(/    this.cache = null;\r?\n    this.lastFetched = 0;\r?\n/, '');
s = s.replace("this.fetchFootballData('/competitions/WC/standings')", "this.tournaments.resource('world-cup', 'standings', 2026)");
fs.writeFileSync(path, s);
