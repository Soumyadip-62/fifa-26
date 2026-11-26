import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import type {
  Competition,
  CompetitionId,
  FootballMatch,
  FootballNews,
  FootballPlayer,
  FootballSnapshot,
  FootballTeam,
  MatchDetails,
  Stadium,
  CatalogKind,
} from '../../../../packages/football-contracts';
import {
  TournamentFixtureEntity,
  TournamentSeasonEntity,
  TournamentResourceCacheEntity,
} from '../tournaments/tournament.entities';
import { MatchEntity } from '../matches/entities/matches.entity';
import {
  TournamentsService,
  validateMatch,
} from '../tournaments/tournaments.service';
import { FootballDataClient } from '../football-data/football-data.client';
import { NewsService } from '../news/news.service';
import { matchAvailability, matchMetadata } from './match-metadata';
import { matchNewsRelevance, matchNewsSearch } from '../news/match-news';
import { FootballReadCache, matchCacheTtl } from './football-cache';
import { MatchPageReader, type MatchPageQuery } from './football.match-page';
import type {
  TournamentId,
  ProviderMatch,
} from '../tournaments/provider.types';
import {
  entityId,
  status,
  resultsFor,
  bracketFor,
  safeUrl,
} from './football.model';

type Json = Record<string, unknown>;
const obj = (v: unknown): Json =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : {};
const str = (v: unknown, fallback = '') =>
  typeof v === 'string' ? v : fallback;
const num = (v: unknown) =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;
const rows = (v: unknown): Json[] => (Array.isArray(v) ? v.map(obj) : []);
const ids: CompetitionId[] = ['premier-league', 'la-liga', 'ucl', 'bundesliga'];
const clubAliases: Record<number, string> = {
  57: 'arsenal',
  61: 'chelsea',
  64: 'liverpool',
  81: 'barcelona',
  78: 'atletico-madrid',
  86: 'real-madrid',
  5: 'bayern-munich',
  4: 'borussia-dortmund',
  108: 'inter-milan',
  3: 'bayer-leverkusen',
};

