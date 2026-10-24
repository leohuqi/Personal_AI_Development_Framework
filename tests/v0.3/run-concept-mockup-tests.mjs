#!/usr/bin/env node
// Independent contract regressions. ALL identities, approvals, links, reports and
// SHAs below are SYNTHETIC; PASS means metadata behavior only. No app, browser,
// Impeccable execution, independent human review or Owner acceptance is claimed.
import assert from 'node:assert/strict';
import {evaluateDesignGate} from '../../lib/design-gate.mjs';
import {evaluateActionPreflight} from '../../lib/action-preflight.mjs';

const A='a'.repeat(40), B='b'.repeat(40), C='c'.repeat(40);
const ref=(name,sha=A)=>`synthetic/${name}@${sha}`;
const evidence=name=>`https://github.com/example/synthetic-padf/issues/1#${name}`;
const PROFILE=ref('profile.md'), STACK=ref('frontend-baseline.md');
const SKILL=ref('impeccable/SKILL.md',C), CONTRACT=evidence('task-contract');
const OWNER_CODING=evidence('owner-start-coding');
const clone=x=>structuredClone(x);
const results=[];
function test(id,name,run){
 try {run();results.push({id,name,status:'PASS'});}
 catch(error){results.push({id,name,status:'FAIL',error:error.message});}
}
function artifact(type,name,extra={}){
 return {type,ref:ref(name),source_revision:A,current_revision:A,verified:true,
  evidence_ref:evidence(`synthetic-${name}-report`),...extra};
}
function uiStage(id='UI',level='L3',role='OWNER'){
 const concept=artifact('ui-concept',`${id}-concept.svg`);
 const stage={id,agent:'ui-ux-designer',required:true,status:'COMPLETED',depends_on:[],
  profile_ref:PROFILE,artifacts:[artifact('ui-design',`${id}-design.md`),concept]};
 if(level!=='L1')stage.concept_confirmation={concept_ref:concept.ref,reviewer_role:role,
  reviewer_id:role==='OWNER'?'synthetic-owner':'synthetic-team-member',
  confirmation_ref:evidence(`${id}-explicit-concept-confirmation`),
  ...(role==='TEAM_MEMBER'?{delegation_ref:evidence('valid-team-ui-responsibility')}:{} )};
 if(level==='L3'){
  const mockup=artifact('interactive-prototype',`${id}-mockup.jsx`,{
   runtime:'frontend',fidelity:'high',editable_source:true,frontend_stack_ref:STACK,
   concept_ref:concept.ref,interaction_test_status:'PASS'});
  stage.artifacts.push(mockup,artifact('impeccable-review',`${id}-impeccable-report.md`,{
   tool:'impeccable',skill_ref:SKILL,target_ref:mockup.ref,profile_ref:PROFILE,status:'PASS',findings:[]}));
 }
 return stage;
}
function refreshReview(x){
 x.design_review.reviewed_refs=x.stages.filter(s=>s.required!==false).flatMap(s=>
  s.artifacts.filter(a=>a.required!==false).map(a=>a.ref));return x;
}
function fixture(level='L3',role='OWNER'){
 const x={repository:'example/synthetic-padf',context_id:'SYNTHETIC-CONCEPT-MOCKUP',task_contract_ref:CONTRACT,
  source_base_sha:A,source_head_sha:B,task_class:'M',architecture_scope:'none',
  routing_rationale:'Synthetic bounded UI task in existing approved system',
  feature_spec_ref:ref('feature.md'),impacts:['ui'],risk_flags:[],ui_level:level,
  ui_delivery_mode:'concept-mockup',ui_profile_ref:PROFILE,ui_profile_status:'APPROVED',
  ui_profile_approved_ref:PROFILE,ui_profile_approval_ref:evidence('profile-owner-approval'),
  stages:[uiStage('UI',level,role)],
  consistency_checks:[{scope:'approved-feature-profile-and-ui',status:'PASS',evidence_ref:evidence('consistency')}],
  design_review:{independent:true,mode:'DESIGN',decision:'APPROVE',evidence_ref:evidence('independent-design-review'),
   reviewed_refs:[],findings:[]},
  coding_authorization:{owner_approval_ref:OWNER_CODING,task_contract_ref:CONTRACT,scope_confirmed:true}};
 if(level==='L3')Object.assign(x,{frontend_stack_ref:STACK,
  frontend_prototype_authorization_ref:evidence('bounded-prototype-authorization'),impeccable_skill_ref:SKILL});
 return refreshReview(x);
}
const ui=x=>x.stages.find(s=>s.agent==='ui-ux-designer'&&s.required!==false);
const art=(x,type,stage=ui(x))=>stage.artifacts.find(a=>a.type===type);
function gate(x,ready){
 const before=clone(x),out=evaluateDesignGate(x);
 assert.deepEqual(x,before,'Read-only gate must preserve caller input');
 if(ready){assert.equal(out.status,'DESIGN_READY',JSON.stringify(out));assert.equal(out.coding_authorized,true);}
 else {assert.notEqual(out.status,'DESIGN_READY',JSON.stringify(out));assert.equal(out.coding_authorized,false,JSON.stringify(out));
  assert(out.reasons?.length>0,'Blocked/refinement result must explain why');}
 return out;
}
function negative(id,name,change,make=fixture){test(id,name,()=>{const x=make();change(x);gate(x,false);});}
function preflight(design){
 const subject={repository:design.repository,context_id:design.context_id,task_contract_ref:CONTRACT,
  environment:'isolated',target_ref:'main',base_sha:A,head_sha:B};
 return {schema_version:'padf.action-preflight/v1',now:'2026-10-24T08:00:00Z',action:'START_CODING',subject,
  verification:{verified:true,observed_at:'2026-10-24T07:59:00Z',valid_until:'2026-10-24T08:02:00Z',evidence_ref:evidence('live-verification')},
  authorization:{status:'APPROVED',owner_approval_ref:OWNER_CODING,action:'START_CODING',subject:clone(subject)},
  policy:{evidence_ref:evidence('current-policy'),task_class:'M',impacts:['ui'],risk_flags:[],review_required:true,qa_required:true},
  findings:[],blockers:[],design_input:design};
}
function action(x,ready){
 const before=clone(x),out=evaluateActionPreflight(x);assert.deepEqual(x,before);
 assert.equal(out.decision,ready?'READY':'BLOCKED',JSON.stringify(out));return out;
}

