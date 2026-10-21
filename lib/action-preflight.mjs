import {createHash} from 'node:crypto';
import {evaluateDesignGate, routeAgents} from './design-gate.mjs';

/** G-01: caller-verified metadata only. No network, permission issuance or actions. */
const ACTIONS=new Set(['MERGE_PR','START_CODING','RELEASE','DEPLOY_PRODUCTION','OWNER_ACCEPTANCE','MARK_ISSUE_DONE']);
const BOUNDARY='CALLER_VERIFIED_SNAPSHOT_ONLY_NOT_AUTHORIZATION_OR_EXECUTION';
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'&&x.trim().length>0;
const ref=x=>text(x)&&/^(https:\/\/|session:|runtime:)/.test(x);
const sha=x=>typeof x==='string'&&/^[a-f0-9]{40}$/i.test(x);
const time=x=>typeof x==='string'?Date.parse(x):NaN;
const list=x=>Array.isArray(x)?x:[];
const obj=x=>record(x)?x:{};
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
function canonical(x){
 if(Array.isArray(x))return x.map(canonical);
 if(record(x))return Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])]));
 return x;
}
function fingerprint(input){
 const {now,verification,...semantic}=input;
 return createHash('sha256').update(JSON.stringify(canonical(semantic))).digest('hex');
}
function subjectValid(s,action){
 return ['repository','context_id','environment','target_ref'].every(k=>text(s[k]))&&ref(s.task_contract_ref)&&
 sha(s.base_sha)&&sha(s.head_sha)&&(action!=='MERGE_PR'||(Number.isInteger(s.pr_number)&&s.pr_number>0&&text(s.merge_method)));
}
function explicitRisk(a,input){
 return record(a)&&a.status==='APPROVED'&&a.explicit===true&&ref(a.owner_approval_ref)&&
 a.action===input.action&&same(a.subject,input.subject)&&['conditions','remediation'].every(k=>text(a[k]))&&ref(a.recheck_ref);
}
function proof(e,s,status){return sha(s.head_sha)&&record(e)&&e.status===status&&e.head_sha===s.head_sha&&ref(e.evidence_ref)}
function ciValid(ci,s){
 const c=list(ci?.checks).filter(x=>x?.required!==false);
 return proof(ci,s,'PASS')&&c.length>0&&c.every(x=>record(x)&&text(x.name)&&proof(x,s,'PASS'));
}
function qaValid(q,s){return proof(q,s,'PASS')&&q.untested_required===0}
function accepted(a,s){return text(s.context_id)&&ref(s.task_contract_ref)&&proof(a,s,'ACCEPTED')&&a.context_id===s.context_id&&a.task_contract_ref===s.task_contract_ref}
function reviewProblems(input){
 const r=obj(input.review),s=obj(input.subject),e=obj(r.execution),c=obj(input.execution_context),errors=[];
 if(r.status!=='COMPLETED')return ['INDEPENDENT_REVIEW_NOT_RUN'];
 if(!['APPROVE','APPROVE_WITH_CONDITIONS','REQUEST_CHANGES'].includes(r.decision))errors.push('INVALID_REVIEW_DECISION');
 if(r.decision==='REQUEST_CHANGES')errors.push('REVIEW_REQUEST_CHANGES');
 if(!sha(s.base_sha)||!sha(s.head_sha)||r.mode!=='IMPLEMENTATION'||r.base_sha!==s.base_sha||r.head_sha!==s.head_sha||r.actual_diff_reviewed!==true||!ref(r.diff_ref))
  errors.push('STALE_OR_UNVERIFIED_REVIEW_DIFF');
 if(!ref(c.implementer_session_ref)||!ref(c.master_session_ref)||!ref(e.session_ref)||
    e.session_ref===c.implementer_session_ref||e.session_ref===c.master_session_ref)
  errors.push('REVIEW_NOT_FRESH_CONTEXT');
 if(!text(e.execution_id)||!ref(e.evidence_ref)||!['RUNTIME_DISPATCH','HUMAN_RELAY'].includes(e.execution_mode)||
   (e.execution_mode==='RUNTIME_DISPATCH'&&!ref(e.runtime_task_ref))||
   (e.execution_mode==='HUMAN_RELAY'&&!ref(e.human_start_ref))||(!ref(r.handoff_ref)&&!ref(r.github_review_ref)))
  errors.push('INDEPENDENT_REVIEW_EXECUTION_NOT_PROVEN');
 if(!Array.isArray(r.conditions)||(r.decision==='APPROVE_WITH_CONDITIONS'&&!r.conditions.length)||
   list(r.conditions).some(x=>!record(x)||!((x.status==='COMPLETED'&&ref(x.evidence_ref))||
    (!['P0','P1'].includes(x.severity)&&explicitRisk(x.risk_acceptance,input)))))
  errors.push('REVIEW_CONDITIONS_UNRESOLVED');
 return errors;
}
const RESERVED=/^(CI|QA|REVIEW|INDEPENDENT|AUTHORIZATION|DESIGN|ACCEPTANCE|DEPENDENCY|HEAD|P0|P1|FRESH|SOURCE|SCOPE|OWNER|BLOCKER)(?:$|[_:-])/i;

