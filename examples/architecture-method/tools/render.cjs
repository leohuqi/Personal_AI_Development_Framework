/* Render only local generated design assets. Host supplies existing Playwright/Chrome. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {pathToFileURL}=require('url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async()=>{
 const options={headless:true};if(process.env.CHROME_EXECUTABLE)options.executablePath=process.env.CHROME_EXECUTABLE;
 const browser=await chromium.launch(options);const model=JSON.parse(fs.readFileSync(path.join(root,'model.json')));const results=[];
 for(const v of model.views){
  const file=path.join(root,'diagrams',v.id+'.html');
  const page=await browser.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:1});const remote=[],errors=[];
  await page.route('**/*',async route=>{if(route.request().url().startsWith('file:'))await route.continue();else{remote.push(route.request().url());await route.abort();}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(file).href,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>{
   const s=document.querySelector('svg'),vb=s.viewBox.baseVal;
   const bbox=el=>{const b=el.getBBox();return{x:b.x,y:b.y,w:b.width,h:b.height}};
   const texts=[...s.querySelectorAll('text')].map(t=>({text:t.textContent,...bbox(t),size:getComputedStyle(t).fontSize}));
   const nodes=[...s.querySelectorAll('[data-node-id]')].map(n=>({id:n.dataset.nodeId,...bbox(n.querySelector('[data-role="bounds"]'))}));
   const labels=[...s.querySelectorAll('[data-label]')].map(n=>({text:n.dataset.label,...bbox(n.querySelector('rect'))}));
   const hit=(a,b)=>a.x<b.x+b.w-.1&&a.x+a.w>b.x+.1&&a.y<b.y+b.h-.1&&a.y+a.h>b.y+.1;
   const collisions=labels.flatMap(l=>nodes.filter(n=>hit(l,n)).map(n=>({label:l.text,node:n.id})));
   const outside=texts.filter(t=>t.x<0||t.y<0||t.x+t.w>vb.width||t.y+t.h>vb.height);
   const nodeTextOverflow=[];
   for(const g of s.querySelectorAll('[data-node-id]')){const b=bbox(g.querySelector('[data-role="bounds"]'));for(const t of g.querySelectorAll('text')){const q=bbox(t);if(q.x<b.x||q.x+q.w>b.x+b.w||q.y<b.y||q.y+q.h>b.y+b.h)nodeTextOverflow.push({node:g.dataset.nodeId,text:t.textContent});}}
   const edges=[...s.querySelectorAll('[data-edge-id]')].map(e=>({id:e.dataset.edgeId,from:e.dataset.from,to:e.dataset.to,guard:e.dataset.guard||'',path:e.querySelector('path').getAttribute('d')}));
   return{viewBox:[vb.width,vb.height],outside,labelNodeCollisions:collisions,nodeTextOverflow,nodeIds:nodes.map(n=>n.id),edges,texts,guards:[...s.querySelectorAll('.guard')].map(n=>n.textContent)};
  });
  const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const dom=await cdp.send('DOM.getDocument');const q=await cdp.send('DOM.querySelector',{nodeId:dom.root.nodeId,selector:'svg .name'});const platformFonts=(await cdp.send('CSS.getPlatformFontsForNode',{nodeId:q.nodeId})).fonts.map(f=>({familyName:f.familyName,isCustomFont:f.isCustomFont,glyphCount:f.glyphCount}));
  // Match semantic identities, directions, guards and message order, independently of layout.
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);const modelErrors=[];
  if(!eq([...metrics.nodeIds].sort(),[...v.node_ids].sort()))modelErrors.push('node IDs');
  if(!eq(metrics.edges.map(e=>e.id),v.relation_ids))modelErrors.push('relation IDs/order');
  for(const e of metrics.edges){const r=model.relations[e.id];if(!r||e.from!==r.from||e.to!==r.to||e.guard!==(r.guard||''))modelErrors.push(e.id+' semantics');}
  const svg=page.locator('svg');await svg.evaluate(el=>{for(const [axis,n] of [['width',1280],['height',720]])for(const pre of ['','min-','max-'])el.style.setProperty(pre+axis,n+'px','important');for(let a=el.parentElement;a;a=a.parentElement)a.style.setProperty('overflow','visible','important');});
  await svg.screenshot({path:path.join(root,'diagrams',v.id+'.png'),omitBackground:true});
  // Reload to test the authored narrow-screen overflow, before screenshot overflow release.
  await page.reload({waitUntil:'domcontentloaded'});await page.setViewportSize({width:390,height:844});
  const mobile=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,localScroll:document.querySelector('.diagram-container').scrollWidth,localClient:document.querySelector('.diagram-container').clientWidth}));
  const svgPage=await browser.newPage();await svgPage.goto(pathToFileURL(path.join(root,'diagrams',v.id+'.svg')).href);const exportedSvgTextCount=await svgPage.locator('text').count();await svgPage.close();
  const pass=!remote.length&&!errors.length&&!metrics.outside.length&&!metrics.labelNodeCollisions.length&&!metrics.nodeTextOverflow.length&&!modelErrors.length&&mobile.documentWidth<=mobile.viewport&&exportedSvgTextCount===metrics.texts.length;
  results.push({id:v.id,status:pass?'PASS':'FAIL',source_sha256:sha(file),png_sha256:sha(path.join(root,'diagrams',v.id+'.png')),svg_sha256:sha(path.join(root,'diagrams',v.id+'.svg')),remoteRequests:remote,pageErrors:errors,modelErrors,platformFonts,mobile,exportedSvgTextCount,...metrics});
  await page.close();
 }
 const out={observed_at:new Date().toISOString(),renderer:'Playwright / headless Chromium',browser_version:browser.version(),playwright_version:require(path.join(process.env.PLAYWRIGHT_MODULE||'playwright','package.json')).version,model_sha256:sha(path.join(root,'model.json')),layout_sha256:sha(path.join(root,'tools/layout.json')),results};
 await browser.close();fs.writeFileSync(path.join(root,'evidence/render-results.json'),JSON.stringify(out,null,2)+'\n');
 console.log(results.map(r=>({id:r.id,status:r.status,outside:r.outside.length,labelNode:r.labelNodeCollisions,overflow:r.nodeTextOverflow,model:r.modelErrors,fonts:r.platformFonts,mobile:r.mobile.documentWidth<=r.mobile.viewport})));
 if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
