from pathlib import Path
import html,json,re,hashlib

OUT=Path('outputs/issue-5/system'); OUT.mkdir(parents=True,exist_ok=True)
SOURCE='f4dbf0d3fac707db1b57252c529618c38d26f0bc'
PAPER='#f5f5f5'; INK='#2d3142'; MUTED='#4f5d75'; SOFT='#5a6580'; ACCENT='#bf4520'; LINK='#2e5aa8'
def esc(s): return html.escape(str(s),quote=True)
CSS='''
:root{--paper:#f5f5f5;--ink:#2d3142;--muted:#4f5d75;--accent:#bf4520;--sans:'Geist',system-ui,sans-serif;--serif:'Instrument Serif','Noto Serif',serif;--mono:'Geist Mono',ui-monospace,monospace}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans)}main{max-width:1440px;margin:auto;padding:40px 32px 32px;min-width:0}header{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:28px}.eyebrow{font:11px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}h1{font:400 38px/1.1 var(--serif);margin:0}header p{max-width:420px;font-size:14px;line-height:1.6;color:var(--muted);margin:0}h2{font:400 28px var(--serif);margin:0 0 8px}.intro{font-size:14px;line-height:1.6;color:var(--muted);max-width:850px;margin:0 0 12px}.diagram-container{width:100%;overflow:auto;min-width:0;border-top:1px solid #bfc0c0;border-bottom:1px solid #bfc0c0}.diagram-container svg{display:block;width:100%;min-width:1280px;height:auto;background:#f5f5f5}.node-name{font:600 12px 'Geist',system-ui,sans-serif;fill:#2d3142}.sub{font:9px 'Geist Mono',ui-monospace,monospace;fill:#5a6580}.tag,.arrow-label{font:8px 'Geist Mono',ui-monospace,monospace;letter-spacing:.06em;fill:#4f5d75}.zone-label{font:8px 'Geist Mono',ui-monospace,monospace;letter-spacing:.12em;fill:#5a6580}.annotation{font:14px 'Instrument Serif','Noto Serif',serif;font-style:italic;fill:#4f5d75}.legend{font:10px 'Geist',system-ui,sans-serif;fill:#4f5d75}svg .inspect{cursor:pointer}svg .inspect:focus{outline:none}svg .inspect:focus .node-box,svg .inspect[data-selected=true] .node-box{stroke:#2e5aa8;stroke-width:3}button{font:13px var(--sans);color:var(--ink);border:1px solid #bfc0c0;background:#fff;padding:10px 14px;border-radius:6px;cursor:pointer}button:hover{border-color:var(--ink)}button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid #2e5aa8;outline-offset:3px}.toolbar{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px}.views,.zoom{display:flex;gap:6px;flex-wrap:wrap}.views button[aria-pressed=true]{color:#fff;background:var(--ink);border-color:var(--ink)}.zoom output{font:12px var(--mono);align-self:center;min-width:48px;text-align:center}.detail{display:grid;grid-template-columns:240px 1fr;gap:28px;padding:24px 0;border-bottom:1px solid #bfc0c0;min-height:140px}.detail h3{font-size:16px;margin:0 0 6px}.detail p{font-size:14px;line-height:1.7;margin:0;max-width:950px}.hint{font-size:12px!important;color:var(--muted)}.index{margin:20px 0}.index summary{cursor:pointer;font-size:13px}.index nav{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.facts{display:grid;grid-template-columns:1.15fr 1fr;gap:40px;margin-top:22px}.facts p{font-size:13px;line-height:1.7;margin:0;color:var(--muted)}footer{font-size:11px;color:var(--muted);margin-top:28px}footer a{color:#2e5aa8}section[hidden]{display:none}noscript p{font-size:14px}body.nojs .toolbar{display:none}body.nojs .detail{display:none}@media(max-width:700px){main{padding:24px 16px}header{display:block}header p{margin-top:16px}h1{font-size:32px}.detail{grid-template-columns:1fr;gap:8px}.facts{grid-template-columns:1fr;gap:12px}}@media print{main{padding:0}.toolbar,.index,.detail{display:none}.diagram-container{overflow:visible}.diagram-container svg{min-width:0!important;width:100%!important}section{display:block!important;break-after:page}header{display:block}header p{margin-top:8px}}
'''

