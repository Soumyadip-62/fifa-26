import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source=await readFile(new URL('../src/lib/matches/detail-labels.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {availabilityLabel,durationLabel,scoreLabel,winnerLabel}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const details=(status,winner)=>({match:{status},score:{winner},homeTeam:{name:'Home FC'},awayTeam:{name:'Away FC'}});

test('only declares a winner from published final result metadata',()=>{
  assert.equal(winnerLabel(details('finished','AWAY_TEAM')),'Away FC');assert.equal(winnerLabel(details('finished','HOME_TEAM')),'Home FC');assert.equal(winnerLabel(details('finished','DRAW')),'Draw');
  assert.equal(winnerLabel(details('finished',null)),null);assert.equal(winnerLabel(details('live','HOME_TEAM')),null);assert.equal(winnerLabel(details('upcoming','HOME_TEAM')),null);
});
test('renders nullable half-time scores without converting missing data to zero',()=>{
  assert.equal(scoreLabel({home:0,away:0}),'0 – 0');assert.equal(scoreLabel({home:null,away:1}),'— – 1');assert.equal(scoreLabel({home:null,away:null}),'— – —');
});
test('labels provider duration without inventing elapsed match minutes',()=>{
  assert.equal(durationLabel('REGULAR'),'Regular time');assert.equal(durationLabel('EXTRA_TIME'),'Extra time');assert.equal(durationLabel('PENALTY_SHOOTOUT'),'Penalty shoot-out');assert.equal(durationLabel(null),null);
});
test('distinguishes pending, not-applicable and unavailable detail fields',()=>{
  assert.equal(availabilityLabel({availability:{venue:{state:'pending'}}},'venue'),'Pending');assert.equal(availabilityLabel({availability:{venue:{state:'not_applicable'}}},'venue'),'Not applicable');assert.equal(availabilityLabel({availability:{venue:{state:'unavailable'}}},'venue'),'Not available');
});