// CM-01: the current flow never needs Figma, including the default and alias.
for(const level of ['L1','L2','L3'])for(const mode of ['concept-mockup','staged',undefined]){
 test('CM-01',`${level} with mode ${mode??'omitted'} passes without Figma`,()=>{
  const x=fixture(level);if(mode===undefined)delete x.ui_delivery_mode;else x.ui_delivery_mode=mode;gate(x,true);
 });
}
for(const level of ['L2','L3'])test('CM-02',`${level} accepts an authorized team confirmation`,()=>gate(fixture(level,'TEAM_MEMBER'),true));
test('CM-02','L1 concept draft does not require a confirmation',()=>gate(fixture('L1'),true));
test('CM-02','A valid confirmation can be reused without asking for a new record',()=>{
 const x=fixture('L2');const confirmation=clone(ui(x).concept_confirmation);gate(x,true);gate(x,true);
 assert.deepEqual(ui(x).concept_confirmation,confirmation);
});
for(const level of ['L2','L3'])for(const mode of ['concept-mockup','staged',undefined]){
 negative('CM-03',`${level}/${mode??'omitted'} cannot omit current concept confirmation`,x=>{
  if(mode===undefined)delete x.ui_delivery_mode;else x.ui_delivery_mode=mode;delete ui(x).concept_confirmation;
 },()=>fixture(level));
}
for(const [name,change] of [
 ['stale concept',x=>ui(x).concept_confirmation.concept_ref=ref('old-concept.svg',B)],
 ['unversioned concept',x=>ui(x).concept_confirmation.concept_ref='synthetic/UI-concept.svg@main'],
 ['unknown reviewer role',x=>ui(x).concept_confirmation.reviewer_role='DESIGNER'],
 ['missing reviewer role',x=>delete ui(x).concept_confirmation.reviewer_role],
 ['missing reviewer identity',x=>delete ui(x).concept_confirmation.reviewer_id],
 ['empty reviewer identity',x=>ui(x).concept_confirmation.reviewer_id=' '],
 ['non-string reviewer identity',x=>ui(x).concept_confirmation.reviewer_id=42],
 ['missing explicit confirmation source',x=>delete ui(x).concept_confirmation.confirmation_ref],
 ['empty explicit confirmation source',x=>ui(x).concept_confirmation.confirmation_ref=' '],
 ['receipt instead of confirmation',x=>ui(x).concept_confirmation={concept_ref:art(x,'ui-concept').ref,reviewer_role:'OWNER',reviewer_id:'synthetic-owner',ack_ref:evidence('receipt-only')}],
 ])negative('CM-04',`Concept rejects ${name}`,change);
