import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('teams')
export class TeamEntity {
  @PrimaryColumn()
  fifa_code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  name_normalised: string;

  @Column()
  continent: string;

  @Column()
  flag_icon: string;

  @Column()
  flag_unicode: string;

  @Column({ nullable: true })
  group: string;

  @Column()
  confed: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ unique: true })
  sportsdb_team_id: string;
}
