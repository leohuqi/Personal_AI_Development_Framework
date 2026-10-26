#!/usr/bin/env python3
"""Use a separately provisioned, hash-verified locked Diagram-Design checkout."""
import argparse,hashlib,json,subprocess,sys
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--skill-dir',type=Path,required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[1];skill=a.skill_dir.resolve()
expected='1b30bb3c0da29a05e5b05c0a4510ce6f286a0d0f1da97b9aa6aaf03c92e98618'
assert hashlib.sha256((skill/'SKILL.md').read_bytes()).hexdigest()==expected,'Pinned Skill content mismatch'
results=[]
for file in sorted((root/'diagrams').glob('*.html')):
 steps=[]
 for argv in [[sys.executable,str(skill/'scripts/self_check.py'),'--offline',str(file)],[sys.executable,str(skill/'scripts/export_svg.py'),str(file),'--system-fonts']]:
  q=subprocess.run(argv,capture_output=True,text=True);steps.append({'tool':Path(argv[1]).name,'exit_code':q.returncode,'stdout':q.stdout.strip(),'stderr':q.stderr.strip()})
 results.append({'diagram':file.stem,'steps':steps})
(root/'evidence/export-check.json').write_text(json.dumps({'skill_content_sha256':expected,'results':results},indent=2)+'\n')
for r in results:print(r['diagram'],[(s['tool'],s['exit_code']) for s in r['steps']])
if any(s['exit_code'] for r in results for s in r['steps']):sys.exit(1)
