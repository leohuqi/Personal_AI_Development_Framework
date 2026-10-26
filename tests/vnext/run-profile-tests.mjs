#!/usr/bin/env node
// Independent acceptance tests from Owner A2/A3/G and VNEXT-QA-01.
// Gate fixtures below are synthetic metadata, never real Agent/Owner approvals.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {evaluateDesignGate, routeAgents} from '../../lib/design-gate.mjs';
import {conceptEvidence} from '../v0.3/ui-fixture.mjs';

const tests=[];
function check(id,requirement,name,fn){
  try { fn(); tests.push({id,requirement,name,status:'PASS'}); }
  catch(error){ tests.push({id,requirement,name,status:'FAIL',actual:error.message}); }
}
const clone=x=>structuredClone(x);
const local=(patch={})=>({task_class:'S',architecture_scope:'none',impacts:[],risk_flags:[],
  change_complexity:'low',runtime_nodes:1,external_dependencies:0,baseline_state:'APPROVED',...patch});
let selectArchitectureProfile;
try { ({selectArchitectureProfile}=await import('../../lib/architecture-profile.mjs')); }
catch(error){tests.push({id:'PROFILE-API',requirement:'VNEXT-QA-01',name:'Load public read-only selector',
  status:'FAIL',actual:error.message});}
function recommended(input){
  const out=selectArchitectureProfile(input);
  assert.equal(out.valid,true,JSON.stringify(out));
  assert(['Lite','Standard','Full'].includes(out.profile),JSON.stringify(out));
  assert(Array.isArray(out.views),JSON.stringify(out));
  assert(Array.isArray(out.reasons)&&out.reasons.length>0,'Recommendation must explain its choice');
  assert.equal(Object.hasOwn(out,'coding_authorized'),false,'Recommendation must not grant coding authority');
  assert.equal(Object.hasOwn(out,'DESIGN_READY'),false,'Recommendation must not grant design readiness');
  assert.notEqual(out.status,'DESIGN_READY');
  assert.equal(out.independent_review_required,routeAgents(input).independent_review_required,
    'Method recommendation must preserve the legacy routing review requirement');
  return out;
}
function hasViews(out,views){for(const view of views)assert(out.views.includes(view),`${view} missing: ${JSON.stringify(out)}`);}
function notSilentLite(out,context='Insufficient evidence'){
  assert(out&&typeof out==='object','Selector must return an explicit assessment');
  assert(Array.isArray(out.reasons)&&out.reasons.length>0||Array.isArray(out.errors)&&out.errors.length>0,
    'Missing/unknown context needs an explanation');
  assert(out.valid===false||['Standard','Full'].includes(out.profile),context+' must not select Lite: '+JSON.stringify(out));
}

