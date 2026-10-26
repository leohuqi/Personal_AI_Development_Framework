#!/usr/bin/env python3
"""Real mutation checks against rendered-source/model consistency (not browser QA)."""
import json, shutil, subprocess, sys, tempfile
from pathlib import Path
root=Path(__file__).resolve().parents[2]
source=root/'examples/architecture-method'
cases=[
 ('baseline',None,None,None,True),
 ('node label','diagrams/standard-container.svg','Web应用','另一个运行单元',False),
 ('inline HTML label','diagrams/standard-container.html','Web应用','另一个运行单元',False),
 ('node kind','diagrams/standard-container.svg','data-kind="CONTAINER"','data-kind="HOST"',False),
 ('relation direction','diagrams/standard-container.svg','data-to="S-API"','data-to="S-WEB"',False),
 ('relation label','diagrams/standard-container.svg','data-label="HTTPS"','data-label="任意直写"',False),
 ('runtime guard','diagrams/full-runtime.svg','data-guard="valid"','data-guard="invalid"',False),
 ('deployment instance','diagrams/full-deployment.svg','data-instance-of="C-API"','data-instance-of="C-PARSER"',False),
]
results=[]
with tempfile.TemporaryDirectory(prefix='padf-diagram-mutations-') as tmp:
 for name,file,before,after,expected in cases:
  target=Path(tmp)/name.replace(' ','-');shutil.copytree(source,target)
  if file:
   p=target/file;text=p.read_text()
   if before not in text:raise AssertionError('Mutation target absent: '+name)
   p.write_text(text.replace(before,after,1))
  # Mirror standards directory only for current relative documentation links.
  # The temp tree's normal link geometry is reproduced below instead of editing documents.
  layout=Path(tmp)/('repo-'+name.replace(' ','-'))
  destination=layout/'examples/architecture-method';destination.parent.mkdir(parents=True)
  shutil.move(str(target),destination)
  shutil.copytree(root/'standards',layout/'standards')
  run=subprocess.run([sys.executable,str(destination/'tools/check.py')],capture_output=True,text=True)
  results.append({'case':name,'status':'PASS' if (run.returncode==0)==expected else 'FAIL','checker_exit':run.returncode})
print(json.dumps({'scope':'Static mutation detection; browser rendering/visual review NOT RUN','results':results},indent=2))
raise SystemExit(any(r['status']=='FAIL' for r in results))
