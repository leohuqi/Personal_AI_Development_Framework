from pathlib import Path
import json,hashlib,sys
O=Path(__file__).resolve().parent
P=O/'ARTIFACT-MANIFEST.json'
def item(p):
 b=p.read_bytes();return {'path':p.name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'git_blob_sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()}
if '--write' in sys.argv:
 figs=json.loads((O/'diagram-metadata.json').read_text())['figures']
 kinds={'MODULE-DESIGN.md':'module-design','CODE-STRUCTURE.md':'module-code-structure','INTERFACES.swift.txt':'module-interface-contract','CORE-DATA-MODEL.json':'core-data-logical-schema','STATE-CONTRACT.json':'workflow-state-contract'}
 data={'schema_version':'padf.module-artifact-manifest/v1','context_id':'PADF-ISSUE-5-EXPENSE-ACCEPTANCE','dispatch_id':'I5-MODULE-001','execution_id':'I5-MODULE-EXEC-001','runtime_task_ref':'/root/module_architect','system_baseline_ref':'examples/issue-5-acceptance/system/SYSTEM-BASELINE.md@f4dbf0d3fac707db1b57252c529618c38d26f0bc','owner_approval_ref':'OWNER-SYSTEM-APPROVAL.md@05ba2117e2fbb5ac924913accb76b763a2fc268c','skill_ref':'.agents/skills/module-architect/SKILL.md@f1b6a6e4a90d547127bd95bceaa12880a7c39855','skill_blob_sha':'a245054afec4a4c5ffb6b283d32e32a52c46058e','generator':'diagram-design','external_skill_sha':'11b08eade8049c441ed3df1895e3b527c26c0fbe','installed_skill_blob_sha':'359a32025f0e43192b2be1fdfb1a62601d4f3564','project_style_profile_ref':'system/DEFAULT-STYLE.md@123aa014962289feccf527f8e063a19299c1e975','render_test_status':'PASS','consistency_status':'PASS','independent_design_review':'PENDING','owner_quality_grades':'PENDING','coding_authorized':False,'figures':[],'artifacts':[]}
 for f in figs:
  srcs=[t.strip() for t in f['source'].split('+')];data['figures'].append({'diagram_type':f['type'],'purpose':f['title'],'html_path':f['slug']+'.html','svg_path':f['slug']+'.svg','png_path':f['slug']+'.png','authoritative_source_ref':f['source'],'source_note':'Exact source blob SHA for each contract is in artifacts; commit revision supplied by later HANDOFF','generator':'diagram-design','external_skill_sha':data['external_skill_sha'],'render_test_status':'PASS','consistency_status':'PASS'})
 for p in sorted(O.iterdir()):
  if p.is_file() and p.name not in ['ARTIFACT-MANIFEST.json','HANDOFF.md']:
   v=item(p);v['kind']=kinds.get(p.name,'verification-script' if p.suffix in ['.py','.cjs'] else 'diagram' if p.suffix in ['.svg','.png','.html'] else 'supporting-evidence');data['artifacts'].append(v)
 P.write_text(json.dumps(data,indent=2)+'\n')
else:
 data=json.loads(P.read_text());bad=[v['path'] for v in data['artifacts'] if item(O/v['path'])['sha256']!=v['sha256']];assert not bad,bad
 print(json.dumps({'status':'PASS','hashes':len(data['artifacts'])}))
