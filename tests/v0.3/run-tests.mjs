#!/usr/bin/env node
import assert from 'node:assert/strict';
import {evaluateStageDependencies,evaluateDesignGate,routeAgents} from '../../lib/design-gate.mjs';
const A='a'.repeat(40),B='b'.repeat(40),C='c'.repeat(40);
const ref=(p,s=A)=>p+'@'+s;
const artifact=(p,type,rev=A)=>({type,ref:ref(p,rev),source_revision:rev,current_revision:rev,verified:true,
 evidence_ref:'https://github.com/example/repo/issues/1#artifact-review',
 ...(type.endsWith('-diagram')?{generator:'diagram-design',generator_sha:C,render_status:'PASS'}:{}),
 ...(type==='interactive-prototype'?{interaction_test_status:'PASS',editable_source:true,fidelity:'high'}:{})
});
const SYSTEM_BASELINE=ref('docs/SYSTEM.md');
const stage=(id,agent,deps=[],revision=A)=>{
 const sys=agent==='solution-architect',mod=agent==='module-architect';
 const artifacts=sys?
   [artifact('docs/'+id+'.md','solution-architecture',revision),
    artifact('docs/'+id+'-diagram.html','architecture-diagram',revision),
    artifact('docs/'+id+'-stack.md','technology-stack',revision),
    artifact('docs/'+id+'-app-code.md','application-code-structure',revision)]:
   mod?
   [artifact('docs/'+id+'.md','module-design',revision),
    artifact('docs/'+id+'-diagram.html','module-component-diagram',revision),
    artifact('docs/'+id+'-packages.md','module-code-structure',revision),
    artifact('docs/'+id+'-interfaces.md','module-interface-contract',revision)]:
   [artifact('docs/'+id+'.md','ui-design',revision),
    artifact('docs/'+id+'-concept.html','ui-concept',revision)];
 return {id,agent,required:true,depends_on:deps,status:'COMPLETED',
   ...(mod?{system_baseline_ref:SYSTEM_BASELINE}:{}),
   ...(!sys&&!mod?{profile_ref:ref('docs/ui-profile.md')}:{}),
   artifacts};
};
const reviewed=stages=>stages.flatMap(s=>s.artifacts.map(a=>a.ref));
const baseline=()=>{
 const stages=[stage('ARCH','solution-architect'),stage('UX','ui-ux-designer',['ARCH'])];
 return {
 context_id:'TEST-001',task_class:'L',architecture_scope:'system',routing_rationale:'New APP',
 feature_spec_ref:ref('docs/feature.md'),ui_profile_ref:ref('docs/ui-profile.md'),ui_level:'L1',
 ui_profile_status:'APPROVED',ui_profile_approved_ref:ref('docs/ui-profile.md'),
 ui_profile_approval_ref:'https://github.com/example/repo/issues/1#profile-owner-approval',
 impacts:['architecture','ui'],risk_flags:[],diagram_skill_sha:C,stages,
 consistency_checks:[{scope:'api-ui',status:'PASS',evidence_ref:'https://github.com/example/repo/issues/1#comment'}],
 design_review:{independent:true,mode:'DESIGN',decision:'APPROVE',evidence_ref:'https://github.com/example/repo/pull/4#review',
   reviewed_refs:reviewed(stages),findings:[]},
 coding_authorization:{owner_approval_ref:'https://github.com/example/repo/issues/1#owner',task_contract_ref:'https://github.com/example/repo/issues/1#contract',scope_confirmed:true}
 };
};
const moduleOnly=()=>{
 const x=baseline();
 x.architecture_scope='module';x.routing_rationale='Existing approved system baseline';
 x.impacts=['api'];x.stages=[stage('MOD','module-architect')];
 x.system_baseline_ref=SYSTEM_BASELINE;x.system_baseline_status='APPROVED';
 x.system_baseline_approval_ref='https://github.com/example/repo/issues/1#system-baseline-owner';
 x.design_review.reviewed_refs=reviewed(x.stages);return x;
};
const bothScopes=()=>{
 const x=baseline();
 x.architecture_scope='both';x.impacts=['architecture','api'];
 x.stages=[stage('SYSTEM','solution-architect'),stage('MODULE','module-architect',['SYSTEM'])];
 x.system_baseline_ref=ref('docs/SYSTEM.md');
 x.system_baseline_status='APPROVED';
 x.system_baseline_approval_ref='https://github.com/example/repo/issues/1#system-baseline-owner';
 x.design_review.reviewed_refs=reviewed(x.stages);return x;
};
const tests=[];
function check(name,fn){fn();tests.push({name,status:'PASS'});}
check('L task requires architect+UI and independent design review',()=>{
 const out=evaluateDesignGate(baseline());assert.equal(out.status,'DESIGN_READY');assert.equal(out.coding_authorized,true);
 assert.equal(out.routing.independent_review_required,true);
});
check('Design READY distinct from coding authorization',()=>{const x=baseline();delete x.coding_authorization;
 const r=evaluateDesignGate(x);assert.equal(r.status,'DESIGN_READY');assert.equal(r.coding_authorized,false);
});
check('L/XL independent review mandatory',()=>{const x=baseline();delete x.design_review;
 assert(evaluateDesignGate(x).reasons.includes('MANDATORY_DESIGN_REVIEW'));x.task_class='XL';
 assert(evaluateDesignGate(x).reasons.includes('MANDATORY_DESIGN_REVIEW'));
});
check('S/M review by risk only',()=>{const r=routeAgents({task_class:'M',impacts:['ui'],risk_flags:[]});
 assert.equal(r.independent_review_required,false);assert.equal(r.ui_required,true);assert.equal(r.architect_required,false);
 const s=routeAgents({task_class:'S',impacts:['api'],risk_flags:['breaking-api']});assert.equal(s.independent_review_required,true);
});
check('Risk-triggered S/M cannot skip review even if rationale is recorded',()=>{
 const x=baseline();x.task_class='M';x.risk_flags=['permissions'];x.review_skip_rationale='not needed';
 delete x.design_review;assert(evaluateDesignGate(x).reasons.includes('MANDATORY_DESIGN_REVIEW'));
});
check('UI-only M can skip independent review with explicit reason and profile evidence',()=>{
 const x=baseline();x.task_class='M';x.impacts=['ui'];x.stages=[stage('UX','ui-ux-designer')];
 x.architecture_scope='none';x.review_skip_rationale='No shared UI pattern, auth, API or schema changes';
 delete x.design_review;const r=evaluateDesignGate(x);
 assert.equal(r.status,'DESIGN_READY');assert.equal(r.routing.architect_required,false);
});
check('Missing Architect stage blocks applicable design',()=>{
 const x=baseline();x.stages=[stage('UX','ui-ux-designer')];const r=evaluateDesignGate(x);
 assert(r.reasons.includes('MISSING_SOLUTION_ARCHITECT_STAGE'));
});
// 必需 UI 角色不能因缺少阶段或被标记为可选而绕过设计门禁。
const uiTriggers=[
 {label:'ui impact',impacts:['architecture','ui'],risk_flags:[]},
 {label:'interaction impact',impacts:['architecture','interaction'],risk_flags:[]},
 {label:'shared-component impact',impacts:['architecture','shared-component'],risk_flags:[]},
 {label:'design-system impact',impacts:['architecture','design-system'],risk_flags:[]},
 {label:'shared-component risk',impacts:['architecture'],risk_flags:['shared-component']},
 {label:'design-system risk',impacts:['architecture'],risk_flags:['design-system']}
];
for(const trigger of uiTriggers)check('Missing required UI stage blocks '+trigger.label,()=>{
 const x=baseline();x.impacts=trigger.impacts;x.risk_flags=trigger.risk_flags;
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
 x.stages=x.stages.filter(s=>s.agent!=='ui-ux-designer');
 x.design_review.reviewed_refs=reviewed(x.stages);
 const r=evaluateDesignGate(x);
 assert.equal(r.routing.ui_required,true);
 assert.equal(r.dependencies.valid,true);
 assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
 assert.deepEqual(r.reasons,['MISSING_UI_DESIGN_STAGE']);
});
check('Optional UI stage cannot satisfy a routed required UI role',()=>{
 const x=baseline();
 x.stages[1].required=false;x.stages[1].na_reason='Recorded but inapplicable to a routed UI change';
 x.design_review.reviewed_refs=reviewed([x.stages[0]]);
 const r=evaluateDesignGate(x);
 assert.equal(r.dependencies.valid,true);
 assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
 assert.deepEqual(r.reasons,['MISSING_UI_DESIGN_STAGE']);
});
check('UI-only L3 tasks of every size require a UI stage even with coding approval',()=>{
 for(const task_class of ['S','M','L','XL']){
  const x=baseline();x.task_class=task_class;x.architecture_scope='none';
  x.impacts=['ui'];x.ui_level='L3';x.stages=[stage('UX','ui-ux-designer')];
  x.stages[0].artifacts.push(artifact('docs/prototype.html','interactive-prototype'));
  x.design_review.reviewed_refs=reviewed(x.stages);
  assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
  x.stages=[];x.design_review.reviewed_refs=[];
  const r=evaluateDesignGate(x);
  assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
  assert.deepEqual(r.reasons,['MISSING_UI_DESIGN_STAGE']);
 }
});
check('UI-looking artifacts from another role cannot replace the required UI stage',()=>{
 const x=baseline();x.stages[1].agent='feature-coder';
 const r=evaluateDesignGate(x);
 assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
 assert.deepEqual(r.reasons,['MISSING_UI_DESIGN_STAGE']);
});
check('Non-UI tasks do not require a UI stage',()=>{
 const x=moduleOnly();
 assert.equal(x.stages.some(s=>s.agent==='ui-ux-designer'),false);
 const r=evaluateDesignGate(x);
 assert.equal(r.routing.ui_required,false);
 assert.equal(r.status,'DESIGN_READY');assert.equal(r.coding_authorized,true);
 assert.equal(r.reasons.includes('MISSING_UI_DESIGN_STAGE'),false);
});
check('Dependencies reject cycle and orphan',()=>{
 const x=baseline();x.stages[0].depends_on=['UX'];assert(evaluateStageDependencies(x).errors.some(e=>e.reason==='CYCLE'));
 x.stages[0].depends_on=['MISSING'];assert(evaluateStageDependencies(x).errors.some(e=>e.reason==='UNKNOWN_DEPENDENCY'));
});
check('Parent incomplete blocks dependent stage',()=>{
 const x=baseline();x.stages[0].status='IN_PROGRESS';const r=evaluateStageDependencies(x);
 assert(r.states.UX.reason.includes('PARENT_NOT_COMPLETED:ARCH'));assert.equal(evaluateDesignGate(x).status,'BLOCKED');
});
check('Required artifact without immutable SHA fails',()=>{
 const x=baseline();x.stages[0].artifacts[0].ref='docs/ARCH.md@main';
 assert(evaluateDesignGate(x).reasons.includes('UNSATISFIED_STAGE:ARCH'));
});
check('Upstream revision drift blocks downstream and stale review',()=>{
 const x=baseline();x.stages[0].artifacts[0].current_revision=B;
 const r=evaluateDesignGate(x);assert.equal(r.status,'BLOCKED');assert(r.reasons.includes('UNSATISFIED_STAGE:ARCH'));
 const y=baseline();y.stages[0]=stage('ARCH','solution-architect',[],B);
 assert(evaluateDesignGate(y).reasons.includes('STALE_OR_INCOMPLETE_REVIEW'));
});
check('Unapproved WAIVED dependency cannot be trusted',()=>{
 const x=baseline();x.stages[0].status='WAIVED';x.stages[0].waiver={reason:'skip'};const r=evaluateStageDependencies(x);
 assert(r.errors.some(e=>e.reason==='UNAUTHORIZED_WAIVER'));
});
check('Optional not-applicable stage requires a reason',()=>{
 const x=baseline();x.stages.push({id:'UXOPTION',agent:'ui-ux-designer',required:false,depends_on:[],status:'PENDING'});
 assert(evaluateStageDependencies(x).errors.some(e=>e.reason==='MISSING_NA_REASON'));
 x.stages.at(-1).na_reason='Backend-only feature';assert.equal(evaluateStageDependencies(x).valid,true);
});
check('Material design change must have Owner approval',()=>{
 const x=baseline();x.material_change=true;assert(evaluateDesignGate(x).reasons.includes('MISSING_MATERIAL_OWNER_APPROVAL'));
});
check('Missing consistency evidence blocks',()=>{
 const x=baseline();x.consistency_checks[0].status='NOT_RUN';
 assert(evaluateDesignGate(x).reasons.includes('MISSING_CONSISTENCY_EVIDENCE'));
});
check('P0/P1 findings block; P2 requires owner-approved conditions',()=>{
 const x=baseline();x.design_review.findings=[{severity:'P1',status:'OPEN'}];
 assert(evaluateDesignGate(x).reasons.includes('BLOCKING_DESIGN_FINDING'));
 x.design_review.findings=[{severity:'P2',status:'OPEN'}];assert(evaluateDesignGate(x).reasons.includes('P2_NOT_ACCEPTED'));
 x.design_review.findings=[{severity:'P2',status:'OPEN',
   owner_risk_acceptance_ref:'https://github.com/example/repo/issues/1#decision',
   acceptance_conditions:'monitor rollback'}];
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
check('UI profile version mismatch blocks design readiness',()=>{
 const x=baseline();x.stages[1].profile_ref=ref('docs/ui-profile.md',B);
 assert(evaluateDesignGate(x).reasons.includes('UI_PROFILE_VERSION_MISMATCH'));
});
check('Missing diagram blocks Architect design',()=>{
 const x=baseline();x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>a.type!=='architecture-diagram');
 assert(evaluateDesignGate(x).reasons.includes('MISSING_SYSTEM_ARTIFACT:architecture-diagram'));
});
check('Database needs authoritative schema and matching diagram',()=>{
 const x=moduleOnly();x.impacts=['database'];
 assert(evaluateDesignGate(x).reasons.includes('MISSING_DATABASE_SCHEMA_AND_DIAGRAM'));
 x.stages[0].artifacts.push(artifact('docs/schema.sql','database-schema'));
 x.stages[0].artifacts.push(artifact('docs/schema.html','database-schema-diagram'));
 x.design_review.reviewed_refs.push(ref('docs/schema.sql'),ref('docs/schema.html'));
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
check('L3 requires a verified interactive prototype artifact',()=>{
 const x=baseline();x.ui_level='L3';
 assert(evaluateDesignGate(x).reasons.includes('MISSING_INTERACTIVE_PROTOTYPE'));
 x.stages[1].artifacts.push(artifact('docs/prototype.html','interactive-prototype'));
 x.design_review.reviewed_refs.push(ref('docs/prototype.html'));
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
check('Unverified visual rendering cannot satisfy diagram artifact',()=>{
 const x=baseline();x.stages[0].artifacts[1].render_status='NOT_RUN';
 assert(evaluateDesignGate(x).reasons.includes('UNSATISFIED_STAGE:ARCH'));
});
check('Diagram generator pin mismatch blocks gate',()=>{
 const x=baseline();x.stages[0].artifacts[1].generator_sha=B;
 assert(evaluateDesignGate(x).reasons.includes('DIAGRAM_SKILL_VERSION_MISMATCH'));
});
check('Artifact must include independent evidence link',()=>{
 const x=baseline();delete x.stages[1].artifacts[0].evidence_ref;
 assert(evaluateDesignGate(x).reasons.includes('UNSATISFIED_STAGE:UX'));
});
check('Interactive prototype must have passing interaction check and editable source',()=>{
 const x=baseline();x.ui_level='L3';
 x.stages[1].artifacts.push(artifact('docs/prototype.html','interactive-prototype'));
 x.design_review.reviewed_refs.push(ref('docs/prototype.html'));
 x.stages[1].artifacts.at(-1).interaction_test_status='NOT_RUN';
 assert(evaluateDesignGate(x).reasons.includes('UNSATISFIED_STAGE:UX'));
});
check('Whole-app architectural scope is routed only to Solution Architect',()=>{
 const r=routeAgents({task_class:'XL',architecture_scope:'system',impacts:['technology-stack','deployment']});
 assert.equal(r.valid,true);assert.equal(r.solution_architect_required,true);
 assert.equal(r.module_architect_required,false);assert.equal(r.independent_review_required,true);
});
check('A module-only feature selects Module Architect, not Solution Architect',()=>{
 const r=routeAgents({task_class:'L',architecture_scope:'module',impacts:['api','database']});
 assert.equal(r.module_architect_required,true);assert.equal(r.solution_architect_required,false);
 assert.deepEqual(r.stages.filter(x=>x.endsWith('-architect')),['module-architect']);
 const x=moduleOnly();assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
check('A module cannot proceed without pinned and approved system baseline',()=>{
 const x=moduleOnly();delete x.system_baseline_ref;
 assert(evaluateDesignGate(x).reasons.includes('MISSING_APPROVED_SYSTEM_BASELINE'));
 const y=moduleOnly();y.system_baseline_status='PROPOSED';
 assert(evaluateDesignGate(y).reasons.includes('SYSTEM_BASELINE_NOT_APPROVED'));
});
check('Module baseline SHA must match the approved system baseline',()=>{
 const x=moduleOnly();x.stages[0].system_baseline_ref=ref('docs/SYSTEM.md',B);
 assert(evaluateDesignGate(x).reasons.includes('MODULE_SYSTEM_BASELINE_MISMATCH'));
});
check('Module contract must contain concrete package and interface design',()=>{
 const x=moduleOnly();x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>a.type!=='module-code-structure');
 assert(evaluateDesignGate(x).reasons.includes('MISSING_MODULE_ARTIFACT:module-code-structure'));
 const y=moduleOnly();y.stages[0].artifacts=y.stages[0].artifacts.filter(a=>a.type!=='module-interface-contract');
 assert(evaluateDesignGate(y).reasons.includes('MISSING_MODULE_ARTIFACT:module-interface-contract'));
});
check('Solution Architect must deliver concrete technology stack and APP code structure',()=>{
 const x=baseline();x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>a.type!=='technology-stack');
 assert(evaluateDesignGate(x).reasons.includes('MISSING_SYSTEM_ARTIFACT:technology-stack'));
 const y=baseline();y.stages[0].artifacts=y.stages[0].artifacts.filter(a=>a.type!=='application-code-structure');
 assert(evaluateDesignGate(y).reasons.includes('MISSING_SYSTEM_ARTIFACT:application-code-structure'));
});
check('Combined scope requires ordered SYSTEM to MODULE handoff',()=>{
 const x=bothScopes();assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
 x.stages[1].depends_on=[];
 assert(evaluateDesignGate(x).reasons.includes('MISSING_SYSTEM_TO_MODULE_DEPENDENCY'));
});
check('Combined scope requires module to cite the new approved system architecture revision',()=>{
 const x=bothScopes();x.system_baseline_ref=ref('docs/OTHER.md');
 x.stages[1].system_baseline_ref=x.system_baseline_ref;
 assert(evaluateDesignGate(x).reasons.includes('NEW_SYSTEM_BASELINE_REF_MISMATCH'));
});
check('System-wide changes cannot be silently delegated as module-only',()=>{
 const r=routeAgents({task_class:'M',architecture_scope:'module',impacts:['technology-stack','api']});
 assert.equal(r.valid,false);assert(r.errors.includes('SYSTEM_ARCHITECTURE_IMPACT_REQUIRES_SOLUTION_ARCHITECT'));
});
check('Master must record architecture scope before dispatch',()=>{
 const x=baseline();delete x.architecture_scope;
 assert(evaluateDesignGate(x).reasons.includes('MISSING_MASTER_ARCHITECTURE_SCOPE_DECISION'));
});
check('UI-only feature needs no Architect and skips with justified risk check',()=>{
 const x=baseline();x.architecture_scope='none';x.impacts=['ui'];x.task_class='M';
 x.stages=[stage('UX','ui-ux-designer')];delete x.design_review;
 x.review_skip_rationale='UI-only feature, no shared-component or security impact';
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
check('MODULE-only L/XL still triggers independent DESIGN review',()=>{
 const x=moduleOnly();delete x.design_review;
 assert(evaluateDesignGate(x).reasons.includes('MANDATORY_DESIGN_REVIEW'));
});
check('MODULE-design diagram must be rendered by pinned external skill',()=>{
 const x=moduleOnly();x.stages[0].artifacts[1].render_status='NOT_RUN';
 assert(evaluateDesignGate(x).reasons.includes('UNSATISFIED_STAGE:MOD'));
});
check('Optional real orchestration acceptance refuses missing Dispatch chain',()=>{
 const x=baseline();x.orchestration_validation_required=true;
 const out=evaluateDesignGate(x);
 assert(out.reasons.includes('ORCHESTRATION_CHAIN_INCOMPLETE'));
 assert(out.reasons.includes('ORCHESTRATION_LIVE_EVIDENCE_NOT_REVIEWED'));
 assert(out.reasons.includes('MISSING_SPECIALIST_EXECUTION:solution-architect'));
});
check('Invalid task class and unsupported status rejected',()=>{
 assert.equal(routeAgents({task_class:'unknown'}).valid,false);
 const x=baseline();x.stages[0].status='MAGIC';
 assert(evaluateStageDependencies(x).errors.some(e=>e.reason==='INVALID_STAGE_STATUS'));
});

// R2 回归：角色路由、强制独立审查和 Profile 批准必须分别闭合。
check('R2-01 module impacts cannot be narrowed to system or none',()=>{
 for(const task_class of ['S','M','L','XL'])
 for(const impact of ['api','database','workflow','integration','module-design','code-structure','security']){
  for(const architecture_scope of ['none','system']){
   const r=routeAgents({task_class,impacts:[impact],risk_flags:[],architecture_scope});
   assert.equal(r.valid,false,task_class+':'+impact+':'+architecture_scope);
   assert.deepEqual(r.errors,['MODULE_DESIGN_IMPACT_REQUIRES_MODULE_ARCHITECT']);
  }
  for(const architecture_scope of ['module','both']){
   const r=routeAgents({task_class,impacts:[impact],risk_flags:[],architecture_scope});
   assert.equal(r.valid,true);assert.equal(r.module_architect_required,true);
  }
 }
});
check('R2-01 API impact with only a completed system stage cannot authorize coding',()=>{
 const x=baseline();x.task_class='M';x.impacts=['api'];x.architecture_scope='system';
 x.stages=[stage('ARCH','solution-architect')];x.design_review.reviewed_refs=reviewed(x.stages);
 const r=evaluateDesignGate(x);
 assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
 assert.deepEqual(r.reasons,['MODULE_DESIGN_IMPACT_REQUIRES_MODULE_ARCHITECT']);
});
check('R2-01 combined impacts require both architects and keep automatic routing symmetric',()=>{
 const input={task_class:'M',impacts:['technology-stack','api'],risk_flags:[]};
 for(const architecture_scope of ['none','system','module'])
  assert.equal(routeAgents({...input,architecture_scope}).valid,false);
 for(const architecture_scope of [undefined,'both']){
  const r=routeAgents({...input,architecture_scope});
  assert.equal(r.valid,true);assert.equal(r.architecture_scope,'both');
  assert.equal(r.solution_architect_required,true);assert.equal(r.module_architect_required,true);
 }
});
check('R2-01 required module stage cannot be missing or merely optional',()=>{
 for(const optional of [false,true]){
  const x=moduleOnly();
  if(optional){x.stages[0].required=false;x.stages[0].na_reason='Proposed exemption without removing actual API impact';}
  else x.stages=[];
  x.design_review.reviewed_refs=[];
  const r=evaluateDesignGate(x);
  assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
  assert(r.reasons.includes('MISSING_MODULE_ARCHITECT_STAGE'));
 }
});
const knownMandatoryRisks=['auth','permissions','privacy','security','destructive-migration',
 'risky-schema-migration','breaking-api','critical-business-rule','critical-workflow',
 'design-system','shared-component','integration','concurrency','cross-module','financial-data'];
check('R2-02 known mandatory risks trigger S/M review from impacts or risk_flags',()=>{
 for(const task_class of ['S','M'])for(const risk of knownMandatoryRisks){
  for(const input of [{impacts:[risk],risk_flags:[]},{impacts:[],risk_flags:[risk]}]){
   const r=routeAgents({task_class,...input});
   assert.equal(r.valid,true);assert.equal(r.independent_review_required,true,task_class+':'+risk);
  }
 }
});
const uiOnly=()=>{
 const x=baseline();x.task_class='M';x.architecture_scope='none';x.impacts=['ui'];
 x.stages=[stage('UX','ui-ux-designer')];x.design_review.reviewed_refs=reviewed(x.stages);
 return x;
};
for(const task_class of ['S','M'])for(const impact of ['shared-component','design-system'])
check('R2-02 '+task_class+' '+impact+' cannot skip mandatory DESIGN review',()=>{
 const x=uiOnly();x.task_class=task_class;x.impacts=[impact];
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
 delete x.design_review;x.review_skip_rationale='Explicit request to skip review despite known shared UI impact';
 const r=evaluateDesignGate(x);
 assert.equal(r.routing.independent_review_required,true);
 assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
 assert.deepEqual(r.reasons,['MANDATORY_DESIGN_REVIEW']);
});
check('R2-02 review evidence for shared UI impacts must be independent DESIGN approval',()=>{
 for(const change of [
  r=>{r.independent=false;},r=>{r.mode='IMPLEMENTATION';},
  r=>{r.decision='REQUEST_CHANGES';},r=>{delete r.evidence_ref;}
 ]){
  const x=uiOnly();x.impacts=['design-system'];change(x.design_review);
  const r=evaluateDesignGate(x);
  assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
  assert(r.reasons.includes('MANDATORY_DESIGN_REVIEW'));
 }
});
check('R2-02 ordinary UI-only S/M tasks can still skip review with a justified rationale',()=>{
 for(const task_class of ['S','M']){
  const x=uiOnly();x.task_class=task_class;delete x.design_review;
  x.review_skip_rationale='Only local UI layout; no known shared, security or cross-module impact';
  const r=evaluateDesignGate(x);
  assert.equal(r.routing.independent_review_required,false);
  assert.equal(r.status,'DESIGN_READY');assert.equal(r.coding_authorized,true);
 }
});
function assertProfileBlocked(x,reason){
 const r=evaluateDesignGate(x);
 assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
 assert(r.reasons.includes(reason),JSON.stringify(r.reasons));
}
check('R2-03 every unapproved or absent UI Profile status blocks readiness',()=>{
 for(const status of [undefined,null,'PROPOSED','DEFERRED','REJECTED','approved']){
  const x=uiOnly();x.ui_profile_status=status;
  assertProfileBlocked(x,'PROJECT_UI_PROFILE_NOT_APPROVED');
 }
});
check('R2-03 an APPROVED label without Owner approval evidence is insufficient',()=>{
 for(const approval of [undefined,null,'','   ','short']){
  const x=uiOnly();x.ui_profile_approval_ref=approval;
  assertProfileBlocked(x,'PROJECT_UI_PROFILE_NOT_APPROVED');
 }
});
check('R2-03 Owner approval must bind to the exact pinned Profile revision',()=>{
 for(const approvedRef of [undefined,null,ref('docs/ui-profile.md',B),'docs/ui-profile.md@main']){
  const x=uiOnly();x.ui_profile_approved_ref=approvedRef;
  assertProfileBlocked(x,'UI_PROFILE_APPROVAL_VERSION_MISMATCH');
 }
});
check('R2-03 exact approval cannot compensate for an unpinned Profile or stale stage',()=>{
 const x=uiOnly();x.ui_profile_ref='docs/ui-profile.md@main';
 x.ui_profile_approved_ref=x.ui_profile_ref;x.stages[0].profile_ref=x.ui_profile_ref;
 assertProfileBlocked(x,'UNVERSIONED_PROJECT_UI_PROFILE');
 const y=uiOnly();y.stages[0].profile_ref=ref('docs/ui-profile.md',B);
 assertProfileBlocked(y,'UI_PROFILE_VERSION_MISMATCH');
});
check('R2-03 L3 prototype and coding approval do not approve a proposed Profile',()=>{
 const x=uiOnly();x.ui_level='L3';
 x.stages[0].artifacts.push(artifact('docs/prototype.html','interactive-prototype'));
 x.design_review.reviewed_refs=reviewed(x.stages);
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
 x.ui_profile_status='PROPOSED';x.ui_profile_approval_ref=null;
 assertProfileBlocked(x,'PROJECT_UI_PROFILE_NOT_APPROVED');
});
check('R2-03 proposed bootstrapping stays blocked until its precise alternative baseline is approved',()=>{
 const x=uiOnly();x.ui_profile_ref=ref('docs/task-ui-baseline.md',B);
 x.stages[0].profile_ref=x.ui_profile_ref;x.ui_profile_approved_ref=x.ui_profile_ref;
 x.ui_profile_status='PROPOSED';
 assertProfileBlocked(x,'PROJECT_UI_PROFILE_NOT_APPROVED');
 x.ui_profile_status='APPROVED';
 x.ui_profile_approval_ref='https://github.com/example/repo/issues/1#task-specific-baseline-owner';
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
check('R2-03 approved UI Profile does not grant coding authorization',()=>{
 const x=uiOnly();delete x.coding_authorization;
 const r=evaluateDesignGate(x);
 assert.equal(r.status,'DESIGN_READY');assert.equal(r.coding_authorized,false);
 assert.equal(r.execution_state,'AWAITING_OWNER_CODING_AUTHORIZATION');
});
check('R2-03 non-UI tasks do not acquire a UI Profile approval dependency',()=>{
 const x=moduleOnly();delete x.ui_profile_ref;delete x.ui_profile_status;
 delete x.ui_profile_approved_ref;delete x.ui_profile_approval_ref;
 const r=evaluateDesignGate(x);
 assert.equal(r.status,'DESIGN_READY');assert.equal(r.coding_authorized,true);
});

check('R3 every required UI stage must match the approved Profile regardless of order',()=>{
 for(const reverse of [false,true])for(const profile of [undefined,ref('docs/ui-profile.md',B)]){
  const x=uiOnly();const extra=stage('UX2','ui-ux-designer');
  x.stages.push(extra);x.design_review.reviewed_refs=reviewed(x.stages);
  assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
  extra.profile_ref=profile;
  if(reverse)x.stages.reverse();
  assertProfileBlocked(x,'UI_PROFILE_VERSION_MISMATCH');
 }
});
check('R3 each required UI stage must provide its own specification and visual artifacts',()=>{
 for(const [type,reason] of [['ui-design','MISSING_UI_SPECIFICATION'],['ui-concept','MISSING_UI_DESIGN_VISUAL']]){
  const x=uiOnly();x.stages.push(stage('UX2','ui-ux-designer'));
  x.stages[1].artifacts=x.stages[1].artifacts.filter(a=>a.type!==type);
  x.design_review.reviewed_refs=reviewed(x.stages);
  const r=evaluateDesignGate(x);
  assert.equal(r.dependencies.valid,true);
  assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);
  assert(r.reasons.includes(reason));
 }
});
check('R3 L3 prototype evidence is required for every required UI stage',()=>{
 const x=uiOnly();x.ui_level='L3';x.stages.push(stage('UX2','ui-ux-designer'));
 x.stages[0].artifacts.push(artifact('docs/UX-prototype.html','interactive-prototype'));
 x.design_review.reviewed_refs=reviewed(x.stages);
 assertProfileBlocked(x,'MISSING_INTERACTIVE_PROTOTYPE');
 x.stages[1].artifacts.push(artifact('docs/UX2-prototype.html','interactive-prototype'));
 x.design_review.reviewed_refs=reviewed(x.stages);
 assert.equal(evaluateDesignGate(x).status,'DESIGN_READY');
});
check('R3 optional UI stages do not substitute for or constrain complete required UI stages',()=>{
 const x=uiOnly();const extra=stage('UXOPTION','ui-ux-designer');
 extra.required=false;extra.na_reason='Exploratory alternative, excluded from this approved task';
 extra.profile_ref=ref('docs/ui-profile.md',B);x.stages.push(extra);
 const r=evaluateDesignGate(x);
 assert.equal(r.status,'DESIGN_READY');assert.equal(r.coding_authorized,true);
});
console.log(JSON.stringify({suite:'PADF V0.3 system/module architecture routing, design dependency and gate simulation',status:'PASS',count:tests.length,tests},null,2));
