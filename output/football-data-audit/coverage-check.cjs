const fs=require('node:fs'),path=require('node:path'),api=path.resolve('apps/api');
require(path.join(api,'node_modules/dotenv')).config({path:path.join(api,'.env'),quiet:true});
require(path.join(api,'node_modules/reflect-metadata'));
const {DataSource}=require(path.join(api,'node_modules/typeorm'));
const {FootballDataClient}=require(path.join(api,'dist/football-data/football-data.client.js'));
const {TournamentResourceCacheEntity}=require(path.join(api,'dist/tournaments/tournament.entities.js'));
const nativeFetch=global.fetch,token=process.env.FOOTBALL_DATA_API_KEY;
const redacted=value=>JSON.stringify(value,null,2).split(token).join('[REDACTED]');
async function main(){const db=new DataSource({type:'postgres',url:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},entities:[TournamentResourceCacheEntity],synchronize:false});await db.initialize();const checks=[];
 try{for(const id of [564746,560639]){
  global.fetch=async(input,options)=>{const headers=new Headers(options.headers);for(const name of ['X-Unfold-Lineups','X-Unfold-Bookings','X-Unfold-Subs','X-Unfold-Goals'])headers.set(name,'true');headers.set('Cache-Control','no-cache');const response=await nativeFetch(input,{...options,headers});const body=await response.clone().json();const identity=response.headers.get('x-authenticated-client');const check={id,status:response.status,competition:body.competition?.code,authenticatedClient:identity===null?null:identity.toLowerCase()!=='anonymous',headers:Object.fromEntries(['date','content-type','x-api-version','x-cache-status','x-requests-available-minute','x-requestcounter-reset','retry-after'].map(name=>[name,response.headers.get(name)])),fields:Object.fromEntries(['goals','penalties','bookings','substitutions'].map(key=>[key,Object.hasOwn(body,key)?body[key]===null?'null':Array.isArray(body[key])?'array('+body[key].length+')':typeof body[key]:'absent'])),teams:Object.fromEntries(['homeTeam','awayTeam'].map(side=>[side,Object.fromEntries(['lineup','bench','statistics','coach','formation'].map(key=>[key,Object.hasOwn(body[side],key)?body[side][key]===null?'null':Array.isArray(body[side][key])?'array('+body[side][key].length+')':typeof body[side][key]:'absent']))]))};checks.push(check);fs.writeFileSync(`output/football-data-audit/coverage-${id}.raw.json`,redacted(body));return response};
  await new FootballDataClient(db).get('/matches/'+id,{unfoldLineups:true,queueTimeoutMs:120000});
 }fs.writeFileSync('output/football-data-audit/coverage-check.json',redacted(checks));console.log(redacted(checks));}finally{global.fetch=nativeFetch;await db.destroy()}}
main().catch(error=>{console.log(error.name);process.exitCode=1});
