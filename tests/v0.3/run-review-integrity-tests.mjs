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

// Follow-up to fresh-context Review of 36f1030. The original 236 registered
// cases above remain unchanged; these fixtures exercise cross-checker inputs
// that complete artifact coverage alone cannot establish.
function multipleSystemChain(providerFirst=false){
 const x=architectures('both',1),support=stage('SUPPORT','solution-architect');
 x.stages.splice(providerFirst?1:0,0,support);
 bindChain(x);
 const chain=x.orchestration_chain.chain;
 const provider=chain.find(i=>i.handoff.artifact_refs.some(a=>a.kind==='solution-architecture'&&a.ref===x.system_baseline_ref));
 const module=chain.find(i=>i.dispatch.target_role==='module-architect');
 if(!module.dispatch.depends_on_dispatch_ids.includes(provider.dispatch.dispatch_id))
  module.dispatch.depends_on_dispatch_ids.push(provider.dispatch.dispatch_id);
 return x;
}
// Collect both entrances before asserting, so an unfixed Gate cannot short-circuit
// the recorded G01 result. Keep this separate from the frozen original helpers.
function followupOutcome(x,expected){
 const chain=evaluateOrchestrationChain(x.orchestration_chain),gate=evaluateDesignGate(x);
 const action=evaluateActionPreflight(preflight(x));
 const actual=JSON.stringify({chain,gate,action});
 if(expected==='READY'){
  assert.equal(chain.eligible,true,actual);assert.equal(gate.status,'DESIGN_READY',actual);
  assert.equal(gate.coding_authorized,true,actual);assert.equal(action.decision,'READY',actual);
 }else{
  assert(['BLOCKED','NEEDS_REFINEMENT'].includes(gate.status),actual);
  assert.equal(gate.coding_authorized,false,actual);assert.equal(action.decision,'BLOCKED',actual);
 }
 return {chain,gate,action};
}
for(const providerFirst of [false,true])test(`F2-followup-multi-sa-${providerFirst?'provider-first':'support-first'}`,
 'Formal multi-SA chain resolves the unique exact baseline provider regardless of SA order',()=>{
  followupOutcome(multipleSystemChain(providerFirst),'READY');
 });