class Figure:
 def __init__(self,slug,title,description,kind):self.slug=slug;self.title=title;self.description=description;self.kind=kind;self.zones=[];self.nodes=[];self.edges=[];self.notes=[]
 def zone(self,x,y,w,h,label):self.zones.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#ececec" fill-opacity="0.3" stroke="#5a6580" stroke-dasharray="4 4"/><text x="{x+16}" y="{y+24}" class="zone-label">{esc(label)}</text>')
 def node(self,id,x,y,w,h,title,sub,tag,detail,accent=False,shape='rect',badge=None):self.nodes.append(dict(id=id,x=x,y=y,w=w,h=h,title=title,sub=sub,tag=tag,detail=detail,accent=accent,shape=shape,badge=badge))
 def edge(self,src,dst,pts,label=None,lpos=None,color=MUTED,dash=False):self.edges.append(dict(src=src,dst=dst,pts=pts,label=label,lpos=lpos,color=color,dash=dash))
 def note(self,x,y,text):self.notes.append(f'<text x="{x}" y="{y}" class="annotation">{esc(text)}</text>')
 def svg(self):
  # Orthogonal routes with rounded corners and white-masked hops at crossings.
  parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-labelledby="{self.slug}-title {self.slug}-desc"><title id="{self.slug}-title">{esc(self.title)}</title><desc id="{self.slug}-desc">{esc(self.description)}</desc><defs>']
  for c,n in [(MUTED,'arrow'),(ACCENT,'accent'),(LINK,'link')]:parts.append(f'<marker id="{self.slug}-{n}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0 0 L8 3 L0 6 Z" fill="{c}"/></marker>')
  parts+=['</defs><rect x="0" y="0" width="1280" height="720" fill="#f5f5f5"/>',*self.zones]
  segments=[]
  for e in self.edges:
   pts=e['pts']; d=f'M {pts[0][0]} {pts[0][1]}'
   for i in range(1,len(pts)):
    x,y=pts[i];px,py=pts[i-1]
    if i<len(pts)-1:
     nx,ny=pts[i+1];r=min(8,abs(x-px+y-py)/2,abs(nx-x+ny-y)/2)
     bx=x-(1 if x>px else -1 if x<px else 0)*r;by=y-(1 if y>py else -1 if y<py else 0)*r
     ax=x+(1 if nx>x else -1 if nx<x else 0)*r;ay=y+(1 if ny>y else -1 if ny<y else 0)*r
     d+=f' L {bx} {by} Q {x} {y} {ax} {ay}'
    else:d+=f' L {x} {y}'
   marker='link' if e['color']==LINK else 'accent' if e['color']==ACCENT else 'arrow'
   parts.append(f'<path data-from="{e["src"]}" data-to="{e["dst"]}" d="{d}" fill="none" stroke="{e["color"]}" stroke-width="1.5"'+(' stroke-dasharray="5 4"' if e['dash'] else '')+f' marker-end="url(#{self.slug}-{marker})"/>')
   # At each crossing the later path gets a small bridge (and no shared stroke).
   for a,b in zip(pts,pts[1:]):
    for c,dd in segments:
     horiz=a[1]==b[1]; other_h=c[1]==dd[1]
     if horiz==other_h:continue
     hx1,hx2,hy=(a[0],b[0],a[1]) if horiz else (c[0],dd[0],c[1]);vx,vy1,vy2=(c[0],c[1],dd[1]) if horiz else (a[0],a[1],b[1])
     if min(hx1,hx2)+10<vx<max(hx1,hx2)-10 and min(vy1,vy2)+10<hy<max(vy1,vy2)-10:
      bridge=f'M {vx-6} {hy} Q {vx} {hy-12} {vx+6} {hy}' if horiz else f'M {vx} {hy-6} Q {vx+12} {hy} {vx} {hy+6}'
      parts.append(f'<circle cx="{vx}" cy="{hy}" r="6" fill="#f5f5f5"/><path d="{bridge}" fill="none" stroke="{e["color"]}" stroke-width="1.5"/>')
   segments+=list(zip(pts,pts[1:]))
  for e in self.edges:
   if e['label']:
    x,y=e['lpos'];w=len(e['label'])*5+16
    parts.append(f'<rect x="{x-w/2}" y="{y-12}" width="{w}" height="18" fill="#f5f5f5"/><text x="{x}" y="{y}" text-anchor="middle" class="arrow-label">{esc(e["label"])}</text>')
  for n in self.nodes:
   x,y,w,h=[n[k] for k in ['x','y','w','h']];fill='#f5f5f5' if not n['accent'] else '#f3e7e2';stroke=ACCENT if n['accent'] else INK
   parts.append(f'<g class="inspect" data-node="{n["id"]}" data-title="{esc(n["title"])}" data-detail="{esc(n["detail"])}" tabindex="0" role="button" aria-label="Inspect {esc(n["title"])}">')
   if n['shape']=='diamond':parts.append(f'<path class="node-box" d="M {x+w/2} {y} L {x+w} {y+h/2} L {x+w/2} {y+h} L {x} {y+h/2} Z" fill="{fill}" stroke="{stroke}"/>')
   else:parts.append(f'<rect class="node-box" x="{x}" y="{y}" width="{w}" height="{h}" rx="{24 if n["shape"]=="oval" else 6}" fill="{fill}" stroke="{stroke}"/>')
   if n['shape']=='diamond':parts.append(f'<text x="{x+w/2}" y="{y+h/2+4}" text-anchor="middle" class="node-name">{esc(n["title"])}</text>')
   else:
    parts.append(f'<text x="{x+16}" y="{y+18}" class="tag">{esc(n["tag"])}</text><text x="{x+16}" y="{y+40}" class="node-name">{esc(n["title"])}</text>')
    for k,line in enumerate(n['sub'].split('|')):parts.append(f'<text x="{x+16}" y="{y+58+k*16}" class="sub">{esc(line)}</text>')
    if n['badge'] is not None:parts.append(f'<text x="{x+w-12}" y="{y+18}" text-anchor="end" class="tag">{n["badge"]} in</text>')
   parts.append('</g>')
  parts+=self.notes
  parts.append(f'<line x1="40" y1="660" x2="1240" y2="660" stroke="#bfc0c0"/><text x="40" y="690" class="legend">{esc(self.kind)} · Arrows show {"dependency direction" if self.kind=="Dependency graph" else "explicit flow"}. Select a node to inspect its responsibility.</text></svg>')
  return ''.join(parts)

