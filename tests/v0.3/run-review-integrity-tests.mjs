#!/usr/bin/env node
// Independent Issue #18 QA. Fixtures are synthetic metadata, not real approvals,
// remote identity verification, Figma execution, dispatches or Owner acceptance.
// Oracle: Issue #18, pre-launch D-GATE-FIX-QA and the proposed Gate/UI contracts.
// No implementation internals, external report files, packages or /tmp fixtures.
import assert from 'node:assert/strict';
import {evaluateDesignGate} from '../../lib/design-gate.mjs';
import {evaluateActionPreflight} from '../../lib/action-preflight.mjs';
import {evaluateOrchestrationChain} from '../../lib/orchestration-evidence.mjs';

const A='a'.repeat(40), B='b'.repeat(40), C='c'.repeat(40);
const pin=(path,sha=A)=>`${path}@${sha}`;
const link=anchor=>`https://github.com/example/padf/issues/18#${anchor}`;
const evidence=link('synthetic-evidence');
const clone=x=>structuredClone(x);
const cases=[];
function test(id,name,fn){
 try{fn();cases.push({id,name,status:'PASS'});}
 catch(error){cases.push({id,name,status:'FAIL',actual:error.message});}
}
function artifact(type,path){
 return {type,ref:pin(path),source_revision:A,current_revision:A,verified:true,evidence_ref:evidence,
  ...(type.endsWith('-diagram')?{generator:'diagram-design',generator_sha:C,render_status:'PASS'}:{})};
}
const types={
 'solution-architect':['solution-architecture','technology-stack','application-code-structure','architecture-diagram'],
 'module-architect':['module-design','module-code-structure','module-interface-contract','module-component-diagram'],
 'ui-ux-designer':['ui-design','ui-concept'],
 'product-analyst':['product-definition','feature-specification']
};
function stage(id,agent,depends_on=[]){
 return {id,agent,required:true,status:'COMPLETED',depends_on,
  artifacts:types[agent].map(type=>artifact(type,`docs/${id}/${type}.md`))};
}
function refresh(x){
 if(x.design_review)x.design_review.reviewed_refs=x.stages.filter(s=>s.required!==false)
  .flatMap(s=>s.artifacts.filter(a=>a.required!==false).map(a=>a.ref));
 return x;
}
function base(){
 return {context_id:'QA-DESIGN-GATE-18',repository:'example/padf',task_contract_ref:link('gate-contract'),
  source_base_sha:A,source_head_sha:B,task_class:'M',architecture_scope:'none',
  routing_rationale:'Bounded independent synthetic regression',impacts:[],risk_flags:[],
  feature_spec_ref:pin('docs/feature.md'),diagram_skill_sha:C,stages:[],
  consistency_checks:[{scope:'design-contract',status:'PASS',evidence_ref:evidence}],
  design_review:{independent:true,mode:'DESIGN',decision:'APPROVE',evidence_ref:link('design-review'),
   reviewed_refs:[],findings:[]},
  coding_authorization:{owner_approval_ref:link('coding-approval'),task_contract_ref:link('gate-contract'),scope_confirmed:true}};
}
function uiTask(level='L1',mode='legacy',count=1){
 const x=base();x.impacts=['ui'];x.ui_level=level;
 Object.assign(x,{ui_profile_ref:pin('docs/profile.md'),ui_profile_status:'APPROVED',
  ui_profile_approved_ref:pin('docs/profile.md'),ui_profile_approval_ref:link('profile-approval')});
 if(mode==='staged'){
  x.ui_delivery_mode='staged';x.frontend_stack_ref=pin('docs/frontend.md');
  x.frontend_prototype_authorization_ref=link('prototype-approval');
 }
 for(let i=0;i<count;i++){
  const s=stage(`UI${i}`,'ui-ux-designer');s.profile_ref=x.ui_profile_ref;
  if(level==='L2'||level==='L3'){
   if(mode==='staged'){
    const f={...artifact('figma-design',`docs/${s.id}/figma.json`),tool:'figma',
     figma_url:'https://www.figma.com/design/synthetic18/design',design_version:`version-${i}`};
    s.artifacts.push(f);
    s.figma_confirmation={design_ref:f.ref,design_version:f.design_version,owner_confirmation_ref:link(`confirm-${i}`)};
   }else s.artifacts.push({...artifact('ui-prototype',`docs/${s.id}/editable.html`),editable_source:true});
  }
  if(level==='L3')s.artifacts.push({...artifact('interactive-prototype',`docs/${s.id}/runtime.html`),
   editable_source:true,fidelity:'high',interaction_test_status:'PASS',
   ...(mode==='staged'?{runtime:'frontend',frontend_stack_ref:x.frontend_stack_ref,
    figma_design_ref:s.artifacts.find(a=>a.type==='figma-design').ref}:{})});
  x.stages.push(s);
 }
 return refresh(x);
}
function architectures(scope='module',count=3){
 const x=base();x.architecture_scope=scope;x.impacts=scope==='system'?['architecture']:['api'];
 if(scope!=='system')Object.assign(x,{system_baseline_ref:pin('docs/SYSTEM/solution-architecture.md'),
  system_baseline_status:'APPROVED',system_baseline_approval_ref:link('system-approved')});
 if(scope==='both')x.stages.push(stage('SYSTEM','solution-architect'));
 for(let i=0;i<count;i++){
  const s=stage(`${scope==='system'?'SYSTEM':'MODULE'}${i}`,scope==='system'?'solution-architect':'module-architect',
   scope==='both'?['SYSTEM']:[]);
  if(scope!=='system')s.system_baseline_ref=x.system_baseline_ref;
  x.stages.push(s);
 }
 return refresh(x);
}
function preflight(x){
 const subject={repository:x.repository,context_id:x.context_id,task_contract_ref:x.task_contract_ref,
  environment:'isolated',target_ref:'main',base_sha:A,head_sha:B};
 return {schema_version:'padf.action-preflight/v1',now:'2026-10-22T02:00:00Z',action:'START_CODING',subject,
  verification:{verified:true,observed_at:'2026-10-22T01:59:00Z',valid_until:'2026-10-22T02:02:00Z',evidence_ref:evidence},
  authorization:{status:'APPROVED',action:'START_CODING',owner_approval_ref:x.coding_authorization?.owner_approval_ref??link('coding-approval'),subject:clone(subject)},
  policy:{evidence_ref:evidence,review_required:true,qa_required:true,task_class:x.task_class,
   impacts:clone(x.impacts),risk_flags:clone(x.risk_flags)},findings:[],blockers:[],design_input:clone(x)};
}
function ready(x){
 const before=clone(x),r=evaluateDesignGate(x);
 assert.equal(r.status,'DESIGN_READY',JSON.stringify(r));
 assert.equal(r.coding_authorized,true,JSON.stringify(r));
 assert.deepEqual(x,before,'Design Gate must not mutate evidence');
 const p=preflight(x),pBefore=clone(p),out=evaluateActionPreflight(p);
 assert.equal(out.decision,'READY',JSON.stringify(out));
 assert.deepEqual(p,pBefore,'START_CODING must not mutate evidence');
 return r;
}
function denied(x){
 const r=evaluateDesignGate(x);
 assert(['BLOCKED','NEEDS_REFINEMENT'].includes(r.status),JSON.stringify(r));
 assert.equal(r.coding_authorized,false,JSON.stringify(r));
 const p=preflight(x);assert.deepEqual(p.findings,[]);
 const out=evaluateActionPreflight(p);
 assert.equal(out.decision,'BLOCKED',JSON.stringify(out));
 assert(out.reasons.length>0,'START_CODING must preserve a blocking reason');
 return r;
}
function negative(id,name,factory,mutate){
 test(id,name,()=>{const x=factory();ready(x);mutate(x);refresh(x);denied(x);});
}
function permutations(items){
 if(items.length===0)return [[]];
 return items.flatMap((v,i)=>permutations(items.filter((_,j)=>i!==j)).map(tail=>[v,...tail]));
}

