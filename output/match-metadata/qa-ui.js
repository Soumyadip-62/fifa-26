async(page)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:14000/matches/564746',{waitUntil:'domcontentloaded',timeout:60000});
 const info=page.getByRole('region',{name:'Match info',exact:true});
 await info.locator('dd').filter({hasText:'Winner: FC Barcelona'}).waitFor({timeout:55000});
 await info.locator('dd').filter({hasText:'Regular time'}).waitFor();
 await info.locator('dd').filter({hasText:'Javier Alberola Rojas'}).waitFor();
 if(await page.locator('.nm-half-time').innerText()!=='HT 1 – 1')throw Error('Half-time score did not render');
 const results=[];
 for(const width of [360,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:1000});
  const result=await page.evaluate(()=>({width:innerWidth,pageWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('.neon-match *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left< -1||r.right>innerWidth+1)}).map(el=>el.className).slice(0,6)}));
  if(result.pageWidth>width||result.overflow.length)throw Error(JSON.stringify(result));
  if(width===1440||width===390){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`output/match-metadata/${width===1440?'desktop':'mobile'}.png`,fullPage:true,animations:'disabled'});}
  results.push(result);
 }
 const fixtures=await page.request.get('http://localhost:10000/tournaments/premier-league/matches?season=2026').then(r=>r.json());
 const next=fixtures.matches.find(match=>['TIMED','SCHEDULED'].includes(match.status)&&Date.parse(match.utcDate)>Date.now());
 await page.goto('http://localhost:14000/matches/'+next.id,{waitUntil:'domcontentloaded',timeout:60000});
 const nextInfo=page.getByRole('region',{name:'Match info',exact:true});await nextInfo.waitFor({timeout:55000});
 await nextInfo.locator('dd').filter({hasText:'Pending'}).first().waitFor();
 if(await page.locator('.nm-half-time').count())throw Error('Unknown half-time was shown for the upcoming match');
 if((await nextInfo.innerText()).includes('Winner:'))throw Error('Upcoming winner was fabricated');
 if(await page.locator('.nm-score').innerText()!=='VS')throw Error('Upcoming score should remain VS');
 const upcoming={id:next.id,pending:true,winnerAbsent:true};
 await page.goto('http://localhost:14000/matches/564746',{waitUntil:'domcontentloaded',timeout:60000});
 if(errors.length)throw Error(JSON.stringify(errors));
 return {completed:{score:'1–2',halfTime:'1–1',winner:'FC Barcelona',duration:'Regular time'},upcoming,widths:results,errors};
}