for(const [label,mutate] of [
 ['missing',x=>x.stages.find(s=>s.agent==='module-architect').depends_on=[]],
 ['unrelated',x=>x.stages.find(s=>s.agent==='module-architect').depends_on=['SUPPORT']]]){
 for(const providerFirst of [false,true])test(`F2-followup-provider-dependency-${label}-${providerFirst}`,
  'Module requires the actual provider stage dependency in either order',()=>{
   const x=multipleSystemChain(providerFirst);followupOutcome(x,'READY');mutate(x);followupOutcome(x,'BLOCKED');
 });
}
test('F2-followup-dispatch-provider-dependency','Module Dispatch directly depends on actual provider, not only unrelated prior SA',()=>{
 const x=multipleSystemChain(true);followupOutcome(x,'READY');
 const provider=x.orchestration_chain.chain.find(i=>i.handoff.artifact_refs.some(a=>a.kind==='solution-architecture'&&a.ref===x.system_baseline_ref));
 const module=x.orchestration_chain.chain.find(i=>i.dispatch.target_role==='module-architect');
 module.dispatch.depends_on_dispatch_ids=module.dispatch.depends_on_dispatch_ids.filter(id=>id!==provider.dispatch.dispatch_id);
 followupOutcome(x,'BLOCKED');
});
test('F2-followup-ambiguous-handoff-provider','Two prior SA Handoffs cannot implicitly provide one approved exact baseline',()=>{
 const x=multipleSystemChain(true);followupOutcome(x,'READY');
 const chain=x.orchestration_chain.chain;
 const provider=chain.find(i=>i.handoff.artifact_refs.some(a=>a.kind==='solution-architecture'&&a.ref===x.system_baseline_ref));
 const support=chain.find(i=>i!==provider&&i.dispatch.target_role==='solution-architect');
 support.handoff.artifact_refs.push(clone(provider.handoff.artifact_refs.find(a=>a.kind==='solution-architecture')));
 const actual=followupOutcome(x,'BLOCKED');assert.equal(actual.chain.eligible,false,JSON.stringify(actual));
});
for(const [label,factory,field] of [
 ['module',()=>bindChain(architectures('module',1)),'system_baseline_ref'],
 ['ui',()=>bindChain(uiTask()),'ui_profile_ref']]){
 test(`F3-followup-${label}-current-input`,'Formal role Dispatch consumes the current approved exact input',()=>{
  followupOutcome(factory(),'READY');
 });
 for(const drift of ['old-sha','missing'])test(`F3-followup-${label}-${drift}`,
  'Current Task and exact Handoff cannot conceal a stale or absent dispatched design input',()=>{
   const x=factory();followupOutcome(x,'READY');
   const d=x.orchestration_chain.chain[0].dispatch;
   if(drift==='missing')delete d[field];else d[field]=d[field].replace(A,B);
   followupOutcome(x,'BLOCKED');
  });
}
for(const [label,mutate] of [
 ['missing-status',d=>delete d.system_baseline_status],
 ['unapproved-status',d=>d.system_baseline_status='PROPOSED'],
 ['missing-approval',d=>delete d.system_baseline_owner_approval_ref],
 ['different-approval',d=>d.system_baseline_owner_approval_ref=link('unrelated-system-approval')]
])test(`F3-followup-module-${label}`,'Formal Module Dispatch baseline approval inputs match the Gate approval',()=>{
 const x=bindChain(architectures('module',1));followupOutcome(x,'READY');
 mutate(x.orchestration_chain.chain[0].dispatch);followupOutcome(x,'BLOCKED');
});

// R3: a declared SYSTEM -> Module edge must agree with the bound runtime chain.
// Keep pure Module-only reuse of a genuinely external approved baseline legal.
test('F2-r3-system-before-module','Bound SYSTEM completion precedes Module execution on the formal both path',()=>{
 followupOutcome(bindChain(architectures('both',1)),'READY');
});
test('F2-r3-module-before-system','A later in-task SYSTEM provider cannot be treated as an external approved baseline',()=>{
 const x=architectures('both',1);x.stages.reverse();bindChain(x);
 assert.deepEqual(x.stages.find(s=>s.agent==='module-architect').depends_on,['SYSTEM']);
 assert.equal(x.orchestration_chain.chain[0].dispatch.target_role,'module-architect');
 followupOutcome(x,'BLOCKED');
});
test('F2-r3-stage-array-order-independent','Changing stage metadata order does not invalidate a correct chronological runtime chain',()=>{
 const x=bindChain(architectures('both',1));x.stages.reverse();refresh(x);
 followupOutcome(x,'READY');
});
test('F2-r3-forward-dependency-id','A forward Dispatch ID cannot prove the provider already completed',()=>{
 const x=architectures('both',1);x.stages.reverse();bindChain(x);
 x.orchestration_chain.chain[0].dispatch.depends_on_dispatch_ids=[x.orchestration_chain.chain[1].dispatch.dispatch_id];
 followupOutcome(x,'BLOCKED');
});
test('F2-r3-wrong-runtime-provider','A prior unrelated SA Dispatch cannot stand in for the stage-bound SYSTEM source',()=>{
 const x=multipleSystemChain(true);followupOutcome(x,'READY');
 const provider=x.stages.find(s=>s.id==='SYSTEM').orchestration_binding.dispatch_id;
 const module=x.orchestration_chain.chain.find(i=>i.dispatch.target_role==='module-architect');
 module.dispatch.depends_on_dispatch_ids=module.dispatch.depends_on_dispatch_ids.filter(id=>id!==provider);
 followupOutcome(x,'BLOCKED');
});
test('F2-r3-wrong-stage-provider','A correct runtime chain cannot repair a Module stage declaring the wrong SYSTEM source',()=>{
 const x=multipleSystemChain(true);followupOutcome(x,'READY');
 x.stages.find(s=>s.agent==='module-architect').depends_on=['SUPPORT'];
 followupOutcome(x,'BLOCKED');
});
test('F2-r3-provider-after-module-with-support','An unrelated earlier SA does not make the later actual provider optional',()=>{
 const x=architectures('both',1),support=stage('SUPPORT','solution-architect');
 x.stages=[support,x.stages[1],x.stages[0]];bindChain(x);
 followupOutcome(x,'BLOCKED');
});
test('F2-r3-module-only-external-baseline','A pure Module-only formal task can still consume its approved external baseline',()=>{
 const x=bindChain(architectures('module',1));
 assert.equal(x.stages.some(s=>s.agent==='solution-architect'),false);
 followupOutcome(x,'READY');
});