// F1: obligation to commission Review and obligation to honor known Review differ.
for(const size of ['S','M','L','XL']){
 const make=()=>Object.assign(uiTask(),{task_class:size});
 test(`F1-${size}-approve`,'Complete independent APPROVE and coding approval',()=>ready(make()));
 negative(`F1-${size}-reject`,'Known REQUEST_CHANGES always stops coding',make,x=>x.design_review.decision='REQUEST_CHANGES');
 for(const severity of ['P0','P1','P2']){
  negative(`F1-${size}-${severity}-open`,'Known OPEN finding is honored',make,x=>x.design_review.findings=[{id:'F',severity,status:'OPEN'}]);
  test(`F1-${size}-${severity}-fixed`,'Fixed finding retains positive route',()=>{
   const x=make();x.design_review.findings=[{id:'F',severity,status:'FIXED'}];ready(x);
  });
 }
 test(`F1-${size}-p2-accepted`,'Individual P2 acceptance with conditions is retained',()=>{
  const x=make();x.design_review.findings=[{id:'P2-A',severity:'P2',status:'OPEN',
   owner_risk_acceptance_ref:link('risk-acceptance'),acceptance_conditions:'Keep the bounded design and recheck before expansion'}];ready(x);
 });
 for(const missing of ['owner_risk_acceptance_ref','acceptance_conditions'])negative(`F1-${size}-p2-${missing}`,
  'P2 acceptance requires both evidence and explicit conditions',make,x=>{
   const f={severity:'P2',status:'OPEN',owner_risk_acceptance_ref:link('risk-acceptance'),acceptance_conditions:'Monitor rollback'};
   delete f[missing];x.design_review.findings=[f];
  });
 for(const severity of ['P0','P1'])negative(`F1-${size}-${severity}-risk-acceptance`,
  'P2-style risk acceptance cannot override open P0/P1',make,x=>x.design_review.findings=[{
   severity,status:'OPEN',owner_risk_acceptance_ref:link('risk-acceptance'),acceptance_conditions:'Bounded scope'}]);
 negative(`F1-${size}-p2-individual`,'One accepted P2 cannot accept another finding',make,x=>x.design_review.findings=[
  {id:'A',severity:'P2',status:'OPEN',owner_risk_acceptance_ref:link('risk-acceptance'),acceptance_conditions:'Bounded scope'},
  {id:'B',severity:'P2',status:'OPEN'}]);
 test(`F1-${size}-p3`,'Tracked open P3 does not prohibit coding',()=>{
  const x=make();x.design_review.findings=[{severity:'P3',status:'OPEN'}];ready(x);
 });
}
for(const size of ['S','M']){
 test(`F1-${size}-skip`,'Low-risk explicit Review skip remains valid',()=>{
  const x=Object.assign(uiTask(),{task_class:size});delete x.design_review;
  x.review_skip_rationale='Local bounded visual adjustment with no shared pattern or security impact';ready(x);
 });
 negative(`F1-${size}-risky-skip`,'Risk-triggered small tasks still require independent Review',
  ()=>Object.assign(uiTask(),{task_class:size}),x=>{delete x.design_review;x.review_skip_rationale='Small';x.risk_flags=['permissions'];});
}

