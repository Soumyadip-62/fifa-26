async(page)=>{
 const errors=[],warnings=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='warning')warnings.push(message.text())});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://localhost:14000/matches/564746',{waitUntil:'domcontentloaded',timeout:60000});
 await page.getByRole('heading',{name:/Match Centre/}).waitFor({timeout:55000});
 await page.getByRole('region',{name:'Match news',exact:true}).getByText('Loading match news…').waitFor({state:'hidden',timeout:40000});
 await page.screenshot({path:'output/match-centre/desktop.png',fullPage:true,animations:'disabled'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'output/match-centre/mobile.png',fullPage:true,animations:'disabled'});
 return {score:await page.locator('.nm-score').innerText(),warnings,errors};
}