for(const [name,change] of [
 ['missing team delegation',x=>delete ui(x).concept_confirmation.delegation_ref],
 ['empty team delegation',x=>ui(x).concept_confirmation.delegation_ref=' '],
 ['material change',x=>x.material_change=true],
 ['design-system impact',x=>x.impacts.push('design-system')],
 ['design-system risk',x=>x.risk_flags.push('design-system')]
 ])negative('CM-05',`Team confirmation cannot cover ${name}`,change,()=>fixture('L3','TEAM_MEMBER'));

// CM-06: each required stage owns its selected concept and real frontend metadata.
for(const [name,change] of [
 ['missing selected concept',x=>ui(x).artifacts=ui(x).artifacts.filter(a=>a.type!=='ui-concept')],
 ['optional selected concept',x=>art(x,'ui-concept').required=false],
 ['missing UI design',x=>ui(x).artifacts=ui(x).artifacts.filter(a=>a.type!=='ui-design')],
 ['optional UI design',x=>art(x,'ui-design').required=false],
 ['missing UI stage',x=>x.stages=[]],
 ['optional UI stage',x=>ui(x).required=false],
 ['waived UI stage',x=>ui(x).status='WAIVED'],
 ['incomplete UI stage',x=>ui(x).status='PENDING'],
 ['wrong Profile',x=>ui(x).profile_ref=ref('other-profile.md')],
 ['Profile approval for another version',x=>x.ui_profile_approved_ref=ref('profile.md',B)],
 ['unapproved Profile',x=>x.ui_profile_status='PROPOSED'],
 ['missing Profile approval',x=>delete x.ui_profile_approval_ref],
 ['invalid UI level',x=>x.ui_level='L4'],
 ['missing UI level',x=>delete x.ui_level],
 ['missing stack baseline',x=>delete x.frontend_stack_ref],
 ['unversioned stack baseline',x=>x.frontend_stack_ref='synthetic/frontend-baseline.md@main'],
 ['missing bounded prototype authorization',x=>delete x.frontend_prototype_authorization_ref],
 ['empty bounded prototype authorization',x=>x.frontend_prototype_authorization_ref=' '],
 ['missing interactive Mockup',x=>ui(x).artifacts=ui(x).artifacts.filter(a=>a.type!=='interactive-prototype')],
 ['optional interactive Mockup',x=>art(x,'interactive-prototype').required=false]
 ])negative('CM-06',`L3 rejects ${name}`,change);
for(const [field,value] of [
 ['runtime',undefined],['runtime','figma'],['runtime','static'],['fidelity',undefined],['fidelity','low'],
 ['editable_source',undefined],['editable_source',false],['editable_source','true'],['interaction_test_status',undefined],
 ['interaction_test_status','NOT_RUN'],['interaction_test_status','FAIL'],
 ['frontend_stack_ref',undefined],['frontend_stack_ref',ref('other-stack.md')],
 ['concept_ref',undefined],['concept_ref',ref('other-concept.svg')],
 ['verified',false],['evidence_ref',undefined],['ref','synthetic/mockup@main'],['current_revision',B],['source_revision',B]
 ])negative('CM-07',`Mockup rejects ${field}=${value}`,x=>{
  const a=art(x,'interactive-prototype');if(value===undefined)delete a[field];else a[field]=value;
 });
