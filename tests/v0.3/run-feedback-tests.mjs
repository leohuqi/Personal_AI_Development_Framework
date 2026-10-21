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
 const x=base();x.impacts=['ui'];x.ui_delivery_mode='staged';x.ui_level=level;
 x.ui_profile_ref=ref('profile.md');x.ui_profile_status='APPROVED';x.ui_profile_approved_ref=x.ui_profile_ref;
 x.ui_profile_approval_ref=link;x.frontend_stack_ref=ref('frontend.md');x.frontend_prototype_authorization_ref=link;
 const figma={...artifact('figma-design','figma-manifest.md'),tool:'figma',figma_url:'https://www.figma.com/design/example/file',design_version:'version-123'};
 x.stages=[{id:'UI',agent:'ui-ux-designer',required:true,status:'COMPLETED',depends_on:[],profile_ref:x.ui_profile_ref,
 figma_confirmation:{design_ref:figma.ref,design_version:figma.design_version,owner_confirmation_ref:link},
 artifacts:[artifact('ui-design','ui.md'),artifact('ui-concept','concept.svg'),figma,
 {...artifact('interactive-prototype','prototype.html'),runtime:'frontend',frontend_stack_ref:x.frontend_stack_ref,
 figma_design_ref:figma.ref,interaction_test_status:'PASS',editable_source:true}]}];return x;
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
check('Staged UI delivers concept, real Figma source and frontend runtime without granting coding',()=>ready(uiTask()));
check('Concept-only L1 and Figma L2 can finish their selected scope without premature frontend work',()=>{
 const x=uiTask('L1');x.stages[0].artifacts=x.stages[0].artifacts.slice(0,2);delete x.stages[0].figma_confirmation;
 delete x.frontend_stack_ref;delete x.frontend_prototype_authorization_ref;ready(x);
 const y=uiTask('L2');y.stages[0].artifacts.pop();delete y.stages[0].figma_confirmation;
 delete y.frontend_stack_ref;delete y.frontend_prototype_authorization_ref;ready(y);
});
check('Staged high fidelity rejects missing Figma, fake source or missing concept',()=>{
 for(const mutate of [x=>x.stages[0].artifacts.splice(2,1),x=>x.stages[0].artifacts[2].tool='html',
 x=>x.stages[0].artifacts[2].figma_url='https://example.test/figma',x=>delete x.stages[0].artifacts[2].design_version,
 x=>x.stages[0].artifacts.splice(1,1)]){const x=uiTask();mutate(x);blocked(x);}
});
check('Figma confirmation must bind the precise design and version before frontend readiness',()=>{
 for(const mutate of [c=>delete c.owner_confirmation_ref,c=>c.design_ref='figma-manifest.md@'+B,
 c=>c.design_version='old-version']){const x=uiTask();mutate(x.stages[0].figma_confirmation);blocked(x,'UNCONFIRMED_FIGMA_DESIGN');}
});
check('Figma click-through and generic coding approval cannot substitute for authorized frontend prototype',()=>{
 const x=uiTask();x.stages[0].artifacts[3].runtime='figma';blocked(x,'MISSING_FRONTEND_HIGH_FIDELITY_PROTOTYPE');
 const y=uiTask();delete y.frontend_prototype_authorization_ref;
 y.coding_authorization={owner_approval_ref:link,task_contract_ref:link,scope_confirmed:true};blocked(y,'MISSING_FRONTEND_PROTOTYPE_AUTHORIZATION');
});
check('Frontend must match approved stack and confirmed Figma and have actual interaction evidence',()=>{
 for(const mutate of [x=>x.frontend_stack_ref='frontend.md@main',x=>x.stages[0].artifacts[3].frontend_stack_ref='frontend.md@'+B,
 x=>x.stages[0].artifacts[3].figma_design_ref='figma-manifest.md@'+B,x=>x.stages[0].artifacts[3].interaction_test_status='NOT_RUN']){
 const x=uiTask();mutate(x);blocked(x);}
});
check('Required UI stages cannot hide invalid second staged source behind the first or waiver',()=>{
 const x=uiTask();x.stages.push({...structuredClone(x.stages[0]),id:'UI2'});ready(x);
 delete x.stages[1].figma_confirmation;blocked(x,'UNCONFIRMED_FIGMA_DESIGN:UI2');
 const y=uiTask();y.stages[0].status='WAIVED';y.stages[0].waiver={owner_approval_ref:link,reason:'Synthetic waiver cannot supply staged content'};
 blocked(y,'UNREADY_STAGED_UI');
});
check('Module consumes confirmed Figma independently of final frontend stage completion',()=>{
 const x=twoPhase(),u=uiTask();Object.assign(x,Object.fromEntries(Object.entries(u).filter(([k])=>k.startsWith('ui_')||k.startsWith('frontend_'))));
 x.impacts.push('ui');const ux=u.stages[0];ux.depends_on=['PA'];x.stages.push(ux);x.stages[1].ui_design_ref=ref('figma-manifest.md');ready(x);
 x.stages[1].ui_design_ref='figma-manifest.md@'+B;blocked(x,'MODULE_UI_DESIGN_MISMATCH');
});
check('Module may refine against confirmed middle-stage Figma without waiting for frontend prototype',()=>{
 const x=twoPhase(),u=uiTask('L2');Object.assign(x,Object.fromEntries(Object.entries(u).filter(([k])=>k.startsWith('ui_'))));
 x.impacts.push('ui');const ux=u.stages[0];ux.artifacts.pop();ux.depends_on=['PA'];x.stages.push(ux);
 x.stages[1].ui_design_ref=ref('figma-manifest.md');ready(x);
 delete ux.figma_confirmation;blocked(x,'UNCONFIRMED_FIGMA_DESIGN');
});
check('Unknown staged mode or level cannot silently fall back to the legacy UI path',()=>{
 const x=uiTask();x.ui_delivery_mode='anything';blocked(x,'INVALID_UI_DELIVERY_MODE');
 const y=uiTask();delete y.ui_level;blocked(y,'INVALID_STAGED_UI_LEVEL');
});
console.log(JSON.stringify({suite:'Owner feedback: two-phase spec and staged UI (synthetic metadata only)',status:'PASS',count:checks.length,checks,
 real_figma_execution:'NOT_RUN',real_frontend_prototype:'NOT_RUN',owner_acceptance:'NOT_RUN'},null,2));
