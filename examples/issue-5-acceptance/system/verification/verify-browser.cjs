const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const {chromium}=require('/Users/leohu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('outputs/issue-5/system');
const uri=f=>'file://'+out+'/'+f;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const report={status:'PASS',browser:await browser.version(),renderer:'Playwright '+require('/Users/leohu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json').version,viewport:{width:1440,height:1080},deviceScaleFactor:2,checks:[],screenshots:[]};
 const context=await browser.newContext({viewport:report.viewport,deviceScaleFactor:2});
 const page=await context.newPage();let requests=[],errors=[];
 page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(uri('architecture-viewer.html'));await page.evaluate(()=>document.fonts.ready);
 const meta=JSON.parse(fs.readFileSync(out+'/diagram-metadata.json','utf8'));
 for(const f of meta.figures){
  await page.locator('[data-switch="'+f.slug+'"]').click();
  assert.equal(await page.locator('section:visible').count(),1);
  assert.equal(await page.locator('section:visible').getAttribute('id'),f.slug);
  const nodes=page.locator('section:visible .inspect');assert.equal(await nodes.count(),f.nodes);
  for(let n=0;n<f.nodes;n++){
   const node=nodes.nth(n),title=await node.getAttribute('data-title'),detail=await node.getAttribute('data-detail');
   await node.click();assert.equal(await page.locator('#detail-title').textContent(),title);assert.equal(await page.locator('#detail-text').textContent(),detail);
  }
  await nodes.first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#detail-title').textContent(),await nodes.first().getAttribute('data-title'));
  await nodes.last().focus();await page.keyboard.press('Space');assert.equal(await page.locator('#detail-title').textContent(),await nodes.last().getAttribute('data-title'));
  await page.locator('section:visible summary').click();const index=page.locator('section:visible [data-inspect]');await index.first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#detail-title').textContent(),await nodes.first().getAttribute('data-title'));
  await page.locator('section:visible summary').click();
  report.checks.push({test:'switch, every node click, Enter/Space, accessible name index',view:f.slug,status:'PASS',nodes:f.nodes});
 }
 await page.locator('[data-switch="system-trust"]').click();
 await page.locator('#zoom-in').click();assert.equal(await page.locator('#zoom-level').textContent(),'125%');assert.equal(await page.locator('section:visible svg').evaluate(e=>e.getBoundingClientRect().width),1600);
 await page.locator('#zoom-out').click();assert.equal(await page.locator('#zoom-level').textContent(),'100%');
 for(let n=0;n<8;n++)await page.locator('#zoom-out').click();assert.equal(await page.locator('#zoom-level').textContent(),'50%');
 for(let n=0;n<10;n++)await page.locator('#zoom-in').click();assert.equal(await page.locator('#zoom-level').textContent(),'200%');
 await page.locator('#reset').click();assert.equal(await page.locator('#zoom-level').textContent(),'100%');assert.equal(await page.locator('section:visible .diagram-container').evaluate(e=>e.scrollLeft),0);
 report.checks.push({test:'zoom in/out, 50–200% limits and reset',status:'PASS'});
 await page.screenshot({path:out+'/viewer-desktop.png',fullPage:true});report.screenshots.push('viewer-desktop.png');
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.equal(await page.locator('section:visible .diagram-container').evaluate(e=>e.scrollWidth>e.clientWidth),true);
 await page.locator('section:visible .diagram-container').evaluate(e=>e.scrollLeft=e.scrollWidth);assert.ok(await page.locator('section:visible .diagram-container').evaluate(e=>e.scrollLeft)>0);
 await page.locator('#reset').click();await page.screenshot({path:out+'/viewer-mobile.png',fullPage:true});report.screenshots.push('viewer-mobile.png');
 report.checks.push({test:'390px page does not overflow; local diagram scroll reaches right edge',status:'PASS'});
 await page.emulateMedia({media:'print'});assert.equal(await page.locator('section:visible').count(),5);report.checks.push({test:'print includes every diagram and releases SVG min-width',status:'PASS'});
 await page.emulateMedia({media:'screen'});
 for(const f of meta.figures){
  await page.setViewportSize({width:1440,height:1080});await page.goto(uri(f.slug+'.html'));await page.evaluate(()=>document.fonts.ready);
  const violations=await page.locator('svg').evaluate(svg=>{let bad=[];const vb=svg.viewBox.baseVal;for(const e of svg.querySelectorAll('text,rect,g.inspect')){let b=e.getBBox();if(b.x<0||b.y<0||b.x+b.width>vb.width+.1||b.y+b.height>vb.height+.1)bad.push({tag:e.tagName,text:e.textContent,box:{x:b.x,y:b.y,w:b.width,h:b.height}})}for(const n of svg.querySelectorAll('.inspect')){const b=n.querySelector('.node-box').getBBox();for(const t of n.querySelectorAll('text')){const a=t.getBBox();if(a.x<b.x+5||a.x+a.width>b.x+b.width-5||a.y<b.y||a.y+a.height>b.y+b.height)bad.push({type:'node text',node:n.dataset.node,text:t.textContent})}}return bad});
  assert.deepEqual(violations,[],f.slug+' bounds');
  await page.locator('svg').evaluate(el=>{el.style.position='absolute';el.style.left='0';el.style.top='0';el.style.width='1280px';el.style.minWidth='1280px';el.style.maxWidth='1280px';el.style.height='720px';el.style.minHeight='720px';el.style.maxHeight='720px';for(let a=el.parentElement;a;a=a.parentElement)a.style.overflow='visible'});
  await page.locator('svg').screenshot({path:out+'/'+f.slug+'.png',omitBackground:true});report.screenshots.push(f.slug+'.png');report.checks.push({test:'static SVG rendered; text fits nodes and canvas',view:f.slug,status:'PASS'});
 }
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1080}});const staticPage=await nojs.newPage();await staticPage.goto(uri('architecture-viewer.html'));assert.equal(await staticPage.locator('section:visible').count(),5);report.checks.push({test:'no-JavaScript viewer exposes all five complete static figures',status:'PASS'});
 report.fonts=await page.locator('.node-name').first().evaluate(e=>getComputedStyle(e).fontFamily);
 report.networkRequests=requests;report.pageErrors=errors;assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);report.checks.push({test:'zero external network requests and page errors',status:'PASS'});
 fs.writeFileSync(out+'/browser-test-report.json',JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,screenshots:report.screenshots,browser:report.browser}));
})().catch(e=>{console.error(e);process.exit(1)});
