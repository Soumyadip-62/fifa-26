async (page) => {
  const results=[];
  for(const width of [360,390,768,1024,1180,1440,1920]){
    await page.setViewportSize({width,height:1000});
    await page.goto('http://localhost:14000/matches/564746');
    await page.getByRole('heading',{name:/Match Centre/}).waitFor();
    await page.getByRole('region',{name:'Match news',exact:true}).getByText('Loading match news…').waitFor({state:'hidden',timeout:45000});
    const result=await page.evaluate(()=>{
      const roots=[...document.querySelectorAll('.neon-match *')];
      const overflow=roots.filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)}).map(el=>el.className).slice(0,8);
      return {width:innerWidth,pageWidth:document.documentElement.scrollWidth,overflow,panels:document.querySelectorAll('.nm-panel').length,score:document.querySelector('.nm-score')?.textContent};
    });
    if(width===1440||width===390)await page.screenshot({path:`output/match-centre/${width===1440?'desktop':'mobile'}.png`,fullPage:true,animations:'disabled'});
    results.push(result);
  }
  return results;
}
