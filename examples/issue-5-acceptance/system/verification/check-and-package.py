from pathlib import Path
import json,hashlib,struct
out=Path('outputs/issue-5/system');source='f4dbf0d3fac707db1b57252c529618c38d26f0bc'
meta=json.loads((out/'diagram-metadata.json').read_text());model=json.loads(Path('work/system-visuals/sources/SYSTEM-MODEL.json').read_text())
# Expand the named aggregate in the overview and compare with the exact approved graph.
adapters=['LedgerPersistence','BillImport','CategoryRules','LocationAccess','BackupArchive'];edges=set()
for f in meta['figures']:
 if f['slug']!='package-core':continue
 for a,b in f['relationships']:
  for aa in adapters if a=='adapters' else [a]:
   for bb in adapters if b=='adapters' else [b]:edges.add((aa,bb))
expected={(a,b) for a,bs in model['package_dependencies'].items() for b in bs}
assert edges==expected,(edges-expected,expected-edges)
(out/'source-consistency-report.json').write_text(json.dumps({'status':'PASS','approved_model_sha':source,'package_edges_expected':len(expected),'package_edges_visualized_after_expansion':len(edges),'missing_edges':[],'extra_edges':[],'model_invariants':model['invariants'],'content_review':'Author source compatibility review, not independent DESIGN review. All 10 model flows are represented in system or deployment abstraction; import branches use baseline ADR-003. Deployment adds only baseline ADR-005 OS-auth detail. No baseline or technology change.'},indent=2)+'\n')
(out/'DEFAULT-STYLE.md').write_text('''# Visualization style record
Owner selected the shipped default in “批准 system 提案，采用默认风格”. Recorded approval: [OWNER-SYSTEM-APPROVAL.md](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/05ba2117e2fbb5ac924913accb76b763a2fc268c/examples/issue-5-acceptance/OWNER-SYSTEM-APPROVAL.md).

Project-local visualization choice only. Global Skill/profile files were not changed. This is not the application UI Profile.

Default light tokens: paper #f5f5f5, paper-2 #ececec, ink #2d3142, muted #4f5d75, soft #5a6580, accent #bf4520, link #2e5aa8. Minimal light, doc-wide 1280×720, system-font/offline mode. Instrument Serif/Geist/Geist Mono lead the stacks; platform serif/sans/monospace fallbacks are intentional. No font downloads, image assets, backend, telemetry or network requests.

Architecture is a component/boundary snapshot, not a governed deployment pipeline, so the secure-paved-road semantic pattern is not claimed. Import uses Flowchart because explicit decisions/failure branches carry meaning, rather than inventing organizational lanes for Data Flow. Package dependencies split into overview and adapter detail to preserve the exact graph within the density budget.
''')
(out/'README.md').write_text('''# Expense Ledger architecture viewer
Open **architecture-viewer.html** in a modern browser. Everything runs locally with no server or internet connection.

Use System, Deployment, Packages, Adapters and Import to switch views. Select a node for its responsibility, or open “Inspect a node by name”. Keyboard: Tab, then Enter or Space. Zoom is bounded from 50% to 200%; Reset returns to 100% and the left edge. Wide diagrams scroll inside their own frame on a phone. Without JavaScript, all five static diagrams remain visible; printing includes all five.

## Editable and static deliverables
- [Interactive viewer](architecture-viewer.html)
- [System / trust boundaries](system-trust.html) · [SVG](system-trust.svg) · [PNG](system-trust.png)
- [Technical / deployment](technical-deployment.html) · [SVG](technical-deployment.svg) · [PNG](technical-deployment.png)
- [Package overview](package-core.html) · [SVG](package-core.svg) · [PNG](package-core.png)
- [Adapter expansion](package-adapters.html) · [SVG](package-adapters.svg) · [PNG](package-adapters.png)
- [Import workflow](import-workflow.html) · [SVG](import-workflow.svg) · [PNG](import-workflow.png)
- [Desktop viewer screenshot](viewer-desktop.png) · [Mobile viewer screenshot](viewer-mobile.png)

HTML contains editable inline SVG and CSS. Standalone diagrams remain readable without scripting; node responsibilities appear below each diagram in its HTML. Platform fonts intentionally fall back in offline mode, so typography may differ across devices. PNGs are actual Chromium renders, not synthetic images.

## Authoritative sources
- [Approved system baseline](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/f4dbf0d3fac707db1b57252c529618c38d26f0bc/examples/issue-5-acceptance/system/SYSTEM-BASELINE.md)
- [Approved structured model](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/f4dbf0d3fac707db1b57252c529618c38d26f0bc/examples/issue-5-acceptance/system/SYSTEM-MODEL.json)
- [Owner approval and default style selection](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/05ba2117e2fbb5ac924913accb76b763a2fc268c/examples/issue-5-acceptance/OWNER-SYSTEM-APPROVAL.md)
- [Bounded refinement dispatch](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/fc6cf84f1a532a482d0157ce4013571a6a50147e/examples/issue-5-acceptance/SYSTEM-REFINEMENT-DISPATCH.md)

No material baseline decisions changed. The historical baseline still says PROPOSED; the later linked Owner decision records its approval without rewriting history. This is a design visualization package, not an application prototype or implementation.

## Verification and fidelity
[Browser checks](browser-test-report.json), [Skill checks](skill-check-report.json), [source consistency](source-consistency-report.json), [artifact hashes](ARTIFACT-MANIFEST.json), [style record](DEFAULT-STYLE.md).

Actual browser checks cover five views and all 36 nodes, click/keyboard/name-index inspection, zoom bounds/reset, 390px local scrolling, print and no-JavaScript fallback, zero external requests/page errors, static text bounds and screenshots. Five static self-checks and geometry checks passed. A source consistency comparison expands the overview’s named adapter aggregate to exactly all 19 approved package edges.

Fidelity: system overview shows 9 model participants; OS location/file-provider flows expand in Deployment. Deployment collapses all app packages into one native executable, with canonical protected store inside its sandbox and OS-auth service from baseline ADR-005. Core package view names all five aggregated adapters and expands them in the Adapters view. User, external input/provider, sandbox, store and OS-service boundaries remain explicit. Import expands ADR-003 with unsupported/cancel/failure outcomes, retained refund evidence and atomic commit. No source relationship or invariant is silently removed.

PASS records author verification, not independent DESIGN review, Owner Skill grades, final Issue acceptance, application build/performance/security validation, coding approval, merge or deployment. Those decisions remain with their assigned roles.
''')
manifest={'schema_version':'padf.diagram-artifact-manifest/v1','dispatch_id':'I5-SYSTEM-002','execution_id':'I5-SYSTEM-EXEC-002','runtime_task_reference':'/root/system_visuals','approved_source_sha':source,'source_blobs':{'SYSTEM-BASELINE.md':'2c404e302213cc0968d71ffd8d986473cce2c8f0','SYSTEM-MODEL.json':'25d3617848dcd2d8f97f36efa0043922dacafead'},'generator':'diagram-design','external_skill_sha':'11b08eade8049c441ed3df1895e3b527c26c0fbe','installed_skill_path':'/Users/leohu/.codex/plugins/cache/diagram-design/diagram-design/2.6.98/skills/diagram-design/SKILL.md','installed_skill_blob_sha':'359a32025f0e43192b2be1fdfb1a62601d4f3564','installed_checkout_status':'clean at verification','project_style_profile_ref':'DEFAULT-STYLE.md','render_test_status':'PASS','diagram_generation':'Actually authored HTML/SVG using loaded pinned Skill/template/type references; exported SVG via pinned export_svg.py and PNG through bundled Node Playwright with installed Chrome. Python Playwright/default bundled Chromium absent; no runtime installed. Headless Chrome required allowed host launch outside the filesystem sandbox.','renderer':json.loads((out/'browser-test-report.json').read_text())['renderer'],'browser':json.loads((out/'browser-test-report.json').read_text())['browser'],'authoring_script_sha256':hashlib.sha256(Path('work/system-visuals/generate.py').read_bytes()).hexdigest(),'browser_verification_script_sha256':hashlib.sha256(Path('work/system-visuals/verify.cjs').read_bytes()).hexdigest(),'source_script_paths':['work/system-visuals/generate.py','work/system-visuals/verify.cjs'],'content_review':'Author compared approved sources and visually inspected real screenshots, no independent review claimed','figures':[],'artifacts':[]}
for f in meta['figures']:
 manifest['figures'].append({'diagram_type':f['type'],'purpose':f['title'],'authoritative_source_ref':('SYSTEM-BASELINE.md ADR-003' if f['slug']=='import-workflow' else 'SYSTEM-MODEL.json + SYSTEM-BASELINE.md')+'@'+source,'html_path':f['slug']+'.html','svg_path':f['slug']+'.svg','png_path':f['slug']+'.png','generator':'diagram-design','external_skill_sha':manifest['external_skill_sha'],'project_style_profile_ref':'DEFAULT-STYLE.md','render_test_status':'PASS','nodes':f['nodes'],'edges':f['edges']})
for p in sorted(out.iterdir()):
 if p.name in ['ARTIFACT-MANIFEST.json','HANDOFF-V2.md','REFINEMENT-COMPLETION.md']:continue
 data=p.read_bytes();item={'path':p.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 if p.suffix=='.png':item['pixel_dimensions']=list(struct.unpack('>II',data[16:24]));item['provenance']='Actual browser screenshot, Playwright / Chrome; file:// source; deviceScaleFactor=2; svg PNGs clipped to original HTML diagram at 1280×720 CSS pixels. Viewer screenshots are full-page desktop/mobile captures.'
 manifest['artifacts'].append(item)
(out/'ARTIFACT-MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'source_consistency':'PASS','package_edges':len(edges),'artifacts':len(manifest['artifacts'])}))
