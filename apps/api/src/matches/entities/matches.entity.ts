import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('matches')
export class MatchEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  matchNumber: number;

  @Column({ nullable: true })
  stage: string;

  @Column({ nullable: true })
  group: string;

  @Column({ nullable: true })
  matchday: number;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  time: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  homeTeam: string;

  @Column({ nullable: true })
  awayTeam: string;

  @Column('jsonb', { nullable: true })
  venue: {
    city: string | null;
    stadium: string | null;
    country: string | null;
  };

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  season: string;

  @Column('jsonb', { nullable: true })
  league: {
    id: string;
    name: string;
    badgeUrl: string;
    sport: string;
  };

  @Column({ nullable: true })
  eventName: string;

  @Column({ nullable: true })
  eventAlternateName: string;

  @Column({ nullable: true })
  sportsDbEventId: string;

  @Column({ nullable: true })
  sportsDbHomeTeamId: string;

  @Column({ nullable: true })
  sportsDbAwayTeamId: string;

  @Column({ nullable: true })
  homeTeamBadgeUrl: string;

  @Column({ nullable: true })
  awayTeamBadgeUrl: string;

  @Column('jsonb', { nullable: true })
  score: {
    home: number | null;
    away: number | null;
  };

  @Column({ nullable: true })
  timestampUtc: string;

  @Column({ nullable: true })
  dateUtc: string;

  @Column({ nullable: true })
  timeUtc: string;

  @Column({ nullable: true })
  statusCode: string;

  @Column({ nullable: true })
  isPostponed: boolean;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  posterUrl: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  sourceFilename: string;

  @Column('jsonb', { nullable: true })
  referees: any[];

  @Column({ nullable: true })
  footballDataorgHomeTeamId: number;

  @Column({ nullable: true })
  footballDataorgAwayTeamId: number;

  @Column({ default: false })
  isNotified: boolean;
}