@Injectable()
export class FootballService {
  private readonly readCache = new FootballReadCache();
  private readonly matchPageReader: MatchPageReader;
  constructor(
    private readonly db: DataSource,
    private readonly tournaments: TournamentsService,
    private readonly news: NewsService,
    private readonly provider: FootballDataClient,
  ) {
    this.matchPageReader = new MatchPageReader(db);
  }
  competitionId(value: string): CompetitionId {
    if (!ids.includes(value as CompetitionId))
      throw new NotFoundException('Competition not supported.');
    return value as CompetitionId;
  }
  season(value?: string) {
    return this.tournaments.seasonYear(value);
  }
  async seasons(id: string) {
    this.competitionId(id);
    return (
      await this.db
        .getRepository(TournamentSeasonEntity)
        .find({ where: { competitionId: id }, order: { season: 'DESC' } })
    ).map((r) => r.season);
  }
  async backfill() {
    const runner = this.db.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.query(
        "SELECT pg_advisory_xact_lock(hashtext('football:catalog'))",
      );
      const seasons = await runner.manager
        .getRepository(TournamentSeasonEntity)
        .find({ order: { season: 'DESC' } });
      const catalog = new Map<
        string,
        { id: string; kind: string; providerKey: string; payload: Json }
      >();
      const aliases: { kind: string; alias: string; entityId: string }[] = [];
      const memberships = new Map<
        string,
        {
          entityId: string;
          competitionId: string;
          season: number;
          teamId: string | null;
        }
      >();
      const add = (
        kind: string,
        provider: string,
        key: string | number,
        payload: Json,
        competitionId: string,
        season: number,
        teamId: string | null = null,
      ) => {
        const id = entityId(kind, provider, key),
          existing = catalog.get(id);
        catalog.set(id, {
          id,
          kind,
          providerKey: `${provider}:${key}`,
          payload: existing
            ? {
                ...payload,
                ...existing.payload,
                competitionIds: [
                  ...new Set([
                    ...((existing.payload.competitionIds as string[]) ?? []),
                    competitionId,
                  ]),
                ],
              }
            : { ...payload, id, competitionIds: [competitionId] },
        });
        aliases.push({ kind, alias: `${provider}:${key}`, entityId: id });
        memberships.set(`${id}:${competitionId}:${season}`, {
          entityId: id,
          competitionId,
          season,
          teamId,
        });
        return id;
      };
      for (const s of seasons)
        for (const raw of s.teams) {
          if (raw.id == null) continue;
          const t = obj(raw),
            tid = entityId('teams', 'football-data', raw.id);
          const venue = str(t.venue);
          const vid = venue
            ? entityId('stadiums', 'football-data', raw.id)
            : '';
          add(
            'teams',
            'football-data',
            raw.id,
            {
              name: raw.name,
              shortName: raw.shortName ?? raw.name,
              country: raw.area?.name ?? '',
              city: '',
              coach: str(obj(t.coach).name),
              founded: num(t.founded),
              logoUrl: raw.crest ?? '',
              stadiumId: vid,
              position: null,
              form: [],
              stats: resultsFor(tid, []).stats,
              providerIds: { footballData: raw.id },
              biography: null,
              website: safeUrl(t.website),
            },
            s.competitionId,
            s.season,
          );
          aliases.push({ kind: 'teams', alias: String(raw.id), entityId: tid });
          if (clubAliases[raw.id])
            aliases.push({
              kind: 'teams',
              alias: clubAliases[raw.id],
              entityId: tid,
            });
          if (vid)
            add(
              'stadiums',
              'football-data',
              raw.id,
              {
                name: venue,
                city: '',
                country: raw.area?.name ?? '',
                capacity: null,
                homeTeamId: tid,
                imageUrl: '/assets/images/stadiums/default-stadium.svg',
              },
              s.competitionId,
              s.season,
              tid,
            );
          for (const p of rows(t.squad)) {
            if (num(p.id) == null || !str(p.name)) continue;
            const birth = Date.parse(str(p.dateOfBirth)),
              age = Number.isFinite(birth)
                ? Math.floor((Date.now() - birth) / 31557600000)
                : null;
            const position = str(p.position).toLowerCase();
            add(
              'players',
              'football-data',
              p.id as number,
              {
                name: p.name,
                teamId: tid,
                nationality: str(p.nationality),
                position: /keeper/.test(position)
                  ? 'Goalkeeper'
                  : /back|defen/.test(position)
                    ? 'Defender'
                    : /midfield/.test(position)
                      ? 'Midfielder'
                      : /offence|wing|forward|attack/.test(position)
                        ? 'Forward'
                        : null,
                shirtNumber: num(p.shirtNumber),
                age,
                height: '',
                preferredFoot: null,
                imageUrl: '',
                providerIds: { footballData: p.id },
                stats: {
                  appearances: null,
                  minutes: null,
                  goals: null,
                  assists: null,
                  shots: null,
                  shotsOnTarget: null,
                  passes: null,
                  passAccuracy: null,
                  tackles: null,
                  cards: null,
                },
              },
              s.competitionId,
              s.season,
              tid,
            );
          }
        }
      await runner.query(
        `INSERT INTO football_catalog(id,kind,"providerKey",payload) SELECT id::uuid,kind,"providerKey",payload FROM jsonb_to_recordset($1::jsonb) AS x(id text,kind text,"providerKey" text,payload jsonb) ON CONFLICT(id) DO UPDATE SET payload=EXCLUDED.payload,"updatedAt"=now()`,
        [JSON.stringify([...catalog.values()])],
      );
      const slug = (value: string) =>
        value
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      for (const c of catalog.values()) {
        if (c.kind === 'players')
          aliases.push({
            kind: c.kind,
            alias: slug(str(c.payload.name)),
            entityId: c.id,
          });
      }
      // Only unique aliases are accepted; shared/ambiguous aliases remain unresolved.
      const verified = new Map<string, (typeof aliases)[number]>(),
        ambiguous = new Set<string>();
      for (const a of aliases) {
        const k = `${a.kind}:${a.alias}`;
        if (verified.has(k) && verified.get(k)!.entityId !== a.entityId)
          ambiguous.add(k);
        else verified.set(k, a);
      }
      await runner.query(
        `INSERT INTO football_aliases(kind,alias,"entityId") SELECT kind,alias,"entityId"::uuid FROM jsonb_to_recordset($1::jsonb) AS x(kind text,alias text,"entityId" text) ON CONFLICT(kind,alias) DO UPDATE SET "entityId"=EXCLUDED."entityId"`,
        [
          JSON.stringify(
            [...verified].filter(([k]) => !ambiguous.has(k)).map(([, v]) => v),
          ),
        ],
      );
      await runner.query(
        `INSERT INTO football_memberships("entityId","competitionId",season,"teamId") SELECT "entityId"::uuid,"competitionId",season,"teamId"::uuid FROM jsonb_to_recordset($1::jsonb) AS x("entityId" text,"competitionId" text,season int,"teamId" text) ON CONFLICT("entityId","competitionId",season) DO UPDATE SET "teamId"=EXCLUDED."teamId"`,
        [JSON.stringify([...memberships.values()])],
      );
      await runner.commitTransaction();
      return {
        catalog: catalog.size,
        memberships: memberships.size,
        archives: 0,
      };
    } finally {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      await runner.release();
    }
  }
  async snapshot(
    competitionId?: string,
    season?: number,
  ): Promise<FootballSnapshot> {
    if (competitionId) this.competitionId(competitionId);
    const key = `snapshot:${competitionId ?? 'all'}:${season ?? 'latest'}`;
    return this.readCache.get(
      key,
      (data: FootballSnapshot) => {
        const now = Date.now();
        const nearMatch = data.matches.some((match) => {
          const kickoff = Date.parse(match.kickoff);
          return (
            match.status === 'live' ||
            (kickoff >= now - 4 * 60 * 60_000 && kickoff <= now + 15 * 60_000)
          );
        });
        const nextKickoff = Math.min(
          ...data.matches
            .filter((match) => match.status === 'upcoming')
            .map((match) => Date.parse(match.kickoff))
            .filter((kickoff) => kickoff > now),
          Infinity,
        );
        const ttl = nearMatch
          ? matchCacheTtl.live
          : Math.min(
              matchCacheTtl.snapshot,
              Math.max(30_000, nextKickoff - now),
            );
        return ttl;
      },
      () => this.loadSnapshot(competitionId, season),
    );
  }
  matchPage(query: MatchPageQuery) {
    return this.matchPageReader.get(query);
  }
  invalidateSnapshots() {
    this.readCache.clear();
    this.matchPageReader.clear();
  }
  private async loadSnapshot(
    competitionId?: string,
    season?: number,
  ): Promise<FootballSnapshot> {
    const allSeasons = await this.db
      .getRepository(TournamentSeasonEntity)
      .find({ order: { season: 'DESC' } });
    const selected = new Map<string, TournamentSeasonEntity>();
    for (const s of allSeasons)
      if (
        (season === undefined || s.season === season) &&
        !selected.has(s.competitionId)
      )
        selected.set(s.competitionId, s);
    const activeSeasons = [...selected.values()].filter(
      (s) =>
        ids.includes(s.competitionId as CompetitionId) &&
        (!competitionId || s.competitionId === competitionId),
    );
    const competitions: Competition[] = [
      ...ids.map((id) => {
        const s = selected.get(id);
        return {
          id,
          name: id === 'la-liga' ? 'La Liga' : (s?.competition.name ?? id),
          shortName:
            id === 'la-liga'
              ? 'La Liga'
              : id === 'ucl'
                ? 'UCL'
                : (s?.competition.name ?? id),
          region: s?.competition.area.name ?? '',
          season: s
            ? `${s.season}/${String(s.competition.currentSeason.endDate).slice(2, 4)}`
            : 'Unavailable',
          format: id === 'ucl' ? 'League phase + knockout' : 'League',
          accent: 'violet',
          hasBracket: id === 'ucl',
          emblem: s?.competition.emblem,
          currentMatchday: s?.competition.currentSeason.currentMatchday,
        };
      }),
    ];
    const [catalog, members, club] = (await Promise.all([
      this.db.query(
        'SELECT id,kind,payload FROM football_catalog WHERE EXISTS (SELECT 1 FROM football_memberships m WHERE m."entityId"=football_catalog.id AND m."competitionId"=ANY($1::text[]))',
        [ids],
      ),
      this.db.query(
        'SELECT * FROM football_memberships WHERE "competitionId"=ANY($1::text[])',
        [ids],
      ),
      activeSeasons.length
        ? this.db.getRepository(TournamentFixtureEntity).find({
            where: activeSeasons.map((s) => ({
              competitionId: s.competitionId,
              season: s.season,
            })),
            order: { kickoff: 'ASC' },
          })
        : Promise.resolve([]),
    ])) as [
      Array<{ id: string; kind: string; payload: Json }>,
      Array<{
        entityId: string;
        competitionId: string;
        season: number;
        teamId: string | null;
      }>,
      TournamentFixtureEntity[],
    ];
    const active = (id: string, year: number) =>
      ids.includes(id as CompetitionId) &&
      (!competitionId || competitionId === id) &&
      selected.get(id)?.season === year;
    const memberships = members.filter((m) =>
      active(m.competitionId, m.season),
    );
    const visible = new Set(memberships.map((m) => m.entityId));
    const teams = catalog
      .filter((c) => c.kind === 'teams' && visible.has(c.id))
      .map(
        (c) =>
          ({
            ...c.payload,
            id: c.id,
            competitionIds: [
              ...new Set(
                memberships
                  .filter((m) => m.entityId === c.id)
                  .map((m) => m.competitionId),
              ),
            ],
          }) as FootballTeam,
      );
    const players = catalog
      .filter((c) => c.kind === 'players' && visible.has(c.id))
      .map(
        (c) =>
          ({
            ...c.payload,
            id: c.id,
            teamId:
              memberships.find((m) => m.entityId === c.id)?.teamId ??
              c.payload.teamId,
          }) as FootballPlayer,
      );
    const stadiums = catalog
      .filter((c) => c.kind === 'stadiums' && visible.has(c.id))
      .map((c) => ({ ...c.payload, id: c.id }) as Stadium);
    const matches: FootballMatch[] = club
      .filter((f) => active(f.competitionId, f.season))
      .map((f) => this.clubMatch(f));
    for (const match of matches) {
      const venues = stadiums.filter((v) => v.name === match.venueName);
      match.stadiumId = venues.length === 1 ? venues[0].id : '';
    }
    const errors: FootballSnapshot['errors'] = {};
    for (const id of ids)
      if (
        (!competitionId || id === competitionId) &&
        !matches.some((m) => m.competitionId === id)
      )
        errors[id] =
          'This season has not been imported or has no published fixtures.';
    for (const t of teams) Object.assign(t, resultsFor(t.id, matches));
    if (competitionId) {
      const year = selected.get(competitionId)?.season;
      const cached = year
        ? await this.db
            .getRepository(TournamentResourceCacheEntity)
            .findOneBy({ key: `${competitionId}:${year}:scorers` })
        : null;
      for (const r of rows(cached?.payload.scorers)) {
        const player = players.find(
          (p) =>
            p.id ===
            entityId('players', 'football-data', Number(obj(r.player).id)),
        );
        if (player)
          Object.assign(player.stats, {
            goals: num(r.goals),
            assists: num(r.assists),
            appearances: num(r.playedMatches),
          });
      }
    }
    return {
      competitions: competitions.filter(
        (c) => !competitionId || c.id === competitionId,
      ),
      teams,
      players,
      stadiums,
      matches: matches.sort((a, b) => a.kickoff.localeCompare(b.kickoff)),
      news: [],
      errors,
      availability: Object.fromEntries(
        ids
          .filter((id) => !competitionId || id === competitionId)
          .map((id) => {
            const importTime = selected.get(id)?.lastSyncedAt.getTime() ?? 0;
            const latest = Math.max(
              importTime,
              ...club
                .filter((f) => f.competitionId === id && active(id, f.season))
                .map((f) => f.observedAt?.getTime() ?? 0),
            );
            const fetchedAt = latest ? new Date(latest).toISOString() : null;
            return [
              id,
              {
                state: errors[id]
                  ? 'unavailable'
                  : fetchedAt &&
                      Date.now() - Date.parse(fetchedAt) >
                        (matches.some(
                          (m) => m.competitionId === id && m.status === 'live',
                        )
                          ? 1800000
                          : 86400000)
                    ? 'stale'
                    : 'available',
                fetchedAt,
                message: errors[id],
              },
            ];
          }),
      ),
    };
  }
  clubMatch(f: TournamentFixtureEntity): FootballMatch {
    const m = f.payload;
    return {
      id: String(f.id),
      competitionId: f.competitionId as CompetitionId,
      season: String(f.season),
      homeTeamId:
        m.homeTeam.id == null
          ? `unconfirmed-${f.id}-home`
          : entityId('teams', 'football-data', m.homeTeam.id),
      awayTeamId:
        m.awayTeam.id == null
          ? `unconfirmed-${f.id}-away`
          : entityId('teams', 'football-data', m.awayTeam.id),
      stadiumId: '',
      venueName: str(m.venue) || undefined,
      kickoff: f.kickoff.toISOString(),
      status: status(f.status),
      stage: m.stage,
      matchday: m.matchday ? `Matchday ${m.matchday}` : m.stage,
      minute:
        m.status === 'PAUSED'
          ? 'Half-time'
          : num(m.minute) === null
            ? undefined
            : `${Number(m.minute)}${num(m.injuryTime) ? `+${Number(m.injuryTime)}` : ''}'`,
      homeScore: f.score.fullTime.home,
      awayScore: f.score.fullTime.away,
      ...{
        group: m.group,
        homeLabel: m.homeTeam.name,
        awayLabel: m.awayTeam.name,
      },
    };
  }
  async resolve(kind: CatalogKind, id: string) {
    const result = await this.db.query<Array<{ id: string }>>(
      'SELECT id FROM football_catalog WHERE kind=$1 AND id::text=$2 UNION SELECT "entityId" AS id FROM football_aliases WHERE kind=$1 AND alias=$2',
      [kind, id],
    );
    if (result.length !== 1) throw new NotFoundException('Profile not found.');
    return result[0].id;
  }
  async directory(
    kind: CatalogKind,
    query: {
      competition?: string;
      season?: string;
      q?: string;
      page?: string;
      pageSize?: string;
    },
  ) {
    const data = await this.snapshot(
      query.competition,
      this.season(query.season),
    );
    const values =
      kind === 'teams'
        ? data.teams
        : kind === 'players'
          ? data.players
          : data.stadiums;
    const q = (query.q ?? '').trim().toLowerCase();
    const filtered = values.filter(
      (v) => !q || v.name.toLowerCase().includes(q),
    );
    const page = Number(query.page ?? 1),
      pageSize = Number(query.pageSize ?? 40);
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    )
      throw new BadRequestException('Invalid pagination.');
    return {
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
      availability: { state: filtered.length ? 'available' : 'empty' },
    };
  }
  async profile(kind: CatalogKind, id: string) {
    const resolved = await this.resolve(kind, id);
    const data = await this.snapshot();
    const item = data[kind === 'stadiums' ? 'stadiums' : kind].find(
      (t) => t.id === resolved,
    );
    if (!item)
      throw new NotFoundException('Profile not available in imported seasons.');
    if (kind === 'players') {
      const player = item as FootballPlayer,
        team = data.teams.find((t) => t.id === player.teamId),
        competition =
          team?.competitionIds.find((id) => id !== 'ucl') ??
          team?.competitionIds[0];
      if (competition && competition !== 'world-cup') {
        const year = (await this.seasons(competition))[0];
        const cache = await this.db
          .getRepository(TournamentResourceCacheEntity)
          .findOneBy({ key: `${competition}:${year}:scorers` });
        const entry = rows(cache?.payload.scorers).find(
          (r) =>
            entityId('players', 'football-data', Number(obj(r.player).id)) ===
            player.id,
        );
        if (entry)
          Object.assign(player, {
            stats: {
              ...player.stats,
              goals: num(entry.goals),
              assists: num(entry.assists),
              appearances: num(entry.playedMatches),
            },
            statisticsScope: { competitionId: competition, season: year },
          });
      }
    }
    return {
      item,
      availability: { state: 'available' },
      enrichment: await this.enrichment(kind, resolved),
    };
  }
  async enrichment(kind: CatalogKind, id: string) {
    const records = await this.db.query<Array<{ payload: Json }>>(
      'SELECT payload FROM football_catalog WHERE id=$1',
      [id],
    );
    const payload = records[0]?.payload,
      sd = obj(payload?.providerIds).sportsdb;
    // Never search by a loosely matched name or pass football-data IDs to SportsDB.
    if (
      (typeof sd !== 'string' && typeof sd !== 'number') ||
      !process.env.THESPORTSDB_API_KEY
    )
      return { state: 'unavailable', message: 'No verified SportsDB mapping.' };
    const key = `enrichment:${kind}:${id}`,
      repo = this.db.getRepository(TournamentResourceCacheEntity);
    const cached = await repo.findOneBy({ key });
    if (cached && cached.expiresAt.getTime() > Date.now())
      return {
        state: 'available',
        data: cached.payload,
        fetchedAt: cached.fetchedAt,
      };
    try {
      const endpoint =
        kind === 'teams'
          ? 'lookupteam'
          : kind === 'players'
            ? 'lookupplayer'
            : 'lookupvenue';
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/${process.env.THESPORTSDB_API_KEY}/${endpoint}.php?id=${encodeURIComponent(String(sd))}`,
        { signal: AbortSignal.timeout(10000) },
      );
      if (!res.ok) throw new Error();
      const raw = obj(await res.json()),
        list = rows(raw.teams ?? raw.players ?? raw.venues),
        entry = list.length === 1 ? list[0] : null;
      if (!entry) throw new Error();
      const now = new Date();
      await repo.save({
        key,
        payload: entry,
        fetchedAt: now,
        expiresAt: new Date(now.getTime() + 86400000),
      });
      return { state: 'available', data: entry, fetchedAt: now };
    } catch {
      return cached
        ? { state: 'stale', data: cached.payload, fetchedAt: cached.fetchedAt }
        : { state: 'unavailable' };
    }
  }
  async standings(id: string, season?: number) {
    const data = await this.snapshot(this.competitionId(id), season);
    if (data.errors[id as CompetitionId])
      throw new ServiceUnavailableException(data.errors[id as CompetitionId]);
    const response = await this.tournaments.resource(
      id as TournamentId | 'world-cup',
      'standings',
      season,
    );
    return {
      rows: rows((response as Json).standings)
        .filter((s) => s.type === 'TOTAL')
        .flatMap((s) =>
          rows(s.table).map((r) => ({
            competitionId: id,
            group: s.group ?? undefined,
            teamId: entityId('teams', 'football-data', Number(obj(r.team).id)),
            position: r.position,
            played: r.playedGames,
            won: r.won,
            drawn: r.draw,
            lost: r.lost,
            goalsFor: r.goalsFor,
            goalsAgainst: r.goalsAgainst,
            points: r.points,
          })),
        ),
      teams: data.teams,
      freshness: response.freshness,
      availability: { state: response.freshness.stale ? 'stale' : 'available' },
    };
  }
  async scorers(id: string, season?: number) {
    this.competitionId(id);
    if (id === 'world-cup')
      return {
        players: [],
        availability: {
          state: 'unsupported',
          message:
            'Scorer statistics are not available in the saved World Cup data.',
        },
      };
    const result = await this.tournaments.resource(
      id as TournamentId,
      'scorers',
      season,
    );
    return {
      players: rows((result as Json).scorers).map((r) => ({
        ...r,
        id: entityId('players', 'football-data', Number(obj(r.player).id)),
        teamId: entityId('teams', 'football-data', Number(obj(r.team).id)),
      })),
      freshness: result.freshness,
      availability: { state: result.freshness.stale ? 'stale' : 'available' },
    };
  }
  async bracket(id: string, season?: number) {
    const data = await this.snapshot(this.competitionId(id), season);
    return {
      rounds: bracketFor(data.matches),
      teams: data.teams,
      availability: {
        state: data.matches.length ? 'available' : 'unavailable',
      },
    };
  }
  async cachedNews(competition?: string): Promise<FootballNews[]> {
    const saved = await this.db
      .getRepository(TournamentResourceCacheEntity)
      .createQueryBuilder('cache')
      .where('cache.key LIKE :key', {
        key: competition
          ? `news:v1:competition:${competition}`
          : 'news:v1:competition:%',
      })
      .orWhere('cache.key LIKE :matches', { matches: 'news:v2:match:%' })
      .getMany();
    const unique = new Map<string, FootballNews>();
    for (const row of saved) {
      if (Date.now() - row.fetchedAt.getTime() > 86400000) continue;
      for (const a of rows(row.payload.news)) {
        const comp = (str(a.competitionId) ||
          row.key.split(':').at(-1)) as CompetitionId;
        if (!ids.includes(comp) || (competition && comp !== competition))
          continue;
        const article = this.newsPreview(a, comp);
        if (article) unique.set(article.sourceUrl!, article);
      }
    }
    return [...unique.values()].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
  }
  private newsPreview(
    a: Json,
    competitionId: CompetitionId,
  ): FootballNews | null {
    const url = safeUrl(a.url);
    if (!url) return null;
    return {
      id: str(a.id),
      slug: str(a.id),
      title: str(a.title),
      excerpt: str(a.description),
      body: '',
      competitionId,
      category: 'News',
      publishedAt: str(a.published),
      imageUrl: safeUrl(a.image) ?? '/assets/images/blogs/default-news.svg',
      sourceUrl: url,
      sourceName: new URL(url).hostname,
    };
  }
  async article(id: string) {
    const article = (await this.cachedNews()).find(
      (a) => a.id === id || a.slug === id,
    );
    if (!article)
      throw new NotFoundException(
        'Article preview has expired or was not found.',
      );
    return article;
  }
  async relatedNews(kind: 'teams' | 'matches', id: string) {
    if (kind === 'matches') {
      // This endpoint needs one fixture, not the entire player/team catalog.
      const numeric =
        /^\d+$/.test(id) &&
        Number.isSafeInteger(Number(id)) &&
        Number(id) <= 2147483647;
      const club = numeric
        ? await this.db
            .getRepository(TournamentFixtureEntity)
            .findOneBy({ id: Number(id) })
        : null;
      if (!club) throw new NotFoundException('Match not found.');
      this.competitionId(club.competitionId);
      const homeTeam = club.payload.homeTeam,
        awayTeam = club.payload.awayTeam;
      if (!homeTeam.id || !awayTeam.id || !homeTeam.name || !awayTeam.name)
        return {
          articles: [],
          availability: {
            state: 'unavailable',
            message: 'News search requires confirmed opponents.',
          },
        };
      const feed = await this.news.getMatchNews({
        id: String(club.id),
        status: club.status,
        competitionId: this.competitionId(club.competitionId) as TournamentId,
        kickoff: club.kickoff.toISOString(),
        homeTeam: {
          name: homeTeam.name,
          shortName: homeTeam.shortName ?? undefined,
        },
        awayTeam: {
          name: awayTeam.name,
          shortName: awayTeam.shortName ?? undefined,
        },
      });
      const articles = feed.news
        .map((article) =>
          this.newsPreview(
            { ...article },
            this.competitionId(club.competitionId),
          ),
        )
        .filter((article): article is FootballNews => article !== null);
      return {
        articles,
        freshness: feed.freshness,
        availability: {
          state: feed.freshness.stale
            ? 'stale'
            : articles.length
              ? 'available'
              : 'empty',
        },
      };
    }
    const data = await this.snapshot();
    let competition: CompetitionId | undefined,
      names: string[] = [];
    if (kind === 'teams') {
      const resolved = await this.resolve('teams', id),
        team = data.teams.find((t) => t.id === resolved);
      if (!team) throw new NotFoundException('Team not found.');
      competition =
        team.competitionIds.find((id) => id !== 'ucl') ??
        team.competitionIds[0];
      names = [team.name, team.shortName];
    }
    if (!competition)
      return { articles: [], availability: { state: 'unavailable' } };
    const feed = await this.news.getCompetitionNews(competition);
    const articles = (await this.cachedNews(competition))
      .filter((a) =>
        names.some(
          (n) =>
            n.length >= 3 &&
            `${a.title} ${a.excerpt}`.toLowerCase().includes(n.toLowerCase()),
        ),
      )
      .slice(0, 12);
    return {
      articles,
      freshness: feed.freshness,
      availability: {
        state: feed.freshness.stale
          ? 'stale'
          : articles.length
            ? 'available'
            : 'empty',
      },
    };
  }
  async search(query: {
    q?: string;
    competition?: string;
    season?: string;
    page?: string;
    pageSize?: string;
  }) {
    const q = (query.q ?? '').trim().toLowerCase();
    if (q.length < 2 || q.length > 120)
      throw new BadRequestException('Search must contain 2 to 120 characters.');
    const data = await this.snapshot(
      query.competition,
      this.season(query.season),
    );
    const news = await this.cachedNews(query.competition);
    const teamName = (id: string) =>
      data.teams.find((t) => t.id === id)?.name ?? '';
    const results = [
      ...data.teams.map((item) => ({
        kind: 'teams',
        item,
        text: `${item.name} ${item.country}`,
      })),
      ...data.players.map((item) => ({
        kind: 'players',
        item,
        text: `${item.name} ${item.nationality} ${teamName(item.teamId)}`,
      })),
      ...data.competitions.map((item) => ({
        kind: 'competitions',
        item,
        text: item.name,
      })),
      ...data.matches.map((item) => ({
        kind: 'matches',
        item,
        text: `${teamName(item.homeTeamId)} ${teamName(item.awayTeamId)}`,
      })),
      ...news.map((item) => ({
        kind: 'news',
        item,
        text: `${item.title} ${item.excerpt}`,
      })),
    ]
      .filter((r) => r.text.toLowerCase().includes(q))
      .map(({ kind, item }) => ({ kind, item }));
    const page = Number(query.page ?? 1),
      pageSize = Number(query.pageSize ?? 40);
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    )
      throw new BadRequestException('Invalid pagination.');
    return {
      items: results.slice((page - 1) * pageSize, page * pageSize),
      total: results.length,
      page,
      pageSize,
    };
  }
  history(year?: number): Promise<never> {
    void year;
    return Promise.reject(
      new NotFoundException('Competition history is currently unavailable.'),
    );
  }
  private async worldCupDetails(id: string) {
    const repo = this.db.getRepository(TournamentResourceCacheEntity),
      key = `wc:match:${id}`;
    let saved = await repo.findOneBy({ key });
    if (saved && saved.expiresAt.getTime() > Date.now())
      return {
        ...saved.payload,
        freshness: { fetchedAt: saved.fetchedAt.toISOString(), stale: false },
      };
    const runner = this.db.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const locked = (await runner.query(
        'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',
        [key],
      )) as Array<{ locked: boolean }>;
      if (!locked[0]?.locked) {
        if (saved)
          return {
            ...saved.payload,
            freshness: {
              fetchedAt: saved.fetchedAt.toISOString(),
              stale: true,
            },
          };
        throw new ServiceUnavailableException(
          'Match update in progress. Please try again shortly.',
        );
      }
      saved = await runner.manager
        .getRepository(TournamentResourceCacheEntity)
        .findOneBy({ key });
      if (saved && saved.expiresAt.getTime() > Date.now())
        return {
          ...saved.payload,
          freshness: { fetchedAt: saved.fetchedAt.toISOString(), stale: false },
        };
      const observedAt = new Date();
      const raw = await this.provider.get<ProviderMatch>(`/matches/${id}`, {
        unfoldLineups: true,
      });
      validateMatch(raw);
      if (
        String(raw.id) !== id ||
        raw.competition?.code !== 'WC' ||
        raw.season?.startDate.slice(0, 4) !== '2026'
      )
        throw new ServiceUnavailableException(
          'Invalid World Cup match response.',
        );
      const savedRows = (await runner.query(
        `INSERT INTO tournament_resource_cache(key,payload,"fetchedAt","expiresAt") VALUES($1,$2,$3,$3::timestamptz+interval '60 seconds') ON CONFLICT(key) DO UPDATE SET payload=EXCLUDED.payload,"fetchedAt"=EXCLUDED."fetchedAt","expiresAt"=EXCLUDED."expiresAt" WHERE tournament_resource_cache."fetchedAt"<=EXCLUDED."fetchedAt" RETURNING key`,
        [key, raw, observedAt],
      )) as unknown as Array<{ key: string }>;
      if (savedRows.length)
        await runner.query(
          `UPDATE matches SET "timestampUtc"=$2,"dateUtc"=$3,"timeUtc"=$4,"statusCode"=$5,status=$6,score=$7 WHERE id=$1`,
          [
            id,
            raw.utcDate,
            raw.utcDate.slice(0, 10),
            raw.utcDate.slice(11, 19),
            raw.status,
            status(raw.status),
            {
              ...raw.score,
              home: raw.score.fullTime.home,
              away: raw.score.fullTime.away,
            },
          ],
        );
      await runner.commitTransaction();
      return {
        ...raw,
        freshness: { fetchedAt: observedAt.toISOString(), stale: false },
      };
    } catch (error) {
      if (saved)
        return {
          ...saved.payload,
          freshness: { fetchedAt: saved.fetchedAt.toISOString(), stale: true },
        };
      throw error;
    } finally {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      await runner.release();
    }
  }
  async details(id: string): Promise<MatchDetails> {
    const fixture = /^\d+$/.test(id)
      ? await this.db
          .getRepository(TournamentFixtureEntity)
          .findOneBy({ id: Number(id) })
      : null;
    if (!fixture) throw new NotFoundException('Match not found.');
    this.competitionId(fixture.competitionId);
    let raw: Json = {},
      freshness: { fetchedAt: string; stale: boolean } | undefined;
    if (fixture) {
      const result = await this.tournaments.details(fixture.id);
      raw = obj(result);
      freshness = result.freshness;
    }
    const data = await this.snapshot();
    let match = data.matches.find((m) => m.id === id);
    if (!match) throw new NotFoundException('Match not found.');
    if (fixture)
      match = this.clubMatch({
        ...fixture,
        payload: raw as ProviderMatch,
        kickoff: new Date(str(raw.utcDate)),
        score: (raw as ProviderMatch).score,
        status: str(raw.status),
      });
    const wc = fixture
      ? null
      : await this.db.getRepository(MatchEntity).findOneBy({ id: match.id });
    const metadata = matchMetadata(
      raw,
      fixture ? obj(fixture.payload) : obj(wc),
      match.status,
    );
    match = {
      ...match,
      attendance: metadata.attendance,
      referee: metadata.referee,
    };
    const summary = (home: boolean) => {
      const tid = home ? match.homeTeamId : match.awayTeamId,
        t = data.teams.find((t) => t.id === tid),
        provider = obj(raw[home ? 'homeTeam' : 'awayTeam']);
      return {
        id: tid,
        name:
          t?.name ??
          str(
            provider.name,
            (
              match as FootballMatch & {
                homeLabel?: string;
                awayLabel?: string;
              }
            )[home ? 'homeLabel' : 'awayLabel'] ?? 'Team to be confirmed',
          ),
        shortName: t?.shortName ?? str(provider.shortName, 'TBC'),
        logoUrl: t?.logoUrl ?? str(provider.crest),
        coach: str(obj(provider.coach).name, t?.coach ?? ''),
      };
    };
    const homeTeam = summary(true),
      awayTeam = summary(false),
      events: MatchDetails['events'] = [];
    for (const [key, type] of [
      ['goals', 'goal'],
      ['bookings', 'yellow'],
      ['substitutions', 'substitution'],
    ] as const)
      for (const [i, e] of rows(raw[key]).entries())
        events.push({
          id: `${id}:${key}:${i}`,
          matchId: match.id,
          minute: `${num(e.minute) ?? ''}${num(e.injuryTime) ? `+${Number(e.injuryTime)}` : ''}'`,
          type: key === 'bookings' && /RED/.test(str(e.card)) ? 'red' : type,
          teamId:
            num(obj(e.team).id) == null
              ? undefined
              : entityId('teams', 'football-data', Number(obj(e.team).id)),
          label: str(
            obj(e.scorer ?? e.player ?? e.playerIn).name,
            key === 'substitutions' ? 'Substitution' : 'Match event',
          ),
          detail:
            key === 'substitutions'
              ? `Replaced ${str(obj(e.playerOut).name)}`
              : str(e.card ?? e.type),
        });
    const lineups: MatchDetails['lineups'] = [
      ['homeTeam', homeTeam],
      ['awayTeam', awayTeam],
    ].flatMap(([key, t]) => {
      const r = obj(raw[key as string]);
      return rows(r.lineup).length
        ? [
            {
              matchId: match.id,
              teamId: (t as typeof homeTeam).id,
              formation: str(r.formation, 'Unavailable'),
              coach: str(obj(r.coach).name, 'Unavailable'),
              starters: rows(r.lineup).map((p) => str(p.name)),
              substitutes: rows(r.bench).map((p) => str(p.name)),
            },
          ]
        : [];
    });
    const hs = obj(obj(raw.homeTeam).statistics),
      as = obj(obj(raw.awayTeam).statistics);
    const stats: MatchDetails['stats'] = Object.keys(hs)
      .filter((k) => num(hs[k]) !== null && num(as[k]) !== null)
      .map((k) => ({
        label: k.replace(/([A-Z])/g, ' $1'),
        home: Number(hs[k]),
        away: Number(as[k]),
      }));
    if (!fixture && wc?.goals)
      for (const [i, e] of rows(wc.goals).entries())
        events.push({
          id: `${id}:goal:${i}`,
          matchId: match.id,
          minute: String(num(e.minute) ?? ''),
          type: 'goal',
          label: str(obj(e.scorer).name, str(e.name, 'Goal')),
        });
    const venues = metadata.venue.confirmed
      ? data.stadiums.filter(
          (stadium) =>
            stadium.name.trim().toLowerCase() ===
            metadata.venue.name!.toLowerCase(),
        )
      : [];
    const catalogVenue =
      venues.find((stadium) => stadium.id === match.stadiumId) ??
      (venues.length === 1 ? venues[0] : undefined);
    const detailedMatch = {
      ...match,
      stadiumId: catalogVenue?.id ?? '',
      venueName: metadata.venue.name ?? undefined,
    };
    const stadium = metadata.venue.confirmed
      ? {
          ...catalogVenue,
          name: metadata.venue.name!,
          imageUrl:
            catalogVenue?.imageUrl ??
            '/assets/images/stadiums/default-stadium.svg',
          city: metadata.venue.city ?? catalogVenue?.city,
          country: metadata.venue.country ?? catalogVenue?.country,
        }
      : {
          name: 'Venue to be confirmed',
          imageUrl: '/assets/images/stadiums/default-stadium.svg',
        };
    return {
      match: detailedMatch,
      score: metadata.score,
      referees: metadata.referees,
      venue: metadata.venue,
      competition: data.competitions.find((c) => c.id === match.competitionId)!,
      homeTeam,
      awayTeam,
      stadium,
      events: events.sort((a, b) => parseInt(a.minute) - parseInt(b.minute)),
      lineups,
      stats,
      relatedNews: (await this.cachedNews(match.competitionId))
        .filter(
          (a) =>
            matchNewsRelevance(
              {
                title: a.title,
                description: a.excerpt,
                url: a.sourceUrl ?? '',
                published: a.publishedAt,
              },
              matchNewsSearch({
                id: match.id,
                competitionId: match.competitionId,
                kickoff: match.kickoff,
                status: match.status,
                homeTeam,
                awayTeam,
              }),
            ) >= 0,
        )
        .slice(0, 6),
      videoUrl: safeUrl(raw.videoUrl ?? wc?.videoUrl),
      freshness,
      availability: {
        ...metadata.availability,
        events: matchAvailability(
          events.length > 0 ||
            (match.status === 'finished' &&
              ['goals', 'bookings', 'substitutions'].some((key) =>
                Array.isArray(raw[key]),
              )),
          match.status,
          'Match events',
        ),
        lineups: matchAvailability(lineups.length > 0, match.status, 'Lineups'),
        statistics: matchAvailability(
          stats.length > 0,
          match.status,
          'Match statistics',
        ),
      },
    };
  }
}
