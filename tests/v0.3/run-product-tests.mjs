#!/usr/bin/env node
// All source/approval/runtime references below are synthetic fixtures, never live proof.
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {routeAgents,evaluateDesignGate} from '../../lib/design-gate.mjs';
import {evaluateDispatchAuthorization,evaluateOrchestrationChain} from '../../lib/orchestration-evidence.mjs';
import {evaluateSkillDeliveryQuality} from '../../lib/skill-delivery-quality.mjs';
import {createAgentMessage} from '../../scripts/create-agent-message.mjs';
const A='a'.repeat(40),B='b'.repeat(40),C='c'.repeat(40);
const pin=p=>p+'@'+A,link='https://github.com/example/padf/issues/12#synthetic';
const artifact=(type,path)=>({type,ref:pin(path),verified:true,evidence_ref:link});
const product=()=>({id:'PRODUCT',agent:'product-analyst',required:true,status:'COMPLETED',depends_on:[],
 artifacts:[artifact('product-definition','docs/product.md'),artifact('feature-specification','docs/feature.md')]});
const task=()=>({task_class:'M',product_scope:'define',architecture_scope:'none',impacts:[],risk_flags:[],
 feature_spec_ref:pin('docs/feature.md'),stages:[product()],
 consistency_checks:[{status:'PASS',evidence_ref:link}],review_skip_rationale:'Only bounded product definition, no risk-triggering design impact'});