// F2: test every required stage, including second/third positions and all orders.
for(const scope of ['system','module']){
 test(`F2-${scope}-complete`,'Three complete same-role stages are legal in every order',()=>{
  const x=architectures(scope);for(const order of permutations(x.stages)){x.stages=order;refresh(x);ready(x);}
 });
 for(const target of [1,2]){
  const role=scope==='system'?'solution-architect':'module-architect';
  const mutations=types[role].map(type=>[type,s=>s.artifacts=s.artifacts.filter(a=>a.type!==type)]);
  mutations.push(['diagram-pin',s=>s.artifacts.find(a=>a.type.endsWith('-diagram')).generator_sha=B]);
  if(scope==='module')mutations.push(['baseline',s=>s.system_baseline_ref=pin('docs/SYSTEM/solution-architecture.md',B)]);
  for(const [label,mutate] of mutations)test(`F2-${scope}-${target}-${label}`,'Later stage semantic defect is order independent',()=>{
   const x=architectures(scope);ready(x);mutate(x.stages[target]);
   let outcome;
   for(const order of permutations(x.stages)){
    x.stages=order;refresh(x);const r=denied(x);
    const canonical=[...r.reasons].sort();
    if(outcome)assert.deepEqual(canonical,outcome,'Same stage set must have same reasons');else outcome=canonical;
   }
  });
 }
}
test('F2-both-exact-provider','Each Module depends on actual exact approved SA provider in every order',()=>{
 const x=architectures('both',2);x.stages.push(stage('SUPPORT','solution-architect'));
 for(const order of permutations(x.stages)){x.stages=order;refresh(x);ready(x);}
});
for(const deps of [[],['SUPPORT']])test(`F2-both-wrong-provider-${deps.length}`,'Unrelated completed SA cannot replace exact baseline dependency',()=>{
 const x=architectures('both',2);x.stages.push(stage('SUPPORT','solution-architect'));ready(refresh(x));
 x.stages.find(s=>s.id==='MODULE1').depends_on=deps;
 for(const order of permutations(x.stages)){x.stages=order;refresh(x);denied(x);}
});
negative('F2-both-ambiguous-provider','Duplicate exact SA baseline providers cannot be selected implicitly',
 ()=>architectures('both',2),x=>{const s=stage('DUPLICATE','solution-architect');s.artifacts[0].ref=x.system_baseline_ref;x.stages.push(s);});

