import '../../apps/api/node_modules/dotenv/config';
import '../../apps/api/node_modules/reflect-metadata';
import { writeFileSync } from 'node:fs';
import { DataSource } from '../../apps/api/node_modules/typeorm';
import { FootballService } from '../../apps/api/src/football/football.service';
import { FootballDataClient } from '../../apps/api/src/football-data/football-data.client';
import { TournamentsService } from '../../apps/api/src/tournaments/tournaments.service';
import { NewsService } from '../../apps/api/src/news/news.service';
import { TournamentFixtureEntity, TournamentResourceCacheEntity, TournamentSeasonEntity } from '../../apps/api/src/tournaments/tournament.entities';
import { MatchEntity } from '../../apps/api/src/matches/entities/matches.entity';
import { TeamEntity } from '../../apps/api/src/teams/entitites/teams.entity';
async function main(){
 const db=new DataSource({type:'postgres',url:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},entities:[TournamentFixtureEntity,TournamentResourceCacheEntity,TournamentSeasonEntity,MatchEntity,TeamEntity],synchronize:false});await db.initialize();
 try{
  const provider=new FootballDataClient(db),news=new NewsService(db);
  const football=new FootballService(db,new TournamentsService(db,provider),news,provider);
  const start=Date.now();const result=await football.relatedNews('matches','564746');
  writeFileSync('../../output/match-news/endpoint-result.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify({count:result.articles.length,ms:Date.now()-start,availability:result.availability,stories:result.articles.slice(0,4).map(a=>({title:a.title,url:a.sourceUrl}))}));
  if(!result.articles.length)throw new Error('Match search returned no relevant coverage');
  const preview=await football.article(result.articles[0].id);console.log(JSON.stringify({cachedArticleFound:preview.id===result.articles[0].id}));
 }finally{await db.destroy()}
}
void main().catch(error=>{console.error(error instanceof Error?error.message:'Match news verification failed');process.exitCode=1});