for(const level of ['L1','L2'])negative('CM-08',`${level} cannot hide a required runnable frontend below L3`,x=>{
 ui(x).artifacts.push(artifact('interactive-prototype',`${level}-unauthorized.jsx`,{
  runtime:'frontend',fidelity:'high',editable_source:true,frontend_stack_ref:STACK,
  concept_ref:art(x,'ui-concept').ref,interaction_test_status:'PASS'}));
},()=>fixture(level));

// CM-09: report status never replaces tool, Skill, version, evidence or findings.
for(const [name,change] of [
 ['missing pinned Skill',x=>delete x.impeccable_skill_ref],
 ['Skill name only',x=>x.impeccable_skill_ref='impeccable'],
 ['latest Skill',x=>x.impeccable_skill_ref='impeccable@latest'],
 ['missing report',x=>ui(x).artifacts=ui(x).artifacts.filter(a=>a.type!=='impeccable-review')],
 ['optional report',x=>art(x,'impeccable-review').required=false]
 ])negative('CM-09',`Impeccable rejects ${name}`,change);
for(const [field,value] of [
 ['tool',undefined],['tool','other-audit'],['skill_ref',undefined],['skill_ref',ref('impeccable/SKILL.md',B)],
 ['target_ref',undefined],['target_ref',ref('old-mockup.jsx',B)],['profile_ref',undefined],
 ['profile_ref',ref('other-profile.md')],['status',undefined],['status','NOT_RUN'],['status','FAIL'],
 ['verified',false],['evidence_ref',undefined],['ref','synthetic/report@main'],['current_revision',B],['source_revision',B],
 ['findings',undefined],['findings',null],['findings',{}],['findings',[{severity:'P4',status:'OPEN'}]],
 ['findings',[{severity:'P1'}]],['findings',[{severity:'P1',status:' '}]],['findings',[null]]
 ])negative('CM-10',`Report rejects ${field}=${JSON.stringify(value)}`,x=>{
  const a=art(x,'impeccable-review');if(value===undefined)delete a[field];else a[field]=value;
 });
for(const severity of ['P0','P1'])for(const status of ['OPEN','ACCEPTED','WONT_FIX'])
 negative('CM-11',`${severity}/${status} remains blocking despite report PASS`,x=>
  art(x,'impeccable-review').findings=[{id:'SYNTHETIC-F1',severity,status,
   owner_risk_acceptance_ref:evidence('risk-acceptance'),acceptance_conditions:'Synthetic accepted condition'}]);
negative('CM-11','Open P2 cannot be hidden by report PASS',x=>
 art(x,'impeccable-review').findings=[{id:'SYNTHETIC-P2',severity:'P2',status:'OPEN'}]);
function acceptedP2(){const x=fixture();art(x,'impeccable-review').findings=[{
 id:'SYNTHETIC-P2',severity:'P2',status:'ACCEPTED',owner_risk_acceptance_ref:evidence('item-specific-owner-p2'),
 acceptance_conditions:'Synthetic bounded condition recorded for this finding'}];return x;}
test('CM-12','Individually Owner accepted P2 with conditions passes',()=>gate(acceptedP2(),true));
for(const field of ['owner_risk_acceptance_ref','acceptance_conditions'])
 negative('CM-12',`Accepted P2 still needs ${field}`,x=>delete art(x,'impeccable-review').findings[0][field],acceptedP2);
for(const severity of ['P0','P1','P2'])test('CM-12',`Fixed ${severity} can pass`,()=>{
 const x=fixture();art(x,'impeccable-review').findings=[{id:'SYNTHETIC-FIXED',severity,status:'FIXED'}];gate(x,true);
});
test('CM-12','Open P3 can be tracked',()=>{
 const x=fixture();art(x,'impeccable-review').findings=[{id:'SYNTHETIC-P3',severity:'P3',status:'OPEN'}];gate(x,true);
});

