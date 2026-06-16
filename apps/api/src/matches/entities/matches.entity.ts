import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('matches')
export class MatchEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  matchNumber: number;

  @Column()
  stage: string;

  @Column()
  date: string;

  @Column({ nullable: true })
  time: string;

  @Column({ nullable: true })
  homeTeam: string;

  @Column({ nullable: true })
  awayTeam: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  group: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  city: string;

  @Column('jsonb', { nullable: true })
  score: {
    home: number | null;
    away: number | null;
  };
}