F=[]
s=Figure('system-trust','Local ledger, explicit boundaries','User-selected files enter the iPhone app sandbox; local use cases own ledger writes, suggestions, location requests and backup.','Architecture')
s.zone(252,96,988,508,'IPHONE APP SANDBOX · ONE PROCESS');s.zone(40,96,184,508,'USER / UNTRUSTED INPUT')
for n in [
('user',56,160,152,80,'User','entry / consent','ACTOR','The user controls manual entry, category overrides, import confirmation, current-location consent and backup destination.'),
('file',56,400,152,80,'Selected export','WeChat / Alipay','DOCUMENT','Untrusted user-exported bill copy. No provider login, API or automatic history scraping. Strict quotas and supported-profile validation apply.'),
('presentation',288,160,184,80,'Presentation','SwiftUI','SCREEN','Screen state, category dropdown and review/permission feedback. Calls application use cases; never mutates the store directly.'),
('application',548,160,184,80,'Application','Swift 6.2','USE CASE','Coordinates versioned commands/results, review, atomic commit, suggestions, explicit location and backup requests. Owns cross-adapter coordination.'),
('persistence',1020,160,184,80,'Canonical ledger','Core Data / SQLite','STORE','Owns ledger, source evidence, refunds and overrides. One atomic durable import transaction; no direct SQLite queries outside Core Data.'),
('import_adapter',288,400,184,80,'Import adapter','Foundation','VALIDATION','Supported profile registry, bounded streaming validation and normalization. Selected copies are protected staging, transient and read-only to this adapter.'),
('category_rules',548,400,184,80,'Category rules','local / versioned','SUGGESTION','Reproducible local suggestions with version and reason. Explicit user choice always wins; reimport never silently replaces overrides.'),
('location_adapter',784,400,184,80,'Location access','foreground only','CONSENT','Collects a current fix only on explicit request, with collectedAt, accuracy and purpose. Current GPS never asserts a historical purchase location.'),
('backup_adapter',1020,400,184,80,'Backup archive','CryptoKit / KDF','RECOVERY','Explicit encrypted portable backup and staged restore. Invalid password, corruption or unsupported schema leaves the current ledger untouched.')]:s.node(*n,accent=n[0]=='persistence')
s.edge('user','presentation',[(208,200),(288,200)],'EXPLICIT',(248,184),LINK)
s.edge('presentation','application',[(472,200),(548,200)])
s.edge('application','persistence',[(732,184),(1020,184)],'ATOMIC WRITE',(876,168))
s.edge('file','import_adapter',[(208,440),(288,440)],'COPY',(248,424),LINK)
s.edge('application','import_adapter',[(572,240),(572,316),(380,316),(380,400)])
s.edge('application','category_rules',[(636,240),(636,400)],'SUGGEST',(672,340))
s.edge('application','location_adapter',[(700,240),(700,288),(876,288),(876,400)])
s.edge('application','backup_adapter',[(732,216),(988,216),(988,336),(1112,336),(1112,400)])
s.note(288,548,'No provider credentials, network API, backend or remote inference.')
s.note(288,580,'Only user-confirmed data becomes canonical; source evidence remains auditable.')
F.append(s)