export function evaluateActionPreflight(raw={}){
 const input=obj(raw),s=obj(input.subject),p=obj(input.policy),a=obj(input.authorization),v=obj(input.verification);
 const reasons=[],checks=[],next=[];
 function check(gate,ok,reason,decision='BLOCKED'){
  checks.push({gate,status:ok?'PASS':decision,...(ok?{}:{reason})});
  if(!ok&&!reasons.includes(reason))reasons.push(reason);
 }
 check('SCHEMA',input.schema_version==='padf.action-preflight/v1','INVALID_PREFLIGHT_SCHEMA');
 check('ACTION',ACTIONS.has(input.action),'INVALID_ACTION');
 check('SUBJECT',subjectValid(s,input.action),'INVALID_OR_UNPINNED_SUBJECT');
 const times=[time(input.now),time(v.observed_at),time(v.valid_until)];
 check('LIVE_SNAPSHOT',v.verified===true&&ref(v.evidence_ref)&&times.every(Number.isFinite)&&
  times[1]<=times[0]&&times[0]<=times[2]&&times[2]-times[1]<=300000,'LIVE_VERIFICATION_MISSING_OR_STALE');
 const missing=!Object.hasOwn(input,'authorization')||(record(input.authorization)&&(!Object.keys(a).length||a.status==='PENDING'));
 check('OWNER_AUTHORIZATION',!missing&&a.status==='APPROVED'&&ref(a.owner_approval_ref)&&a.action===input.action&&same(a.subject,s),
  missing?'OWNER_ACTION_DECISION_REQUIRED':'OWNER_AUTHORIZATION_INACTIVE_OR_SCOPE_MISMATCH',missing?'NEEDS_OWNER_DECISION':'BLOCKED');
 check('POLICY',ref(p.evidence_ref)&&typeof p.review_required==='boolean'&&typeof p.qa_required==='boolean'&&
  Array.isArray(p.impacts)&&Array.isArray(p.risk_flags),'MISSING_PROJECT_POLICY');
 const routing=routeAgents({task_class:p.task_class,impacts:p.impacts,risk_flags:p.risk_flags});
 check('RISK_CLASSIFICATION',routing.valid===true,'INVALID_RISK_CLASSIFICATION');
 check('FINDINGS_READ',Array.isArray(input.findings),'FINDINGS_NOT_VERIFIED');
 check('BLOCKERS_READ',Array.isArray(input.blockers)&&input.blockers.length===0,'UNRESOLVED_OR_UNVERIFIED_BLOCKERS');
 const findings=[...list(input.findings),...list(input.review?.findings)];
 for(const [i,f] of findings.entries()){
  check('FINDING_'+i,record(f)&&['P0','P1','P2','P3'].includes(f.severity)&&text(f.status),'INVALID_FINDING');
  if(['P0','P1'].includes(f?.severity))check('FINDING_'+i,f.status==='FIXED','UNRESOLVED_P0_P1');
  if(f?.severity==='P2')check('FINDING_'+i,f.status==='FIXED'||explicitRisk(f.risk_acceptance,input),'P2_RISK_NOT_ACCEPTED');
 }
 if(input.review?.findings!==undefined)check('REVIEW_FINDINGS',Array.isArray(input.review.findings),'INVALID_REVIEW_FINDINGS');
 if(input.action==='START_CODING'){
  const d=obj(input.design_input);let gate;
  try {gate=evaluateDesignGate(d)}catch{gate=null}
  check('DESIGN_GATE',gate?.status==='DESIGN_READY'&&gate?.coding_authorized===true,'DESIGN_OR_CODING_GATE_NOT_READY');
  check('DESIGN_SCOPE',d.repository===s.repository&&d.context_id===s.context_id&&d.task_contract_ref===s.task_contract_ref&&
   d.source_base_sha===s.base_sha&&d.source_head_sha===s.head_sha&&
   (missing?ref(d.coding_authorization?.owner_approval_ref):d.coding_authorization?.owner_approval_ref===a.owner_approval_ref)&&d.coding_authorization?.task_contract_ref===s.task_contract_ref,
   'DESIGN_TASK_OR_AUTHORIZATION_MISMATCH');
 } else if(ACTIONS.has(input.action)){
  check('IMPLEMENTATION',proof(input.implementation,s,'COMPLETE'),'IMPLEMENTATION_NOT_COMPLETE');
  check('CI',ciValid(input.ci,s),'CURRENT_HEAD_CI_NOT_PASSED');
  if(p.qa_required!==false)check('QA',qaValid(input.qa,s),'APPLICABLE_QA_NOT_PASSED');
  else check('QA_SKIP',ref(p.qa_skip_ref)&&routing.independent_review_required===false,'QA_SKIP_NOT_JUSTIFIED');
  const required=p.review_required!==false||routing.independent_review_required===true;
  if(p.review_required===false)check('REVIEW_POLICY',routing.independent_review_required===false&&ref(p.review_skip_ref),'MANDATORY_REVIEW_CANNOT_BE_SKIPPED');
  if(required||input.review!==undefined)for(const code of reviewProblems(input))check('INDEPENDENT_REVIEW',false,code);
  else check('INDEPENDENT_REVIEW',true);
 }
 if(input.action==='MERGE_PR'){
  const pr=obj(input.pr);
  check('PR_SCOPE',pr.state==='OPEN'&&pr.draft===false&&ref(pr.evidence_ref)&&pr.repository===s.repository&&
   pr.number===s.pr_number&&pr.base_sha===s.base_sha&&pr.head_sha===s.head_sha&&pr.base_ref===s.target_ref&&pr.merge_method===s.merge_method,
   'PR_STATE_OR_EXPECTED_BASE_HEAD_MISMATCH');
  check('MERGE_POLICY',Array.isArray(p.allowed_base_refs)&&p.allowed_base_refs.includes(s.target_ref)&&
   Array.isArray(p.allowed_merge_methods)&&p.allowed_merge_methods.includes(s.merge_method),'BRANCH_OR_MERGE_METHOD_NOT_ALLOWED');
 }
 if(input.action==='RELEASE'){
  const r=obj(input.release);
  check('RELEASE_TARGET',r.target_sha===s.head_sha&&r.tag===s.target_ref&&r.tag_available===true&&
    [r.notes_ref,r.rollback_ref,r.source_merge_ref].every(ref),'RELEASE_TARGET_OR_EVIDENCE_NOT_READY');
 }
 if(input.action==='DEPLOY_PRODUCTION'){
  const r=obj(input.release),d=obj(input.deployment);
  check('PUBLISHED_RELEASE',r.published===true&&r.target_sha===s.head_sha&&ref(r.evidence_ref),'PUBLISHED_RELEASE_NOT_VERIFIED');
  check('DEPLOYMENT_SAFETY',s.environment==='production'&&d.environment===s.environment&&d.artifact_sha===s.head_sha&&
   ref(d.runbook_ref)&&ref(d.rollback_ref)&&d.recovery_verified===true,'PRODUCTION_RECOVERY_OR_ARTIFACT_NOT_READY');
 }
 if(input.action==='MARK_ISSUE_DONE')check('OWNER_ACCEPTANCE',accepted(input.acceptance,s),'OWNER_ACCEPTANCE_NOT_VERIFIED');
 const optional=p.optional_checks===undefined?[]:p.optional_checks;
 check('OPTIONAL_POLICY',Array.isArray(optional)&&optional.every(x=>record(x)&&text(x.id)&&!RESERVED.test(x.id)&&
   ['PASS','FAIL','NOT_RUN'].includes(x.status))&&new Set(list(optional).map(x=>x?.id)).size===list(optional).length,'INVALID_OPTIONAL_CHECK_POLICY');
 if(input.exceptions!==undefined)check('EXCEPTIONS',Array.isArray(input.exceptions)&&input.exceptions.every(e=>
  record(e)&&text(e.exception_id)&&text(e.rule_id)&&!RESERVED.test(e.rule_id)&&list(optional).some(r=>r?.id===e.rule_id)),
  'INVALID_OR_NON_WAIVABLE_EXCEPTION');
 for(const rule of list(optional).filter(x=>record(x)&&text(x.id))){
  if(rule.status==='PASS')check('OPTIONAL:'+rule.id,ref(rule.evidence_ref),'OPTIONAL_CHECK_EVIDENCE_MISSING');
  else {
   const es=list(input.exceptions).filter(e=>e?.rule_id===rule.id);
   const e=es[0];
   const valid=es.length===1&&!RESERVED.test(rule.id)&&text(e?.exception_id)&&e?.status==='APPROVED'&&e.explicit===true&&
     ref(e.owner_approval_ref)&&e.action===input.action&&same(e.subject,s)&&['risk','conditions','remediation'].every(k=>text(e[k]))&&ref(e.recheck_ref);
   check('OPTIONAL:'+rule.id,valid,'OPTIONAL_CHECK_REQUIRES_EXPLICIT_DECISION:'+rule.id,'NEEDS_OWNER_DECISION');
  }
 }
 const blocked=checks.some(c=>c.status==='BLOCKED');
 const needs=checks.some(c=>c.status==='NEEDS_OWNER_DECISION');
 const decision=blocked?'BLOCKED':needs?'NEEDS_OWNER_DECISION':'READY';
 if(reasons.includes('INDEPENDENT_REVIEW_NOT_RUN'))next.push('启动真实独立Reviewer；无运行时则HUMAN_RELAY，请Owner按Dispatch链接启动新会话并回传真实Execution/Handoff。');
 if(decision==='BLOCKED')next.push('先完成缺失门禁/修复阻塞，重读准确版本及有效授权后重新预检；普通Owner请求不等于豁免。');
 if(needs)next.push('仅请求所缺的明确Owner决定/有界非强制例外；已有有效授权不重复索取。');
 if(decision==='READY')next.push('实际操作前重新读取实时来源并调用revalidateActionPreflight；工具须使用原子HEAD匹配，之后核对证据和Issue状态。');
 return {schema_version:'padf.action-preflight/v1',action:input.action??null,decision,reasons,checks,next_steps:next,
  fingerprint:fingerprint(input),verification_boundary:BOUNDARY};
}

