import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import type {
  ProviderCompetition,
  ProviderMatch,
  ProviderTeam,
} from './provider.types';

@Entity('tournament_seasons')
export class TournamentSeasonEntity {
  @PrimaryColumn() competitionId: string;
  @PrimaryColumn('int') season: number;
  @Column('jsonb') competition: ProviderCompetition;
  @Column('jsonb') teams: ProviderTeam[];
  @Column('timestamptz') lastSyncedAt: Date;
}

@Entity('tournament_fixtures')
@Index(['competitionId', 'season', 'kickoff'])
export class TournamentFixtureEntity {
  @PrimaryColumn('int') id: number;
  @Column() competitionId: string;
  @Column('int') season: number;
  @Column('timestamptz') kickoff: Date;
  @Column() status: string;
  @Column('jsonb') score: ProviderMatch['score'];
  @Column('jsonb') payload: ProviderMatch;
  @Column('timestamptz') observedAt: Date;
}

@Entity('tournament_resource_cache')
export class TournamentResourceCacheEntity {
  @PrimaryColumn() key: string;
  @Column('jsonb') payload: Record<string, unknown>;
  @Column('timestamptz') fetchedAt: Date;
  @Column('timestamptz') expiresAt: Date;
}
