import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('qualified_teams')
export class QualifiedTeamEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  competitionCode: string;

  @Column()
  season: string;

  @Column()
  teamKey: string;

  @Column('int', { nullable: true })
  footballDataTeamId: number | null;

  @Column('varchar', { nullable: true })
  sportsdbTeamId: string | null;

  @Column()
  teamName: string;

  @Column('varchar', { nullable: true })
  shortName: string | null;

  @Column('varchar', { nullable: true })
  tla: string | null;

  @Column('varchar', { nullable: true })
  crest: string | null;

  @Column()
  stage: string;

  @Column('varchar', { nullable: true })
  group: string | null;

  @Column('int', { nullable: true })
  position: number | null;

  @Column('int', { nullable: true })
  points: number | null;

  @Column('varchar', { nullable: true })
  source: string | null;

  @Column('timestamptz')
  qualifiedAt: Date;

  @Column('timestamptz')
  lastSyncedAt: Date;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown>;
}
