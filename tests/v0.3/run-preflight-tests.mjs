#!/usr/bin/env node
// Synthetic contract snapshots exercise decision logic, never live approvals, Agent identity or platform settings.
import assert from 'node:assert/strict';
import {evaluateActionPreflight, revalidateActionPreflight, reconcileActionEvidence} from '../../lib/action-preflight.mjs';
import {evaluateDispatchAuthorization} from '../../lib/orchestration-evidence.mjs';

const A='a'.repeat(40), B='b'.repeat(40), C='c'.repeat(40);
const link=suffix=>'https://github.com/example/padf/'+suffix;
const evidence=link('issues/15#synthetic-evidence');
const clone=x=>structuredClone(x);
const tests=[];
function test(group,name,fn){
 try {fn();tests.push({group,name,status:'PASS'});}
 catch(error){tests.push({group,name,status:'FAIL',error:error.message});}
}
function decision(x,want='BLOCKED'){
 const result=evaluateActionPreflight(x);
 assert.equal(result.decision,want,JSON.stringify(result));
 assert(Array.isArray(result.reasons));assert(Array.isArray(result.checks));assert(Array.isArray(result.next_steps));
 assert.equal(typeof result.verification_boundary,'string');
 if(want!=='READY')assert(result.reasons.length>0,'Non-ready result needs reasons');
 return result;
}
function mutate(path,value,x=fixture()){
 const parts=path.split('.');let obj=x;
 for(const part of parts.slice(0,-1))obj=obj[part];
 if(value===undefined)delete obj[parts.at(-1)];else obj[parts.at(-1)]=value;
 return x;
}
function design(subject,approval){
 return {repository:subject.repository,context_id:subject.context_id,task_contract_ref:subject.task_contract_ref,
  source_base_sha:subject.base_sha,source_head_sha:subject.head_sha,
  task_class:'S',architecture_scope:'none',routing_rationale:'Bounded documentation-only change',
  feature_spec_ref:'docs/feature.md@'+A,impacts:[],risk_flags:[],stages:[],
  consistency_checks:[{scope:'contract',status:'PASS',evidence_ref:evidence}],
  review_skip_rationale:'No architecture, product, API or security change',
  coding_authorization:{owner_approval_ref:approval,task_contract_ref:subject.task_contract_ref,scope_confirmed:true}};
}
function fixture(action='MERGE_PR'){
 const subject={repository:'example/padf',context_id:'PADF-G01',task_contract_ref:link('issues/15#contract'),
  environment:action==='DEPLOY_PRODUCTION'?'production':'isolated',
  target_ref:action==='RELEASE'?'v0.3.3':action==='DEPLOY_PRODUCTION'?'production':'main',base_sha:A,head_sha:B,
  ...(action==='MERGE_PR'?{pr_number:16,merge_method:'squash'}:{})};
 const approval=link('issues/15#owner-'+action);
 const x={schema_version:'padf.action-preflight/v1',now:'2026-10-21T08:00:00Z',
  verification:{verified:true,observed_at:'2026-10-21T07:59:00Z',valid_until:'2026-10-21T08:02:00Z',evidence_ref:evidence},
  action,subject,authorization:{status:'APPROVED',owner_approval_ref:approval,action,subject:clone(subject)},
  policy:{evidence_ref:evidence,review_required:true,qa_required:true,task_class:'M',impacts:[],risk_flags:[],
   allowed_base_refs:['main'],allowed_merge_methods:['squash']},findings:[],blockers:[],
  implementation:{status:'COMPLETE',head_sha:B,evidence_ref:evidence},
  ci:{status:'PASS',head_sha:B,evidence_ref:evidence,checks:[{name:'node-regression',status:'PASS',head_sha:B,evidence_ref:evidence,required:true}]},
  qa:{status:'PASS',head_sha:B,evidence_ref:evidence,untested_required:0},
  execution_context:{implementer_session_ref:'session:implementer',master_session_ref:'session:master'},
  review:{status:'COMPLETED',decision:'APPROVE',mode:'IMPLEMENTATION',base_sha:A,head_sha:B,
   actual_diff_reviewed:true,diff_ref:link('pull/16/files?base='+A+'&head='+B),
   execution:{execution_id:'runtime-review-1',session_ref:'session:reviewer',execution_mode:'RUNTIME_DISPATCH',
    evidence_ref:evidence,runtime_task_ref:'runtime:task/reviewer-1'},handoff_ref:link('issues/15#review-handoff'),conditions:[]}};
 if(action==='MERGE_PR')x.pr={state:'OPEN',draft:false,number:16,repository:subject.repository,base_sha:A,head_sha:B,
  base_ref:'main',merge_method:'squash',evidence_ref:evidence};
 if(action==='START_CODING'){
  x.design_input=design(subject,approval);
  for(const key of ['implementation','ci','qa','review','execution_context'])delete x[key];
 }
 if(action==='RELEASE')x.release={target_sha:B,tag:subject.target_ref,tag_available:true,notes_ref:evidence,rollback_ref:evidence,source_merge_ref:evidence};
 if(action==='DEPLOY_PRODUCTION'){
  x.release={published:true,target_sha:B,evidence_ref:evidence};
  x.deployment={environment:'production',artifact_sha:B,runbook_ref:evidence,rollback_ref:evidence,recovery_verified:true};
 }
 if(action==='MARK_ISSUE_DONE')x.acceptance={status:'ACCEPTED',head_sha:B,context_id:subject.context_id,
  task_contract_ref:subject.task_contract_ref,evidence_ref:link('issues/15#owner-acceptance')};
 return x;
}
function risk(x){return {status:'APPROVED',explicit:true,owner_approval_ref:link('issues/15#risk-acceptance'),
 action:x.action,subject:clone(x.subject),conditions:'Only this reviewed revision',remediation:'Follow up in tracked issue',recheck_ref:evidence};}