// Database/workflow are task-level requirements; architecture stages may share them.
function taskwide(scope='module',split=false){
 const x=architectures(scope,3);x.impacts.push('database','workflow');
 const packages=['database-schema','database-schema-diagram','workflow-diagram'];
 packages.forEach((type,i)=>x.stages[split?i:0].artifacts.push(artifact(type,`docs/shared/${type}.md`)));
 return refresh(x);
}
// Existing routing sends database/workflow implementation impacts to Module;
// BOTH additionally proves that SA may contribute task-level artifacts.
for(const scope of ['module','both'])for(const split of [false,true]){
 test(`F2-taskwide-${scope}-${split}`,'Task-level artifacts may be supplied once or across required architecture stages',()=>{
  const x=taskwide(scope,split);for(const order of permutations(x.stages)){x.stages=order;refresh(x);ready(x);}
 });
 for(const type of ['database-schema','database-schema-diagram','workflow-diagram'])test(`F2-taskwide-${scope}-${split}-${type}`,
  'Task-level missing required type is rejected in every order',()=>{
   const x=taskwide(scope,split);ready(x);
   for(const s of x.stages)s.artifacts=s.artifacts.filter(a=>a.type!==type);
   for(const order of permutations(x.stages)){x.stages=order;refresh(x);denied(x);}
  });
}
for(const type of ['database-schema-diagram','workflow-diagram'])negative(`F2-taskwide-invalid-${type}`,
 'Shared task-level diagram retains fixed generator validation',()=>taskwide('module',true),x=>{
  x.stages.flatMap(s=>s.artifacts).find(a=>a.type===type).generator_sha=B;
 });
test('F2-taskwide-optional-stage','Optional architecture work cannot supply a required task-level database source',()=>{
 const x=taskwide();ready(x);
 const extra=stage('OPTIONAL','module-architect');extra.system_baseline_ref=x.system_baseline_ref;
 extra.required=false;extra.na_reason='Exploratory proposal outside required delivery';
 const owner=x.stages[0];extra.artifacts.push(...owner.artifacts.filter(a=>a.type==='database-schema'));
 owner.artifacts=owner.artifacts.filter(a=>a.type!=='database-schema');x.stages.push(extra);denied(refresh(x));
});