d=Figure('technical-deployment','One iPhone. One native process.','The iPhone app uses OS location, device authentication and protected storage, with encrypted manual export to the user-selected file provider.','Deployment')
d.zone(40,72,928,544,'SINGLE IPHONE · IOS 17+');d.zone(76,128,852,256,'APP SANDBOX · 1 EXECUTABLE + PROTECTED LOCAL DATA');d.zone(76,416,852,152,'IOS TRUSTED SERVICES')
d.node('runtime',108,184,296,176,'Expense Ledger','SwiftUI / Foundation|Core Data / Core Location|CryptoKit + CommonCrypto','NATIVE ×1','Build baseline: Xcode 26.0, Swift 6.2 and iOS 26 SDK; minimum iOS 17. App + local Swift packages, no remote package dependencies. App composition wires Presentation plus LedgerPersistence, BillImport, CategoryRules, LocationAccess and BackupArchive. These are approved design versions, not an asserted build or installed Xcode version.',True)
d.node('store',528,184,352,80,'Protected local store','LedgerModel v1 · Core Data SQLite','DEVICE FILES','Canonical ledger plus protected staging/logs. Apply complete file protection, including WAL/SHM; defer store work while locked. No automatic OS cloud backup for the app store/staging under the manual backup policy.')
d.node('location',108,448,296,80,'Core Location','when-in-use · foreground','OS PERMISSION','Only explicit current-location requests. Denial, timeout, reduced accuracy or no fix must preserve saving and import; keep unknown/existing evidence.')
d.node('auth',528,448,352,80,'Device authentication','passcode / optional LocalAuthentication','OS AUTH','Single local OS user; device passcode and sandbox are the primary boundary. Optional sensitive-screen lock uses OS authentication and is not a separate encryption scheme.')
d.node('provider',1016,344,224,112,'OS file provider','encrypted archive v1|user-selected destination','EXTERNAL DESTINATION','Explicit manual encrypted backup only. Provider may sync externally at the user-selected destination. Passphrase not persisted; forgotten passphrase cannot be recovered. Restore validates a candidate store before swapping.')
d.edge('runtime','store',[(404,208),(528,208)],'CORE DATA',(468,192))
d.edge('runtime','location',[(220,360),(220,448)])
d.edge('runtime','auth',[(352,360),(352,400),(704,400),(704,448)])
d.edge('runtime','provider',[(404,304),(976,304),(976,400),(1016,400)],'AES-256-GCM',(696,288),LINK)
d.note(1016,520,'No app hosting.')
d.note(1016,552,'No network endpoints.')
F.append(d)