// CM-13: multiple required stages and multiple Mockups are all checked, in any order.
function multiple(){const x=fixture();x.stages.push(uiStage('SECOND','L3','TEAM_MEMBER'));return refreshReview(x);}
for(const reverse of [false,true]){
 const make=()=>{const x=multiple();if(reverse)x.stages.reverse();return x;};
 test('CM-13',`Two complete required UI stages pass (reverse=${reverse})`,()=>gate(make(),true));
 for(const [name,change] of [
  ['concept',s=>s.artifacts=s.artifacts.filter(a=>a.type!=='ui-concept')],
  ['confirmation',s=>delete s.concept_confirmation],
  ['design',s=>s.artifacts=s.artifacts.filter(a=>a.type!=='ui-design')],
  ['Mockup',s=>s.artifacts=s.artifacts.filter(a=>a.type!=='interactive-prototype')],
  ['report',s=>s.artifacts=s.artifacts.filter(a=>a.type!=='impeccable-review')],
  ['Profile',s=>s.profile_ref=ref('other-profile.md')],
  ['completion',s=>s.status='PENDING']
 ])negative('CM-13',`SECOND ${name} is mandatory regardless of order (reverse=${reverse})`,x=>
  change(x.stages.find(s=>s.id==='SECOND')),make);
}
function twoMockups(){const x=fixture(),s=ui(x);s.artifacts.push(artifact('interactive-prototype','second-mockup.jsx',{
 runtime:'frontend',fidelity:'high',editable_source:true,frontend_stack_ref:STACK,
 concept_ref:art(x,'ui-concept').ref,interaction_test_status:'PASS'}),
 artifact('impeccable-review','second-report.md',{tool:'impeccable',skill_ref:SKILL,
  target_ref:ref('second-mockup.jsx'),profile_ref:PROFILE,status:'PASS',findings:[]}));return refreshReview(x);}
test('CM-14','Each of two Mockups can have its own current report',()=>gate(twoMockups(),true));
negative('CM-14','First report cannot cover an unreviewed second Mockup',x=>{
 ui(x).artifacts=ui(x).artifacts.filter(a=>a.ref!==ref('second-report.md'));
},twoMockups);
negative('CM-14','Second Mockup must match the approved stack too',x=>{
 ui(x).artifacts.find(a=>a.ref===ref('second-mockup.jsx')).frontend_stack_ref=ref('different-stack.md');
},twoMockups);

// CM-15: optional/N/A evidence cannot fill a required stage's missing evidence.
for(const type of ['ui-design','ui-concept','interactive-prototype','impeccable-review'])
 negative('CM-15',`Optional stage cannot replace required ${type}`,x=>{
  const optional=clone(ui(x));optional.id='OPTIONAL';optional.required=false;x.stages.push(optional);
  ui(x).artifacts=ui(x).artifacts.filter(a=>a.type!==type);
 });
for(const mode of ['concept-mockup','staged',undefined])
 negative('CM-15',`${mode??'omitted'} cannot use optional report evidence`,x=>{
  if(mode===undefined)delete x.ui_delivery_mode;else x.ui_delivery_mode=mode;
  art(x,'impeccable-review').required=false;
 });

// CM-16: historical Figma attachments grant neither confirmation nor L3 completion.
function withFigma(){const x=fixture();const s=ui(x);s.figma_design_ref=ref('old-figma.md');
 s.figma_confirmation={figma_design_ref:s.figma_design_ref,owner_approval_ref:evidence('old-figma-approval')};
 s.artifacts.push(artifact('figma-design','old-figma.md'));return refreshReview(x);}
test('CM-16','Optional Figma reference does not prevent a complete current flow',()=>gate(withFigma(),true));
negative('CM-16','Figma confirmation cannot replace concept confirmation',x=>delete ui(x).concept_confirmation,withFigma);
negative('CM-16','Figma design cannot replace runnable frontend',x=>{
 ui(x).artifacts=ui(x).artifacts.filter(a=>a.type!=='interactive-prototype');
},withFigma);