// F3: complete chain is independently eligible before cross-Gate binding tests.
function bindChain(x){
 const master='session:synthetic-master',chain=[];
 for(const [index,s] of x.stages.filter(s=>s.required!==false).entries()){
  const prev=chain.at(-1),dispatchId=`SYNTHETIC-DISPATCH-${index}`,executionId=`SYNTHETIC-EXECUTION-${index}`;
  const time=n=>new Date(Date.UTC(2026,9,22,0,index*10+n)).toISOString();
  const dispatch={dispatch_id:dispatchId,context_id:x.context_id,repository:x.repository,target_role:s.agent,
   master_session_ref:master,dispatch_ref:link(`dispatch-${index}`),task_contract_ref:s.orchestration_binding?.task_contract_ref??x.task_contract_ref,
   skill_ref:pin(`.agents/skills/${s.agent}/SKILL.md`),created_at:time(1),
   routing_rationale:'Synthetic metadata for exact stage binding',expected_artifact_types:s.artifacts.map(a=>a.type),
   execution_mode:'HUMAN_RELAY',initiated_by:'HUMAN_OWNER',depends_on_dispatch_ids:prev?[prev.dispatch.dispatch_id]:[],
   ...(prev?{prior_handoff_ref:prev.handoff.handoff_ref,prior_reconciliation_ref:prev.reconciliation.reconciliation_ref}:{}),
   ...(s.agent==='module-architect'?{system_baseline_ref:x.system_baseline_ref,system_baseline_status:'APPROVED',
    system_baseline_owner_approval_ref:link('system-approved')}:{}),
   ...(s.agent==='ui-ux-designer'?{ui_profile_ref:x.ui_profile_ref}:{})};
  const execution={execution_id:executionId,dispatch_id:dispatchId,executor_role:s.agent,
   executor_session_ref:`session:synthetic-specialist-${index}`,started_at:time(3),dispatch_ref_read:dispatch.dispatch_ref,
   skill_ref_used:dispatch.skill_ref,evidence_method:'OWNER_ATTESTED',human_start_ref:link(`human-start-${index}`)};
  const handoff={handoff_id:`SYNTHETIC-HANDOFF-${index}`,dispatch_id:dispatchId,execution_id:executionId,
   sender_role:s.agent,handoff_ref:link(`handoff-${index}`),submitted_at:time(6),
   artifact_refs:s.artifacts.filter(a=>a.required!==false).map(a=>({kind:a.type,ref:a.ref}))};
  const reconciliation={dispatch_id:dispatchId,master_session_ref:master,reconciliation_ref:link(`reconcile-${index}`),
   evidence_check_ref:link(`live-check-${index}`),observed_at:time(8),reviewed_handoff_ref:handoff.handoff_ref,
   decision:'CONTINUE',next_dispatch_id:null};
  if(prev)prev.reconciliation.next_dispatch_id=dispatchId;
  chain.push({dispatch,execution,handoff,reconciliation});
  s.orchestration_binding={...s.orchestration_binding,dispatch_id:dispatchId,execution_id:executionId};
 }
 x.orchestration_validation_required=true;x.owner_live_evidence_review_ref=link('owner-live-evidence');
 x.orchestration_chain={schema_version:'padf.agent-dispatch/v1',context_id:x.context_id,repository:x.repository,
  task_contract_ref:x.task_contract_ref,master_session_ref:master,chain};return refresh(x);
}
function formal(){
 const x=architectures('both',1),u=uiTask();x.product_scope='define';x.impacts.push('ui');
 for(const [key,value] of Object.entries(u))if(key.startsWith('ui_'))x[key]=value;
 const pa=stage('PRODUCT','product-analyst');pa.artifacts[1].ref=x.feature_spec_ref;
 x.stages.unshift(pa);x.stages.find(s=>s.id==='SYSTEM').depends_on=['PRODUCT'];
 const ux=clone(u.stages[0]);ux.depends_on=['PRODUCT'];x.stages.push(ux);
 return bindChain(x);
}
function eligible(x){const r=evaluateOrchestrationChain(x.orchestration_chain);assert.equal(r.eligible,true,JSON.stringify(r));}
test('F3-complete','Current Gate/PA/SA/Module/UI chain with exact artifacts succeeds',()=>{const x=formal();eligible(x);ready(x);});
for(const key of ['context_id','repository','task_contract_ref']){
 negative(`F3-chain-${key}-missing`,'Formal chain must identify current Gate',formal,x=>delete x.orchestration_chain[key]);
 negative(`F3-chain-${key}-other`,'Internally eligible chain from another task is rejected',formal,x=>{
  x.orchestration_chain[key]=key==='task_contract_ref'?link('other-task'):'other-value';
  if(key!=='task_contract_ref')for(const item of x.orchestration_chain.chain)item.dispatch[key]=x.orchestration_chain[key];
  eligible(x);
 });
}
negative('F3-dispatch-repository','Each Dispatch must belong to current repository',formal,x=>{
 x.orchestration_chain.chain[2].dispatch.repository='other/repository';eligible(x);
});
negative('F3-dispatch-repository-missing','Dispatch repository cannot be omitted on the formal path',formal,x=>{
 delete x.orchestration_chain.chain[2].dispatch.repository;eligible(x);
});
negative('F3-completed-stage','Formal binding cannot turn a waived stage into completed execution',formal,x=>{
 const s=x.stages.find(s=>s.agent==='ui-ux-designer');s.status='WAIVED';
 s.waiver={owner_approval_ref:link('waiver'),reason:'Synthetic waiver does not prove completion'};eligible(x);
});
for(const role of Object.keys(types))for(const field of ['dispatch_id','execution_id']){
 negative(`F3-${role}-${field}-missing`,'Every required professional stage needs explicit binding',formal,x=>{
  delete x.stages.find(s=>s.agent===role).orchestration_binding[field];eligible(x);
 });
 negative(`F3-${role}-${field}-wrong`,'Unknown execution or dispatch cannot bind a stage',formal,x=>{
  x.stages.find(s=>s.agent===role).orchestration_binding[field]='SYNTHETIC-UNRELATED';eligible(x);
 });
}
for(const role of Object.keys(types))negative(`F3-${role}-binding-absent`,'Role presence cannot substitute for stage binding',formal,x=>{
 delete x.stages.find(s=>s.agent===role).orchestration_binding;eligible(x);
});
negative('F3-wrong-role-binding','Binding must match the actual stage role',formal,x=>{
 x.stages.at(-1).orchestration_binding=clone(x.stages[0].orchestration_binding);eligible(x);
});
negative('F3-dispatch-task-contract','Dispatch contract defaults to current Gate contract',formal,x=>{
 x.orchestration_chain.chain[2].dispatch.task_contract_ref=link('unrelated-module-contract');eligible(x);
});
test('F3-role-contract','Explicit exact role-specific Task Contract is supported',()=>{
 const x=formal(),s=x.stages.find(s=>s.agent==='module-architect');
 s.orchestration_binding.task_contract_ref=link('role-module-contract');
 bindChain(x);eligible(x);ready(x);
 x.orchestration_chain.chain.find(i=>i.dispatch.target_role==='module-architect').dispatch.task_contract_ref=x.task_contract_ref;
 eligible(x);denied(x);
});
for(const role of Object.keys(types)){
 // Remove the downstream Module for SA-only artifact mutations, so an independent
 // chain can remain internally eligible while missing the Gate's current SA ref.
 const make=role==='solution-architect'?()=>bindChain(architectures('system',1)):formal;
 const sample=make(),index=sample.stages.findIndex(s=>s.agent===role);
 for(let artifactIndex=0;artifactIndex<sample.stages[index].artifacts.length;artifactIndex++)for(const drift of ['missing','sha']){
  negative(`F3-${role}-artifact-${artifactIndex}-${drift}`,'Each exact required artifact must appear in corresponding Handoff',make,x=>{
   const refs=x.orchestration_chain.chain[index].handoff.artifact_refs;
   if(drift==='missing')refs.splice(artifactIndex,1);else refs[artifactIndex].ref=refs[artifactIndex].ref.replace(A,B);
   eligible(x);
  });
 }
}
test('F3-same-role-complete','Two UI stages with distinct exact Dispatches succeed',()=>{
 const x=bindChain(uiTask('L1','legacy',2));eligible(x);ready(x);
 // Deliberately cover both stages' refs in one Handoff: artifact union alone is insufficient.
 const first=x.orchestration_chain.chain[0];first.handoff.artifact_refs.push(...x.orchestration_chain.chain[1].handoff.artifact_refs);
 x.stages[1].orchestration_binding=clone(x.stages[0].orchestration_binding);eligible(x);denied(x);
});
negative('F3-same-role-wrong-handoff','Same role different execution still needs its own exact Handoff',
 ()=>bindChain(uiTask('L1','legacy',2)),x=>{
  x.orchestration_chain.chain[1].handoff.artifact_refs=clone(x.orchestration_chain.chain[0].handoff.artifact_refs);eligible(x);
 });
