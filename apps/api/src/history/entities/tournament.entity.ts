import { Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { HistoricalMatchEntity } from './history.entity';

@Entity('tournaments')
export class TournamentEntity {
  @PrimaryColumn()
  name: string; // e.g. "World Cup 1930"

  @OneToMany(() => HistoricalMatchEntity, (match) => match.tournament, {
    cascade: true,
  })
  matches: HistoricalMatchEntity[];
}