// CM-17: Module may consume a confirmed L1 concept before final frontend exists.
function moduleConsumer(){const x=fixture('L1');ui(x).concept_confirmation={
 concept_ref:art(x,'ui-concept').ref,reviewer_role:'OWNER',reviewer_id:'synthetic-owner',confirmation_ref:evidence('reused-concept-confirmation')};
 const baseline=ref('system.md');Object.assign(x,{product_spec_ref:ref('product.md'),architecture_scope:'module',
  system_baseline_ref:baseline,system_baseline_status:'APPROVED',system_baseline_approval_ref:evidence('system-approval'),diagram_skill_sha:C});
 const module={id:'MODULE',agent:'module-architect',required:true,status:'COMPLETED',depends_on:['UI'],
  system_baseline_ref:baseline,product_spec_ref:x.product_spec_ref,ui_design_ref:art(x,'ui-concept').ref,
  spec_handoff_ref:evidence('module-spec-handoff'),artifacts:[
   artifact('module-design','module.md'),artifact('module-code-structure','module-code.md'),
   artifact('module-interface-contract','module-interface.md'),
   artifact('module-component-diagram','module-diagram.svg',{generator:'diagram-design',generator_sha:C,render_status:'PASS'}),
   artifact('feature-specification','feature.md')]};
 x.stages.push(module);return refreshReview(x);}
test('CM-17','Module consumes confirmed concept without final frontend',()=>gate(moduleConsumer(),true));
negative('CM-17','Module consumption requires confirmation even at L1',x=>delete ui(x).concept_confirmation,moduleConsumer);
negative('CM-17','Module cannot consume a stale concept',x=>x.stages.find(s=>s.id==='MODULE').ui_design_ref=ref('old-concept.svg'),moduleConsumer);
negative('CM-17','Module cannot consume the UI document in place of selected concept',x=>
 x.stages.find(s=>s.id==='MODULE').ui_design_ref=art(x,'ui-design').ref,moduleConsumer);

// CM-18: new UI evidence does not replace independent Review or coding authority.
test('CM-18','Design readiness alone still does not authorize coding',()=>{
 const x=fixture();delete x.coding_authorization;const out=evaluateDesignGate(x);
 assert.equal(out.status,'DESIGN_READY',JSON.stringify(out));assert.equal(out.coding_authorized,false);
});
negative('CM-18','L3 with Impeccable PASS still needs L-class independent DESIGN review',x=>{
 x.task_class='L';delete x.design_review;
});
negative('CM-18','Impeccable PASS cannot conceal independent REQUEST_CHANGES',x=>x.design_review.decision='REQUEST_CHANGES');

// CM-19: G-01 calls the same gate, even when outer findings are empty.
test('CM-19','Complete no-Figma L3 metadata passes START_CODING preflight',()=>action(preflight(fixture()),true));
for(const [name,change] of [
 ['missing confirmation',x=>delete ui(x).concept_confirmation],
 ['stale confirmation',x=>ui(x).concept_confirmation.concept_ref=ref('old-concept.svg')],
 ['missing prototype authorization',x=>delete x.frontend_prototype_authorization_ref],
 ['missing actual interaction evidence',x=>delete art(x,'interactive-prototype').evidence_ref],
 ['Impeccable NOT_RUN',x=>art(x,'impeccable-review').status='NOT_RUN'],
 ['Impeccable P1',x=>art(x,'impeccable-review').findings=[{severity:'P1',status:'OPEN'}]],
 ['Impeccable P2',x=>art(x,'impeccable-review').findings=[{severity:'P2',status:'OPEN'}]],
 ['independent REQUEST_CHANGES',x=>x.design_review.decision='REQUEST_CHANGES']
 ])test('CM-19',`START_CODING preserves inner ${name} blocker`,()=>{
  const d=fixture();change(d);gate(d,false);const x=preflight(d);assert.deepEqual(x.findings,[]);action(x,false);
 });
for(const mode of ['staged',undefined])test('CM-19',`START_CODING ${mode??'omitted mode'} cannot bypass confirmation`,()=>{
 const d=fixture();if(mode===undefined)delete d.ui_delivery_mode;else d.ui_delivery_mode=mode;
 delete ui(d).concept_confirmation;action(preflight(d),false);
});

