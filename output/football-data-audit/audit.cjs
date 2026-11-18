// Audit only: application source/schema are not edited. The normal client owns request-budget reservations.
const fs=require('node:fs'),path=require('node:path');
const api=path.resolve('apps/api'),out=path.resolve('output/football-data-audit');
require(path.join(api,'node_modules/dotenv')).config({path:path.join(api,'.env'),quiet:true});
require(path.join(api,'node_modules/reflect-metadata'));
require(path.join(api,'node_modules/ts-node')).register({project:path.join(api,'tsconfig.json')});
const {DataSource}=require(path.join(api,'node_modules/typeorm'));
const {FootballDataClient}=require(path.join(api,'src/football-data/football-data.client.ts'));
const {TournamentFixtureEntity,TournamentResourceCacheEntity,TournamentSeasonEntity}=require(path.join(api,'src/tournaments/tournament.entities.ts'));
const token=process.env.FOOTBALL_DATA_API_KEY;
if(!token)throw Error('Football data credential is not configured');
const redact=text=>text.split(token).join('[REDACTED]');
const save=(name,data)=>fs.writeFileSync(path.join(out,name),redact(JSON.stringify(data,null,2)));
const nativeFetch=global.fetch;
const allowedHeaders=new Set(['date','content-type','content-length','cache-control','age','etag','last-modified','vary','retry-after','x-api-version','x-api-tier','x-api-tiers','x-subscription-tier','x-plan','x-requests-available-minute','x-requestcounter-reset','x-ratelimit-limit','x-ratelimit-remaining','x-ratelimit-reset','ratelimit-limit','ratelimit-remaining','ratelimit-reset']);
const paths=['id','utcDate','status','competition.code','season.startDate','homeTeam.lineup','homeTeam.bench','homeTeam.statistics','homeTeam.formation','homeTeam.coach','awayTeam.lineup','awayTeam.bench','awayTeam.statistics','awayTeam.formation','awayTeam.coach','goals','penalties','bookings','substitutions','referees','attendance','venue','score'];
const valueAt=(body,key)=>key.split('.').reduce((v,part)=>v&&Object.prototype.hasOwnProperty.call(v,part)?v[part]:undefined,body);
function inspect(body){return Object.fromEntries(paths.map(key=>{const value=valueAt(body,key);return[key,value===undefined?{state:'absent'}:value===null?{state:'null'}:Array.isArray(value)?{state:'array',count:value.length,sample:value.slice(0,2)}:typeof value==='object'?{state:'object',keys:Object.keys(value),value}:{state:typeof value,value}]}))}
async function main(){
 const db=new DataSource({type:'postgres',url:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},entities:[TournamentFixtureEntity,TournamentResourceCacheEntity,TournamentSeasonEntity],synchronize:false,extra:{connectionTimeoutMillis:10000,query_timeout:15000}});await db.initialize();
 try{
  const read=async()=>({fixture:await db.getRepository(TournamentFixtureEntity).findOneBy({id:564746}),cache:await db.getRepository(TournamentResourceCacheEntity).findOneBy({key:'match:564746'}),competition:await db.getRepository(TournamentSeasonEntity).findOneBy({competitionId:'la-liga',season:2026})});
  const before=await read();
  save('database-before.json',{fixture:before.fixture,cache:before.cache,competition:{id:before.competition?.competitionId,plan:before.competition?.competition.plan,metadata:before.competition?.competition}});
  const observations=[];
  for(const mode of ['current-request','all-unfold-headers']){
   global.fetch=async(input,options={})=>{
    const headers=new Headers(options.headers);
    if(mode==='all-unfold-headers')for(const key of ['X-Unfold-Lineups','X-Unfold-Bookings','X-Unfold-Subs','X-Unfold-Goals'])headers.set(key,'true');
    const started=Date.now();const response=await nativeFetch(input,{...options,headers});
    const body=await response.clone().json();
    const safeHeaders=Object.fromEntries([...response.headers].filter(([key])=>allowedHeaders.has(key.toLowerCase())));
    const observation={mode,observedAt:new Date().toISOString(),endpoint:String(input),status:response.status,ms:Date.now()-started,requestHeaders:Object.fromEntries([...headers].filter(([key])=>key.startsWith('x-unfold-'))),responseHeaders:safeHeaders,responseHeaderNames:[...response.headers.keys()],fields:inspect(body),topLevelKeys:Object.keys(body)};
    observations.push(observation);save(mode+'.raw.json',body);save(mode+'.metadata.json',observation);
    return response;
   };
   try{await new FootballDataClient(db).get('/matches/564746',{unfoldLineups:true,queueTimeoutMs:120000})}catch(error){save(mode+'.error.json',{name:error.name,status:typeof error.getStatus==='function'?error.getStatus():null})}
  }
  global.fetch=nativeFetch;
  const start=Date.now();const response=await nativeFetch('http://localhost:10000/football/matches/564746',{signal:AbortSignal.timeout(60000)});const normalized=await response.json();
  save('backend-normalized.json',normalized);
  const after=await read();save('database-after.json',{fixture:after.fixture,cache:after.cache});
  const summary={observations,backend:{status:response.status,ms:Date.now()-start,events:normalized.events,lineups:normalized.lineups,stats:normalized.stats,homeTeam:normalized.homeTeam,awayTeam:normalized.awayTeam,match:normalized.match,stadium:normalized.stadium,availability:normalized.availability,freshness:normalized.freshness},database:{fixtureBefore:before.fixture?inspect(before.fixture.payload):null,cacheBefore:before.cache?inspect(before.cache.payload):null,fixtureAfter:after.fixture?inspect(after.fixture.payload):null,cacheAfter:after.cache?inspect(after.cache.payload):null,cacheFetchedAtBefore:before.cache?.fetchedAt,cacheFetchedAtAfter:after.cache?.fetchedAt},configuration:{clientBudgetPerMinute:process.env.FOOTBALL_DATA_REQUESTS_PER_MINUTE??'8',subscriptionNameExposedByConfiguration:process.env.FOOTBALL_DATA_PLAN??process.env.FOOTBALL_DATA_TIER??null}};
  save('audit-summary.json',summary);
  console.log(redact(JSON.stringify({upstream:observations.map(o=>({mode:o.mode,status:o.status,headers:o.responseHeaders,fields:o.fields})),backend:summary.backend,dbCacheTimes:{before:before.cache?.fetchedAt,after:after.cache?.fetchedAt}})));
 }finally{global.fetch=nativeFetch;await db.destroy()}
}
main().catch(error=>{console.error('Audit failed:',error.name,redact(error.message));process.exitCode=1});
