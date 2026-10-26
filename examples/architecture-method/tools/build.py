#!/usr/bin/env python3
"""Derive static Diagram-Design presentations from semantic model + layout.
No product behavior, external requests, or dependency installation.
"""
import html,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
M=json.loads((ROOT/'model.json').read_text()); L=json.loads((ROOT/'tools/layout.json').read_text())
PAPER='#f5f5f5'; INK='#2d3142'; MUTED='#4f5d75'; ACCENT='#bf4520'; LINK='#2e5aa8'
def esc(v):return html.escape(str(v),quote=True)
def txt(x,y,s,cl='name',anchor='middle',**attrs):
 return f'<text x="{x}" y="{y}" class="{cl}" text-anchor="{anchor}" '+ ' '.join(f'{k}="{esc(v)}"' for k,v in attrs.items())+f'>{esc(s)}</text>'
def label(x,y,s):
 width=len(s)*8+16
 return f'<g data-label="{esc(s)}"><rect x="{x-width/2}" y="{y-18}" width="{width}" height="24" rx="2" fill="{PAPER}"/>'+txt(x,y,s,'edge')+'</g>'
def box(i,b,focal=False,kind=None,detail=True):
 n=M['nodes'][i];x,y,w,h=b;color=ACCENT if focal else MUTED;fill='#fae9e4' if focal else PAPER
 title=n['name'];tag=kind or n['kind']
 body=f'<g data-node-id="{i}" data-kind="{n["kind"]}"><rect data-role="bounds" x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{color}" stroke-width="1.5"/>'
 body+=txt(x+16,y+24,tag,'tag','start')+txt(x+w/2,y+60,title)
 if detail:body+=txt(x+w/2,y+88,n['detail'],'sub')
 if n['kind']=='ENTITY':
  body+=f'<line x1="{x}" y1="{y+72}" x2="{x+w}" y2="{y+72}" stroke="{MUTED}"/>'+txt(x+w/2,y+120,'OWNER '+n['owner'],'sub')
 if n['kind']=='HOST':
  inst=next(v['instances'][i] for v in M['views'] if 'instances' in v and i in v['instances'])
  for k,c in enumerate(inst):
   cy=y+108+k*28
   body+=f'<rect data-instance-of="{c}" x="{x+16}" y="{cy}" width="{w-32}" height="24" rx="4" fill="#ececec" stroke="{MUTED}"/>'+txt(x+w/2,cy+17,c+' · SYN-B1','sub')
 return body+'</g>'
