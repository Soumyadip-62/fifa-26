async(page)=>{
  const checks={}; const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__matchCopied=value}}});
  });
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://localhost:14000/matches/564746');
  await page.getByRole('button',{name:'Save match',exact:true}).click();
  await page.reload();
  if(await page.getByRole('button',{name:'Remove saved match',exact:true}).getAttribute('aria-pressed')!=='true')throw Error('Saved match did not persist');
  await page.getByRole('button',{name:'Remove saved match',exact:true}).click();checks.savedMatchPersistence=true;
  await page.getByRole('button',{name:'Share match',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Match link copied'}).waitFor();
  if(await page.evaluate(()=>window.__matchCopied)!=='http://localhost:14000/matches/564746')throw Error('Wrong share URL');checks.shareLink=true;
  const filters=page.getByRole('group',{name:'Filter match timeline'});
  for(const name of ['Goals','Cards','Subs','All']){await filters.getByRole('button',{name,exact:true}).click();if(await filters.getByRole('button',{name,exact:true}).getAttribute('aria-pressed')!=='true')throw Error('Timeline filter failed');}checks.timelineFilters=true;
  const teams=page.getByRole('group',{name:'Choose starting lineup'});
  await teams.getByRole('button',{name:/Barça/}).click();
  if(await teams.getByRole('button',{name:/Barça/}).getAttribute('aria-pressed')!=='true')throw Error('Team selection failed');
  await page.getByRole('heading',{name:'FC Barcelona',exact:true}).waitFor();checks.lineupSelection=true;
  await page.route('**/football/matches/564746/news',route=>route.fulfill({status:503,json:{message:'Temporarily unavailable'}}));
  await page.reload();await page.getByText('Match news is temporarily unavailable.',{exact:true}).waitFor();checks.newsErrorState=true;
  await page.unroute('**/football/matches/564746/news');
  const snapshot=await page.request.get('http://localhost:10000/football/snapshot').then(r=>r.json());
  const upcoming=snapshot.matches.find(m=>m.status==='upcoming'&&Date.parse(m.kickoff)>Date.now());
  const worldCup=snapshot.matches.find(m=>m.competitionId==='world-cup'&&m.status==='finished');
  for(const fixture of [upcoming,worldCup]){
    await page.goto('http://localhost:14000/matches/'+fixture.id);await page.getByRole('region',{name:'Match scoreboard'}).waitFor();
    if(fixture===upcoming){await page.getByRole('button',{name:'Remind me',exact:true}).click();await page.reload();await page.getByRole('button',{name:'30-minute reminder saved',exact:true}).click();checks.upcomingReminder=true;}
    if(fixture===worldCup)checks.worldCup=true;
  }
  await page.goto('http://localhost:14000/matches/564746');
  checks.pageErrors=errors;
  if(errors.length)throw Error(JSON.stringify(errors));
  return checks;
}