function exception(x,rule_id='OPTIONAL_STYLE'){return {exception_id:'EX-001',rule_id,...risk(x),risk:'Cosmetic output variance'};}

// G-01.1 / G-01.5: separate actions, technical prerequisites and existing Owner scope.
const actions=['MERGE_PR','START_CODING','RELEASE','DEPLOY_PRODUCTION','OWNER_ACCEPTANCE','MARK_ISSUE_DONE'];
for(const action of actions){
 test('six-actions',action+' accepts its own complete evidence',()=>{
  const x=fixture(action),before=clone(x),r=decision(x,'READY');
  assert.equal(r.action,action);assert.match(r.fingerprint,/^[0-9a-f]{64}$/);assert.deepEqual(x,before);
 });
 test('six-actions',action+' cannot inherit another action authorization',()=>{
  const x=fixture(action);x.authorization.action=action==='MERGE_PR'?'RELEASE':'MERGE_PR';decision(x);
 });
 test('six-actions',action+' needs an Owner decision even with technical readiness',()=>{
  const x=fixture(action);delete x.authorization;decision(x,'NEEDS_OWNER_DECISION');
 });
}
for(const [action,path] of [
 ['MERGE_PR','pr'],['START_CODING','design_input'],['RELEASE','release'],
 ['DEPLOY_PRODUCTION','deployment'],['OWNER_ACCEPTANCE','implementation'],['MARK_ISSUE_DONE','acceptance']])
 test('six-actions',action+' blocks missing action prerequisite',()=>decision(mutate(path,undefined,fixture(action))));
for(const action of actions.filter(x=>x!=='START_CODING'))for(const key of ['implementation','ci','qa','review'])
 test('six-actions',action+' requires '+key,()=>decision(mutate(key,undefined,fixture(action))));
for(const [path,value] of [['pr.number',17],['pr.repository','other/repo'],['pr.head_sha',C],['pr.base_sha',C],
 ['pr.state','CLOSED'],['pr.draft',true],['pr.base_ref','unapproved'],['pr.merge_method','merge'],
 ['policy.allowed_base_refs',[]],['policy.allowed_merge_methods',[]]])
 test('merge-boundary',path+' mismatch blocks',()=>decision(mutate(path,value)));
for(const [action,path,value] of [
 ['RELEASE','release.target_sha',C],['RELEASE','release.tag','vOTHER'],['RELEASE','release.tag_available',false],
 ['RELEASE','release.notes_ref',undefined],['RELEASE','release.rollback_ref',undefined],['RELEASE','release.source_merge_ref',undefined],
 ['DEPLOY_PRODUCTION','release.published',false],['DEPLOY_PRODUCTION','release.target_sha',C],
 ['DEPLOY_PRODUCTION','release.evidence_ref',undefined],['DEPLOY_PRODUCTION','deployment.artifact_sha',C],
 ['DEPLOY_PRODUCTION','deployment.environment','staging'],['DEPLOY_PRODUCTION','deployment.recovery_verified',false],
 ['DEPLOY_PRODUCTION','deployment.rollback_ref',undefined],['DEPLOY_PRODUCTION','deployment.runbook_ref',undefined],
 ['MARK_ISSUE_DONE','acceptance.status','PROPOSED'],['MARK_ISSUE_DONE','acceptance.head_sha',C],
 ['MARK_ISSUE_DONE','acceptance.context_id','OTHER'],['MARK_ISSUE_DONE','acceptance.task_contract_ref',link('issues/99')],
 ['MARK_ISSUE_DONE','acceptance.evidence_ref',undefined]])
 test('action-evidence',action+' rejects '+path,()=>decision(mutate(path,value,fixture(action))));
