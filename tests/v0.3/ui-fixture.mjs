// Synthetic test data only; never an approval, browser run or Impeccable execution.
const SHA='a'.repeat(40), pin=p=>p+'@'+SHA;
const evidence='https://example.test/issues/22#synthetic';
export function conceptEvidence(task,stage){
 const concept=stage.artifacts.find(a=>a.type==='ui-concept');
 stage.concept_confirmation={concept_ref:concept.ref,reviewer_role:'OWNER',
  reviewer_id:'test-owner',confirmation_ref:evidence};
 if(task.ui_level!=='L3')return;
 task.frontend_stack_ref=pin('frontend.md');task.frontend_prototype_authorization_ref=evidence;
 task.impeccable_skill_ref=pin('skills/impeccable/SKILL.md');
 for(const p of stage.artifacts.filter(a=>a.type==='interactive-prototype')){
  Object.assign(p,{runtime:'frontend',fidelity:'high',editable_source:true,concept_ref:concept.ref,
   frontend_stack_ref:task.frontend_stack_ref});
  stage.artifacts.push({type:'impeccable-review',ref:pin(stage.id+'-'+stage.artifacts.indexOf(p)+'-ui-review.md'),
   verified:true,evidence_ref:evidence,tool:'impeccable',skill_ref:task.impeccable_skill_ref,
   target_ref:p.ref,profile_ref:task.ui_profile_ref,status:'PASS',findings:[]});
 }
}
