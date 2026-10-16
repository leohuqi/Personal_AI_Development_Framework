#!/usr/bin/env node
import assert from 'node:assert/strict';
import {evaluateOrchestrationChain} from '../../lib/orchestration-evidence.mjs';
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
 const execution={execution_id:'RUN-'+index,dispatch_id:id,executor_role:role,
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
console.log(JSON.stringify({suite:'Master Orchestration evidence (synthetic metadata ONLY)',
 status:'PASS',count:checks.length,checks,external_sessions_executed:'NOT_RUN',
 actual_runtime_dispatch:'NOT_RUN'},null,2));