test('action-evidence','Production deployment requires production subject scope',()=>{
 const x=fixture('DEPLOY_PRODUCTION');x.subject.environment='staging';x.authorization.subject=clone(x.subject);decision(x);
});
for(const [path,value] of [['design_input.task_class','INVALID'],['design_input.coding_authorization.scope_confirmed',false],
 ['design_input.feature_spec_ref','docs/spec@main'],['design_input.repository','other/repo'],
 ['design_input.context_id','OTHER'],['design_input.task_contract_ref',link('issues/99')],
 ['design_input.source_base_sha',C],['design_input.source_head_sha',C],
 ['design_input.coding_authorization.owner_approval_ref',link('issues/15#unrelated')],
 ['design_input.coding_authorization.task_contract_ref',link('issues/99')]])
 test('design-reuse','START_CODING rechecks '+path,()=>decision(mutate(path,value,fixture('START_CODING'))));
test('design-reuse','A DESIGN_READY label cannot substitute for original Design Gate input',()=>{
 const x=fixture('START_CODING');x.design_input={status:'DESIGN_READY',coding_authorized:true};decision(x);
});

// G-01.2: real-context metadata and actual precise diff, not a status label or CI.
test('independent-review','Owner Merge request with CI PASS and no Review blocks with relay path',()=>{
 const x=fixture();delete x.review;const r=decision(x);
 assert(r.reasons.includes('INDEPENDENT_REVIEW_NOT_RUN'));assert.match(JSON.stringify(r.next_steps),/HUMAN_RELAY/);
});
for(const [path,value] of [['review.status','NOT_RUN'],['review.decision','REQUEST_CHANGES'],['review.mode','DESIGN'],
 ['review.base_sha',C],['review.head_sha',C],['review.actual_diff_reviewed',false],['review.diff_ref',undefined],
 ['review.execution',undefined],['review.execution.execution_id',undefined],['review.execution.evidence_ref',undefined],
 ['review.execution.runtime_task_ref',undefined],['review.execution.execution_mode','ROLE_SIMULATION'],
 ['review.execution.session_ref','session:master'],['review.execution.session_ref','session:implementer'],
 ['review.execution.session_ref',undefined],['review.handoff_ref',undefined],['execution_context',undefined]])
 test('independent-review',path+' invalidates Review',()=>decision(mutate(path,value)));
test('independent-review','HUMAN_RELAY with actual start metadata is allowed',()=>{
 const x=fixture();x.review.execution.execution_mode='HUMAN_RELAY';delete x.review.execution.runtime_task_ref;
 x.review.execution.human_start_ref=link('issues/15#human-start');decision(x,'READY');
 delete x.review.execution.human_start_ref;decision(x);
});
test('independent-review','GitHub Review record can supply Review handoff evidence',()=>{
 const x=fixture();delete x.review.handoff_ref;x.review.github_review_ref=link('pull/16#pullrequestreview-123');decision(x,'READY');
});
test('independent-review','APPROVE_WITH_CONDITIONS requires all conditions to be disposed',()=>{
 const x=fixture();x.review.decision='APPROVE_WITH_CONDITIONS';decision(x);
 x.review.conditions=[{id:'C1',status:'PENDING'}];decision(x);
 x.review.conditions=[{id:'C1',status:'COMPLETED',evidence_ref:evidence}];decision(x,'READY');
 x.review.conditions.push({id:'C2',status:'PENDING'});decision(x);
 x.review.conditions[1].risk_acceptance=risk(x);decision(x,'READY');
 x.review.conditions[1].risk_acceptance.subject.head_sha=C;decision(x);
});
test('independent-review','APPROVE label cannot conceal pending conditions',()=>{
 const x=fixture();x.review.conditions=[{id:'C1',status:'PENDING'}];decision(x);
});
for(const severity of ['P0','P1'])
 test('independent-review',severity+' condition cannot be waived by risk acceptance',()=>{
  const x=fixture();x.review.decision='APPROVE_WITH_CONDITIONS';
  x.review.conditions=[{id:'C1',severity,status:'PENDING',risk_acceptance:risk(x)}];decision(x);
 });