// R4: every declared required professional-stage dependency must be reflected
// by actual prior execution and a direct or transitive Dispatch path. Capture
// both public entrances even if malformed formal evidence makes one throw.
function r4Outcome(x,expected){
 const actual={};
 for(const [name,evaluate] of [['gate',()=>evaluateDesignGate(x)],['action',()=>evaluateActionPreflight(preflight(x))]]){
  try{actual[name]=evaluate();}catch(error){actual[name]={threw:error.name,message:error.message};}
 }
 const message=JSON.stringify(actual);
 assert.equal(actual.gate.threw,undefined,message);assert.equal(actual.action.threw,undefined,message);
 assert.equal(actual.gate.status,expected==='READY'?'DESIGN_READY':'BLOCKED',message);
 assert.equal(actual.gate.coding_authorized,expected==='READY',message);
 assert.equal(actual.action.decision,expected,message);
 return actual;
}
function r4CrossRole(source,target){
 const roles=[source,target];
 const x=roles.includes('module-architect')?architectures('module',1):
  roles.includes('solution-architect')?architectures('system',1):base();
 const stages=new Map(x.stages.map(s=>[s.agent,s]));
 if(roles.includes('ui-ux-designer')){
  const u=uiTask();for(const [k,v] of Object.entries(u))if(k.startsWith('ui_'))x[k]=v;
  x.impacts.push('ui');stages.set('ui-ux-designer',clone(u.stages[0]));
 }
 if(roles.includes('product-analyst')){
  x.product_scope='define';const pa=stage('PRODUCT','product-analyst');pa.artifacts[1].ref=x.feature_spec_ref;
  stages.set('product-analyst',pa);
 }
 x.stages=roles.map(role=>stages.get(role));x.stages[1].depends_on=[x.stages[0].id];return refresh(x);
}
for(const [source,target] of [
 ['product-analyst','solution-architect'],['product-analyst','module-architect'],['product-analyst','ui-ux-designer'],
 ['solution-architect','ui-ux-designer'],['ui-ux-designer','solution-architect'],
 ['module-architect','ui-ux-designer'],['ui-ux-designer','module-architect']]){
 test(`F3-r4-${source}-to-${target}-ordered`,'Declared cross-role prerequisite executes before its consumer',()=>{
  r4Outcome(bindChain(r4CrossRole(source,target)),'READY');
 });
 test(`F3-r4-${source}-to-${target}-reversed`,'Declared cross-role prerequisite cannot execute after its consumer',()=>{
  const x=r4CrossRole(source,target);x.stages.reverse();bindChain(x);r4Outcome(x,'BLOCKED');
 });
}
function r4SameRole(role){
 const x=role==='ui-ux-designer'?uiTask('L1','legacy',2):role==='solution-architect'?architectures('system',2):
  role==='module-architect'?architectures('module',2):base();
 if(role==='product-analyst'){
  x.product_scope='define';x.stages=[stage('PA0',role),stage('PA1',role)];
  for(const s of x.stages)s.artifacts.find(a=>a.type==='feature-specification').ref=x.feature_spec_ref;
 }
 x.stages[1].depends_on=[x.stages[0].id];return refresh(x);
}
for(const role of Object.keys(types))for(const reversed of [false,true])test(`F3-r4-${role}-same-role-${reversed}`,
 'Two same-role stages retain their actual declared prerequisite direction',()=>{
  const x=r4SameRole(role);if(reversed)x.stages.reverse();bindChain(x);r4Outcome(x,reversed?'BLOCKED':'READY');
 });
