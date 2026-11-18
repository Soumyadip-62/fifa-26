// Isolated visual QA only. No fixture data is written to the app or database.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=process.cwd(), web=path.join(root,'apps/web');
const ts=require(path.join(web,'node_modules/typescript'));
const resolve=Module._resolveFilename;
Module._resolveFilename=function(request,parent,...args){return resolve.call(this,request.startsWith('@/')?path.join(web,'src',request.slice(2)):request,parent,...args)};
require.extensions['.tsx']=require.extensions['.ts']=function(module,filename){module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText,filename)};
const React=require(path.join(web,'node_modules/react'));
const {renderToStaticMarkup}=require(path.join(web,'node_modules/react-dom/server'));
const {AppRouterContext}=require(path.join(web,'node_modules/next/dist/shared/lib/app-router-context.shared-runtime'));
const {ImageConfigContext}=require(path.join(web,'node_modules/next/dist/shared/lib/image-config-context.shared-runtime'));
const {imageConfigDefault}=require(path.join(web,'node_modules/next/dist/shared/lib/image-config'));
const {MatchCentre}=require(path.join(web,'src/features/matches/MatchCentre.tsx'));
const fixture=JSON.parse(fs.readFileSync('output/match-centre/real-match.json','utf8'));
fixture.lineups=[fixture.homeTeam,fixture.awayTeam].map((team,index)=>({matchId:fixture.match.id,teamId:team.id,coach:team.coach,formation:index?'4-3-3':'4-4-2',starters:Array.from({length:11},(_,i)=>`Visual QA Player ${i+1}${i===4?' With A Very Long Surname':''}`),substitutes:['QA Substitute One','QA Substitute Two']}));
fixture.events=Array.from({length:7},(_,i)=>({id:`visual-qa-${i}`,matchId:fixture.match.id,minute:`${90-i*8}${i===0?'+2':''}′`,type:['goal','yellow','substitution','red','goal','var','goal'][i],teamId:i%2?fixture.homeTeam.id:fixture.awayTeam.id,label:`Visual QA Player ${i+1}${i===2?' With A Very Long Surname':''}`,detail:i===2?'Replaced QA Player Two':''}));
fixture.stats=[{label:'Possession',home:52,away:48,suffix:'%'},{label:'Total shots',home:14,away:12},{label:'Shots on target',home:5,away:5},{label:'Corners',home:6,away:4},{label:'Fouls',home:13,away:11},{label:'Yellow cards',home:2,away:0},{label:'Red cards',home:0,away:0}];
const markup=renderToStaticMarkup(React.createElement(ImageConfigContext.Provider,{value:{...imageConfigDefault,unoptimized:true}},React.createElement(AppRouterContext.Provider,{value:{refresh(){}}},React.createElement(MatchCentre,fixture))));
async function main(){
 const html=await fetch('http://localhost:14000/matches/564746').then(r=>r.text());
 const styles=html.match(/<link[^>]+rel="stylesheet"[^>]*>/g)??[];
 if(!styles.length)throw Error('No preview stylesheets found');
 const content='<!doctype html><html><head><base href="http://localhost:14000/"><meta name="viewport" content="width=device-width,initial-scale=1">'+styles.join('')+'</head><body><div class="companion-app dark"><p style="text-align:center;color:#91b9aa;padding:10px">VISUAL QA FIXTURE — NOT LIVE MATCH DATA</p>'+markup+'</div></body></html>';
 fs.writeFileSync('output/match-centre/populated-qa.html',content);
 fs.writeFileSync('output/match-centre/qa-populated.js',`async(page)=>{const results=[];await page.setContent(${JSON.stringify(content)});await page.evaluate(()=>document.fonts.ready);for(const width of [360,390,768,1024,1180,1440,1920]){await page.setViewportSize({width,height:1000});const result=await page.evaluate(()=>({width:innerWidth,pageWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('.neon-match *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)}).map(el=>el.className).slice(0,8),formationPlayers:document.querySelectorAll('.nm-player-dot').length,zeroStatBar:document.querySelector('.nm-stat-track.is-empty')!==null}));if(width===1440||width===390)await page.screenshot({path:'output/match-centre/populated-qa-'+width+'.png',fullPage:true,animations:'disabled'});results.push(result);}await page.goto('http://localhost:14000/matches/564746');return results;}`);
 console.log('Created isolated populated-state visual fixture.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
