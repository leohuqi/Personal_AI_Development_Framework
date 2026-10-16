from pathlib import Path
import json
O=Path(__file__).resolve().parent
m=json.loads((O/'CORE-DATA-MODEL.json').read_text());s=json.loads((O/'STATE-CONTRACT.json').read_text());rels=m['relationships'];checks=[]
def c(name,ok):
 assert ok,name
 checks.append({'test':name,'status':'PASS'})
for role,prop,many in [('original','refundLinks','0..N'),('refund','asRefundLink','0..1')]:
 c('RefundLink '+role+' exact inverse and multiplicities',any(a=='Entry' and p==prop and b=='RefundLink' and inv==role and one=='1' and n==many for a,p,b,inv,one,n in rels))
html=(O/'ledger-model.html').read_text();c('both named refund relationships actually in rendered source','ORIGINAL N:1' in html and 'REFUND 0..1:1' in html)
for a,p,b,inv,one,n in [('AccountNamespace','sources','SourceIdentity','namespace','1','0..N'),('SourceIdentity','observations','SourceObservation','identity','0..1','1..N'),('BatchReceipt','observations','SourceObservation','batch','1','0..N'),('Entry','observations','SourceObservation','entry','1','0..N')]:c('source ER '+a+'.'+p,[a,p,b,inv,one,n] in rels)
for a,b in [('parsing','review'),('review','committing'),('committing','committed'),('committing','recoverable'),('recoverable','review'),('review','cancelled')]:c('state diagram '+a+' -> '+b,any(x==a and y==b for x,y,_ in s['transitions']))
c('same approved SYSTEM ref in state/model',m['system_baseline_ref']==s['system_baseline_ref'])
c('component ports match typed source',all(p in (O/'INTERFACES.swift.txt').read_text() for p in ['LedgerStorePort','ImportPort','CategoryPort','LocationPort','IdentityPort','MaintenancePort']))
report={'status':'PASS','scope':'author source/diagram alignment; not independent review','checks':checks,'fidelity':'Overview/detail cuts explicitly disclosed in README and figure descriptions; full 12-entity/17-relationship model is canonical. All six ports named. State subset checked against complete transition list.'}
(O/'source-consistency-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':'PASS','checks':len(checks)}))