test('F3-r4-all-roles-transitive-correct','PA prerequisite may reach UI through intervening SA and Module Dispatches',()=>{
 const x=formal();
 assert.deepEqual(x.stages.at(-1).depends_on,['PRODUCT']);
 assert.deepEqual(x.orchestration_chain.chain.at(-1).dispatch.depends_on_dispatch_ids,[x.orchestration_chain.chain[2].dispatch.dispatch_id]);
 r4Outcome(x,'READY');
});
test('F3-r4-product-last','Complete Task/ref bindings cannot conceal PA execution after all dependent designs',()=>{
 const x=formal(),pa=x.stages.shift();x.stages.push(pa);bindChain(x);r4Outcome(x,'BLOCKED');
});
test('F3-r4-transitive-same-role-and-metadata-order','Same-role declared dependency accepts a transitive runtime path in every stage list order',()=>{
 const x=uiTask('L1','legacy',3);x.stages[1].depends_on=[x.stages[0].id];x.stages[2].depends_on=[x.stages[0].id];bindChain(x);
 for(const order of permutations(x.stages)){x.stages=order;refresh(x);r4Outcome(x,'READY');}
});
test('F3-r4-unreachable-dependency','Earlier timestamp alone cannot replace a reachable declared Dispatch dependency',()=>{
 const x=uiTask('L1','legacy',3);x.stages[1].depends_on=[x.stages[0].id];x.stages[2].depends_on=[x.stages[0].id];bindChain(x);
 r4Outcome(x,'READY');x.orchestration_chain.chain[1].dispatch.depends_on_dispatch_ids=[];
 r4Outcome(x,'BLOCKED');
});
for(const [label,value] of [
 ['missing',undefined],['null',null],['string','missing formal evidence'],['number',42],
 ['empty-array',[]],['empty-object',{}],['empty-chain',{chain:[]}]])test(`F3-r4-formal-chain-${label}`,
 'Missing or malformed formal chain reports BLOCKED at both public entrances without throwing',()=>{
  const x=formal();r4Outcome(x,'READY');
  if(value===undefined)delete x.orchestration_chain;else x.orchestration_chain=clone(value);
  r4Outcome(x,'BLOCKED');
 });
for(const [label,mutate] of [
 ['missing',s=>delete s.orchestration_binding],['null',s=>s.orchestration_binding=null],
 ['missing-dispatch',s=>delete s.orchestration_binding.dispatch_id]])test(`F3-r4-prerequisite-binding-${label}`,
 'A required prerequisite without a usable execution binding reports BLOCKED without throwing',()=>{
  const x=formal();r4Outcome(x,'READY');mutate(x.stages.find(s=>s.id==='PRODUCT'));r4Outcome(x,'BLOCKED');
 });