export function revalidateActionPreflight(previous,fresh){
 const result=evaluateActionPreflight(fresh);
 const reasons=[...result.reasons];
 if(previous?.decision!=='READY')reasons.push('PREVIOUS_PREFLIGHT_NOT_READY');
 if(typeof previous?.fingerprint!=='string'||previous.fingerprint!==result.fingerprint)reasons.push('PREFLIGHT_INPUT_CHANGED');
 return {...result,decision:reasons.length?'BLOCKED':result.decision,reasons:[...new Set(reasons)]};
}

export function reconcileActionEvidence(raw={}){
 const x=obj(raw),s=obj(x.subject),states={},anomalies=[],actions=[];
 function state(name,ok,evidence){states[name]={status:ok?'VERIFIED':'NOT_VERIFIED',evidence_ref:ok?evidence:null}}
 state('IMPLEMENTATION_COMPLETE',proof(x.implementation,s,'COMPLETE'),x.implementation?.evidence_ref);
 state('CI_PASSED',ciValid(x.ci,s),x.ci?.evidence_ref);
 state('QA_PASSED',qaValid(x.qa,s),x.qa?.evidence_ref);
 const known=[...list(x.findings),...list(x.review?.findings)];
 const reviewed=reviewProblems(x).length===0&&Array.isArray(x.findings)&&known.every(f=>
  record(f)&&['P0','P1','P2','P3'].includes(f.severity)&&text(f.status)&&
  (!['P0','P1'].includes(f.severity)||f.status==='FIXED')&&
  (f.severity!=='P2'||f.status==='FIXED'||explicitRisk(f.risk_acceptance,x)));
 state('INDEPENDENT_REVIEW_PASSED',reviewed,x.review?.handoff_ref??x.review?.github_review_ref);
 state('PR_MERGED',sha(s.head_sha)&&x.pr?.merged===true&&x.pr?.merge_commit_sha===s.head_sha&&ref(x.pr?.evidence_ref),x.pr?.evidence_ref);
 const acceptance=accepted(x.acceptance,s);
 state('OWNER_ACCEPTED',acceptance,x.acceptance?.evidence_ref);
 const done=x.issue?.status_type==='completed'&&ref(x.issue?.evidence_ref);
 state('ISSUE_DONE',done&&acceptance,x.issue?.evidence_ref);
 state('PRODUCTION_DEPLOYED',sha(s.head_sha)&&x.deployment?.status==='DEPLOYED'&&x.deployment?.environment==='production'&&
  x.deployment?.artifact_sha===s.head_sha&&ref(x.deployment?.evidence_ref),x.deployment?.evidence_ref);
 if(x.issue?.status_type==='completed'&&!acceptance){
  anomalies.push({code:'DONE_WITHOUT_OWNER_ACCEPTANCE',evidence_ref:x.issue?.evidence_ref??null});
  actions.push('记录治理异常；核对Merge→Done映射，保留In Review或在适用授权后恢复，不能自动修改PQA/Linear状态。');
 }
 return {states,anomalies,recommended_actions:actions,verification_boundary:BOUNDARY};
}
