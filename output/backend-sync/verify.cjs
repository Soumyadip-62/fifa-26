require('../../apps/api/node_modules/dotenv').config({path:'apps/api/.env',quiet:true});
const {Client}=require('../../apps/api/node_modules/pg');
async function main(){
 const db=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}}); await db.connect();
 try{
  for(const [name,sql] of [
   ['jobs',`SELECT name,"lastStartedAt","lastSuccessAt","lastError",result FROM football_jobs WHERE name IN ('scores','schedules') ORDER BY name`],
   ['schedules',`SELECT "competitionId",season,count(*)::int AS fixtures,max("observedAt") AS updated FROM tournament_fixtures GROUP BY "competitionId",season ORDER BY "competitionId"`],
   ['worldCup',`SELECT season,count(*)::int AS fixtures,count(*) FILTER (WHERE id LIKE 'wc2026%')::int AS seeded,min("timestampUtc") AS first,max("timestampUtc") AS last FROM matches GROUP BY season`],
   ['officialTables',`SELECT key,"fetchedAt","expiresAt",jsonb_array_length(payload->'standings') AS tables FROM tournament_resource_cache WHERE key LIKE '%:standings' ORDER BY key`]
  ])console.log(JSON.stringify({[name]:(await db.query(sql)).rows}));
 }finally{await db.end()}
 const health=await fetch('http://localhost:10000/health'); console.log(JSON.stringify({backend:health.status}));
}
main().catch(error=>{console.error('Verification failed:',error.code??error.name);process.exitCode=1});
