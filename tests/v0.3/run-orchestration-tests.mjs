#!/usr/bin/env node
import assert from 'node:assert/strict';
import {evaluateOrchestrationChain,evaluateDispatchAuthorization} from '../../lib/orchestration-evidence.mjs';
const A='a'.repeat(40),B='b'.repeat(40),C='c'.repeat(40);
const base='https://github.com/example/padf/';
const link=s=>base+s;
const pin=s=>s+'@'+A;
function make(role='solution-architect',prev=null,index=0,mode='HUMAN_RELAY'){
 const id='DISP-'+index, moment=n=>new Date(Date.UTC(2026,9,16,0,index*10+n)).toISOString();
 const dispatch={dispatch_id:id,context_id:'SAMPLE-EXPENSE',target_role:role,
  master_session_ref:'session:master-A',dispatch_ref:link('issues/6#dispatch-'+index),
  task_contract_ref:link('issues/6#contract-'+index),
  skill_ref:pin('.agents/skills/'+role+'/SKILL.md'),
  created_at:moment(1),routing_rationale:'Master chose role for documented design impact',
  expected_artifact_types:[role==='solution-architect'?'solution-architecture':role==='module-architect'?'module-design':'ui-design'],
  execution_mode:mode,initiated_by:mode==='HUMAN_RELAY'?'HUMAN_OWNER':mode==='RUNTIME_DISPATCH'?'MASTER_RUNTIME_TOOL':'SAME_SESSION',
  depends_on_dispatch_ids:prev?[prev.dispatch.dispatch_id]:[],
  ...(prev?{prior_handoff_ref:prev.handoff.handoff_ref,prior_reconciliation_ref:prev.reconciliation.reconciliation_ref}:{}),
  ...(mode==='RUNTIME_DISPATCH'?{runtime_dispatch_ref:link('tasks/launch-'+id)}:{}),
  ...(role==='module-architect'?{system_baseline_ref:pin('docs/SYSTEM.md'),
   system_baseline_status:'APPROVED',system_baseline_owner_approval_ref:link('issues/6#approved-system')}:{}),
  ...(role==='ui-ux-designer'?{ui_profile_ref:pin('docs/ui-profile.md')}:{}),
 };
 const execution={execution_id:'EXECUTION-'+index,dispatch_id:id,executor_role:role,
  executor_session_ref:'session:specialist-'+index,started_at:moment(3),
  dispatch_ref_read:dispatch.dispatch_ref,skill_ref_used:dispatch.skill_ref,
  evidence_method:mode==='RUNTIME_DISPATCH'?'RUNTIME_ISSUED':'OWNER_ATTESTED',
  ...(mode==='RUNTIME_DISPATCH'?{runtime_task_ref:link('tasks/run-'+id)}:{human_start_ref:link('issues/6#start-'+index)})};
 const handoff={handoff_id:'HAND-'+index,dispatch_id:id,execution_id:execution.execution_id,
  sender_role:role,handoff_ref:link('issues/6#handoff-'+index),submitted_at:moment(6),
  artifact_refs:[{kind:role==='solution-architect'?'solution-architecture':'design',
   ref:pin(role==='solution-architect'?'docs/SYSTEM.md':'docs/role-'+index+'.md')}]};
 const reconciliation={dispatch_id:id,master_session_ref:'session:master-A',
  reconciliation_ref:link('issues/6#reconcile-'+index),
  evidence_check_ref:link('issues/6#live-check-'+index),
  observed_at:moment(8),reviewed_handoff_ref:handoff.handoff_ref,
  decision:'CONTINUE',next_dispatch_id:'DISP-'+(index+1)};
 return {dispatch,execution,handoff,reconciliation};
}
const wrap=(chain)=>({schema_version:'padf.agent-dispatch/v1',context_id:'SAMPLE-EXPENSE',
  master_session_ref:'session:master-A',chain});