if(typeof selectArchitectureProfile==='function'){
  check('P01','A2/A3; G1','Simple existing UI change reuses baseline without whole-system diagrams',()=>{
    const out=recommended(local({impacts:['ui']}));
    assert.equal(out.profile,'Lite');assert.equal(out.architecture_scope,'none');
    assert.equal(out.independent_review_required,false);
    assert(!out.views.includes('context')&&!out.views.includes('container'),JSON.stringify(out));
  });
  check('P02','A3','XL local API change can be Lite while keeping mandatory independent review',()=>{
    const out=recommended(local({task_class:'XL',architecture_scope:'module',impacts:['api']}));
    assert.equal(out.profile,'Lite');assert.equal(out.architecture_scope,'module');
    assert.equal(out.independent_review_required,true);
    assert(!out.views.includes('context')&&!out.views.includes('container'));
  });
  check('P03','A2; G2','Ordinary medium Web/API work selects Standard without forcing every Full view',()=>{
    const out=recommended(local({task_class:'M',architecture_scope:'both',impacts:['architecture','api'],
      change_complexity:'medium',runtime_nodes:2,external_dependencies:1}));
    assert.equal(out.profile,'Standard');hasViews(out,['overview','container','module']);
    assert(!['context','component','deployment','runtime','data','security-quality'].every(v=>out.views.includes(v)),
      'Ordinary Standard work must not require the entire Full view package');
    assert.equal(out.independent_review_required,false);
  });
  check('P04','A2; G3','High-complexity multi-node integration selects Full with layered views',()=>{
    const out=recommended(local({task_class:'L',architecture_scope:'both',
      impacts:['architecture','api','integration'],change_complexity:'high',runtime_nodes:8,external_dependencies:6}));
    assert.equal(out.profile,'Full');assert.equal(out.architecture_scope,'both');
    hasViews(out,['overview','context','container','component','deployment','runtime','data']);
    assert.equal(out.independent_review_required,true);assert.equal(out.review_recommended,true);
  });
  check('P05','A3','A new small product still receives necessary system design',()=>{
    const input=local({impacts:['new-product']});delete input.architecture_scope;
    const out=recommended(input);assert.notEqual(out.profile,'Lite');assert.equal(out.architecture_scope,'system');
    hasViews(out,['overview','container']);
  });
  check('P06','A3','Profile and explicitly selected system/module scopes remain independent',()=>{
    for(const architecture_scope of ['none','system','module','both']){
      const out=recommended(local({architecture_scope}));assert.equal(out.architecture_scope,architecture_scope);
    }
    for(const [impacts,scope] of [[['api'],'module'],[['technology-stack'],'system'],[['technology-stack','api'],'both'],[[],'none']]){
      const input=local({impacts});delete input.architecture_scope;
      assert.equal(recommended(input).architecture_scope,scope);
    }
  });
  check('P07','A3/F compatibility','Profile cannot narrow known system/module impacts through explicit scope',()=>{
    for(const [impacts,architecture_scope] of [[['new-product'],'none'],[['api'],'system'],[['architecture','api'],'module']]){
      const out=selectArchitectureProfile(local({impacts,architecture_scope}));
      assert.equal(out.valid,false,JSON.stringify(out));assert(out.errors?.length>0);
    }
  });
  check('P08','A3; G4','Permissions add a security view and review from either risk source',()=>{
    for(const source of ['impacts','risk_flags']){
      const out=recommended(local({[source]:['permissions']}));
      hasViews(out,['security-quality']);assert.equal(out.review_recommended,true);
      assert.equal(out.independent_review_required,true);
      assert.notEqual(out.profile,'Lite');
    }
  });
  check('P09','A3; G4','Deletion, recovery and synchronization add runtime/data coverage from either source',()=>{
    for(const risk of ['file-delete','file-deletion','destructive-operation','cache-sync','synchronization','recovery','data-recovery','restore'])
    for(const source of ['impacts','risk_flags']){
      const input=local({[source]:[risk]});const out=recommended(input);
      assert.notEqual(out.profile,'Lite',risk+':'+source);hasViews(out,['runtime','data']);
      assert.equal(out.review_recommended,true,risk+':'+source);
      assert.equal(out.independent_review_required,routeAgents(input).independent_review_required);
    }
  });
  check('P10','A3/F compatibility','All existing mandatory risks retain independent review for S and M',()=>{
    const risks=['auth','permissions','privacy','security','destructive-migration','risky-schema-migration',
      'breaking-api','critical-business-rule','critical-workflow','design-system','shared-component',
      'integration','concurrency','cross-module','financial-data'];
    for(const task_class of ['S','M'])for(const risk of risks)for(const source of ['impacts','risk_flags']){
      const input=local({task_class,[source]:[risk]});delete input.architecture_scope;
      const out=recommended(input);assert.equal(out.independent_review_required,true,task_class+':'+risk+':'+source);
      assert.equal(out.review_recommended,true);assert.notEqual(out.profile,'Lite');
    }
  });
  check('P11','A3','Unknown risks are explained conservatively and recommend review',()=>{
    const out=selectArchitectureProfile(local({risk_flags:['unassessed-retention-risk']}));
    notSilentLite(out);if(out.valid)assert.equal(out.review_recommended,true);
  });
  check('P12','A3','Risk advice is additive and cannot be erased by low complexity or other risk labels',()=>{
    const input=local({impacts:['permissions'],risk_flags:['recovery','unassessed-retention-risk']});
    const out=recommended(input);assert.notEqual(out.profile,'Lite');
    hasViews(out,['security-quality','runtime','data']);assert.equal(out.review_recommended,true);
    assert.equal(out.independent_review_required,true);
  });
  check('P13','A3','Absent complexity, baseline and runtime/dependency context never silently select Lite',()=>{
    for(const field of ['change_complexity','baseline_state','runtime_nodes','external_dependencies']){
      const input=local();delete input[field];notSilentLite(selectArchitectureProfile(input),'Missing '+field);
    }
    notSilentLite(selectArchitectureProfile({task_class:'S'}));
    for(const baseline_state of ['PROPOSED','MISSING'])notSilentLite(selectArchitectureProfile(local({baseline_state})));
  });
  check('P14','A3','Malformed root and required classifications fail explicitly without throwing',()=>{
    for(const input of [undefined,null,[],1,'S',{},local({task_class:'XS'}),local({task_class:null}),
      local({architecture_scope:'global'}),local({change_complexity:'trivial'}),local({baseline_state:'approved'})]){
      const out=selectArchitectureProfile(input);assert.equal(out.valid,false,JSON.stringify(input));
      assert(out.errors?.length>0,JSON.stringify(out));
    }
  });
  check('P15','A3','Malformed risk arrays and non-string members cannot appear low-risk',()=>{
    for(const field of ['impacts','risk_flags'])for(const value of [null,'permissions',{},[null],[1],[{}],['']]){
      const out=selectArchitectureProfile(local({[field]:value}));assert.equal(out.valid,false,field+':'+JSON.stringify(value));
      assert(out.errors?.length>0,JSON.stringify(out));
    }
  });
  check('P16','A3','Counts require finite nonnegative integers; zero is a usable count',()=>{
    for(const field of ['runtime_nodes','external_dependencies'])for(const value of [-1,0.5,NaN,Infinity,'1',null,true]){
      const out=selectArchitectureProfile(local({[field]:value}));assert.equal(out.valid,false,field+':'+String(value));
      assert(out.errors?.length>0,JSON.stringify(out));
    }
    assert.equal(recommended(local({runtime_nodes:0,external_dependencies:0})).profile,'Lite');
  });
  check('P17','Read-only API','Frozen caller object and arrays are unchanged by success or error paths',()=>{
    for(const input of [local({impacts:['api'],architecture_scope:'module'}),local({risk_flags:['permissions']}),local({impacts:[1]})]){
      const before=clone(input);Object.freeze(input.impacts);Object.freeze(input.risk_flags);Object.freeze(input);
      selectArchitectureProfile(input);assert.deepEqual(input,before);
    }
  });
  check('P18','Read-only API','Outputs and successive calls do not share mutable recommendation state',()=>{
    const input=local();const first=recommended(input);const saved=clone(first);
    recommended(local({risk_flags:['permissions','restore']}));
    assert.deepEqual(first,saved,'A later call changed an earlier result');
    first.views.push('QA-CALLER-MUTATION');first.reasons.push('QA-CALLER-MUTATION');
    const next=recommended(input);assert.deepEqual(next,saved,'Caller mutation leaked into a later result');
  });
}