p=Figure('package-core','Packages point inward','The composition root wires presentation and adapters; presentation calls application ports and the domain stays independent of UI, storage and permissions.','Dependency graph')
for n in [
('App',528,80,224,80,'App','composition / lifecycle','ROOT','The sole composition root wires LedgerPresentation and the five concrete adapters: LedgerPersistence, BillImport, CategoryRules, LocationAccess and BackupArchive.',0),
('LedgerPresentation',264,248,232,80,'LedgerPresentation','screens / view state','PACKAGE','Depends on LedgerApplication and DesignSystem. Cannot depend directly on persistence or other adapters.',1),
('adapters',824,248,360,128,'Adapters ×5','LedgerPersistence · BillImport|CategoryRules · LocationAccess|BackupArchive','EXPANDED IN ADAPTER VIEW','Aggregate of exactly five packages. App depends on each; each depends on LedgerApplication ports and LedgerDomain. No adapter-to-adapter or adapter-to-Presentation dependencies.',1),
('DesignSystem',80,440,232,80,'DesignSystem','tokens / components','PACKAGE','Presentation dependency only. Visual tokens/components require the separately approved UI Profile; this architecture viewer establishes no app UI design.',1),
('LedgerApplication',528,440,232,80,'LedgerApplication','use cases / ports','PACKAGE','Depends only on LedgerDomain; coordinates adapters through ports. Actual graph fan-in is 6 (Presentation plus five adapters).',6),
('LedgerDomain',528,568,232,72,'LedgerDomain','Foundation-only policies','PACKAGE','Money, ledger and provenance invariants; no UI, storage or permission framework. Actual graph fan-in is 6 (Application plus five adapters).',6)]:p.node(*n[:-1],badge=n[-1])
p.edge('App','LedgerPresentation',[(568,160),(568,204),(380,204),(380,248)])
p.edge('App','adapters',[(712,160),(712,204),(1004,204),(1004,248)])
p.edge('LedgerPresentation','DesignSystem',[(312,328),(312,384),(196,384),(196,440)])
p.edge('LedgerPresentation','LedgerApplication',[(448,328),(448,384),(644,384),(644,440)])
p.edge('adapters','LedgerApplication',[(888,376),(888,480),(760,480)])
p.edge('LedgerApplication','LedgerDomain',[(644,520),(644,568)])
p.edge('adapters','LedgerDomain',[(1120,376),(1120,604),(760,604)])
p.note(80,600,'Five adapter dependencies are expanded in the next view.')
F.append(p)

a=Figure('package-adapters','Five adapters, two shared contracts','Every concrete adapter depends on application ports and domain policies, with no dependencies between adapters.','Dependency graph')
names=['LedgerPersistence','BillImport','CategoryRules','LocationAccess','BackupArchive']
details=['Core Data adapter, model and migrations.','Provider export adapters and supported profile registry.','Deterministic local rules and user mappings.','Core Location foreground adapter.','Portable schema, authenticated encryption and file adapter.']
for i,(name,detail) in enumerate(zip(names,details)):
 x=80+i*232;a.node(name,x,128,192,80,name,'application + domain','ADAPTER',detail+' Depends on LedgerApplication and LedgerDomain only; App creates and wires it.',badge=1)
