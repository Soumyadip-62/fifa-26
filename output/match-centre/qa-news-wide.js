async(page)=>{
  await page.goto('http://localhost:14000/matches/564746',{waitUntil:'domcontentloaded',timeout:60000});
  const news=page.getByRole('region',{name:'Match news',exact:true});
  await news.locator('.nm-news-list a').first().waitFor();
  if(await page.getByRole('region',{name:'Highlights',exact:true}).count())throw Error('Highlights is still present');
  const results=[];
  for(const width of [1440,768,390]){
    await page.setViewportSize({width,height:1000});
    await news.scrollIntoViewIfNeeded();
    const result=await page.evaluate(()=>{const panel=document.querySelector('.nm-news').getBoundingClientRect(),dashboard=document.querySelector('.nm-dashboard').getBoundingClientRect();return{width:innerWidth,fullWidth:Math.abs(panel.width-dashboard.width)<1,columns:getComputedStyle(document.querySelector('.nm-news-list')).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth}});
    if(!result.fullWidth||result.overflow)throw Error(JSON.stringify(result));
    if(width===1440)await news.screenshot({path:'output/match-centre/news-wide.png',animations:'disabled'});
    results.push(result);
  }
  return results;
}