const checks=[],check=(name,fn)=>{fn();checks.push(name)};
const blocked=(x,reason)=>{const r=evaluateDesignGate(x);assert.equal(r.status,'BLOCKED',JSON.stringify(r));assert.equal(r.coding_authorized,false);assert(r.reasons.includes(reason),JSON.stringify(r.reasons));};
check('Known product impacts route PA; new product also routes system architecture',()=>{
 for(const impact of ['new-product','product-definition','product-behavior']){
  const r=routeAgents({task_class:'M',impacts:[impact]});assert.equal(r.product_analyst_required,true);
  assert(r.stages.indexOf('product-analyst')<r.stages.indexOf('master-orchestrator:DESIGN_GATE'));
 }
 assert.equal(routeAgents({task_class:'XL',impacts:['new-product']}).solution_architect_required,true);
});
check('Existing precise specs and simple changes reuse without forcing all roles',()=>{
 const r=routeAgents({task_class:'S',impacts:[]});assert.equal(r.product_analyst_required,false);
 assert.equal(r.architect_required,false);assert.equal(r.ui_required,false);
 const x=task();delete x.product_scope;x.stages=[];assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
check('Explicit reuse cannot exclude known required product work',()=>{
 for(const impact of ['new-product','product-definition','product-behavior']){
  const r=routeAgents({task_class:'M',impacts:[impact],product_scope:'reuse'});assert.equal(r.valid,false);
  assert(r.errors.includes('PRODUCT_IMPACT_REQUIRES_DEFINITION'));
 }
 assert.equal(routeAgents({task_class:'M',product_scope:'unknown'}).valid,false);
});
check('Valid detailed product definition passes metadata gate without granting coding',()=>{
 for(const scope of ['define','refine']){const x=task();x.product_scope=scope;
  const r=evaluateDesignGate(x);assert.equal(r.status,'DESIGN_READY');assert.equal(r.coding_authorized,false);}
});
check('Missing or merely optional PA stage blocks even with separate coding approval',()=>{
 for(const stages of [[],[{...product(),required:false,na_reason:'Attempted product waiver'}]]){
  const x=task();x.stages=stages;x.coding_authorization={owner_approval_ref:link,task_contract_ref:link,scope_confirmed:true};
  blocked(x,'MISSING_PRODUCT_ANALYST_STAGE');
 }
});
check('Owner waiver cannot replace completed verified product definition or inherit coding approval',()=>{
 for(const mutate of [
  p=>p.artifacts[0].verified=false,
  p=>p.artifacts[0].ref='docs/product.md@main',
  p=>p.artifacts[0].required=false,
  p=>p
 ]){
  const x=task(),p=x.stages[0];p.status='WAIVED';
  p.waiver={owner_approval_ref:link,reason:'Synthetic Owner waiver does not supply missing product content'};
  mutate(p);x.coding_authorization={owner_approval_ref:link,task_contract_ref:link,scope_confirmed:true};
  blocked(x,'UNREADY_PRODUCT_DEFINITION:PRODUCT');
 }
 const x=task();assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
check('A Feature Catalog cannot substitute for detailed product/specification artifacts',()=>{
 const x=task();x.stages[0].artifacts=[artifact('feature-catalog','docs/catalog.md')];
 blocked(x,'MISSING_PRODUCT_ARTIFACT:product-definition');
 blocked(x,'MISSING_PRODUCT_ARTIFACT:feature-specification');
});
check('Product spec must match the exact downstream feature revision',()=>{
 const x=task();x.stages[0].artifacts[1].ref='docs/feature.md@'+B;
 blocked(x,'PRODUCT_FEATURE_SPEC_MISMATCH');
});
check('Unfinished stale and unverified product stages cannot enable downstream readiness',()=>{
 for(const status of ['PENDING','BLOCKED','STALE']){const x=task();x.stages[0].status=status;blocked(x,'UNSATISFIED_STAGE:PRODUCT');}
 const x=task();x.stages[0].artifacts[1].verified=false;blocked(x,'UNSATISFIED_STAGE:PRODUCT');
});
const uiTask=()=>{
 const x=task();x.impacts=['ui'];x.ui_profile_ref=pin('docs/profile.md');x.ui_profile_status='APPROVED';
 x.ui_profile_approved_ref=x.ui_profile_ref;x.ui_profile_approval_ref=link;x.ui_level='L1';
 x.stages.push({id:'UI',agent:'ui-ux-designer',required:true,status:'COMPLETED',depends_on:['PRODUCT'],
  profile_ref:x.ui_profile_ref,artifacts:[artifact('ui-design','docs/ui.md'),artifact('ui-concept','docs/concept.html')]});return x;
};
check('Formal UI design depends on completed product definition; early artifacts cannot bypass it',()=>{
 const x=uiTask();assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
 x.stages[1].depends_on=[];blocked(x,'MISSING_PRODUCT_TO_DESIGN_DEPENDENCY:UI');
});
check('Module design requires detailed product dependency and retains approved system gate',()=>{
 const x=task();x.architecture_scope='module';x.impacts=['module-design'];x.diagram_skill_sha=C;
 x.system_baseline_ref=pin('docs/system.md');x.system_baseline_status='APPROVED';x.system_baseline_approval_ref=link;
 const module={id:'MODULE',agent:'module-architect',status:'COMPLETED',required:true,depends_on:[],
 system_baseline_ref:x.system_baseline_ref,artifacts:[
 artifact('module-design','docs/module.md'),artifact('module-code-structure','docs/packages.md'),
 artifact('module-interface-contract','docs/api.md'),
 {...artifact('module-component-diagram','docs/module.svg'),generator:'diagram-design',generator_sha:C,render_status:'PASS'}]};
 x.stages.push(module);blocked(x,'MISSING_PRODUCT_TO_DESIGN_DEPENDENCY:MODULE');
 module.depends_on=['PRODUCT'];assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
 x.system_baseline_status='PROPOSED';blocked(x,'SYSTEM_BASELINE_NOT_APPROVED');
});
check('Product dependency may be transitive but a missing edge still blocks',()=>{
 const x=uiTask();x.stages.splice(1,0,{id:'FLOW',agent:'context-coordinator',status:'COMPLETED',required:true,
  depends_on:['PRODUCT'],artifacts:[artifact('context-checkpoint','docs/flow-inputs.md')]});
 x.stages[2].depends_on=['FLOW'];assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
 x.stages[1].depends_on=[];blocked(x,'MISSING_PRODUCT_TO_DESIGN_DEPENDENCY:UI');
});
check('Every required product stage is checked, not just the first',()=>{
 const x=task();x.stages.push({...product(),id:'PRODUCT2',artifacts:[artifact('feature-catalog','docs/catalog.md')]});
 blocked(x,'MISSING_PRODUCT_ARTIFACT:feature-specification');
});
check('Product completion cannot approve a proposed UI Profile or material decision',()=>{
 const x=uiTask();x.ui_profile_status='PROPOSED';blocked(x,'PROJECT_UI_PROFILE_NOT_APPROVED');
 x.ui_profile_status='APPROVED';x.material_change=true;blocked(x,'MISSING_MATERIAL_OWNER_APPROVAL');
});
check('PA does not remove independent design review or bypass its exact source coverage',()=>{
 const x=task();x.task_class='L';blocked(x,'MANDATORY_DESIGN_REVIEW');
 x.design_review={independent:true,mode:'DESIGN',decision:'APPROVE',evidence_ref:link,reviewed_refs:[],findings:[]};
 blocked(x,'STALE_OR_INCOMPLETE_REVIEW');
 x.design_review.reviewed_refs=x.stages.flatMap(s=>s.artifacts.map(a=>a.ref));
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
const authorization=()=>({authorization:{schema_version:'padf.dispatch-authorization/v1',authorization_ref:link,
 owner_approval_ref:link,status:'APPROVED',context_id:'SAMPLE-PRODUCT',repository:'example/padf',
 task_contract_ref:link,environment:'isolated',scope_items:[{id:'product-definition',
 allowed_roles:['product-analyst'],allowed_actions:['ANALYZE','DESIGN_PROPOSAL'],required_decisions:[]}]},
 dispatch:{context_id:'SAMPLE-PRODUCT',repository:'example/padf',task_contract_ref:link,environment:'isolated',
 target_role:'product-analyst',action:'ANALYZE',scope_ids:['product-definition']},decision_approvals:[]});
check('Authorized PA research/proposal reuses approval without per-dispatch approval',()=>{
 const x=authorization();assert.equal(evaluateDispatchAuthorization(x).allowed,true);
 x.dispatch.action='DESIGN_PROPOSAL';assert.equal(evaluateDispatchAuthorization(x).allowed,true);
 assert.equal(x.dispatch.owner_approval_ref,undefined);
});
check('PA role never confers scope expansion, approval, coding, merge or deployment authority',()=>{
 for(const action of ['CODE','APPROVE_DESIGN','PR_MERGE','PRODUCTION_DEPLOY','RELEASE','DESTRUCTIVE_OPERATION']){
  const x=authorization();x.dispatch.action=action;x.authorization.scope_items[0].allowed_actions.push(action);
  assert.equal(evaluateDispatchAuthorization(x).allowed,false);
 }
 const x=authorization();x.dispatch.scope_ids.push('unapproved-scope');assert.equal(evaluateDispatchAuthorization(x).allowed,false);
});
check('New PA execution still requires real-mode provenance and an independent session',()=>{
 const d={dispatch_id:'DISPATCH-PRODUCT',context_id:'SAMPLE-PRODUCT',target_role:'product-analyst',
  master_session_ref:'session:master-test',dispatch_ref:link,task_contract_ref:link,skill_ref:pin('.agents/skills/product-analyst/SKILL.md'),
  routing_rationale:'Bounded product definition requested',expected_artifact_types:['product-definition','feature-specification'],
  execution_mode:'RUNTIME_DISPATCH',initiated_by:'MASTER_RUNTIME_TOOL',runtime_dispatch_ref:'runtime:synthetic-launch',
  created_at:'2026-10-21T00:00:01Z',depends_on_dispatch_ids:[]};
 const e={dispatch_id:d.dispatch_id,execution_id:'EXECUTION-PRODUCT',executor_role:d.target_role,
  executor_session_ref:'session:product-test',dispatch_ref_read:d.dispatch_ref,skill_ref_used:d.skill_ref,
  evidence_method:'RUNTIME_ISSUED',runtime_task_ref:'runtime:synthetic-task',started_at:'2026-10-21T00:00:02Z'};
 const h={dispatch_id:d.dispatch_id,execution_id:e.execution_id,handoff_id:'HANDOFF-PRODUCT',sender_role:d.target_role,
  handoff_ref:link,artifact_refs:[{kind:'product-definition',ref:pin('docs/product.md')}],submitted_at:'2026-10-21T00:00:03Z'};
 const reconciliation={dispatch_id:d.dispatch_id,master_session_ref:d.master_session_ref,reconciliation_ref:link,
  evidence_check_ref:link,reviewed_handoff_ref:h.handoff_ref,decision:'CONTINUE',observed_at:'2026-10-21T00:00:04Z'};
 const chain={schema_version:'padf.agent-dispatch/v1',context_id:d.context_id,master_session_ref:d.master_session_ref,
  chain:[{dispatch:d,execution:e,handoff:h,reconciliation}]};
 assert.equal(evaluateOrchestrationChain(chain).eligible,true);
 delete e.runtime_task_ref;assert.equal(evaluateOrchestrationChain(chain).eligible,false);
 e.runtime_task_ref='runtime:synthetic-task';e.executor_session_ref=d.master_session_ref;
 assert.equal(evaluateOrchestrationChain(chain).eligible,false);
});
check('PA quality metadata cannot accept inadequate detailed Feature Specs',()=>{
 const sheet={schema_version:'padf.skill-delivery-evaluation/v1',context_id:'SAMPLE-PRODUCT',dispatch_id:'DISPATCH-PRODUCT',
 execution_id:'EXECUTION-PRODUCT',skill_role:'product-analyst',skill_ref:pin('.agents/skills/product-analyst/SKILL.md'),
 artifact_manifest_ref:pin('docs/manifest.json'),owner_decision:'ACCEPT',owner_evaluation_ref:link,
 criteria:[1,2,3,4,5].map(i=>({id:'PA-Q'+i,score:2,evidence_ref:link}))};
 assert.equal(evaluateSkillDeliveryQuality(sheet).eligible,true);
 sheet.criteria[3].score=1;assert.equal(evaluateSkillDeliveryQuality(sheet).eligible,false);
 sheet.criteria[3].score=2;sheet.owner_decision='CHANGES_REQUESTED';assert.equal(evaluateSkillDeliveryQuality(sheet).eligible,false);
});
const input=()=>({context_id:'SAMPLE-PRODUCT',project:'Sample',repository:'example/padf',linear_issue:null,
 original_feature_ids:[],sender:'product-analyst',receiver:'master-orchestrator',type:'CLARIFICATION_REQUEST',
 subject:'Product input gap',body:'Which data safety constraint applies?',source_refs:[link],
 requested_action:'Clarify relevant constraint',requires_response:true});
check('Shared message generator fills exact protocol fields and preserves retry identity without mutating input',()=>{
 const raw=input(),before=structuredClone(raw),message=createAgentMessage(raw);
 assert.deepEqual(raw,before);assert.equal(message.schema_version,'padf.agent-message/v1');
 assert.match(message.message_id,/^MSG-/);assert.match(message.thread_id,/^THREAD-/);
 assert(Number.isFinite(Date.parse(message.created_at)));assert.equal(message.status,'OPEN');
 assert.equal(message.owner_approval_ref,null);assert.deepEqual(createAgentMessage(message),message);
});
check('A reply requires real correlation and does not inherit the request message ID',()=>{
 const message=createAgentMessage(input()),reply={...input(),type:'RESPONSE',thread_id:message.thread_id,in_reply_to:message.message_id};
 const result=createAgentMessage(reply);assert.equal(result.thread_id,message.thread_id);
 assert.equal(result.in_reply_to,message.message_id);assert.notEqual(result.message_id,message.message_id);
 delete reply.thread_id;assert.throws(()=>createAgentMessage(reply),/RESPONSE_CORRELATION/);
});
check('Draft generation cannot fill missing facts, approval or claim a lifecycle transition',()=>{
 const x=input();delete x.body;assert.throws(()=>createAgentMessage(x),/Missing body/);
 const y=input();y.source_refs=[];assert.throws(()=>createAgentMessage(y),/SOURCE_REFS/);
 const z=input();z.type='TASK_REQUEST';assert.throws(()=>createAgentMessage(z),/APPROVAL_REFERENCE/);
 assert.throws(()=>createAgentMessage({...input(),status:'CLOSED'}),/lifecycle/);
 assert.throws(()=>createAgentMessage({...input(),schema_version:'wrong'}),/SCHEMA_VERSION/);
 assert.throws(()=>createAgentMessage({...input(),created_at:'yesterday'}),/CREATED_AT/);
});
check('CLI generates JSON draft only and explicitly reports NOT_PERSISTED',()=>{
 const dir=mkdtempSync(join(tmpdir(),'padf-message-'));
 try{
  const file=join(dir,'input.json');writeFileSync(file,JSON.stringify(input()));
  const script=fileURLToPath(new URL('../../scripts/create-agent-message.mjs',import.meta.url));
  const r=spawnSync(process.execPath,[script,file],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
  const result=JSON.parse(r.stdout);assert.equal(result.schema_version,'padf.agent-message/v1');
  assert.match(r.stderr,/DRAFT \/ NOT_PERSISTED/);assert.equal(result.owner_approval_ref,null);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
console.log(JSON.stringify({suite:'Product outcomes and shared protocol (synthetic metadata only)',status:'PASS',
 count:checks.length,checks,actual_product_usability:'NOT_RUN',real_agent_dispatch:'NOT_RUN'},null,2));
