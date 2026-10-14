#!/usr/bin/env node
import assert from 'node:assert/strict';
import {evaluateStageDependencies,evaluateDesignGate,routeAgents} from '../../lib/design-gate.mjs';
const A='a'.repeat(40),B='b'.repeat(40),C='c'.repeat(40);
const ref=(p,s=A)=>p+'@'+s;
const stage=(id,agent,deps=[],revision=A)=>({id,agent,required:true,depends_on:deps,status:'COMPLETED',
  artifacts:[{type:'design',ref:ref('docs/'+id+'.md',revision),source_revision:revision,current_revision:revision,verified:true}]});
const baseline=()=>({
 context_id:'TEST-001',task_class:'L',feature_spec_ref:ref('docs/feature.md'),
 impacts:['architecture','ui'],risk_flags:[],
 stages:[stage('ARCH','solution-architect'),stage('UX','ui-ux-designer',['ARCH'])],
 consistency_checks:[{scope:'api-ui',status:'PASS',evidence_ref:'https://github.com/example/repo/issues/1#comment'}],
 design_review:{independent:true,mode:'DESIGN',decision:'APPROVE',evidence_ref:'https://github.com/example/repo/pull/4#review',
   reviewed_refs:[ref('docs/ARCH.md'),ref('docs/UX.md')],findings:[]},
 coding_authorization:{owner_approval_ref:'https://github.com/example/repo/issues/1#owner',task_contract_ref:'https://github.com/example/repo/issues/1#contract',scope_confirmed:true}
});
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
 x.review_skip_rationale='No shared UI pattern, auth, API or schema changes';
 delete x.design_review;const r=evaluateDesignGate(x);
 assert.equal(r.status,'DESIGN_READY');assert.equal(r.routing.architect_required,false);
});
check('Missing Architect stage blocks applicable design',()=>{
 const x=baseline();x.stages=[stage('UX','ui-ux-designer')];const r=evaluateDesignGate(x);
 assert(r.reasons.includes('MISSING_ARCHITECT_STAGE'));
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
check('Invalid task class and unsupported status rejected',()=>{
 assert.equal(routeAgents({task_class:'unknown'}).valid,false);
 const x=baseline();x.stages[0].status='MAGIC';
 assert(evaluateStageDependencies(x).errors.some(e=>e.reason==='INVALID_STAGE_STATUS'));
});
console.log(JSON.stringify({suite:'PADF V0.3 role routing/design dependency gate simulation',status:'PASS',count:tests.length,tests},null,2));