// G-01.3: blocking findings, explicit P2 treatment, narrow non-mandatory exceptions.
for(const severity of ['P0','P1'])for(const status of ['OPEN','ACCEPTED','WONT_FIX'])
 test('findings',severity+' '+status+' cannot be waived by Merge authorization or exception',()=>{
  const x=fixture();x.findings=[{id:'F1',severity,status,risk_acceptance:risk(x)}];
  x.exceptions=[exception(x,severity)];decision(x);
 });
test('findings','FIXED P1 and open P3 do not block',()=>{
 const x=fixture();x.findings=[{id:'F1',severity:'P1',status:'FIXED'},{id:'F2',severity:'P3',status:'OPEN'}];decision(x,'READY');
});
test('findings','Review-local findings also block',()=>{
 const x=fixture();x.review.findings=[{id:'R1',severity:'P1',status:'OPEN'}];decision(x);
});
test('findings','P2 needs separate explicit accurate risk acceptance',()=>{
 const x=fixture();x.findings=[{id:'F1',severity:'P2',status:'OPEN'}];decision(x);
 x.findings[0].risk_acceptance=risk(x);decision(x,'READY');
});
for(const [path,value] of [['explicit',false],['status','PROPOSED'],['owner_approval_ref',undefined],
 ['action','RELEASE'],['subject.head_sha',C],['conditions',undefined],['remediation',undefined],['recheck_ref',undefined]])
 test('findings','P2 risk acceptance rejects '+path,()=>{
  const x=fixture();x.findings=[{id:'F1',severity:'P2',status:'OPEN',risk_acceptance:risk(x)}];
  mutate('findings.0.risk_acceptance.'+path,value,x);decision(x);
 });
test('dependencies','Known critical blockers cannot be converted to ordinary exceptions',()=>{
 const x=fixture();x.blockers=[{id:'DEPENDENCY-1',status:'OPEN',critical:true,evidence_ref:evidence}];
 x.exceptions=[exception(x,'DEPENDENCY')];decision(x);
});
test('optional-exceptions','Optional failure requests Owner decision, exact exception permits continuation',()=>{
 const x=fixture();x.policy.optional_checks=[{id:'OPTIONAL_STYLE',status:'FAIL',evidence_ref:evidence}];
 decision(x,'NEEDS_OWNER_DECISION');x.exceptions=[exception(x)];decision(x,'READY');
});
test('optional-exceptions','Optional NOT_RUN needs explicit disposition; PASS does not',()=>{
 const x=fixture();x.policy.optional_checks=[{id:'OPTIONAL_STYLE',status:'NOT_RUN'}];decision(x,'NEEDS_OWNER_DECISION');
 x.policy.optional_checks[0].status='PASS';x.policy.optional_checks[0].evidence_ref=evidence;decision(x,'READY');
});
for(const [path,value] of [['exception_id',undefined],['explicit',false],['owner_approval_ref',undefined],['action','RELEASE'],
 ['subject.context_id','OTHER'],['subject.head_sha',C],['risk',undefined],['conditions',undefined],['remediation',undefined],['recheck_ref',undefined]])
 test('optional-exceptions','Incomplete exception '+path+' does not authorize optional bypass',()=>{
  const x=fixture();x.policy.optional_checks=[{id:'OPTIONAL_STYLE',status:'FAIL'}];x.exceptions=[exception(x)];
  mutate('exceptions.0.'+path,value,x);assert.notEqual(evaluateActionPreflight(x).decision,'READY');
 });
for(const id of ['CI','QA','REVIEW','AUTHORIZATION','DESIGN','ACCEPTANCE','DEPENDENCY','HEAD','P0','P1'])
 test('optional-exceptions','Reserved mandatory rule '+id+' cannot be reclassified optional',()=>{
  const x=fixture();x.policy.optional_checks=[{id,status:'FAIL'}];x.exceptions=[exception(x,id)];decision(x);
 });