a.node('LedgerApplication',224,424,304,88,'LedgerApplication','use cases and ports','CONTRACT','All five concrete adapters depend on application-defined ports. Application coordinates adapters without referencing concrete implementations. Badge is full graph fan-in, including Presentation.',badge=6)
a.node('LedgerDomain',776,552,304,88,'LedgerDomain','pure Swift / Foundation','POLICY','All five adapters and Application depend on domain policies. No dependency from Domain to UI, storage or permission frameworks.',badge=6)
for i,name in enumerate(names):
 x=80+i*232
 a.edge(name,'LedgerApplication',[(x+48,208),(x+48,244+i*16),(272+i*48,244+i*16),(272+i*48,424)])
 a.edge(name,'LedgerDomain',[(x+136,208),(x+136,328+i*16),(808+i*56,328+i*16),(808+i*56,552)])
a.note(80,596,'App wires all five adapters; no lateral adapter imports.')
F.append(a)

i=Figure('import-workflow','Review first. Commit atomically.','Selected exports are validated and reviewed before explicit atomic commit; cancellation and failures preserve the canonical ledger.','Flowchart')
for n in [
('select',536,48,224,72,'Select exported file','bounded protected copy','INPUT','User picks a previously exported WeChat/Alipay document. Copy to protected staging; maximum 10 MiB, 10,000 rows and 256 KiB per row. No provider login.'),
('validate',536,152,224,72,'Detect and validate','explicit profile / encoding','STEP','Detect supported profile, normalize and validate with bounded streaming parser. Never guess an unknown financial format. Retain provider/profile/version, source-file hash and source row identity.'),
('review',536,256,224,72,'Preview and review','suggestions / duplicates','STEP','Local category rules provide versioned reasoned suggestions, user overrides win. Ambiguous duplicates require review. Retain unresolved refunds and exclude them from settled net totals until linked; preserve source evidence. Import never automatically requests GPS.'),
('confirm',548,360,200,80,'Confirm import?','','DECISION','Only an explicit user confirmation authorizes the ledger transaction. Cancellation discards staging and preserves ledger.',False,'diamond'),
('commit',536,464,224,72,'Commit one batch','atomic durable transaction','STEP','Persistence commits all entries, source/refund/override records atomically. Strong provider/account/transaction identity or reviewed fingerprint handles duplicates across overlapping exports. Same file hash prevents repeated batch commit.',True),
('success',536,568,224,72,'Saved + cleaned','staging deleted','END','Canonical ledger is durable; delete staging after completion. Crash after durable commit: reopening the batch ID returns the committed result. No partial commit.'),
('unsupported',112,152,296,72,'Stop: unsupported input','safe format / validation report','END','Unknown profile, header, encoding or quota violation stops import. Actionable report uses row numbers/codes by default. Ledger unchanged; protected staging cleaned on review completion/cancellation.'),
('cancel',920,360,288,80,'Cancel + discard staging','ledger unchanged','END','Cancel before commit removes staging only. Raw source documents are transient and deleted after completion or cancellation; never used as portable backup.'),
('rollback',920,464,288,112,'Rollback / safe retry','ledger unchanged|stable code / recoverability','END','Crash before durable commit, locked store, disk full or transaction failure cannot leave partial entries. Retry must remain idempotent. Persist safe error codes/counts only, no amounts, merchants, coordinates or raw provider IDs.')]:
 if len(n)>9:i.node(*n)
 else:i.node(*n,shape='oval' if n[0] in ['select','success','unsupported','cancel','rollback'] else 'rect')
