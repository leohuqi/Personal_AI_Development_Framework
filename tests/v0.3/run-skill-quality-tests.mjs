#!/usr/bin/env node
import assert from 'node:assert/strict';
import {evaluateSkillDeliveryQuality} from '../../lib/skill-delivery-quality.mjs';
const A='a'.repeat(40),link='https://github.com/example/padf/issues/8#review';
function sheet(role='solution-architect',level='L3'){
 const p=role==='solution-architect'?'SA':role==='module-architect'?'MA':'UI';
 const criteria=Array.from({length:5},(_,i)=>({id:p+'-Q'+(i+1),score:2,evidence_ref:link}));
 return {schema_version:'padf.skill-delivery-evaluation/v1',
   context_id:'PILOT-EXPENSE',dispatch_id:'DISPATCH-01',execution_id:'RUN-01',
   skill_role:role,skill_ref:'.agents/skills/'+role+'/SKILL.md@'+A,
   artifact_manifest_ref:'docs/design-manifest.md@'+A,owner_decision:'ACCEPT',
   owner_evaluation_ref:link,unresolved_p0_p1:false,
   diagram_tool_execution_ref:link,diagram_render_verification_ref:link,
   ui_level:level,interactive_prototype_ref:link,interaction_test_ref:link,criteria};
}
let n=0;function test(name,fn){fn();n++}
function fails(s,needle){const r=evaluateSkillDeliveryQuality(s);
 assert(r.issues.includes(needle),JSON.stringify({name:needle,issues:r.issues}))}
for(const role of ['solution-architect','module-architect','ui-ux-designer'])
 test('Complete role sheet '+role,()=>assert.equal(evaluateSkillDeliveryQuality(sheet(role)).eligible,true));
test('Missing applicable quality criterion cannot pass',()=>{
 const s=sheet();s.criteria.pop();fails(s,'MISSING_CRITERION:SA-Q5')});
test('Unacceptable critical score blocks acceptance',()=>{
 const s=sheet('module-architect');s.criteria[1].score=1;fails(s,'CRITICAL_QUALITY_FAIL:MA-Q2')});
test('Unverified fabricated quality score lacks artifact evidence',()=>{
 const s=sheet('ui-ux-designer');delete s.criteria[1].evidence_ref;
 fails(s,'CRITERION_EVIDENCE_MISSING:UI-Q2')});
test('Owner signoff is separate from designer self-check',()=>{
 const s=sheet();s.owner_decision='PENDING';fails(s,'OWNER_NOT_ACCEPTED')});
test('Quality cannot pass when critical P1 is open',()=>{
 const s=sheet();s.unresolved_p0_p1=true;fails(s,'BLOCKING_FINDINGS')});
test('Missing actual external diagram invocation evidence is disqualifying',()=>{
 const s=sheet('module-architect');delete s.diagram_tool_execution_ref;
 fails(s,'ACTUAL_DIAGRAM_TOOL_PROOF_MISSING')});
test('L3 must prove prototype interactions, not static image',()=>{
 const s=sheet('ui-ux-designer');delete s.interaction_test_ref;
 fails(s,'WORKING_L3_PROTOTYPE_EVIDENCE_MISSING')});
test('L2 may mark L3 criterion N/A with reason',()=>{
 const s=sheet('ui-ux-designer','L2');
 s.criteria[3]={id:'UI-Q4',score:'N/A',na_reason:'L2 approved for single static settings page'};
 assert.equal(evaluateSkillDeliveryQuality(s).eligible,true)});
test('L3 cannot N/A its interactive evidence criterion',()=>{
 const s=sheet('ui-ux-designer');s.criteria[3]={id:'UI-Q4',score:'N/A',na_reason:'skip clicking'};
 fails(s,'CRITICAL_ITEM_NOT_APPLICABLE:UI-Q4')});
test('Unpinned artifact metadata is not accepted',()=>{
 const s=sheet();s.artifact_manifest_ref='docs/design.md@main';
 fails(s,'UNPINNED_SKILL_OR_ARTIFACTS')});
test('Cannot accidentally use Solution rubric for Module',()=>{
 const s=sheet('module-architect');s.criteria[0].id='SA-Q1';
 fails(s,'WRONG_ROLE_CRITERION:SA-Q1')});
console.log(JSON.stringify({suite:'Owner-rated Specialist Skill delivery quality METADATA ONLY',
 status:'PASS',count:n,real_owner_acceptance:'NOT_RUN',actual_design_review:'NOT_RUN'},null,2));