test('optional-exceptions','Mandatory failure takes precedence over pending optional decision',()=>{
 const x=fixture();x.policy.optional_checks=[{id:'OPTIONAL_STYLE',status:'FAIL'}];x.ci.status='FAIL';decision(x);
});
test('optional-exceptions','Exception cannot name an undeclared optional rule',()=>{
 const x=fixture();x.exceptions=[exception(x,'UNKNOWN_RULE')];decision(x);
});
test('policy','Explicit low-risk QA/Review exclusions need applicable policy evidence',()=>{
 const x=fixture();Object.assign(x.policy,{review_required:false,qa_required:false,review_skip_ref:evidence,qa_skip_ref:evidence});
 delete x.review;delete x.qa;decision(x,'READY');delete x.policy.review_skip_ref;decision(x);
});
test('policy','Optional Review cannot conceal a submitted REQUEST_CHANGES',()=>{
 const x=fixture();Object.assign(x.policy,{review_required:false,review_skip_ref:evidence});x.review.decision='REQUEST_CHANGES';decision(x);
});
for(const field of ['review_required','qa_required'])for(const task_class of ['L','XL'])
 test('policy',task_class+' cannot suppress '+field,()=>{
  const x=fixture();x.policy.task_class=task_class;x.policy[field]=false;
  x.policy.review_skip_ref=evidence;x.policy.qa_skip_ref=evidence;decision(x);
 });
for(const field of ['review_required','qa_required'])for(const risk_flag of ['permissions','breaking-api','cross-module'])
 test('policy',risk_flag+' cannot suppress '+field,()=>{
  const x=fixture();x.policy.risk_flags=[risk_flag];x.policy[field]=false;
  x.policy.review_skip_ref=evidence;x.policy.qa_skip_ref=evidence;decision(x);
 });

// Input ambiguity, exact scope and stale source data must fail closed without throwing.
for(const value of [undefined,null,{},[],true,'READY',42])
 test('malformed-input','Top-level '+JSON.stringify(value)+' fails closed',()=>decision(value));
for(const [path,value] of [['schema_version','unknown/v1'],['action','MERGE'],['subject',null],['subject.pr_number',0],
 ['subject.pr_number','16'],['subject.head_sha','main'],['subject.base_sha','a'.repeat(39)],
 ['subject.context_id',''],['subject.repository',''],['subject.target_ref',''],['subject.task_contract_ref',''],
 ['authorization',[]],['authorization.status','REVOKED'],['authorization.status','EXPIRED'],
 ['authorization.owner_approval_ref',''],['authorization.subject.head_sha',C],['authorization.subject.base_sha',C],
 ['authorization.subject.repository','other/repo'],['authorization.subject.environment','production'],
 ['authorization.subject.target_ref','other'],['authorization.subject.context_id','other'],
 ['authorization.subject.task_contract_ref',link('issues/99')],['authorization.subject.pr_number',17],
 ['authorization.subject.merge_method','merge'],['policy',null],['policy.review_required',undefined],
 ['policy.qa_required',undefined],['policy.evidence_ref',''],['policy.task_class','UNKNOWN'],
 ['policy.impacts',{}],['policy.risk_flags',{}],['findings',undefined],['findings',{}],['findings',[null]],
 ['findings',[{severity:'UNKNOWN',status:'OPEN'}]],['blockers',null],['blockers',[null]],
 ['findings',[{severity:'P3'}]],['findings',[{severity:'P3',status:''}]],
 ['review.conditions',null],['review.conditions',{}],['review.findings',{}],['review.findings',[null]],
 ['exceptions',{}],['ci.checks',{}],['ci.checks',[]],['ci.checks',[null]],
 ['ci.status','NOT_RUN'],['ci.head_sha',C],['ci.evidence_ref',''],['ci.checks.0.status','FAIL'],
 ['ci.checks.0.head_sha',C],['ci.checks.0.evidence_ref',''],['ci.checks.0.required',false],
 ['qa.status','BLOCKED'],['qa.head_sha',C],['qa.evidence_ref',''],['qa.untested_required',1],
 ['qa.untested_required','0'],['implementation.head_sha',C],['implementation.evidence_ref','']])
 test('malformed-input',path+'='+JSON.stringify(value)+' fails closed',()=>decision(mutate(path,value)));