i.edge('select','validate',[(648,120),(648,152)])
i.edge('validate','review',[(648,224),(648,256)])
i.edge('validate','unsupported',[(536,188),(408,188)],'UNSUPPORTED',(472,172))
i.edge('review','confirm',[(648,328),(648,360)])
i.edge('confirm','commit',[(648,440),(648,464)],'YES',(688,456))
i.edge('confirm','cancel',[(748,400),(920,400)],'NO / CANCEL',(836,384))
i.edge('commit','success',[(648,536),(648,568)])
i.edge('commit','rollback',[(760,500),(920,500)],'FAILURE',(840,484))
F.append(i)

FACTS={
'system-trust':['The canonical ledger stays in the app sandbox. User-selected documents are untrusted input; backup is an explicit encrypted export. OS boundaries are expanded in Deployment.','Current GPS is a present observation with consent, time and accuracy. It is never inferred to be a historical purchase location.'],
'technical-deployment':['Build baseline: Xcode 26.0 · Swift 6.2 · iOS 26 SDK. Runtime target: iOS 17+. One process; no server, remote packages or provider API. These are design decisions, not application build results.','Backup envelope v1 uses PBKDF2-HMAC-SHA256 (600,000 iterations), random salt and AES-256-GCM. Password is not stored. Restore validates a candidate store before replacing the current one.'],
'package-core':['App → LedgerPresentation + the five named adapters. LedgerPresentation → LedgerApplication + DesignSystem. LedgerApplication → LedgerDomain. Aggregate edges expand one-for-five; no dependency is omitted.','Each adapter → LedgerApplication + LedgerDomain. No adapter-to-adapter or adapter-to-Presentation imports. Badges show full graph fan-in; the adapter aggregate is expanded in Adapters.'],
'package-adapters':['Ten edges expand the five adapters’ dependencies. The core view shows App’s five composition dependencies as one explicit aggregate edge and Application → Domain.','No cycles. No generic Common package. Domain remains independent of SwiftUI, Core Data and Core Location. Cross-adapter coordination belongs in Application.'],
'import-workflow':['Keep provider evidence beside edits. A provider/account/transaction ID is the strongest identity; deterministic fingerprints require review when ambiguous. User category overrides always win.','Unresolved refunds remain auditable and stay out of settled net totals until linked. Crash before commit leaves ledger unchanged; after commit, reopening batch ID returns the committed result.']}

def section(f,interactive=False):
 nodeindex=''.join(f'<button type="button" data-inspect="{n["id"]}">{esc(n["title"])}</button>' for n in f.nodes)
 details=''.join(f'<p><strong>{esc(n["title"])}.</strong> {esc(n["detail"])}</p>' for n in f.nodes)
 return f'<section id="{f.slug}" data-view="{f.slug}"><h2>{f.title}</h2><p class="intro">{f.description}</p><div class="diagram-container" tabindex="0" aria-label="Scrollable {esc(f.title)} diagram">{f.svg()}</div>'+ (f'<details class="index"><summary>Inspect a node by name</summary><nav aria-label="Nodes in {esc(f.title)}">{nodeindex}</nav></details>' if interactive else '')+f'<div class="facts"><p>{FACTS[f.slug][0]}</p><p>{FACTS[f.slug][1]}</p></div>'+('' if interactive else f'<details class="index"><summary>Node responsibilities</summary>{details}</details>')+'</section>'

for f in F:
 content=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{f.title}</title><style>{CSS}</style></head><body><main><p class="eyebrow">Expense Ledger · {f.kind}</p>{section(f)}<footer>Approved system source {SOURCE[:12]} · Offline system fonts · Design visualization</footer></main></body></html>'
 content=content.replace(' tabindex="0" role="button"','').replace('Select a node to inspect its responsibility.','Node responsibilities are listed in the source HTML.')
 (OUT/(f.slug+'.html')).write_text(content)

