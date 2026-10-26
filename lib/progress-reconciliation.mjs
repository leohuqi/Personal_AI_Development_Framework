import {createHash,randomUUID} from 'node:crypto';
import {evaluateActionPreflight,revalidateActionPreflight} from './action-preflight.mjs';
import {validateProgressIdentity,validateProgressSyncReceipt,progressReceiptCore} from './orchestration-evidence.mjs';
export {validateProgressSyncReceipt} from './orchestration-evidence.mjs';

const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'&&x.trim().length>0;
const ref=x=>text(x)&&/^(https:\/\/|runtime:|session:)/.test(x);
const time=x=>typeof x==='string'?Date.parse(x):NaN;
const clone=x=>structuredClone(x);
const canonical=x=>Array.isArray(x)?x.map(canonical):record(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const digest=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const sorted=x=>[...x].sort();
const hasSha=(r,s)=>ref(r)&&typeof s==='string'&&/^[a-f0-9]{40}$/i.test(s)&&(r.includes('/blob/'+s+'/')||r.endsWith('/commit/'+s)||r.includes('/tree/'+s+'/')||r.endsWith('@'+s));
const events=new Set(['READY','EXECUTION_STARTED','HANDOFF_ACKNOWLEDGED','REVIEW_COMPLETED','REWORK_STARTED','DEPENDENCIES_CHANGED','DONE_REQUESTED']);
const ranks={Backlog:0,Todo:1,'In Progress':2,'In Review':3,Done:4};
const active=new Set();

function issueValid(issue,identity,now){
 return record(issue)&&issue.id===identity.execution_issue_id&&text(issue.uuid)&&text(issue.team_id)&&
  issue.parent_id===identity.parent_cr_id&&text(issue.state_id)&&Array.isArray(issue.blocked_by)&&
  issue.blocked_by.every(text)&&new Set(issue.blocked_by).size===issue.blocked_by.length&&ref(issue.evidence_ref)&&
  Number.isFinite(time(issue.updated_at))&&Number.isFinite(time(issue.observed_at))&&time(issue.updated_at)<=time(now)&&
  time(issue.observed_at)<=time(now)&&time(now)-time(issue.observed_at)<=300000;
}
function observedSame(a,b){return ['id','uuid','team_id','parent_id','state_id','updated_at'].every(k=>a?.[k]===b?.[k])&&same(sorted(a?.blocked_by??[]),sorted(b?.blocked_by??[]))}
function doneSnapshot(input){
 const d=clone(input.done_input),review=input.evidence?.review;
 // Completion must include current dependency facts, even if an older G-01
 // snapshot omitted them. Integration blockers are completion blockers too.
 if(record(d)&&Array.isArray(d.blockers)){
  const deps=Array.isArray(input.dependencies)?input.dependencies:[];
  const remaining=(Array.isArray(input.issue?.blocked_by)?input.issue.blocked_by:[]).filter(id=>!deps.some(p=>p.issue_id===id&&p.satisfied===true));
  const ids=[...new Set([...remaining,...deps.filter(p=>p.satisfied===false).map(p=>p.issue_id)])];
  d.blockers=[...d.blockers,...ids.map(issue_id=>({issue_id,evidence_ref:deps.find(p=>p.issue_id===issue_id)?.evidence_ref??input.issue.evidence_ref,reason:'CURRENT_EXECUTION_PREREQUISITE_UNSATISFIED'}))];
 }
 if(record(review)&&record(d?.review)){
  d.findings=[...(Array.isArray(d.findings)?d.findings:[]),...(Array.isArray(review.findings)?review.findings:[])];
  const conditions=[...(Array.isArray(d.review.conditions)?d.review.conditions:[]),...(Array.isArray(review.conditions)?review.conditions:[])];
  d.review={...d.review,decision:[d.review.decision,review.decision].includes('REQUEST_CHANGES')?'REQUEST_CHANGES':conditions.length?'APPROVE_WITH_CONDITIONS':d.review.decision,conditions};
 }
 return {...d,now:input.now};
}
function doneAssessment(input){
 const d=input.done_input,i=input.identity,e=input.evidence;
 if(!record(d)||!record(e)||d.action!=='MARK_ISSUE_DONE'||!record(d.subject)||!record(d.acceptance))return {decision:'BLOCKED',reasons:['DONE_SCOPE_OR_ACCEPTANCE_MISSING']};
 for(const s of [d.subject,d.acceptance])if(s.execution_issue_id!==i.execution_issue_id||s.execution_context_id!==i.execution_context_id||s.context_id!==i.context_id||s.task_contract_ref!==i.task_contract_ref)return {decision:'BLOCKED',reasons:['DONE_EXECUTION_SCOPE_MISMATCH']};
 if(d.subject.repository!==i.repository||d.subject.head_sha!==e.source_head_sha||d.acceptance.head_sha!==e.source_head_sha)return {decision:'BLOCKED',reasons:['DONE_SOURCE_MISMATCH']};
 return evaluateActionPreflight(doneSnapshot(input));
}

/** Pure plan over caller-verified facts; neither authenticates evidence nor issues authority. */
export function planProgressReconciliation(raw={}){
 const input=record(raw)?raw:{},i=input.identity,e=input.evidence,v=input.event,errors=[];
 const fail=s=>{if(!errors.includes(s))errors.push(s)};
 if(input.schema_version!=='padf.progress-reconciliation/v1')fail('INVALID_PROGRESS_SCHEMA');
 for(const s of validateProgressIdentity(i).errors)fail(s);
 const base={identity:record(i)?clone(i):null,event:record(v)?clone(v):null,reasons:errors,verification_boundary:'CALLER_VERIFIED_FACTS_NOT_AUTHORIZATION'};
 if(errors.length)return {...base,result:'BLOCKED'};
 if(i.tracker==='none')return {...base,result:'NO_CHANGE_REQUIRED',applicability:'NOT_APPLICABLE',stage:'NOT_APPLICABLE',patch:{add_blocked_by:[],remove_blocked_by:[]},dependency_changes:[]};
 if(!record(v)||!text(v.event_id)||!events.has(v.type)||!Number.isFinite(time(v.occurred_at))||!Number.isFinite(time(input.now))||time(v.occurred_at)>time(input.now))fail('INVALID_OR_UNORDERED_EVENT');
 if(!record(e)||!hasSha(e.evidence_ref,e.source_head_sha))fail('IMMUTABLE_EXECUTION_EVIDENCE_REQUIRED');
 if(!record(input.authorization)||input.authorization.status!=='APPROVED'||!same(input.authorization.identity,i)||!ref(input.authorization.evidence_ref))fail('PROGRESS_AUTHORIZATION_SCOPE_MISMATCH');
 if(!issueValid(input.issue,i,input.now))fail('ISSUE_SNAPSHOT_MISMATCH_OR_STALE');
 const defs=[['Backlog','backlog'],['Todo','unstarted'],['In Progress','started'],['In Review','started'],['Done','completed']];
 const states=Array.isArray(input.statuses)?input.statuses:[],map={};
 if(states.some(s=>!record(s)||!text(s.id))||new Set(states.map(s=>s.id)).size!==states.length)fail('INVALID_TEAM_STATUS_MAPPING');
 for(const [name,type] of defs){const matches=states.filter(s=>s?.name===name);if(matches.length!==1||matches[0].type!==type)fail('INVALID_TEAM_STATUS_MAPPING');else map[name]=matches[0]}
 const current=states.find(s=>s?.id===input.issue?.state_id);
 if(!current)fail('UNKNOWN_CURRENT_STATE');
 if(current&&['canceled','duplicate'].includes(current.type))fail('TERMINAL_ISSUE_REQUIRES_MASTER_DECISION');
 if(!Array.isArray(input.dependencies))fail('DEPENDENCY_FACTS_REQUIRED');
 const deps=Array.isArray(input.dependencies)?input.dependencies:[];
 if(deps.some(d=>!record(d)||!text(d.issue_id)||d.issue_id===i.execution_issue_id||d.issue_id===i.parent_cr_id||!['start','integration'].includes(d.phase)||typeof d.satisfied!=='boolean'||!ref(d.evidence_ref))||new Set(deps.map(d=>d.issue_id)).size!==deps.length)fail('INVALID_DEPENDENCY_FACTS');
 const needsHandoff=['HANDOFF_ACKNOWLEDGED','REVIEW_COMPLETED','DONE_REQUESTED'].includes(v?.type);
 if(needsHandoff){const h=input.handoff,a=input.master_ack;
  if(!record(h)||!record(a)||!text(h.handoff_id)||!ref(h.handoff_ref)||!ref(a.ack_ref)||a.handoff_id!==h.handoff_id||a.handoff_ref!==h.handoff_ref||
   [h,a].some(x=>x.execution_issue_id!==i.execution_issue_id||x.execution_context_id!==i.execution_context_id)||h.source_head_sha!==e?.source_head_sha||h.evidence_ref!==e?.evidence_ref||
   !Number.isFinite(time(h.submitted_at))||!Number.isFinite(time(a.observed_at))||time(h.submitted_at)>time(a.observed_at)||time(a.observed_at)>time(v?.occurred_at))fail('HANDOFF_ACK_BINDING_OR_ORDER_MISMATCH');
 }
 if(['EXECUTION_STARTED','REWORK_STARTED'].includes(v?.type)){
  const x=e?.execution;if(!record(x)||!text(x.execution_id)||!ref(x.evidence_ref)||!Number.isFinite(time(x.started_at))||time(x.started_at)>time(v.occurred_at)||!['design','coding'].includes(v.work_kind))fail('REAL_EXECUTION_START_EVIDENCE_REQUIRED');
 }
 const review=e?.review;
 if(review!==undefined&&(!record(review)||!['APPROVE','APPROVE_WITH_CONDITIONS','REQUEST_CHANGES'].includes(review.decision)||!Array.isArray(review.conditions)||(review.decision==='APPROVE_WITH_CONDITIONS'&&!review.conditions.length)||
  (review.findings!==undefined&&(!Array.isArray(review.findings)||review.findings.some(f=>!record(f)||!['P0','P1','P2','P3'].includes(f.severity)||!text(f.status))))))fail('INVALID_REVIEW_FACTS');
 if(v?.type==='REVIEW_COMPLETED'&&!record(review))fail('REVIEW_FACTS_REQUIRED');
 let name='In Review',stage='IMPLEMENTATION_READY';
 switch(v?.type){
  case 'READY':name=deps.some(d=>d.phase==='start'&&!d.satisfied)?'Backlog':'Todo';stage=name==='Backlog'?'WAITING_DEPENDENCIES':'READY';break;
  case 'EXECUTION_STARTED':name='In Progress';stage=v.work_kind==='design'?'DESIGN_IN_PROGRESS':'CODING_IN_PROGRESS';break;
  case 'REWORK_STARTED':name='In Progress';stage=v.work_kind==='design'?'DESIGN_REWORK':'CODING_REWORK';if(review?.decision!=='REQUEST_CHANGES')fail('REWORK_REQUIRES_REJECTION');break;
  case 'REVIEW_COMPLETED':stage=review?.decision==='APPROVE_WITH_CONDITIONS'?'REVIEWED_WITH_CONDITIONS':review?.decision==='APPROVE'?'OWNER_ACCEPTANCE_PENDING':'REVIEW_IN_PROGRESS';break;
  case 'HANDOFF_ACKNOWLEDGED':stage=review?.decision==='APPROVE_WITH_CONDITIONS'?'REVIEWED_WITH_CONDITIONS':e?.implementation_ready===true?'IMPLEMENTATION_READY':'REVIEW_IN_PROGRESS';break;
  case 'DEPENDENCIES_CHANGED':name=current?.name;stage='DEPENDENCIES_CHANGED';break;
  case 'DONE_REQUESTED':name='Done';stage='DONE';if(doneAssessment(input).decision!=='READY')fail('DONE_G01_OR_EXECUTION_ACCEPTANCE_NOT_READY');break;
 }
 const previous=input.previous_receipt;
 if(input.previous_receipt_ref&&!record(previous))fail('PREVIOUS_RECEIPT_NOT_READ');
 if(previous!==undefined){
  if(!record(previous)||!same(previous.identity,i)||!record(previous.event)||!Number.isFinite(time(previous.event.occurred_at)))fail('PREVIOUS_RECEIPT_SCOPE_INVALID');
  else if(time(v?.occurred_at)<time(previous.event.occurred_at)||(time(v?.occurred_at)===time(previous.event.occurred_at)&&v?.event_id!==previous.event.event_id)||
    (v?.event_id===previous.event.event_id&&(!same(v,previous.event)||e?.source_head_sha!==previous.source_head_sha)))fail('STALE_OR_AMBIGUOUS_EVENT');
 }
 if(current?.name==='Done'&&name!=='Done')fail('TERMINAL_ISSUE_REQUIRES_MASTER_DECISION');
 if((ranks[name]??-1)<(ranks[current?.name]??-1)){
  const latest=Math.max(time(previous?.event?.occurred_at)||0,time(input.issue.updated_at));
  if(v?.type!=='REWORK_STARTED'||time(v.occurred_at)<=latest||time(e?.execution?.started_at)<=latest)fail('LATE_EVENT_CANNOT_REGRESS_PROGRESS');
 }
 if(v?.type==='REWORK_STARTED'&&previous&&time(e?.execution?.started_at)<=time(previous.event?.occurred_at))fail('OLD_EXECUTION_CANNOT_PROVE_NEW_REWORK');
 if(errors.length)return {...base,result:'BLOCKED'};
 const dependency_changes=deps.filter(d=>d.satisfied?input.issue.blocked_by.includes(d.issue_id):!input.issue.blocked_by.includes(d.issue_id)).map(d=>({...clone(d),action:d.satisfied?'REMOVE':'ADD'}));
 const patch={...(input.issue.state_id!==map[name]?.id?{state_id:map[name]?.id}:{}),add_blocked_by:dependency_changes.filter(d=>d.action==='ADD').map(d=>d.issue_id),remove_blocked_by:dependency_changes.filter(d=>d.action==='REMOVE').map(d=>d.issue_id)};
 const operation_key=digest({identity:i,event_id:v.event_id,handoff_id:input.handoff?.handoff_id??null,source_head_sha:e.source_head_sha,stage,target:map[name]?.id,dependencies:deps});
 return {...base,result:'READY',applicability:'LINEAR',stage,target_state:clone(map[name]),patch,dependency_changes,operation_key,done_assessment:v.type==='DONE_REQUESTED'?doneAssessment(input):null};
}

function receipt(input,plan){return {schema_version:'padf.progress-sync-receipt/v1',receipt_id:'PROGRESS-'+randomUUID(),attempt_id:randomUUID(),operation_key:plan.operation_key??digest({identity:input.identity,event:input.event}),identity:clone(input.identity??null),event:clone(input.event??null),stage:plan.stage??null,applicability:plan.applicability??'LINEAR',handoff:clone(input.handoff??null),master_ack:clone(input.master_ack??null),source_head_sha:input.evidence?.source_head_sha??null,evidence:clone(input.evidence??null),review:clone(input.evidence?.review??null),authorization_ref:input.authorization?.evidence_ref??null,previous_receipt_ref:input.previous_receipt_ref??null,statuses:clone(input.statuses??[]),original_issue:clone(input.issue??null),pre_write_issue:null,target_state:clone(plan.target_state??null),dependencies:clone(input.dependencies??[]),dependency_changes:clone(plan.dependency_changes??[]),write_results:[],readback:null,observed_at:input.now??null,synced_at:null,result:'BLOCKED',reasons:clone(plan.reasons??[]),failure_items:[],verification_boundary:'READ_BACK_OBSERVED_NOT_ATOMIC',done_verification:plan.done_assessment?clone(plan.done_assessment):null};}
function readMatches(actual,expected,target,changes){
 const blocked=[...new Set([...expected.blocked_by,...changes.filter(d=>d.action==='ADD').map(d=>d.issue_id)])].filter(id=>!changes.some(d=>d.action==='REMOVE'&&d.issue_id===id));
 return ['id','uuid','team_id','parent_id'].every(k=>actual?.[k]===expected[k])&&actual?.state_id===target.id&&same(sorted(actual?.blocked_by??[]),sorted(blocked))&&Number.isFinite(time(actual?.updated_at));
}
async function save(receipt,adapter){
 try{
  const core=progressReceiptCore(receipt),saved=await adapter.persistReceipt(clone(core));if(!ref(saved?.receipt_ref))throw Error('Missing actual persisted receipt reference');
  const stored=await adapter.readReceipt(saved.receipt_ref);if(!same(progressReceiptCore(stored),core))throw Error('Persisted receipt read-back mismatch');
  return {...receipt,receipt_ref:saved.receipt_ref,persistence:{verified:true,core_sha256:digest(core)}};
 }catch(error){return {...receipt,result:'PROGRESS_SYNC_FAILED',failure_items:[...receipt.failure_items,{step:'RECEIPT_PERSIST_OR_READ',error:String(error.message)}],reasons:[...receipt.reasons,'RECEIPT_PERSISTENCE_NOT_VERIFIED']};}
}

/** One caller-authorized attempt; no network client, automatic retry or Agent execution. */
export async function reconcileProgress(raw={},adapter){
 const input=record(raw)?clone(raw):{};
 const now=()=>typeof adapter?.now==='function'?adapter.now():new Date().toISOString();
 if(input.identity?.tracker==='linear')input.now=now();
 const local=planProgressReconciliation(input);
 if(local.applicability==='NOT_APPLICABLE')return {...receipt(input,local),result:'NO_CHANGE_REQUIRED',applicability:'NOT_APPLICABLE',stage:'NOT_APPLICABLE',synced_at:input.now};
 // A previous receipt is only available through an explicit persistent reference.
 if(local.result==='BLOCKED'&&!local.reasons.every(r=>r==='PREVIOUS_RECEIPT_NOT_READ'))return receipt(input,local);
 const key=input.identity?.repository+':'+input.identity?.execution_issue_id;
 if(active.has(key))return receipt(input,{reasons:['SYNC_ATTEMPT_IN_PROGRESS']});
 active.add(key);let r=receipt(input,local),step='READ_ISSUE';
 try{
  if(!adapter||!['readIssue','readStatuses','updateIssue','persistReceipt','readReceipt'].every(k=>typeof adapter[k]==='function'))throw Error('Required adapter method missing');
  if(input.previous_receipt_ref){step='READ_PREVIOUS_RECEIPT';input.previous_receipt=await adapter.readReceipt(input.previous_receipt_ref);}
  step='READ_ISSUE';const observed=await adapter.readIssue(input.identity.execution_issue_id);
  input.now=now();
  if(!observedSame(observed,input.issue)){r.reasons=['ISSUE_DRIFT_BEFORE_PLAN'];return await save(r,adapter)}
  step='READ_TEAM_STATUSES';const teamStatuses=await adapter.readStatuses(observed.team_id);
  input.now=now();
  const plan=planProgressReconciliation({...input,issue:observed,statuses:teamStatuses});r=receipt({...input,issue:observed,statuses:teamStatuses},plan);
  if(plan.result==='BLOCKED')return await save(r,adapter);
  step='PRE_WRITE_READ';const fresh=await adapter.readIssue(input.identity.execution_issue_id);
  input.now=now();
  if(!observedSame(fresh,observed)||!issueValid(fresh,input.identity,input.now)||time(fresh.observed_at)<time(observed.observed_at)){r.reasons=['ISSUE_DRIFT_OR_STALE_BEFORE_WRITE'];return await save(r,adapter)}
  r.pre_write_issue=clone(fresh);
  if(input.event.type==='DONE_REQUESTED'){
   const freshNow=now();
   const liveDone={...input,issue:fresh,now:freshNow,done_input:{...input.done_input,now:freshNow}};
   const scope=doneAssessment(liveDone);const revalidated=revalidateActionPreflight(plan.done_assessment,doneSnapshot(liveDone));
   if(scope.decision!=='READY'||revalidated.decision!=='READY'){r.reasons=['DONE_REVALIDATION_BLOCKED'];return await save(r,adapter)}r.done_verification={...revalidated,execution_issue_id:input.identity.execution_issue_id,execution_context_id:input.identity.execution_context_id};
  }
  const write=plan.patch.state_id||plan.patch.add_blocked_by.length||plan.patch.remove_blocked_by.length;
  if(write){step='WRITE';try{const response=await adapter.updateIssue(input.identity.execution_issue_id,clone(plan.patch),{expected_updated_at:fresh.updated_at,operation_key:plan.operation_key});r.write_results.push({status:response?.success===true?'SUCCESS':'FAILED',issue_id:input.identity.execution_issue_id,patch:clone(plan.patch),response:clone(response)});if(response?.success!==true)throw Error('Write result not successful');}catch(error){if(!r.write_results.length)r.write_results.push({status:'UNKNOWN',issue_id:input.identity.execution_issue_id,patch:clone(plan.patch),error:String(error.message)});throw error}}
  step='READ_BACK';r.readback=await adapter.readIssue(input.identity.execution_issue_id);
  input.now=now();
  if(!readMatches(r.readback,observed,plan.target_state,plan.dependency_changes)||!issueValid(r.readback,input.identity,input.now)||time(r.readback.observed_at)<time(fresh.observed_at)||time(r.readback.observed_at)<time(r.observed_at))throw Error('Issue read-back mismatch or stale observation');
  r.result=write?'SYNCED':'NO_CHANGE_REQUIRED';r.synced_at=input.now;r.reasons=[];
  const stored=await save(r,adapter);const validation=validateProgressSyncReceipt(stored);
  return validation.valid?stored:{...stored,result:'PROGRESS_SYNC_FAILED',failure_items:[...stored.failure_items,{step:'RECEIPT_VALIDATION',error:validation.errors.join(',')}],reasons:[...stored.reasons,'RECEIPT_VALIDATION_FAILED']};
 }catch(error){r.result='PROGRESS_SYNC_FAILED';r.failure_items.push({step,error:String(error.message)});r.reasons.push('PROGRESS_TOOL_OPERATION_FAILED');if(step==='WRITE')try{r.readback=await adapter.readIssue(input.identity.execution_issue_id)}catch{}return adapter&&typeof adapter.persistReceipt==='function'&&typeof adapter.readReceipt==='function'?await save(r,adapter):r;
 }finally{active.delete(key)}
}
