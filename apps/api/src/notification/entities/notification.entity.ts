import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('subscribedTokens')
export class SubscribedTokens {
  @PrimaryColumn()
  id: string;

  @Column()
  token: string;
}