// Minimal complete legacy fixtures, adapted from existing v0.3 tests; all approval
// references and rendered flags are synthetic and assert only checker behavior.
const A='a'.repeat(40),C='c'.repeat(40),pin=p=>p+'@'+A;
const evidence='https://example.test/padf/issues/25#synthetic-metadata';
const artifact=(type)=>({type,ref:pin('synthetic/'+type),source_revision:A,current_revision:A,
  verified:true,evidence_ref:evidence,...(type.endsWith('-diagram')?
    {generator:'diagram-design',generator_sha:C,render_status:'PASS'}:{})});
function gateFixture(mode='module'){
  const sys=mode==='system',ui=mode==='ui';
  const types=sys?['solution-architecture','technology-stack','application-code-structure','architecture-diagram']:
    ui?['ui-design','ui-concept']:['module-design','module-code-structure','module-interface-contract','module-component-diagram'];
  const stage={id:'SYNTHETIC',agent:sys?'solution-architect':ui?'ui-ux-designer':'module-architect',
    required:true,status:'COMPLETED',depends_on:[],artifacts:types.map(artifact),
    ...(ui?{profile_ref:pin('synthetic/ui-profile')}:{system_baseline_ref:pin('synthetic/system-baseline')})};
  const x={task_class:'L',architecture_scope:ui?'none':mode,impacts:[sys?'architecture':ui?'ui':'api'],risk_flags:[],
    feature_spec_ref:pin('synthetic/feature-spec'),diagram_skill_sha:C,stages:[stage],
    system_baseline_ref:pin('synthetic/system-baseline'),system_baseline_status:'APPROVED',system_baseline_approval_ref:evidence,
    consistency_checks:[{scope:'synthetic-contract',status:'PASS',evidence_ref:evidence}],
    design_review:{independent:true,mode:'DESIGN',decision:'APPROVE',evidence_ref:evidence,
      reviewed_refs:stage.artifacts.map(a=>a.ref),findings:[]},
    coding_authorization:{owner_approval_ref:evidence,task_contract_ref:evidence,scope_confirmed:true}};
  if(ui){Object.assign(x,{ui_level:'L1',ui_profile_ref:stage.profile_ref,ui_profile_status:'APPROVED',
    ui_profile_approved_ref:stage.profile_ref,ui_profile_approval_ref:evidence});conceptEvidence(x,stage);}
  return x;
}
let immutableGate;
if(process.env.PADF_PROFILE_BASELINE){
  try {({evaluateDesignGate:immutableGate}=await import(pathToFileURL(resolve(process.env.PADF_PROFILE_BASELINE,'lib/design-gate.mjs')).href));}
  catch(error){tests.push({id:'BASELINE-API',requirement:'F compatibility',status:'FAIL',actual:error.message});}
}
function checkUnchanged(input,expected,reason){
  const before=clone(input),control=evaluateDesignGate(input);assert.equal(control.status,expected,JSON.stringify(control));
  if(reason)assert(control.reasons.includes(reason),JSON.stringify(control.reasons));
  if(immutableGate)assert.deepEqual(control,immutableGate(input),'Candidate legacy Gate changed versus immutable baseline');
  for(const profile of ['Lite','Standard','Full']){
    const tagged={...input,profile,architecture_profile:profile,
      architecture_profile_recommendation:{valid:true,profile,review_recommended:false,views:['overview']}};
    assert.deepEqual(evaluateDesignGate(tagged),control,'Profile label changed legacy Gate: '+profile);
    if(immutableGate)assert.deepEqual(evaluateDesignGate(tagged),immutableGate(tagged));
  }
  assert.deepEqual(input,before,'Gate mutated synthetic caller metadata');
}
check('G01','F/G compatibility','Complete synthetic control fixtures retain their original checker result',()=>{
  for(const scope of ['module','system','ui'])checkUnchanged(gateFixture(scope),'DESIGN_READY');
});
check('G02','F/G compatibility','Profile tags cannot supply missing architect roles',()=>{
  for(const [scope,reason] of [['module','MISSING_MODULE_ARCHITECT_STAGE'],['system','MISSING_SOLUTION_ARCHITECT_STAGE']]){
    const x=gateFixture(scope);x.stages=[];x.design_review.reviewed_refs=[];checkUnchanged(x,'BLOCKED',reason);
  }
});
check('G03','F/G compatibility','Profile tags cannot approve a missing/proposed system baseline',()=>{
  for(const state of [undefined,'PROPOSED','MISSING']){
    const x=gateFixture();x.system_baseline_status=state;checkUnchanged(x,'BLOCKED','SYSTEM_BASELINE_NOT_APPROVED');
  }
  const x=gateFixture();delete x.system_baseline_ref;checkUnchanged(x,'BLOCKED','MISSING_APPROVED_SYSTEM_BASELINE');
});
check('G04','F/G compatibility','Profile tags cannot skip mandatory DESIGN review',()=>{
  for(const task_class of ['S','XL']){
    const x=gateFixture();x.task_class=task_class;x.risk_flags=['permissions'];delete x.design_review;
    x.review_skip_rationale='Synthetic proposed skip despite mandatory review';checkUnchanged(x,'BLOCKED','MANDATORY_DESIGN_REVIEW');
  }
});
check('G05','A3/F compatibility','Lite does not waive the old required module diagram',()=>{
  const x=gateFixture();x.stages[0].artifacts=x.stages[0].artifacts.filter(a=>a.type!=='module-component-diagram');
  x.design_review.reviewed_refs=x.stages[0].artifacts.map(a=>a.ref);
  checkUnchanged(x,'BLOCKED','MISSING_MODULE_ARTIFACT:module-component-diagram');
});
check('G06','F/G compatibility','Profile tags cannot authorize coding or approve material design',()=>{
  const x=gateFixture();delete x.coding_authorization;checkUnchanged(x,'DESIGN_READY');
  assert.equal(evaluateDesignGate({...x,architecture_profile:'Lite'}).coding_authorized,false);
  x.material_change=true;checkUnchanged(x,'BLOCKED','MISSING_MATERIAL_OWNER_APPROVAL');
});
check('G07','F/UI compatibility','Profile tags cannot replace approved UI Profile or required concept evidence',()=>{
  const x=gateFixture('ui');x.ui_profile_status='PROPOSED';checkUnchanged(x,'BLOCKED','PROJECT_UI_PROFILE_NOT_APPROVED');
  const y=gateFixture('ui');y.ui_level='L2';delete y.stages[0].concept_confirmation;
  checkUnchanged(y,'BLOCKED','UNCONFIRMED_UI_CONCEPT:SYNTHETIC');
});
const failed=tests.filter(t=>t.status==='FAIL').length;
console.log(JSON.stringify({suite:'PADF vNext independent Profile behavior and legacy Gate compatibility',
  fixture_kind:'SYNTHETIC_METADATA_ONLY',baseline_comparison:immutableGate?'RUN':'NOT_RUN (set PADF_PROFILE_BASELINE)',
  status:failed?'FAIL':'PASS',count:tests.length,passed:tests.length-failed,failed,tests},null,2));
if(failed)process.exitCode=1;