test('malformed-input','Optional failing CI job cannot conceal a failed required CI job',()=>{
 const x=fixture();x.ci.checks.push({name:'optional',status:'FAIL',head_sha:B,evidence_ref:evidence,required:false});decision(x,'READY');
 x.ci.checks[0].status='FAIL';decision(x);
});
for(const [path,value] of [['verification',undefined],['verification.verified',false],['verification.evidence_ref',''],
 ['verification.observed_at','invalid'],['verification.valid_until','invalid'],['now','invalid'],
 ['verification.observed_at','2026-10-21T08:00:01Z'],['verification.valid_until','2026-10-21T07:59:59Z'],
 ['verification.observed_at','2026-10-21T07:55:59Z'],['verification.valid_until','2026-10-21T08:04:01Z']])
 test('freshness',path+'='+JSON.stringify(value)+' blocks',()=>decision(mutate(path,value)));
test('freshness','Inclusive timestamps and exact five-minute observation window are accepted',()=>{
 const x=fixture();x.verification.observed_at=x.now;x.verification.valid_until='2026-10-21T08:05:00Z';decision(x,'READY');
 x.now=x.verification.valid_until;decision(x,'READY');
});

// G-01.5 / requirement 12: all semantic drift, including same-HEAD drift, requires a new preflight.
test('toctou','Revalidation permits refreshed observation metadata only when still fresh',()=>{
 const x=fixture(),ready=decision(x,'READY'),fresh=clone(x);
 fresh.now='2026-10-21T08:01:00Z';fresh.verification={verified:true,observed_at:fresh.now,
  valid_until:'2026-10-21T08:04:00Z',evidence_ref:link('issues/15#fresh-read')};
 assert.equal(evaluateActionPreflight(fresh).fingerprint,ready.fingerprint);
 assert.equal(revalidateActionPreflight(ready,fresh).decision,'READY');
});
for(const [name,change] of [
 ['HEAD',x=>{x.subject.head_sha=C;x.authorization.subject=clone(x.subject);x.pr.head_sha=C;x.implementation.head_sha=C;
  x.ci.head_sha=C;x.ci.checks[0].head_sha=C;x.qa.head_sha=C;x.review.head_sha=C;}],
 ['Owner approval revoked',x=>x.authorization.status='REVOKED'],
 ['Owner approval reference replaced',x=>x.authorization.owner_approval_ref=link('issues/15#replacement')],
 ['new blocking finding',x=>x.findings.push({id:'NEW-P1',severity:'P1',status:'OPEN'})],
 ['changed Review evidence',x=>x.review.github_review_ref=link('pull/16#new-review')],
 ['new policy optional check',x=>x.policy.optional_checks=[{id:'STYLE_NEW',status:'PASS',evidence_ref:evidence}]],
 ['new dependency blocker',x=>x.blockers.push({id:'DEP',status:'OPEN',critical:true,evidence_ref:evidence})],
 ['CI result changed',x=>x.ci.checks[0].status='FAIL'],
 ['PR closed',x=>x.pr.state='CLOSED'],
 ['observation stale',x=>x.now='2026-10-21T08:03:00Z']])
 test('toctou',name+' after READY blocks execution-time reuse',()=>{
  const x=fixture(),previous=decision(x,'READY');change(x);
  assert.equal(revalidateActionPreflight(previous,x).decision,'BLOCKED');
 });
test('toctou','A newly READY semantic change still requires normal preflight',()=>{
 const x=fixture(),previous=decision(x,'READY');x.policy.evidence_ref=link('issues/15#new-policy');decision(x,'READY');
 assert.equal(revalidateActionPreflight(previous,x).decision,'BLOCKED');
});
test('toctou','Stable fingerprint is insensitive to object property insertion order',()=>{
 const x=fixture(),reordered=Object.fromEntries(Object.entries(x).reverse());
 reordered.subject=Object.fromEntries(Object.entries(x.subject).reverse());
 assert.equal(decision(x,'READY').fingerprint,decision(reordered,'READY').fingerprint);
});
for(const previous of [undefined,null,{}, {decision:'BLOCKED',fingerprint:'x'}, {decision:'READY'}])
 test('toctou','Malformed or non-READY previous result '+JSON.stringify(previous)+' blocks',()=>{
  assert.equal(revalidateActionPreflight(previous,fixture()).decision,'BLOCKED');
 });

// G-01.4: evidence states remain distinct, and compensation is advisory only.
const stateNames=['IMPLEMENTATION_COMPLETE','CI_PASSED','QA_PASSED','INDEPENDENT_REVIEW_PASSED',
 'PR_MERGED','OWNER_ACCEPTED','ISSUE_DONE','PRODUCTION_DEPLOYED'];