// R5: professional prerequisites remain prerequisites across nonprofessional
// coordination nodes. Those nodes are stage evidence, not fake specialists.
function r5Bridge(x,sourceIds,targetIds,hops=1){
 let previous=sourceIds;
 for(let i=0;i<hops;i++){
  const id=`COORDINATE${i}`;
  x.stages.push({id,agent:i%2?'context-coordinator':'master-orchestrator',required:true,status:'COMPLETED',
   depends_on:previous,artifacts:[artifact('coordination-record',`docs/${id}.md`)]});
  previous=[id];
 }
 for(const s of x.stages.filter(s=>targetIds.includes(s.id)))
  s.depends_on=[...s.depends_on.filter(id=>!sourceIds.includes(id)),...previous];
 return refresh(x);
}
function r5BindProfessionals(x,lateId){
 const all=x.stages,professionals=all.filter(s=>Object.hasOwn(types,s.agent));
 if(lateId){const i=professionals.findIndex(s=>s.id===lateId);professionals.push(...professionals.splice(i,1));}
 x.stages=professionals;bindChain(x);x.stages=[...professionals,...all.filter(s=>!Object.hasOwn(types,s.agent))];
 for(const s of x.stages.filter(s=>!Object.hasOwn(types,s.agent)))assert.equal(s.orchestration_binding,undefined);
 return refresh(x);
}
function r5Fixture(kind,hops){
 if(kind==='all-roles')return r5Bridge(formal(),['PRODUCT'],['SYSTEM','UI0'],hops);
 if(kind==='cross-role')return r5Bridge(r4CrossRole('solution-architect','ui-ux-designer'),['SYSTEM0'],['UI0'],hops);
 return r5Bridge(uiTask('L1','legacy',2),['UI0'],['UI1'],hops);
}
for(const kind of ['all-roles','cross-role','same-role'])for(const hops of [1,2])for(const late of [false,true])
 test(`F3-r5-${kind}-${hops}-${late?'ancestor-late':'ordered'}`,
  'Required professional ancestor across coordination nodes must really precede its consumer',()=>{
   const x=r5Fixture(kind,hops),source=kind==='all-roles'?'PRODUCT':kind==='cross-role'?'SYSTEM0':'UI0';
   r5BindProfessionals(x,late?source:undefined);r4Outcome(x,late?'BLOCKED':'READY');
  });
test('F3-r5-stage-list-order','Correct runtime path through multiple coordinator nodes survives stage metadata reordering',()=>{
 const x=r5BindProfessionals(r5Fixture('all-roles',2));
 for(const order of [[...x.stages].reverse(),[...x.stages.slice(2),...x.stages.slice(0,2)],
  [...x.stages].sort((a,b)=>a.id.localeCompare(b.id))]){x.stages=order;refresh(x);r4Outcome(x,'READY');}
});
test('F3-r5-nonformal-compatible','Nonformal coordination stages acquire no new runtime binding obligation',()=>{
 const x=r5BindProfessionals(r5Fixture('all-roles',2),'PRODUCT');
 delete x.orchestration_validation_required;delete x.orchestration_chain;
 for(const s of x.stages)delete s.orchestration_binding;r4Outcome(x,'READY');
});
for(const late of [undefined,'UI0','UI1'])test(`F3-r5-all-ancestors-${late??'ordered'}`,
 'A branching coordination dependency preserves every reachable professional ancestor',()=>{
  const x=r5Bridge(uiTask('L1','legacy',3),['UI0','UI1'],['UI2'],2);
  r5BindProfessionals(x,late);r4Outcome(x,late?'BLOCKED':'READY');
 });
test('F3-r5-ancestor-binding-missing','A professional prerequisite hidden behind a coordinator still needs its actual binding',()=>{
 const x=r5BindProfessionals(r5Fixture('all-roles',2));r4Outcome(x,'READY');
 delete x.stages.find(s=>s.id==='PRODUCT').orchestration_binding;r4Outcome(x,'BLOCKED');
});

const failed=cases.filter(t=>t.status==='FAIL');
console.log(JSON.stringify({suite:'Issue18 independent Design Gate integrity / G01 regression',
 status:failed.length?'FAIL':'PASS',count:cases.length,passed:cases.length-failed.length,failed:failed.length,
 verification_boundary:'SYNTHETIC_METADATA_ONLY',source_baseline:'8a1fa8142c2a7304f8c5f2978fa557437a8942f6',
 runtime:{node:process.version,platform:process.platform,arch:process.arch},
 real_runtime_dispatch:'NOT_RUN',real_figma_execution:'NOT_RUN',owner_acceptance:'NOT_RUN',cases},null,2));
if(failed.length)process.exitCode=1;