// CM-20: a voluntary concept review still exposes known blocking findings.
// L1/L2 target the selected concept; no frontend or frontend authorization is
// implied by reviewing a concept according to the pinned Skill guidelines.
function reviewedConcept(level){const x=fixture(level);x.impeccable_skill_ref=SKILL;
 ui(x).artifacts.push(artifact('impeccable-review',`${level}-concept-review.md`,{
  tool:'impeccable',skill_ref:SKILL,target_ref:art(x,'ui-concept').ref,
  profile_ref:PROFILE,status:'PASS',findings:[]}));return refreshReview(x);}
for(const level of ['L1','L2']){
 const make=()=>reviewedConcept(level);
 test('CM-20',`${level} accepts a current concept-targeted Impeccable report`,()=>gate(make(),true));
 for(const severity of ['P0','P1','P2']){
  negative('CM-20',`${level} concept review cannot hide open ${severity}`,x=>
   art(x,'impeccable-review').findings=[{id:'SYNTHETIC-CONCEPT-FINDING',severity,status:'OPEN'}],make);
  test('CM-20',`START_CODING retains ${level} concept review ${severity} despite empty outer findings`,()=>{
   const d=make();art(d,'impeccable-review').findings=[{id:'SYNTHETIC-CONCEPT-FINDING',severity,status:'OPEN'}];
   action(preflight(d),false);
  });
 }
 test('CM-20',`${level} concept review accepts individually conditioned Owner P2 disposition`,()=>{
  const x=make();art(x,'impeccable-review').findings=clone(art(acceptedP2(),'impeccable-review').findings);gate(x,true);
 });
}

// CM-21: delivery selection cannot hide a report already supplied for the
// current task. Each control has a clean primary report AND a second current
// report. The only negative mutation is one field on that second report.
// Report placement is fixture setup, never a simultaneous fault mutation.
const attachedReviewRef=ref('additional-current-impeccable-report.md');
function additionalReview(level,placement){
 const x=level==='L3'?fixture():reviewedConcept(level);
 const target=art(x,level==='L3'?'interactive-prototype':'ui-concept').ref;
 const report=artifact('impeccable-review','additional-current-impeccable-report.md',{
  tool:'impeccable',skill_ref:SKILL,target_ref:target,profile_ref:PROFILE,status:'PASS',findings:[],
  ...(placement==='optional-report'?{required:false}:{})});
 if(placement==='optional-report')ui(x).artifacts.push(report);
 else x.stages.push({id:'ADDITIONAL-REVIEW',
  agent:placement==='optional-ui-stage'?'ui-ux-designer':'master',
  required:placement==='required-coordination-stage',status:'COMPLETED',depends_on:['UI'],
  ...(placement==='required-coordination-stage'?{}:{na_reason:'Additional advisory delivery; required UI deliverables remain in UI stage'}),
  ...(placement==='optional-ui-stage'?{profile_ref:PROFILE}:{}),artifacts:[report]});
 return refreshReview(x);
}
function additionalReport(x){return x.stages.flatMap(s=>s.artifacts??[]).find(a=>a.ref===attachedReviewRef);}
function bothEntrypoints(x,ready){
 gate(x,ready);const input=preflight(x);assert.deepEqual(input.findings,[]);
 action(input,ready);
}
for(const level of ['L1','L2','L3'])for(const placement of [
 'optional-report','optional-ui-stage','required-coordination-stage','optional-coordination-stage']){
 const make=()=>additionalReview(level,placement);
 test('CM-21',`${level}/${placement}: clean additional current report passes both gates`,()=>
  bothEntrypoints(make(),true));
 for(const severity of ['P0','P1','P2']){
  test('CM-21',`${level}/${placement}: additional ${severity} blocks both gates`,()=>{
   const x=make();additionalReport(x).findings=[{id:'SYNTHETIC-ADDITIONAL-FINDING',severity,status:'OPEN'}];
   bothEntrypoints(x,false);
  });
  test('CM-22',`${level}/${placement}: fixed additional ${severity} passes both gates`,()=>{
   const x=make();additionalReport(x).findings=[{id:'SYNTHETIC-ADDITIONAL-FINDING',severity,status:'FIXED'}];
   bothEntrypoints(x,true);
  });
 }
 for(const [name,field,value] of [
  ['failed conclusion','status','FAIL'],
  ['unexecuted conclusion','status','NOT_RUN'],
  ['missing findings','findings',undefined],
  ['non-array findings','findings',{}],
  ['malformed severity','findings',[{severity:'P4',status:'OPEN'}]],
  ['missing finding disposition','findings',[{severity:'P1'}]]
 ])test('CM-21',`${level}/${placement}: ${name} blocks both gates`,()=>{
  const x=make();if(value===undefined)delete additionalReport(x)[field];else additionalReport(x)[field]=clone(value);
  bothEntrypoints(x,false);
 });
 test('CM-22',`${level}/${placement}: individually Owner accepted P2 passes both gates`,()=>{
  const x=make();additionalReport(x).findings=clone(art(acceptedP2(),'impeccable-review').findings);
  bothEntrypoints(x,true);
 });
 for(const field of ['owner_risk_acceptance_ref','acceptance_conditions'])
  test('CM-22',`${level}/${placement}: P2 acceptance without ${field} blocks both gates`,()=>{
   const x=make();additionalReport(x).findings=clone(art(acceptedP2(),'impeccable-review').findings);
   delete additionalReport(x).findings[0][field];bothEntrypoints(x,false);
  });
 test('CM-22',`${level}/${placement}: tracked P3 passes both gates`,()=>{
  const x=make();additionalReport(x).findings=[{id:'SYNTHETIC-ADDITIONAL-P3',severity:'P3',status:'OPEN'}];
  bothEntrypoints(x,true);
 });
}

