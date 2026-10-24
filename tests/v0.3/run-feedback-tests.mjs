import {conceptEvidence} from './ui-fixture.mjs';
import assert from 'node:assert/strict';
import {evaluateDesignGate} from '../../lib/design-gate.mjs';
const A='a'.repeat(40), B='b'.repeat(40), C='c'.repeat(40);
const ref=p=>p+'@'+A, link='https://example.test/issues/1#comment-2';
const artifact=(type,p)=>({type,ref:ref(p),verified:true,evidence_ref:link});
const diagram=(type,p)=>({...artifact(type,p),generator:'diagram-design',generator_sha:C,render_status:'PASS'});
const base=()=>({task_class:'M',architecture_scope:'none',product_scope:'reuse',impacts:[],risk_flags:[],
 feature_spec_ref:ref('feature.md'),stages:[],review_skip_rationale:'Bounded synthetic low risk case',
 consistency_checks:[{status:'PASS',evidence_ref:link}]});
const twoPhase=()=>{
 const x=base();x.product_scope='define';x.product_spec_ref=ref('product.md');x.architecture_scope='module';
 x.impacts=['module-design'];x.diagram_skill_sha=C;x.system_baseline_ref=ref('system.md');
 x.system_baseline_status='APPROVED';x.system_baseline_approval_ref=link;
 x.stages=[{id:'PA',agent:'product-analyst',required:true,status:'COMPLETED',depends_on:[],
 artifacts:[artifact('product-definition','definition.md'),artifact('feature-specification','product.md')]},
 {id:'MODULE',agent:'module-architect',required:true,status:'COMPLETED',depends_on:['PA'],
 product_spec_ref:x.product_spec_ref,spec_handoff_ref:link,system_baseline_ref:x.system_baseline_ref,
 artifacts:[artifact('feature-specification','feature.md'),artifact('module-design','module.md'),
 artifact('module-code-structure','packages.md'),artifact('module-interface-contract','api.md'),diagram('module-component-diagram','module.svg')]}];return x;
};
const uiTask=(level='L3')=>{
 const x=base();x.impacts=['ui'];x.ui_delivery_mode='concept-mockup';x.ui_level=level;
 x.ui_profile_ref=ref('profile.md');x.ui_profile_status='APPROVED';x.ui_profile_approved_ref=x.ui_profile_ref;
 x.ui_profile_approval_ref=link;
 x.stages=[{id:'UI',agent:'ui-ux-designer',required:true,status:'COMPLETED',depends_on:[],profile_ref:x.ui_profile_ref,
 artifacts:[artifact('ui-design','ui.md'),artifact('ui-concept','concept.svg'),
 ...(level==='L3'?[{...artifact('interactive-prototype','prototype.html'),interaction_test_status:'PASS',editable_source:true}]:[])]}];
 if(level!=='L1')conceptEvidence(x,x.stages[0]);return x;
};
const checks=[];
function check(name,fn){fn();checks.push(name)}
function ready(x){const r=evaluateDesignGate(x);assert.equal(r.status,'DESIGN_READY',JSON.stringify(r.reasons));assert.equal(r.coding_authorized,false)}
function blocked(x,reason){const r=evaluateDesignGate(x);assert.equal(r.status,'BLOCKED');assert.equal(r.coding_authorized,false);if(reason)assert(r.reasons.some(s=>s.startsWith(reason)),JSON.stringify(r.reasons))}
check('PA high-level and Module detailed specs can differ and hand off without circular dependency',()=>ready(twoPhase()));
check('Catalog or high-level output cannot replace the final detailed spec',()=>{
 const x=twoPhase();x.stages[1].artifacts=x.stages[1].artifacts.filter(a=>a.type!=='feature-specification');
 x.coding_authorization={owner_approval_ref:link,task_contract_ref:link,scope_confirmed:true};blocked(x,'MISSING_IMPLEMENTATION_FEATURE_SPEC');
 const y=twoPhase();y.stages[1].artifacts[0].ref=y.product_spec_ref;blocked(y,'MISSING_IMPLEMENTATION_FEATURE_SPEC');
});
check('Stale product source, detail revision or missing Handoff blocks refinement',()=>{
 for(const mutate of [x=>x.product_spec_ref='product.md@main',x=>x.stages[1].product_spec_ref='product.md@'+B,
 x=>delete x.stages[1].spec_handoff_ref,x=>x.stages[1].artifacts[0].ref='feature.md@'+B]){const x=twoPhase();mutate(x);blocked(x)}
});
check('WAIVED, optional or unverified module details cannot bypass the new spec requirement',()=>{
 for(const mutate of [m=>{m.status='WAIVED';m.waiver={owner_approval_ref:link,reason:'Synthetic waiver is not implementation detail'}},
 m=>m.artifacts[0].verified=false,m=>{m.required=false;m.na_reason='Attempted optional detail stage'}]){
 const x=twoPhase();mutate(x.stages[1]);blocked(x);}
});
check('Simple project can combine steps with actual receipt and final detailed reference',()=>{
 const x=twoPhase();x.stages.pop();x.architecture_scope='none';x.impacts=[];
 blocked(x,'MISSING_IMPLEMENTATION_SPEC_REFINEMENT');
 x.simple_spec_refinement={rationale:'Single bounded behavior, no module impact',evidence_ref:link,feature_spec_ref:x.feature_spec_ref};ready(x);
 for(const key of ['rationale','evidence_ref','feature_spec_ref']){const y=structuredClone(x);delete y.simple_spec_refinement[key];blocked(y);}
 x.impacts=['module-design'];blocked(x); // simple records never remove the mandatory architect
});
check('Every required module refinement is checked rather than only the first',()=>{
 const x=twoPhase();x.stages.push({...structuredClone(x.stages[1]),id:'MODULE2'});ready(x);
 delete x.stages[2].spec_handoff_ref;blocked(x,'MISSING_SPEC_HANDOFF:MODULE2');
});
check('Every required module retains system baseline, package and diagram checks regardless of order',()=>{
 for(const reverse of [false,true])for(const [mutate,reason] of [
  [m=>m.system_baseline_ref='system.md@'+B,'MODULE_SYSTEM_BASELINE_MISMATCH'],
  [m=>m.artifacts=m.artifacts.filter(a=>a.type!=='module-interface-contract'),'MISSING_MODULE_ARTIFACT'],
  [m=>m.artifacts.at(-1).generator_sha=B,'DIAGRAM_SKILL_VERSION_MISMATCH']]){
  const x=twoPhase();const second={...structuredClone(x.stages[1]),id:'MODULE2'};mutate(second);x.stages.push(second);
  if(reverse)x.stages.reverse();blocked(x,reason);
 }
});
check('Confirmed concept directly supports frontend Mockup and Impeccable without Figma',()=>ready(uiTask()));
check('L1 drafts and confirmed L2 concepts need no frontend or Figma',()=>{ready(uiTask('L1'));ready(uiTask('L2'));});
check('Unconfirmed or stale concept blocks frontend and module consumption',()=>{
 for(const mutate of [c=>delete c.confirmation_ref,c=>c.concept_ref='concept.svg@'+B,
 c=>c.reviewer_role='ANYONE',c=>c.reviewer_id='']){const x=uiTask();mutate(x.stages[0].concept_confirmation);blocked(x,'UNCONFIRMED_UI_CONCEPT');}
});
check('Concept and prototype must both be real required current artifacts',()=>{
 for(const type of ['ui-concept','interactive-prototype']){const x=uiTask();x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>a.type!==type);blocked(x);}
});
check('Frontend keeps stack, prototype authorization, fidelity, concept and interaction invariants',()=>{
 for(const mutate of [x=>delete x.frontend_prototype_authorization_ref,x=>x.frontend_stack_ref='frontend.md@main',
 x=>x.stages[0].artifacts[2].runtime='figma',x=>x.stages[0].artifacts[2].concept_ref='concept.svg@'+B,
 x=>x.stages[0].artifacts[2].fidelity='low',x=>x.stages[0].artifacts[2].interaction_test_status='NOT_RUN']){const x=uiTask();mutate(x);blocked(x);}
});
check('Required frontend cannot hide under L1 or L2 labels',()=>{
 for(const level of ['L1','L2']){const x=uiTask();x.ui_level=level;blocked(x,'FRONTEND_PROTOTYPE_REQUIRES_L3');}
});
check('All required UI stages retain their own confirmation and report',()=>{
 const x=uiTask();x.stages.push({...structuredClone(x.stages[0]),id:'UI2'});ready(x);
 delete x.stages[1].concept_confirmation;blocked(x,'UNCONFIRMED_UI_CONCEPT:UI2');
 const y=uiTask();y.stages[0].status='WAIVED';y.stages[0].waiver={owner_approval_ref:link,reason:'Cannot replace current content'};blocked(y,'UNREADY_UI');
});
check('Module consumes confirmed L2 concept without waiting for final frontend',()=>{
 const x=twoPhase(),u=uiTask('L2');Object.assign(x,Object.fromEntries(Object.entries(u).filter(([k])=>k.startsWith('ui_'))));
 x.impacts.push('ui');u.stages[0].depends_on=['PA'];x.stages.push(u.stages[0]);x.stages[1].ui_design_ref=ref('concept.svg');ready(x);
 delete u.stages[0].concept_confirmation;blocked(x,'UNCONFIRMED_UI_CONCEPT');
});
check('Wrong module concept and unknown mode/level cannot bypass UI',()=>{
 const x=twoPhase(),u=uiTask('L2');Object.assign(x,Object.fromEntries(Object.entries(u).filter(([k])=>k.startsWith('ui_'))));
 x.impacts.push('ui');u.stages[0].depends_on=['PA'];x.stages.push(u.stages[0]);x.stages[1].ui_design_ref='concept.svg@'+B;blocked(x,'MODULE_UI_DESIGN_MISMATCH');
 const y=uiTask();y.ui_delivery_mode='anything';blocked(y,'INVALID_UI_DELIVERY_MODE');
 const z=uiTask();delete z.ui_level;blocked(z,'INVALID_UI_LEVEL');
});
console.log(JSON.stringify({suite:'Two-phase specs and concept-confirmation/frontend Mockup',status:'PASS',count:checks.length,checks,
 real_frontend_execution:'NOT_RUN',real_impeccable_execution:'NOT_RUN',owner_acceptance:'NOT_RUN'},null,2));
