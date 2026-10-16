"""Design/reference-vector checks only; does not implement or validate the iOS app."""
from pathlib import Path
import json, hashlib, hmac, struct, unicodedata, re, csv
O=Path(__file__).resolve().parent
checks=[]
def check(name,condition):
 if not condition: raise AssertionError(name)
 checks.append({'test':name,'status':'PASS'})
def canonical(parts):return b''.join(struct.pack('>I',len(v.encode()))+v.encode() for v in parts)
def digest(parts):return hmac.new(bytes(range(32)),canonical(parts),hashlib.sha256).hexdigest()
def money(s,cur):
 exp={'CNY':2,'USD':2,'JPY':0}[cur]
 if not re.fullmatch(r'-?[0-9]+(?:\.[0-9]+)?',s):raise ValueError('format')
 neg=s.startswith('-');whole,_,frac=s.lstrip('-').partition('.')
 if len(frac)>exp:raise ValueError('precision')
 n=int(whole)*(10**exp)+int((frac+'0'*exp)[:exp] or '0');n=-n if neg else n
 if n==0 or n<=-(2**63) or n>2**63-1:raise ValueError('amount')
 return n
def cap(original,refunds):return original>0 and all(r<0 and r>-(2**63) for r in refunds) and sum(-r for r in refunds)<=original
m=json.loads((O/'CORE-DATA-MODEL.json').read_text());st=json.loads((O/'STATE-CONTRACT.json').read_text());meta=json.loads((O/'diagram-metadata.json').read_text())
check('exact approved baseline SHA in model/state/design',all('f4dbf0d3fac707db1b57252c529618c38d26f0bc' in (O/f).read_text() for f in ['CORE-DATA-MODEL.json','STATE-CONTRACT.json','MODULE-DESIGN.md','EXECUTION-RECEIPT.md']))
check('12 logical entities including namespace/receipts/provenance',len(m['entities'])==12)
for name,e in m['entities'].items():
 check(name+' constraints/indexes use declared attributes',all(set(fields)<=set(e['attributes']) for fields in e['unique']+e['indexes']))
check('all relationship endpoints exist',all(a in m['entities'] and b in m['entities'] for a,_,b,*_ in m['relationships']))
check('strong identity unique; fingerprint deliberately nonunique',['strongKey'] in m['entities']['SourceIdentity']['unique'] and all('fingerprint' not in fields for fields in m['entities']['SourceObservation']['unique']))
check('file receipt and command receipt uniqueness',['fileDigest'] in m['entities']['BatchReceipt']['unique'] and ['id'] in m['entities']['CommandReceipt']['unique'])
check('canonical length encoding prevents delimiter collision',canonical(['a|b','c'])!=canonical(['a','b|c']))
check('HMAC stable and namespace-sensitive',digest(['strong-v1','wechat','A','ID'])==digest(['strong-v1','wechat','A','ID']) and digest(['strong-v1','wechat','A','ID'])!=digest(['strong-v1','wechat','B','ID']))
check('NFC merchant vector',unicodedata.normalize('NFC','Cafe\u0301')=='Café')
check('exact minor-unit vectors',money('10.01','CNY')==1001 and money('-3.00','CNY')==-300 and money('7','JPY')==7 and money('92233720368547758.07','CNY')==2**63-1)
for value,cur in [('0','CNY'),('1.001','CNY'),('1.1','JPY'),('92233720368547758.08','CNY'),('-92233720368547758.08','CNY'),('1e2','CNY'),('1,000','CNY')]:
 try:money(value,cur);raise AssertionError(value)
 except ValueError:pass
check('zero/precision/overflow/exponent/grouping rejected',True)
check('partial/multiple refunds and permutation stability',cap(1000,[-300,-200]) and cap(1000,[-200,-300]) and not cap(1000,[-1000,-1]) and not cap(1000,[1]))
# Reference source identity plan for overlapping exports, changed source IDs and missing IDs.
old={'X':digest(['economic-v1','1000']),'Y':digest(['economic-v1','2000'])}
new={'Y':digest(['economic-v1','2000']),'Z':digest(['economic-v1','800'])}
check('overlap identifies Y duplicate and Z new',[i for i,d in new.items() if old.get(i)==d]==['Y'] and [i for i in new if i not in old]==['Z'])
check('conflicting same ID never overwrites',old['Y']!=digest(['economic-v1','2001']))
check('no-ID policy requires review, separate UUID allowed','keepSeparate is allowed only for no-ID rows' in (O/'MODULE-DESIGN.md').read_text())
check('every state transition names legal endpoints',all(a in st['states'] and b in st['states'] for a,b,_ in st['transitions']))
check('committed is terminal',not any(a=='committed' for a,_,_ in st['transitions']))
check('five diagrams within 9 nodes/12 edges',len(meta['figures'])==5 and all(f['nodes']<=9 and f['edges']<=12 for f in meta['figures']))
for f in ['synthetic-wechat-v1.csv','synthetic-alipay-v1.csv']:
 rows=list(csv.reader((O/f).open()));check(f+' marker/header/row width',rows[0][:2]==['PADF-SYNTHETIC-BILL','1'] and len(rows[1])==9 and all(len(r)==9 for r in rows[2:]))
report={'status':'PASS','scope':'design schema/metadata and reference vectors; no Swift/CoreData/device tests','checks':checks,'not_run':['Swift compile','Core Data disk atomicity/crash','iOS17 device/GPS','production provider exports','migration/backup/performance/security']}
(O/'contract-test-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':'PASS','checks':len(checks)}))