test('F3-extra-optional-artifact','Optional artifact does not become mandatory Handoff evidence',()=>{
 const x=formal();const s=x.stages[0];s.artifacts.push({...artifact('note','docs/optional.md'),required:false});ready(refresh(x));
});
test('F3-nonformal-compatible','Nonformal task acquires no chain or binding obligation',()=>{
 const x=formal();delete x.orchestration_validation_required;delete x.orchestration_chain;delete x.owner_live_evidence_review_ref;
 for(const s of x.stages)delete s.orchestration_binding;ready(x);
});

// F4: level enum and high-fidelity source inheritance apply to every required UI.
for(const mode of ['legacy','staged']){
 for(const level of ['L1','L2','L3'])test(`F4-${mode}-${level}-complete`,'Complete selected UI scope succeeds',()=>ready(uiTask(level,mode)));
 for(const level of [undefined,'','L0','L4','l2',2])negative(`F4-${mode}-enum-${String(level)}`,'UI level is explicitly L1/L2/L3',
  ()=>uiTask('L1',mode),x=>{if(level===undefined)delete x.ui_level;else x.ui_level=level;});
 for(const level of ['L2','L3'])negative(`F4-${mode}-${level}-concept-only`,'Concept alone cannot satisfy high fidelity',
  ()=>uiTask(level,mode),x=>x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>['ui-design','ui-concept'].includes(a.type)));
 negative(`F4-${mode}-L3-no-interaction`,'L3 inherits source and additionally requires real interaction evidence',
  ()=>uiTask('L3',mode),x=>x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>a.type!=='interactive-prototype'));
 for(const value of ['NOT_RUN','FAIL',undefined])negative(`F4-${mode}-interaction-${value}`,'Interaction declaration alone cannot pass L3',
  ()=>uiTask('L3',mode),x=>x.stages[0].artifacts.find(a=>a.type==='interactive-prototype').interaction_test_status=value);
}
for(const level of ['L2','L3']){
 test(`F4-legacy-${level}-figma`,'Versioned valid Figma source is a supported high-fidelity source',()=>{
  const x=uiTask(level),s=x.stages[0];s.artifacts=s.artifacts.filter(a=>a.type!=='ui-prototype');
  // In L3 make the separate interaction source non-high-fidelity to prove Figma supplies fidelity.
  const p=s.artifacts.find(a=>a.type==='interactive-prototype');if(p)delete p.fidelity;
  s.artifacts.push({...artifact('figma-design','docs/figma.json'),tool:'figma',
   figma_url:'https://www.figma.com/design/synthetic18/design',design_version:'version-18'});ready(refresh(x));
 });
 test(`F4-legacy-${level}-combined`,'One high-fidelity editable interactive source can meet both requirements',()=>{
  const x=uiTask('L3');x.ui_level=level;x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>a.type!=='ui-prototype');ready(refresh(x));
 });
 for(const value of [undefined,false])negative(`F4-legacy-${level}-editable-${value}`,'UI prototype must be explicitly editable',
  ()=>uiTask(level),x=>{
   const s=x.stages[0];s.artifacts.find(a=>a.type==='ui-prototype').editable_source=value;
   const p=s.artifacts.find(a=>a.type==='interactive-prototype');if(p)delete p.fidelity;
  });
 for(const [label,mutate] of [
  ['missing-fidelity',p=>delete p.fidelity],['low-fidelity',p=>p.fidelity='low'],
  ['missing-editable',p=>delete p.editable_source],['false-editable',p=>p.editable_source=false]]){
  negative(`F4-combined-${level}-${label}`,'Combined interactive source needs high fidelity and editability',()=>{
   const x=uiTask('L3');x.ui_level=level;x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>a.type!=='ui-prototype');return refresh(x);
  },x=>mutate(x.stages[0].artifacts.find(a=>a.type==='interactive-prototype')));
 }
}
for(const field of ['tool','figma_url','design_version'])negative(`F4-legacy-figma-${field}`,'Invalid Figma metadata cannot count as a high-fidelity source',()=>{
 const x=uiTask('L2');x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>a.type!=='ui-prototype');
 x.stages[0].artifacts.push({...artifact('figma-design','docs/figma.json'),tool:'figma',
  figma_url:'https://www.figma.com/design/synthetic18/design',design_version:'version-18'});return refresh(x);
},x=>{const f=x.stages[0].artifacts.find(a=>a.type==='figma-design');
 if(field==='tool')f.tool='html';else if(field==='figma_url')f.figma_url='https://example.test/figma';else delete f.design_version;});
