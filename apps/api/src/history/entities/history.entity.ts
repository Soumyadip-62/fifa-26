import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TournamentEntity } from './tournament.entity';

@Entity('historical_matches')
export class HistoricalMatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  num: number;

  @Column()
  round: string;

  @Column()
  date: string;

  @Column({ nullable: true })
  time: string;

  @Column()
  team1: string;

  @Column()
  team2: string;

  @Column('jsonb', { nullable: true })
  score: any; // e.g. { ft: [4, 1] }

  @Column('jsonb', { nullable: true })
  goals1: any;

  @Column('jsonb', { nullable: true })
  goals2: any;

  @Column({ nullable: true })
  group: string;

  @Column()
  ground: string;

  @ManyToOne(() => TournamentEntity, (tournament) => tournament.matches)
  tournament: TournamentEntity;
}