JS='''
document.body.classList.remove('nojs');
const views=[...document.querySelectorAll('[data-view]')], tabs=[...document.querySelectorAll('[data-switch]')];let zoom=1;
const detailTitle=document.getElementById('detail-title'),detailText=document.getElementById('detail-text');
function active(){return views.find(v=>!v.hidden)}
function scale(){const svg=active().querySelector('svg');svg.style.width=(1280*zoom)+'px';svg.style.minWidth=(1280*zoom)+'px';document.getElementById('zoom-level').value=Math.round(zoom*100)+'%'}
function inspect(node){document.querySelectorAll('[data-selected]').forEach(n=>n.removeAttribute('data-selected'));node.dataset.selected='true';detailTitle.textContent=node.dataset.title;detailText.textContent=node.dataset.detail}
function show(id){const found=views.find(v=>v.id===id)||views[0];views.forEach(v=>v.hidden=v!==found);tabs.forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.switch===found.id)));zoom=1;scale();found.querySelector('.diagram-container').scrollTo(0,0);detailTitle.textContent='Explore this view';detailText.textContent='Select a diagram node, or open the node index and choose a name. Use Tab and Enter or Space with the keyboard.';history.replaceState(null,'','#'+found.id)}
tabs.forEach(t=>t.addEventListener('click',()=>show(t.dataset.switch)));
document.querySelectorAll('.inspect').forEach(n=>{n.addEventListener('click',()=>inspect(n));n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(n)}})});
document.querySelectorAll('[data-inspect]').forEach(b=>b.addEventListener('click',()=>inspect(b.closest('section').querySelector('[data-node="'+b.dataset.inspect+'"]'))));
document.getElementById('zoom-in').addEventListener('click',()=>{zoom=Math.min(2,zoom+.25);scale()});document.getElementById('zoom-out').addEventListener('click',()=>{zoom=Math.max(.5,zoom-.25);scale()});document.getElementById('reset').addEventListener('click',()=>{zoom=1;scale();active().querySelector('.diagram-container').scrollTo(0,0)});
show(location.hash.slice(1));
'''
nav=''.join(f'<button type="button" data-switch="{f.slug}" aria-controls="{f.slug}" aria-pressed="false">{label}</button>' for f,label in zip(F,['System','Deployment','Packages','Adapters','Import']))
viewer=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Expense Ledger · Architecture</title><meta name="description" content="Offline interactive architecture viewer for the approved Expense Ledger system."><style>{CSS}</style></head><body class="nojs"><main><header><div><p class="eyebrow">Expense Ledger · System architecture</p><h1>A private ledger, on your iPhone.</h1></div><p>Explore the system, its boundaries and the path from a selected bill to an auditable entry.</p></header><nav class="toolbar" aria-label="Architecture controls"><div class="views">{nav}</div><div class="zoom"><button id="zoom-out" type="button" aria-label="Zoom out">−</button><output id="zoom-level" aria-live="polite">100%</output><button id="zoom-in" type="button" aria-label="Zoom in">+</button><button id="reset" type="button">Reset</button></div></nav><noscript><p>All five diagrams are shown below. Open each diagram’s standalone HTML for a focused static view.</p></noscript>{''.join(section(f,True) for f in F)}<aside class="detail" aria-label="Node details"><div><h3 id="detail-title">Explore this view</h3><p class="hint">Keyboard: Tab → Enter / Space</p></div><p id="detail-text" aria-live="polite"></p></aside><footer>Approved SYSTEM design · Offline viewer · <a href="README.md">Sources and usage</a></footer></main><script>{JS}</script></body></html>'''
(OUT/'architecture-viewer.html').write_text(viewer)
(OUT/'diagram-metadata.json').write_text(json.dumps({'source_sha':SOURCE,'generator':'diagram-design','external_skill_sha':'11b08eade8049c441ed3df1895e3b527c26c0fbe','font_source':'system','figures':[{'slug':f.slug,'title':f.title,'type':f.kind,'nodes':len(f.nodes),'edges':len(f.edges),'relationships':[[e['src'],e['dst']] for e in f.edges]} for f in F]},indent=2)+'\n')
print('Generated five static diagrams and architecture-viewer.html')