for(const mode of ['legacy','staged'])for(const target of [1,2])test(`F4-${mode}-later-stage-${target}`,'Every required UI stage must meet level-specific evidence in any order',()=>{
 const x=uiTask('L2',mode,3);ready(x);x.stages[target].artifacts=x.stages[target].artifacts.filter(a=>['ui-design','ui-concept'].includes(a.type));
 for(const order of permutations(x.stages)){x.stages=order;refresh(x);denied(x);}
});
const stagedMutations=[
 ['confirmation',x=>delete x.stages[0].figma_confirmation],
 ['confirmation-sha',x=>x.stages[0].figma_confirmation.design_ref=pin('docs/UI0/figma.json',B)],
 ['confirmation-version',x=>x.stages[0].figma_confirmation.design_version='old'],
 ['confirmation-owner',x=>delete x.stages[0].figma_confirmation.owner_confirmation_ref],
 ['authorization',x=>delete x.frontend_prototype_authorization_ref],
 ['stack',x=>delete x.frontend_stack_ref],
 ['runtime',x=>x.stages[0].artifacts.at(-1).runtime='figma'],
 ['runtime-stack',x=>x.stages[0].artifacts.at(-1).frontend_stack_ref=pin('docs/frontend.md',B)],
 ['runtime-figma',x=>x.stages[0].artifacts.at(-1).figma_design_ref=pin('docs/UI0/figma.json',B)]
];
for(const [name,mutate] of stagedMutations)negative(`F4-staged-${name}`,'Staged confirmation, authorization and approved frontend remain mandatory',()=>uiTask('L3','staged'),mutate);
for(const level of ['L1','L2'])negative(`F4-staged-downgrade-${level}`,'Lower level cannot hide required frontend prototype',
 ()=>uiTask('L3','staged'),x=>{x.ui_level=level;delete x.frontend_stack_ref;delete x.frontend_prototype_authorization_ref;delete x.stages[0].figma_confirmation;});

const failed=cases.filter(t=>t.status==='FAIL');
console.log(JSON.stringify({suite:'Issue18 independent Design Gate integrity / G01 regression',
 status:failed.length?'FAIL':'PASS',count:cases.length,passed:cases.length-failed.length,failed:failed.length,
 verification_boundary:'SYNTHETIC_METADATA_ONLY',source_baseline:'8a1fa8142c2a7304f8c5f2978fa557437a8942f6',
 runtime:{node:process.version,platform:process.platform,arch:process.arch},
 real_runtime_dispatch:'NOT_RUN',real_figma_execution:'NOT_RUN',owner_acceptance:'NOT_RUN',cases},null,2));
if(failed.length)process.exitCode=1;
