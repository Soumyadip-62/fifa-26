require('../../apps/api/node_modules/dotenv').config({path:'apps/api/.env',quiet:true});
const assert=require('node:assert/strict');
const {Client}=require('../../apps/api/node_modules/pg');
async function get(path){const r=await fetch('http://localhost:10000'+path);assert.equal(r.status,200,path);return r.json()}
async function main(){
 const db=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await db.connect();
 try{
  const snapshot=await get('/football/snapshot');assert.equal(snapshot.matches.length,1314);assert.deepEqual(snapshot.errors,{});
  const competitions=['premier-league','la-liga','ucl','bundesliga','world-cup'];
  const results=[];
  for(const id of competitions){
   const result=await get('/football/competitions/'+id+'/standings?season=2026');
   assert.equal(result.freshness.stale,false,id);assert.ok(result.rows.length>0,id);
   const {rows:[cache]}=await db.query('SELECT payload,"fetchedAt" FROM tournament_resource_cache WHERE key=$1',[id+':2026:standings']);
   const official=cache.payload.standings.filter(s=>s.type==='TOTAL').flatMap(s=>s.table);
   assert.equal(result.freshness.fetchedAt,cache.fetchedAt.toISOString());
   assert.deepEqual(result.rows.map(r=>[r.position,r.points]),official.map(r=>[r.position,r.points]));
   results.push({competition:id,rows:result.rows.length,persistedAt:result.freshness.fetchedAt,matchesDatabase:true});
  }
  const legacy=await get('/points-table/standings');assert.equal(legacy.freshness.stale,false);assert.ok(legacy.standings.length);
  const knockout=await get('/matches/qualifier-matches');assert.ok(knockout.length);assert.ok(knockout.every(m=>m.stage!=='GROUP_STAGE'));
  const status=await fetch('http://localhost:10000/football/admin/status',{headers:{'x-admin-secret':process.env.ADMIN_SECRET??''}});
  const admin=await status.json();
  console.log(JSON.stringify({snapshotFixtures:snapshot.matches.length,officialTables:results,legacyWorldCupOfficial:true,knockoutFixtures:knockout.length,scheduler:admin.scheduler,cadence:admin.cadence}));
  const page=await fetch('http://localhost:14000/standings');assert.equal(page.status,200);console.log('Frontend standings page: 200');
 }finally{await db.end()}
}
main().catch(error=>{console.error('Endpoint check failed:',error.message);process.exitCode=1});