const baseline=()=>{
 const s=make();const m=make('module-architect',s,1);
 const u=make('ui-ux-designer',m,2);u.reconciliation.next_dispatch_id=null;
 return wrap([s,m,u]);
};
const checks=[];
const check=(title,fn)=>{fn();checks.push(title)};
const has=(x,code)=>assert(x.errors.some(e=>e.code===code),JSON.stringify(x.errors));
check('Owner-mediated distinct-session full 3 specialist chain structurally eligible',()=>{
 const v=evaluateOrchestrationChain(baseline());
 assert.equal(v.eligible,true,JSON.stringify(v.errors));
 assert.equal(v.level,'HUMAN_RELAY_METADATA_ELIGIBLE');assert.equal(v.stage_count,3);
});
check('Runtime dispatched mode needs actual Master task references',()=>{
 const x=wrap([make('solution-architect',null,0,'RUNTIME_DISPATCH')]);
 assert.equal(evaluateOrchestrationChain(x).eligible,true);
 delete x.chain[0].execution.runtime_task_ref;has(evaluateOrchestrationChain(x),'RUNTIME_DISPATCH_NOT_PROVEN');
});
check('Role simulation cannot pass true orchestration',()=>{
 const x=wrap([make('solution-architect',null,0,'ROLE_SIMULATION')]);
 has(evaluateOrchestrationChain(x),'ROLE_SIMULATION_NOT_ORCHESTRATION');
});
check('Same Master and agent session cannot pass',()=>{
 const x=baseline();x.chain[1].execution.executor_session_ref=x.master_session_ref;
 has(evaluateOrchestrationChain(x),'SAME_SESSION_NOT_INDEPENDENT');
});
check('Only agent label with no session receipt is insufficient',()=>{
 const x=baseline();delete x.chain[1].execution.executor_session_ref;
 has(evaluateOrchestrationChain(x),'EXECUTION_NOT_LINKED_TO_DISPATCH');
});
check('Self-reported execution is not independent session evidence',()=>{
 const x=baseline();x.chain[0].execution.evidence_method='SELF_REPORTED';
 has(evaluateOrchestrationChain(x),'HUMAN_RELAY_EVIDENCE_MISSING');
});
check('Human relay cannot be misrepresented as master-launched',()=>{
 const x=baseline();x.chain[0].dispatch.initiated_by='MASTER_RUNTIME_TOOL';
 has(evaluateOrchestrationChain(x),'HUMAN_RELAY_EVIDENCE_MISSING');
});
check('No dispatch after blocked reconciliation',()=>{
 const x=baseline();x.chain[0].reconciliation.decision='BLOCKED';
 has(evaluateOrchestrationChain(x),'PREDECESSOR_DID_NOT_CONTINUE');
});
check('Dispatch must occur after predecessor handoff and reconciliation',()=>{
 const x=baseline();x.chain[1].dispatch.created_at=x.chain[0].reconciliation.observed_at;
 has(evaluateOrchestrationChain(x),'DISPATCH_BEFORE_RECONCILIATION');
});
check('No orphan Module stage without actual previous Handoff link',()=>{
 const x=baseline();x.chain[1].dispatch.prior_handoff_ref=link('issues/6#invented');
 has(evaluateOrchestrationChain(x),'MISSING_DEPENDENCY_RECONCILIATION_LINK');
});
check('Next role must be explicitly selected by Master',()=>{
 const x=baseline();x.chain[0].reconciliation.next_dispatch_id='OTHER';
 has(evaluateOrchestrationChain(x),'MASTER_DID_NOT_AUTHORIZE_NEXT_DISPATCH');
});
check('MODULE blocked when system baseline not Owner approved',()=>{
 const x=baseline();x.chain[1].dispatch.system_baseline_status='PROPOSED';
 has(evaluateOrchestrationChain(x),'UNAPPROVED_MODULE_BASELINE');
});
check('MODULE blocked when baseline does not match SYSTEM artifact',()=>{
 const x=baseline();x.chain[1].dispatch.system_baseline_ref='docs/WRONG.md@'+B;
 has(evaluateOrchestrationChain(x),'MODULE_BASELINE_SOURCE_MISMATCH');
});
check('Unversioned Skill ref blocks claim of pinned execution',()=>{
 const x=baseline();x.chain[0].dispatch.skill_ref='skills/solution-architect@main';
 has(evaluateOrchestrationChain(x),'INVALID_DISPATCH_REFERENCE');
});
check('Executed Skill revision must match Master dispatch',()=>{
 const x=baseline();x.chain[0].execution.skill_ref_used=pin('another-skill');
 has(evaluateOrchestrationChain(x),'EXECUTION_NOT_LINKED_TO_DISPATCH');
});
check('Handoff artifacts need immutable source references',()=>{
 const x=baseline();x.chain[2].handoff.artifact_refs[0].ref='docs/ui.md@main';
 has(evaluateOrchestrationChain(x),'HANDOFF_EVIDENCE_INCOMPLETE');
});
check('Master must check live Handoff instead of blindly advancing',()=>{
 const x=baseline();x.chain[1].reconciliation.reviewed_handoff_ref=link('issues/6#other');
 has(evaluateOrchestrationChain(x),'RECONCILIATION_EVIDENCE_INCOMPLETE');
});
check('UI Designer requires project UI profile or creation authorization',()=>{
 const x=baseline();delete x.chain[2].dispatch.ui_profile_ref;
 has(evaluateOrchestrationChain(x),'UI_PROFILE_OR_CREATION_AUTHORIZATION_MISSING');
});
check('Different context or executor role blocks chain',()=>{
 const x=baseline();x.chain[1].execution.executor_role='solution-architect';
 has(evaluateOrchestrationChain(x),'ROLE_MISMATCH');
});
// These are policy snapshots, not real Owner approvals or runtime executions.
const authorizationFixture=()=>({
 authorization:{schema_version:'padf.dispatch-authorization/v1',authorization_ref:link('issues/10#contract'),
  owner_approval_ref:link('issues/10#owner-approval'),status:'APPROVED',context_id:'padf-task-10',
  repository:'example/padf',task_contract_ref:link('issues/10#contract'),environment:'isolated',
  scope_items:[{id:'bounded-review',allowed_roles:['independent-reviewer','qa-tester'],
   allowed_actions:['REVIEW','TEST'],required_decisions:[]}]},
 dispatch:{context_id:'padf-task-10',repository:'example/padf',task_contract_ref:link('issues/10#contract'),
  environment:'isolated',target_role:'independent-reviewer',action:'REVIEW',scope_ids:['bounded-review']},
 decision_approvals:[]});
