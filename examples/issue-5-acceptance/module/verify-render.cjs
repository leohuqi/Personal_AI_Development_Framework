// Reproducible: NODE_PATH=<bundled modules> NODE=<bundled node> node verify-render.cjs.
// PLAYWRIGHT_MODULE_DIR/CHROME_PATH may override observed local dependencies; no install needed.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const modules=process.env.PLAYWRIGHT_MODULE_DIR||'/Users/leohu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(modules,'playwright'));
(async()=>{
 const out=__dirname,meta=JSON.parse(fs.readFileSync(path.join(out,'diagram-metadata.json')));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2});const page=await context.newPage();const network=[],errors=[],checks=[];
 page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});page.on('pageerror',e=>errors.push(e.message));
 for(const f of meta.figures){
  await page.goto('file://'+path.join(out,f.slug+'.html'));await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('svg [data-node]').count(),f.nodes);
  const bad=await page.locator('svg').evaluate(svg=>{const bad=[];for(const t of svg.querySelectorAll('text')){const b=t.getBBox();if(b.x<0||b.y<0||b.x+b.width>1280||b.y+b.height>720)bad.push(t.textContent)}for(const n of svg.querySelectorAll('[data-node]')){const b=n.querySelector('.node-box').getBBox();for(const t of n.querySelectorAll('text')){const a=t.getBBox();if(a.x<b.x+8||a.x+a.width>b.x+b.width-8||a.y<b.y||a.y+a.height>b.y+b.height)bad.push(n.dataset.node+':'+t.textContent)}}return bad});assert.deepEqual(bad,[],f.slug+' text bounds');
  await page.locator('svg').evaluate(el=>{el.style.width='1280px';el.style.height='720px';el.style.position='absolute';el.style.left='0';el.style.top='0';for(let p=el.parentElement;p;p=p.parentElement)p.style.overflow='visible'});
  await page.locator('svg').screenshot({path:path.join(out,f.slug+'.png')});checks.push({view:f.slug,test:'actual render, node count, node/canvas text bounds',status:'PASS'});
 }
 await page.goto('file://'+path.join(out,'module-viewer.html'));assert.equal(await page.locator('section svg').count(),5);
 for(const a of await page.locator('nav a').all()){await a.focus();await page.keyboard.press('Enter');assert.ok(await page.evaluate(()=>location.hash.length>1));}
 for(const d of await page.locator('details').all()){await d.locator('summary').click();assert.ok(await d.getAttribute('open')!==null);await d.locator('summary').click();}
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'viewer-desktop.png'),fullPage:false});checks.push({test:'viewer navigation keyboard and source-contract disclosure',status:'PASS'});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.locator('.diagram-container').first().evaluate(e=>e.scrollWidth>e.clientWidth));await page.locator('.diagram-container').first().evaluate(e=>e.scrollLeft=e.scrollWidth);assert.ok(await page.locator('.diagram-container').first().evaluate(e=>e.scrollLeft>0));await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'viewer-mobile.png'),fullPage:false});checks.push({test:'390px local scrolling without page overflow',status:'PASS'});
 await page.emulateMedia({media:'print'});assert.equal(await page.locator('section svg:visible').count(),5);checks.push({test:'print all five figures',status:'PASS'});
 const nj=await browser.newContext({javaScriptEnabled:false});const np=await nj.newPage();await np.goto('file://'+path.join(out,'module-viewer.html'));assert.equal(await np.locator('svg').count(),5);checks.push({test:'no-JavaScript complete static viewer',status:'PASS'});
 assert.deepEqual(network,[]);assert.deepEqual(errors,[]);checks.push({test:'zero external requests/page errors',status:'PASS'});
 const report={status:'PASS',renderer:'Playwright '+require(path.join(modules,'playwright/package.json')).version,browser:await browser.version(),deviceScaleFactor:2,checks,networkRequests:network,pageErrors:errors,fonts:await page.locator('.node-name').first().evaluate(e=>getComputedStyle(e).fontFamily),scope:'Actual diagram rendering/UI viewer checks only, not application tests'};fs.writeFileSync(path.join(out,'browser-test-report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({status:'PASS',checks:checks.length}));
})().catch(e=>{console.error(e);process.exit(1)});