test('lifecycle','All eight lifecycle states are separately reported',()=>{
 const x=fixture('MARK_ISSUE_DONE');x.pr={merged:true,head_sha:B,merge_commit_sha:B,evidence_ref:evidence};
 x.issue={status_type:'completed',evidence_ref:evidence};x.deployment={status:'DEPLOYED',environment:'production',artifact_sha:B,evidence_ref:evidence};
 const before=clone(x),r=reconcileActionEvidence(x);assert.deepEqual(Object.keys(r.states).sort(),[...stateNames].sort());
 for(const name of stateNames)assert.equal(r.states[name].status,'VERIFIED',name+': '+JSON.stringify(r));
 assert.deepEqual(x,before);
});
test('lifecycle','Merged PR does not prove Owner acceptance or Done',()=>{
 const x=fixture();x.pr.merged=true;x.pr.merge_commit_sha=B;const r=reconcileActionEvidence(x);
 assert.equal(r.states.PR_MERGED.status,'VERIFIED');assert.equal(r.states.OWNER_ACCEPTED.status,'NOT_VERIFIED');
 assert.equal(r.states.ISSUE_DONE.status,'NOT_VERIFIED');assert.equal(r.states.PRODUCTION_DEPLOYED.status,'NOT_VERIFIED');
});
test('lifecycle','PR source HEAD cannot substitute for verified merge commit SHA',()=>{
 const x=fixture();x.pr.merged=true;assert.equal(reconcileActionEvidence(x).states.PR_MERGED.status,'NOT_VERIFIED');
 x.pr.merge_commit_sha=C;assert.equal(reconcileActionEvidence(x).states.PR_MERGED.status,'NOT_VERIFIED');
 x.pr.merge_commit_sha=B;assert.equal(reconcileActionEvidence(x).states.PR_MERGED.status,'VERIFIED');
});
test('lifecycle','Merge to Done without Owner acceptance raises governance anomaly and advisory recovery',()=>{
 const x=fixture();x.pr.merged=true;x.pr.merge_commit_sha=B;x.issue={status_type:'completed',evidence_ref:evidence};const before=clone(x);
 const r=reconcileActionEvidence(x);assert(r.anomalies.some(a=>a.code==='DONE_WITHOUT_OWNER_ACCEPTANCE'));
 assert.equal(r.states.ISSUE_DONE.status,'NOT_VERIFIED');assert(r.recommended_actions.length>0);assert.deepEqual(x,before);
});
test('lifecycle','Stale acceptance cannot bless current Done',()=>{
 const x=fixture('MARK_ISSUE_DONE');x.acceptance.head_sha=C;x.issue={status_type:'completed',evidence_ref:evidence};
 const r=reconcileActionEvidence(x);assert.equal(r.states.OWNER_ACCEPTED.status,'NOT_VERIFIED');
 assert.equal(r.states.ISSUE_DONE.status,'NOT_VERIFIED');assert(r.anomalies.some(a=>a.code==='DONE_WITHOUT_OWNER_ACCEPTANCE'));
});
test('lifecycle','Owner acceptance alone does not claim issue Done',()=>{
 const x=fixture('MARK_ISSUE_DONE');x.issue={status_type:'started',evidence_ref:evidence};const r=reconcileActionEvidence(x);
 assert.equal(r.states.OWNER_ACCEPTED.status,'VERIFIED');assert.equal(r.states.ISSUE_DONE.status,'NOT_VERIFIED');
});
test('lifecycle','Absent facts and malformed lifecycle input are NOT_VERIFIED, without invented PASS',()=>{
 for(const x of [undefined,null,{}]){
  const r=reconcileActionEvidence(x);for(const name of stateNames)assert.equal(r.states[name].status,'NOT_VERIFIED');
 }
});
for(const [name,path,value] of [
 ['IMPLEMENTATION_COMPLETE','implementation.head_sha',C],['IMPLEMENTATION_COMPLETE','implementation.evidence_ref',undefined],
 ['CI_PASSED','ci.head_sha',C],['CI_PASSED','ci.checks.0.status','FAIL'],['CI_PASSED','ci.evidence_ref',undefined],
 ['QA_PASSED','qa.head_sha',C],['QA_PASSED','qa.untested_required',1],['QA_PASSED','qa.evidence_ref',undefined],
 ['INDEPENDENT_REVIEW_PASSED','review.head_sha',C],['INDEPENDENT_REVIEW_PASSED','review.execution.session_ref','session:master'],
 ['OWNER_ACCEPTED','acceptance.context_id','OTHER'],['OWNER_ACCEPTED','acceptance.task_contract_ref',link('issues/99')],
 ['OWNER_ACCEPTED','acceptance.evidence_ref',undefined]])
 test('lifecycle','Cannot verify '+name+' with invalid '+path,()=>{
  const x=mutate(path,value,fixture('MARK_ISSUE_DONE'));assert.equal(reconcileActionEvidence(x).states[name].status,'NOT_VERIFIED');
 });
