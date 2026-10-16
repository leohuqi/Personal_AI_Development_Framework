"""Run pinned installed diagram-design safety/geometry checks and SVG exports. No downloads."""
from pathlib import Path
import json,os,subprocess
O=Path(__file__).resolve().parent
R=Path(os.environ.get('DIAGRAM_DESIGN_ROOT','/Users/leohu/.codex/plugins/cache/diagram-design/diagram-design/2.6.98'))
def run(args):
 r=subprocess.run(args,capture_output=True,text=True)
 return r.returncode,r.stdout+r.stderr
head=run(['git','-C',str(R),'rev-parse','HEAD'])[1].strip()
assert head=='11b08eade8049c441ed3df1895e3b527c26c0fbe',head
checks=[]
for f in json.loads((O/'diagram-metadata.json').read_text())['figures']:
 p=O/(f['slug']+'.html')
 for tool,args in [(R/'skills/diagram-design/scripts/self_check.py',['--offline']), (R/'scripts/verify-geometry.py',[]),(R/'skills/diagram-design/scripts/export_svg.py',['--system-fonts'])]:
  code,log=run(['python3',str(tool),*args,str(p)]);checks.append({'figure':f['slug'],'tool':tool.name,'status':'PASS' if code==0 else 'FAIL','output':log.replace(str(O)+'/','')})
report={'status':'PASS' if all(c['status']=='PASS' for c in checks) else 'FAIL','skill_sha':head,'checks':checks}
(O/'skill-test-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':report['status'],'checks':len(checks)}));assert report['status']=='PASS'
