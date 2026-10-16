from pathlib import Path
import json,hashlib,subprocess,xml.etree.ElementTree as ET,re
ROOT=Path(__file__).resolve().parent;SRC=Path.cwd()/'work/design-review/supp-sources';OUT=Path.cwd()/'outputs/issue-5/review';PIN=Path('/Users/leohu/.codex/plugins/cache/diagram-design/diagram-design/2.6.98');checks=[]
def check(name,ok,actual):checks.append({'check':name,'status':'PASS' if ok else 'FAIL','actual':actual})
def run(args):
 r=subprocess.run(args,capture_output=True,text=True);return {'returncode':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
head=run(['git','-C',str(PIN),'rev-parse','HEAD']);clean=run(['git','-C',str(PIN),'status','--porcelain']);check('installed pinned checkout',head['stdout'].strip()=='11b08eade8049c441ed3df1895e3b527c26c0fbe' and clean['stdout']=='',{'head':head,'clean':clean})
skill=(PIN/'skills/diagram-design/SKILL.md').read_bytes();blob=hashlib.sha1(b'blob '+str(len(skill)).encode()+b'\0'+skill).hexdigest();check('installed Skill blob',blob=='359a32025f0e43192b2be1fdfb1a62601d4f3564',blob)
for role in ['system','module']:
 manifest=json.loads((SRC/role/'ARTIFACT-MANIFEST.json').read_text());hashes=[]
 for item in manifest['artifacts']:
  f=SRC/role/item['path'];actual=hashlib.sha256(f.read_bytes()).hexdigest() if f.exists() else None;hashes.append({'path':item['path'],'sha256':actual,'match':actual==item['sha256']})
 check(role+' manifest bytes',all(x['match'] for x in hashes),hashes)
 for f in json.loads((SRC/role/'diagram-metadata.json').read_text())['figures']:
  slug=f['slug'];p=SRC/role/(slug+'.html')
  for name,argv in [('self_check',['python3',str(PIN/'skills/diagram-design/scripts/self_check.py'),'--offline',str(p)]),('geometry',['python3',str(PIN/'scripts/verify-geometry.py'),str(p)]),('export',['python3',str(PIN/'skills/diagram-design/scripts/export_svg.py'),'--system-fonts',str(p),str(OUT/(role+'-'+slug+'-independent.svg'))])]:
   r=run(argv);check(role+'/'+slug+' '+name,r['returncode']==0,r)
  exported=OUT/(role+'-'+slug+'-independent.svg');source=SRC/role/(slug+'.svg');check(role+'/'+slug+' reproducible SVG',exported.read_bytes()==source.read_bytes(),{'expected_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'actual_sha256':hashlib.sha256(exported.read_bytes()).hexdigest()})
model=json.loads((SRC/'system/SYSTEM-MODEL.json').read_text());meta=json.loads((SRC/'system/diagram-metadata.json').read_text());expected={(a,b) for a,bs in model['package_dependencies'].items() for b in bs};adapters=['LedgerPersistence','BillImport','CategoryRules','LocationAccess','BackupArchive'];actual=set()
for f in meta['figures']:
 if f['slug']=='package-core':
  for a,b in f['relationships']:
   for aa in adapters if a=='adapters' else [a]:
    for bb in adapters if b=='adapters' else [b]:actual.add((aa,bb))
check('SYSTEM expanded package graph',actual==expected,{'missing':sorted(expected-actual),'extra':sorted(actual-expected),'edges':len(expected)})
for f in meta['figures']:
 p=SRC/'system'/(f['slug']+'.html');text=p.read_text();drawn={(a,b) for a,b in re.findall(r'data-from="([^"]+)" data-to="([^"]+)"',text)};declared={tuple(x) for x in f['relationships']};check('SYSTEM actual SVG endpoints '+f['slug'],drawn==declared,{'drawn':sorted(drawn),'declared':sorted(declared)})
ns={'s':'http://www.w3.org/2000/svg'}
for role in ['system','module']:
 for fig in json.loads((SRC/role/'diagram-metadata.json').read_text())['figures']:
  svg=ET.parse(SRC/role/(fig['slug']+'.svg')).getroot();ids=[x.attrib['id'] for x in svg.iter() if 'id'in x.attrib];check(role+'/'+fig['slug']+' XML/accessibility',len(ids)==len(set(ids)) and svg.attrib.get('role')=='img' and all(x in ids for x in svg.attrib['aria-labelledby'].split()),{'ids':len(ids),'node_ids':[e.attrib['data-node'] for e in svg.iter() if 'data-node'in e.attrib]})
report={'executedAt':__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),'reviewer':'/root/design_reviewer','scope':'independent immutable SYSTEM/MODULE supplement, not UI re-review','checks':checks,'pass':sum(x['status']=='PASS' for x in checks),'fail':sum(x['status']=='FAIL' for x in checks)}
(OUT/'sa-ma-static-checks.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'pass':report['pass'],'fail':report['fail'],'failed':[x['check'] for x in checks if x['status']=='FAIL']}))