for(const severity of ['P0','P1','P2'])
 test('lifecycle','Known open '+severity+' Review finding prevents Independent Review PASS',()=>{
  const x=fixture();x.review.findings=[{id:'R1',severity,status:'OPEN'}];
  assert.equal(reconcileActionEvidence(x).states.INDEPENDENT_REVIEW_PASSED.status,'NOT_VERIFIED');
 });

// G-01 requirement 13: unchanged bounded Master dispatch authorization behavior.
function dispatchFixture(){return {
 authorization:{schema_version:'padf.dispatch-authorization/v1',authorization_ref:link('issues/15#contract'),
  owner_approval_ref:link('issues/15#owner-dispatch'),status:'APPROVED',context_id:'PADF-G01',
  repository:'example/padf',task_contract_ref:link('issues/15#contract'),environment:'isolated',
  scope_items:[{id:'bounded-review',allowed_roles:['independent-reviewer','qa-tester'],allowed_actions:['REVIEW','TEST'],required_decisions:[]}]},
 dispatch:{context_id:'PADF-G01',repository:'example/padf',task_contract_ref:link('issues/15#contract'),environment:'isolated',
  target_role:'independent-reviewer',action:'REVIEW',scope_ids:['bounded-review']},decision_approvals:[]};}
test('dispatch-compatibility','Existing Owner grant continues successive bounded Review and Test dispatch',()=>{
 const x=dispatchFixture(),before=clone(x.authorization);assert.equal(evaluateDispatchAuthorization(x).decision,'CONTINUE');
 x.dispatch.target_role='qa-tester';x.dispatch.action='TEST';assert.equal(evaluateDispatchAuthorization(x).decision,'CONTINUE');
 assert.deepEqual(x.authorization,before);
});
test('dispatch-compatibility','G-01 action authorization does not replace dispatch grant',()=>{
 const x=dispatchFixture();x.authorization=fixture().authorization;assert.equal(evaluateDispatchAuthorization(x).decision,'BLOCKED');
});
for(const action of ['CODE','PR_MERGE','RELEASE','PRODUCTION_DEPLOY','MARK_DONE','ACCEPT_RISK'])
 test('dispatch-compatibility','Dispatch cannot inherit reserved '+action,()=>{
  const x=dispatchFixture();x.dispatch.action=action;x.authorization.scope_items[0].allowed_actions.push(action);
  const r=evaluateDispatchAuthorization(x);assert.equal(r.decision,'BLOCKED');assert(r.errors.includes('ACTION_REQUIRES_SEPARATE_AUTHORIZATION'));
 });
test('dispatch-compatibility','Scope drift and revoked dispatch grants still block',()=>{
 const x=dispatchFixture();x.authorization.status='REVOKED';assert.equal(evaluateDispatchAuthorization(x).decision,'BLOCKED');
 x.authorization.status='APPROVED';x.dispatch.context_id='OTHER';assert.equal(evaluateDispatchAuthorization(x).decision,'BLOCKED');
});

const failed=tests.filter(t=>t.status==='FAIL');
const groups=Object.fromEntries([...new Set(tests.map(t=>t.group))].map(group=>[group,{
 count:tests.filter(t=>t.group===group).length,failed:tests.filter(t=>t.group===group&&t.status==='FAIL').length}]));
console.log(JSON.stringify({suite:'PADF G-01 Action Preflight contract regression (synthetic snapshots only)',
 status:failed.length?'FAIL':'PASS',count:tests.length,groups,failures:failed,
 verification_boundary:'DECISION_LOGIC_ONLY_NOT_LIVE_APPROVAL_AGENT_IDENTITY_OR_PLATFORM_CONFIGURATION',
 not_run:['External connector configuration','Live Merge/Deploy/Release/Issue mutation','Actual Reviewer identity authentication']},null,2));
if(failed.length)process.exitCode=1;