CSS="""*{box-sizing:border-box}body{margin:0;padding:28px;background:#f5f5f5;color:#2d3142;font-family:'Geist','PingFang SC','Noto Sans SC','Microsoft YaHei',system-ui,sans-serif}.frame{max-width:1320px;margin:auto}h1{font-family:'Instrument Serif','Songti SC',serif;font-size:32px;font-weight:400}.eyebrow{font:14px 'Geist Mono',Menlo,monospace;color:#4f5d75}.diagram-container{width:100%;overflow-x:auto}svg{width:100%;min-width:1280px;display:block}svg .name{font-family:'Geist','PingFang SC','Noto Sans SC','Microsoft YaHei',system-ui,sans-serif;font-size:20px;font-weight:600;fill:#2d3142}svg .sub,svg .tag,svg .edge{font-family:'Geist Mono','PingFang SC',Menlo,ui-monospace,monospace;font-size:14px;fill:#4f5d75}svg .guard{font-family:'Geist','PingFang SC',system-ui,sans-serif;font-size:14px;fill:#4f5d75}svg .caption{font-family:'Geist','PingFang SC',system-ui,sans-serif;font-size:16px;fill:#4f5d75}@media(max-width:600px){body{padding:16px}h1{font-size:28px}}@media print{.diagram-container{overflow-x:visible}svg{min-width:0}}
"""
manifest=[]
for v in M['views']:
 i=v['id'];lay=L[i];parts=[]
 defs=''.join(f'<marker id="{i}-{key}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="{color}"/></marker>' for key,color in [('arrow',MUTED),('arrow-accent',ACCENT),('arrow-link',LINK)])
 parts.append(f'<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="{i}-title {i}-desc"><title id="{i}-title">{esc(v["title"])}</title><desc id="{i}-desc">{esc(v["purpose"])}</desc><defs>{defs}</defs><rect width="1280" height="720" fill="{PAPER}"/>')
 if v['type']=='sequence':
  for nid,b in lay['nodes'].items():
   cx=b[0]+b[2]/2
   parts.append(f'<line x1="{cx}" y1="172" x2="{cx}" y2="652" stroke="#bfc0c0" stroke-dasharray="4,4"/>')
  parts.append(f'<rect x="380" y="488" width="820" height="164" fill="#ececec" fill-opacity="0.4" stroke="{MUTED}"/>')
  parts.append(txt(392,506,'ALT','tag','start')+txt(452,514,'[全部条件满足]','guard','start')+f'<line x1="388" y1="568" x2="1192" y2="568" stroke="{MUTED}" stroke-dasharray="4,4"/>'+txt(392,594,'[任一校验失败]','guard','start'))
  for rid in v['relation_ids']:
   r=M['relations'][rid];a=lay['nodes'][r['from']];b=lay['nodes'][r['to']];ax=a[0]+a[2]/2;bx=b[0]+b[2]/2;y=lay['message_y'][rid]
   dash=' stroke-dasharray="5,4"' if r.get('return') else ''
   parts.append(f'<g data-edge-id="{rid}" data-from="{r["from"]}" data-to="{r["to"]}" data-guard="{r.get("guard","")}"><path d="M {ax},{y} H {bx}" fill="none" stroke="{MUTED}" stroke-width="1.5" marker-end="url(#{i}-arrow)"{dash}/></g>')
   mid=(ax+bx)/2
   if rid=='M03':mid=780
   parts.append(label(mid,y-16,rid+' '+r['label']))
  for nid,b in lay['nodes'].items():parts.append(box(nid,b,False,detail=False))
 else:
  if v['type']=='deployment':
   for x,title in [(64,'CLIENT'),(464,'TRUSTED APP'),(864,'ISOLATED COMPUTE')]:
    parts.append(f'<rect x="{x}" y="184" width="312" height="304" rx="8" fill="#ececec" fill-opacity="0.35" stroke="{MUTED}" stroke-dasharray="4,4"/>'+txt(x+16,216,title,'tag','start'))
  elif 'component' in i:
   parts.append(f'<rect x="40" y="172" width="1200" height="396" rx="8" fill="#ececec" fill-opacity="0.3" stroke="{MUTED}" stroke-dasharray="4,4"/>'+txt(64,204,'C-API / COMPONENTS / SAME APPLICATION','tag','start'))
  for rid in v['relation_ids']:
   r=M['relations'][rid];e=lay['edges'][rid]
   parts.append(f'<g data-edge-id="{rid}" data-from="{r["from"]}" data-to="{r["to"]}"><path d="{e["path"]}" fill="none" stroke="{MUTED}" stroke-width="1.5" marker-end="url(#{i}-arrow)"/></g>')
   parts.append(label(*e['label'],r['label']))
   if 'cardinality' in r:
    a=lay['nodes'][r['from']];b=lay['nodes'][r['to']]
    parts.append(txt(a[0]+a[2]+18,376,r['cardinality'][0],'edge')+txt(b[0]-26,376,r['cardinality'][1],'edge'))
  for k,nid in enumerate(v['node_ids']):parts.append(box(nid,lay['nodes'][nid],k==1 and v['type']!='deployment'))
 parts.append(f'<line x1="40" y1="660" x2="1240" y2="660" stroke="#bfc0c0"/>'+txt(40,688,'PROPOSED · 合成文档练习 · '+v['type'].upper(),'caption','start')+'</svg>')
 htmlout=f'<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>{esc(v["title"])}</title><style>{CSS}</style></head><body><main class="frame"><p class="eyebrow">PADF · DOC-WIDE · STATIC / SYSTEM FONTS</p><h1>{esc(v["title"])}</h1><div class="diagram-container">'+''.join(parts)+f'</div><p>{esc(v["purpose"])}</p><p>权威：{esc(v["authoritative_source"])}；裁剪：{esc(v["cuts"])}</p></main></body></html>\n'
 (ROOT/'diagrams'/f'{i}.html').write_text(htmlout)
 manifest.append({**v,'html_path':'diagrams/'+i+'.html','svg_path':'diagrams/'+i+'.svg','png_path':'diagrams/'+i+'.png','generator':'diagram-design instructions + tools/build.py','external_skill_sha':'11b08eade8049c441ed3df1895e3b527c26c0fbe','skill_content_sha256':'1b30bb3c0da29a05e5b05c0a4510ce6f286a0d0f1da97b9aa6aaf03c92e98618','project_style_profile_ref':'VISUAL-STYLE.md'})
(ROOT/'diagrams/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Generated {len(manifest)} HTML projections; exports require actual render/export steps.')
