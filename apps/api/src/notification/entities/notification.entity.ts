import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('subscribedTokens')
export class SubscribedTokens {
  @PrimaryColumn()
  id: string;

  @Column()
  token: string;

  @Column('jsonb', { nullable: true })
  preferences: {
    favoriteTeams?: string[];
    kickoff30?: boolean;
    kickoff10?: boolean;
    finalScore?: boolean;
    qualification?: boolean;
  } | null;
}