const blocked=(x,code)=>{const v=evaluateDispatchAuthorization(x);assert.equal(v.allowed,false);assert.equal(v.decision,'BLOCKED');assert(v.errors.includes(code),JSON.stringify(v))};
const allowed=x=>{const v=evaluateDispatchAuthorization(x);assert.equal(v.allowed,true,JSON.stringify(v));assert.equal(v.decision,'CONTINUE');return v};
const formalDesign=(role='module-architect',kind='SYSTEM_BASELINE')=>{
 const x=authorizationFixture(),r={decision_id:'approved-baseline',kind,subject_ref:pin('docs/baseline.md')};
 x.dispatch.target_role=role;x.dispatch.action='DESIGN';
 Object.assign(x.authorization.scope_items[0],{allowed_roles:[role],allowed_actions:['DESIGN'],required_decisions:[r]});
 x.decision_approvals=[{...r,status:'APPROVED',owner_approval_ref:link('issues/10#baseline-approval')}];return x;
};
check('Same Owner approval supports successive real-mode review/test dispatches without new approval',()=>{
 const x=authorizationFixture(),before=structuredClone(x.authorization);allowed(x);
 x.dispatch.target_role='qa-tester';x.dispatch.action='TEST';allowed(x);
 assert.deepEqual(x.authorization,before);assert.equal(x.dispatch.owner_approval_ref,undefined);
 const chain=wrap([make('independent-reviewer',null,0,'RUNTIME_DISPATCH')]);
 assert.equal(evaluateOrchestrationChain(chain).level,'RUNTIME_DISPATCH_METADATA_ELIGIBLE');
});
check('Approved formal module and UI design may continue at matching decision revisions',()=>{
 allowed(formalDesign());allowed(formalDesign('ui-ux-designer','UI_PROFILE'));
 allowed(formalDesign('ui-ux-designer','UI_PROFILE_CREATION'));
});
check('Authorized proposal can proceed without making the proposed baseline approved',()=>{
 const x=formalDesign();x.dispatch.action='DESIGN_PROPOSAL';
 Object.assign(x.authorization.scope_items[0],{allowed_actions:['DESIGN_PROPOSAL'],required_decisions:[]});
 x.decision_approvals=[];allowed(x);
 const chain=baseline();chain.chain[1].dispatch.system_baseline_status='PROPOSED';
 has(evaluateOrchestrationChain(chain),'UNAPPROVED_MODULE_BASELINE');
});
check('Absent authorization cannot be supplied by a dispatch-level approval label',()=>{
 const x=authorizationFixture();delete x.authorization;x.dispatch.owner_approval_ref=link('issues/10#owner-approval');
 blocked(x,'MISSING_AUTHORIZATION');
});
check('Missing canonical Owner approval or Task Contract reference blocks',()=>{
 for(const key of ['owner_approval_ref','authorization_ref','task_contract_ref']){
  const x=authorizationFixture();delete x.authorization[key];
  blocked(x,key==='task_contract_ref'?'INVALID_TASK_CONTRACT':'MISSING_AUTHORIZATION');
 }
});
check('Revoked expired cancelled completed or proposed authorization blocks',()=>{
 for(const status of ['REVOKED','EXPIRED','CANCELLED','COMPLETED','PROPOSED',undefined]){
  const x=authorizationFixture();x.authorization.status=status;blocked(x,'AUTHORIZATION_NOT_ACTIVE');
 }
});
check('Repository context environment and exact Task Contract drift block',()=>{
 for(const field of ['repository','context_id','environment','task_contract_ref']){
  const x=authorizationFixture();x.dispatch[field]+='-other';blocked(x,'AUTHORIZATION_SCOPE_MISMATCH');
 }
});
check('Unknown scope and mixed authorized plus unauthorized scopes block',()=>{
 for(const scope_ids of [['another-scope'],['bounded-review','another-scope']]){
  const x=authorizationFixture();x.dispatch.scope_ids=scope_ids;blocked(x,'SCOPE_NOT_AUTHORIZED');
 }
});
check('Role and delegated action must both be permitted by the approved scope',()=>{
 const x=authorizationFixture();x.dispatch.target_role='solution-architect';blocked(x,'ROLE_NOT_ALLOWED');
 x.dispatch.target_role='independent-reviewer';x.dispatch.action='DESIGN';blocked(x,'ACTION_NOT_ALLOWED');
});
check('Coding major decisions merge release deployment destruction and acceptance never inherit dispatch approval',()=>{
 for(const action of ['CODE','IMPLEMENT','APPROVE_DESIGN','ACCEPT_RISK','CHANGE_SCOPE','PR_MERGE','RELEASE',
  'PRODUCTION_DEPLOY','DESTRUCTIVE_OPERATION','CREDENTIAL_ROTATION','MARK_DONE','unknown']){
  const x=authorizationFixture();x.dispatch.action=action;x.authorization.scope_items[0].allowed_actions.push(action);
  blocked(x,'ACTION_REQUIRES_SEPARATE_AUTHORIZATION');
 }
});
check('Formal module/UI design cannot silently omit necessary baseline decision requirements',()=>{
 for(const role of ['module-architect','ui-ux-designer']){
  const x=formalDesign(role);x.authorization.scope_items[0].required_decisions=[];
  blocked(x,role==='module-architect'?'SYSTEM_APPROVAL_REQUIREMENT_MISSING':'UI_APPROVAL_REQUIREMENT_MISSING');
 }
});
check('Missing pending rejected stale or unlinked necessary decisions block before launch',()=>{
 for(const mutate of [x=>x.decision_approvals=[],x=>x.decision_approvals[0].status='PROPOSED',
  x=>x.decision_approvals[0].status='REJECTED',x=>x.decision_approvals[0].subject_ref='docs/baseline.md@'+B,
  x=>delete x.decision_approvals[0].owner_approval_ref,x=>x.decision_approvals[0].kind='UI_PROFILE']){
  const x=formalDesign();mutate(x);blocked(x,'REQUIRED_DECISION_NOT_APPROVED');
 }
});
check('All selected scope decisions are required, not only the first scope',()=>{
 const x=formalDesign();x.authorization.scope_items.push({id:'second-scope',allowed_roles:['module-architect'],
  allowed_actions:['DESIGN'],required_decisions:[{decision_id:'other-baseline',kind:'SYSTEM_BASELINE',subject_ref:pin('docs/other.md')}]});
 x.dispatch.scope_ids.push('second-scope');blocked(x,'REQUIRED_DECISION_NOT_APPROVED');
});
check('Malformed empty or ambiguous scope cannot fail open',()=>{
 for(const scope_ids of [undefined,[],['bounded-review','bounded-review'],'bounded-review']){
  const x=authorizationFixture();x.dispatch.scope_ids=scope_ids;blocked(x,'INVALID_DISPATCH_SCOPE');
 }
 for(const scope_items of [undefined,[],[null],[{},{}]]){
  const x=authorizationFixture();x.authorization.scope_items=scope_items;blocked(x,'INVALID_AUTHORIZED_SCOPE');
 }
 const x=authorizationFixture();x.authorization.scope_items.push(structuredClone(x.authorization.scope_items[0]));
 blocked(x,'INVALID_AUTHORIZED_SCOPE');
});
check('Malformed duplicate or unversioned decision requirements block',()=>{
 for(const requirements of [undefined,[null],[{}],[{decision_id:'baseline',kind:'SYSTEM_BASELINE',subject_ref:'docs@main'}]]){
  const x=formalDesign();x.authorization.scope_items[0].required_decisions=requirements;blocked(x,'INVALID_DECISION_REQUIREMENTS');
 }
 const x=formalDesign();x.decision_approvals.push(structuredClone(x.decision_approvals[0]));blocked(x,'REQUIRED_DECISION_NOT_APPROVED');
 x.decision_approvals=null;blocked(x,'INVALID_DECISION_APPROVALS');
});
check('Null malformed and empty input safely block with explicit snapshot boundary',()=>{
 for(const x of [null,undefined,{},[],{authorization:null,dispatch:null}]){
  const v=evaluateDispatchAuthorization(x);assert.equal(v.allowed,false);
  assert.equal(v.verification_boundary,'SNAPSHOT_ONLY_NOT_LIVE_AUTHORIZATION_OR_EXECUTION');
 }
});
console.log(JSON.stringify({suite:'Master Orchestration evidence (synthetic metadata ONLY)',
 status:'PASS',count:checks.length,checks,external_sessions_executed:'NOT_RUN',
 actual_runtime_dispatch:'NOT_RUN'},null,2));
