import { Module } from '@nestjs/common';
import { FootballDataModule } from '../football-data/football-data.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { FootballService } from './football.service';
import { FootballController } from './football.controller';
import { FootballDevices } from './football.devices';
import { FootballJobs } from './football.jobs';
import { NewsService } from '../news/news.service';
@Module({
  imports: [FootballDataModule, TournamentsModule, FirebaseModule],
  controllers: [FootballController],
  providers: [FootballService, FootballDevices, FootballJobs, NewsService],
  exports: [FootballService],
})
export class FootballModule {}
