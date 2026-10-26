#!/usr/bin/env python3
"""Source/model integrity checks. This does NOT render or assess visual quality."""
import hashlib,json,re,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'model.json').read_text());layout=json.loads((ROOT/'tools/layout.json').read_text());issues=[];views=[]
for v in m['views']:
 i=v['id'];html=(ROOT/'diagrams'/f'{i}.html').read_text();svg=(ROOT/'diagrams'/f'{i}.svg').read_text();tree=ET.fromstring(svg)
 ns={'s':'http://www.w3.org/2000/svg'}
 nodes=[g.attrib['data-node-id'] for g in tree.findall('.//s:g[@data-node-id]',ns)]
 edges=[g for g in tree.findall('.//s:g[@data-edge-id]',ns)]
 if set(nodes)!=set(v['node_ids']):issues.append([i,'node identity mismatch'])
 if [g.attrib['data-edge-id'] for g in edges]!=v['relation_ids']:issues.append([i,'edge order mismatch'])
 for g in edges:
  r=m['relations'][g.attrib['data-edge-id']]
  if g.attrib['data-from']!=r['from'] or g.attrib['data-to']!=r['to']:issues.append([i,'edge direction mismatch'])
  if r['from'] not in v['node_ids'] or r['to'] not in v['node_ids']:issues.append([i,'missing endpoint'])
 if len(nodes)>9 or len(edges)>12:issues.append([i,'complexity budget'])
 if len(set(nodes))!=len(nodes):issues.append([i,'duplicate IDs'])
 if re.search(r'https?://(?!www.w3.org)',html):issues.append([i,'remote content'])
 ref=v['authoritative_source'].split('#')[0]
 if not (ROOT/ref).exists():issues.append([i,'missing authoritative source'])
 # Compare display semantics in both HTML's inline SVG and its exported SVG.
 # This catches label/guard/kind changes that retain apparently correct stable IDs.
 for format_name,projection in [('SVG',tree),('HTML',ET.fromstring(re.search(r'<svg\b[\s\S]*?</svg>',html).group()))]:
  projected_nodes=projection.findall('.//s:g[@data-node-id]',ns)
  if sorted(g.attrib['data-node-id'] for g in projected_nodes)!=sorted(v['node_ids']):issues.append([i,format_name+' node identities'])
  for g in projected_nodes:
   expected=m['nodes'].get(g.attrib['data-node-id'])
   if expected is None:continue
   names=[''.join(t.itertext()) for t in g.findall('s:text',ns) if t.attrib.get('class')=='name']
   if names!=[expected['name']] or g.attrib.get('data-kind')!=expected['kind']:issues.append([i,format_name+' node name/kind'])
  projected_edges=projection.findall('.//s:g[@data-edge-id]',ns)
  if [g.attrib['data-edge-id'] for g in projected_edges]!=v['relation_ids']:issues.append([i,format_name+' message/edge order'])
  for g in projected_edges:
   expected=m['relations'].get(g.attrib['data-edge-id'])
   if expected and (g.attrib.get('data-from')!=expected['from'] or g.attrib.get('data-to')!=expected['to'] or g.attrib.get('data-guard','')!=expected.get('guard','')):issues.append([i,format_name+' relation semantics'])
  labels=[g.attrib['data-label'] for g in projection.findall('.//s:g[@data-label]',ns)]
  expected_labels=[(rid+' ' if v['type']=='sequence' else '')+m['relations'][rid]['label'] for rid in v['relation_ids']]
  if labels!=expected_labels:issues.append([i,format_name+' relation labels'])
  if v['type']=='deployment':
   actual=[g.attrib['data-instance-of'] for g in projection.findall('.//*[@data-instance-of]')]
   if sorted(actual)!=sorted(n for group in v['instances'].values() for n in group):issues.append([i,format_name+' deployment instances'])
 # Every straight segment uses H or V. Q is the radius-8 elbow only.
 for g in edges:
  d=g.find('s:path',ns).attrib['d']
  if re.search('[LlCcAaSsTt]',d):issues.append([i,'unexpected connector geometry'])
 views.append({'id':i,'nodes':len(nodes),'relations':len(edges),'status':'PASS' if not any(x[0]==i for x in issues) else 'FAIL'})
# Links must resolve. PNG is optional and not claimed until renderer really runs.
for f in ROOT.rglob('*.md'):
 for target in re.findall(r'\]\(([^)]+)\)',f.read_text()):
  if '://' in target or target.startswith('#'):continue
  dest=target.split('#')[0]
  if dest and not (f.parent/dest).exists():issues.append([str(f.relative_to(ROOT)),'missing '+target])
# Current doc references do not introduce forbidden synthetic approval artifacts.
report={'scope':'source/model/static links only; browser/visual/product tests not included','model_sha256':hashlib.sha256((ROOT/'model.json').read_bytes()).hexdigest(),'views':views,'issues':issues,'status':'PASS' if not issues else 'FAIL'}
(ROOT/'evidence/source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
raise SystemExit(bool(issues))