// CM-23: optional current-target reports retain their evidence/binding checks.
for(const [name,field,value] of [
 ['unverified source','verified',false],
 ['unpinned report source','ref','synthetic/additional-current-impeccable-report.md@main'],
 ['missing report evidence','evidence_ref',undefined],
 ['wrong review tool','tool','other-tool'],
 ['another Profile','profile_ref',ref('different-profile.md')],
 ['another Skill revision','skill_ref',ref('impeccable/SKILL.md',B)],
 ['missing target','target_ref',undefined],
 ['unversioned target','target_ref','synthetic/UI-mockup.jsx@main']
 ])test('CM-23',`Optional current report with ${name} blocks both gates`,()=>{
  const x=additionalReview('L3','optional-report'),report=additionalReport(x);
  if(value===undefined)delete report[field];else report[field]=value;
  bothEntrypoints(x,false);
 });

// CM-24: a report explicitly bound to an unselected immutable draft is a
// reference, not evidence about the selected current Mockup. Its own failures
// neither satisfy a missing current review nor contaminate the current result.
function unselectedDraftReview(){const x=additionalReview('L3','optional-report');
 additionalReport(x).target_ref=ref('UI-mockup.jsx',B);return x;}
test('CM-24','An optional report for another pinned draft is not a current deliverable',()=>
 bothEntrypoints(unselectedDraftReview(),true));
for(const severity of ['P0','P1','P2'])
 test('CM-24',`Unselected pinned draft ${severity} does not contaminate current gates`,()=>{
  const x=unselectedDraftReview();additionalReport(x).findings=[{id:'SYNTHETIC-OTHER-DRAFT',severity,status:'OPEN'}];
  bothEntrypoints(x,true);
 });
test('CM-24','Failed review of another pinned optional draft does not fail the current Mockup',()=>{
 const x=unselectedDraftReview();additionalReport(x).status='FAIL';bothEntrypoints(x,true);
});
test('CM-24','Another pinned draft report cannot replace the required current Mockup review',()=>{
 const x=unselectedDraftReview();ui(x).artifacts=ui(x).artifacts.filter(a=>
  a.type!=='impeccable-review'||a.ref===attachedReviewRef);bothEntrypoints(x,false);
});

const failed=results.filter(r=>r.status==='FAIL');
for(const r of failed)console.error(`FAIL ${r.id}: ${r.name}\n${r.error}`);
console.log(`Concept/Mockup synthetic metadata regressions: ${results.length-failed.length}/${results.length} PASS; ${failed.length} FAIL.`);
console.log('Actual UI/browser/Impeccable execution/Owner acceptance: NOT_RUN.');
if(failed.length)process.exitCode=1;
