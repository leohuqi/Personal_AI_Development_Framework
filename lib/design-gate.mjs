/**
 * PADF V0.3 declarative routing/dependency/design gate checks.
 * Pure, read-only, no runtime dispatch, filesystem, network or implicit approval.
 */
const SIZES = new Set(['S','M','L','XL']);
const STATUSES = new Set(['PENDING','READY','IN_PROGRESS','COMPLETED','BLOCKED','STALE','WAIVED']);
const MANDATORY_RISKS = new Set([
  'auth','permissions','privacy','security','destructive-migration',
  'risky-schema-migration','breaking-api','critical-business-rule',
  'critical-workflow','design-system','shared-component','integration',
  'concurrency','cross-module','financial-data'
]);
const DESIGN_IMPACTS = new Set(['architecture','api','database','workflow','integration','deployment','security']);
const UI_IMPACTS = new Set(['ui','shared-component','design-system','interaction']);
const SHA = /^[0-9a-f]{40}$/i;
const hasRef = x => typeof x === 'string' && x.trim().length>5;
const pinned = x => typeof x === 'string' && (/@[0-9a-f]{40}$/i.test(x) ||
  /\/blob\/[0-9a-f]{40}\//i.test(x) || SHA.test(x));
const err = (reason,detail) => ({reason,detail});
const unique = a => [...new Set(a)];

export function routeAgents({task_class,impacts=[],risk_flags=[]}={}) {
  if(!SIZES.has(task_class)) return {valid:false,errors:['INVALID_TASK_CLASS']};
  if(!Array.isArray(impacts)||!Array.isArray(risk_flags)) return {valid:false,errors:['INVALID_IMPACTS_OR_RISKS']};
  const arch=impacts.some(x=>DESIGN_IMPACTS.has(x)) || risk_flags.some(x=>MANDATORY_RISKS.has(x)&&!['design-system','shared-component'].includes(x));
  const ux=impacts.some(x=>UI_IMPACTS.has(x))||risk_flags.some(x=>['design-system','shared-component'].includes(x));
  const independent_review_required=['L','XL'].includes(task_class)||risk_flags.some(x=>MANDATORY_RISKS.has(x));
  return {valid:true,architect_required:arch,ui_required:ux,independent_review_required,
    stages:['master-orchestrator',...(arch?['solution-architect']:[]),...(ux?['ui-ux-designer']:[]),
      ...(independent_review_required?['independent-reviewer:DESIGN']:[]),'master-orchestrator:DESIGN_GATE',
      'feature-coder','qa-tester','independent-reviewer:IMPLEMENTATION']};
}

export function evaluateStageDependencies(task) {
  const errors=[],stages=task?.stages;
  if(!Array.isArray(stages)) return {valid:false,errors:[err('MISSING_STAGES')],states:{}};
  const map=new Map(),states={}, visiting=new Set(),visited=new Set();
  for(const stage of stages){
    if(!stage||typeof stage.id!=='string'||!stage.id.trim()){errors.push(err('INVALID_STAGE_ID'));continue}
    if(map.has(stage.id))errors.push(err('DUPLICATE_STAGE',stage.id));
    map.set(stage.id,stage);
    if(!STATUSES.has(stage.status))errors.push(err('INVALID_STAGE_STATUS',stage.id));
    if(!Array.isArray(stage.depends_on))errors.push(err('INVALID_DEPENDENCIES',stage.id));
    if(stage.required===false&&!hasRef(stage.na_reason))errors.push(err('MISSING_NA_REASON',stage.id));
    if(stage.status==='WAIVED'&&(!stage.waiver||!hasRef(stage.waiver.owner_approval_ref)||!hasRef(stage.waiver.reason))){
      errors.push(err('UNAUTHORIZED_WAIVER',stage.id));
    }
  }
  for(const stage of stages){
    if(!stage||!map.has(stage.id))continue;
    for(const dep of stage.depends_on||[]){
      if(dep===stage.id)errors.push(err('SELF_DEPENDENCY',stage.id));
      else if(!map.has(dep))errors.push(err('UNKNOWN_DEPENDENCY',stage.id+':'+dep));
    }
  }
  function visit(id){
    if(visiting.has(id)){errors.push(err('CYCLE',id));return}
    if(visited.has(id))return;
    visited.add(id);visiting.add(id);
    for(const dep of map.get(id)?.depends_on||[]){if(map.has(dep))visit(dep)}
    visiting.delete(id);
  }
  for(const id of map.keys())visit(id);
  // Compute parent satisfaction independent of declared READY/COMPLETED labels.
  for(const [id,stage] of map){
    const failures=[];
    if(stage.required===false){
      if(!hasRef(stage.na_reason))failures.push('NO_NA_REASON');
      else {states[id]={ready:true,satisfied:true,reason:'NOT_APPLICABLE'};continue}
    }
    if(['BLOCKED','STALE'].includes(stage.status))failures.push('STAGE_'+stage.status);
    if(stage.status==='WAIVED'){
      if(!stage.waiver||!hasRef(stage.waiver.owner_approval_ref)||!hasRef(stage.waiver.reason))failures.push('MISSING_WAIVER_AUTHORIZATION');
      states[id]={ready:failures.length===0,satisfied:failures.length===0,reason:failures};continue
    }
    for(const dep of stage.depends_on||[]){
      const upstream=map.get(dep);
      if(!upstream) {failures.push('MISSING_PARENT:'+dep);continue}
      if(upstream.required===false && hasRef(upstream.na_reason))continue;
      if(upstream.status==='WAIVED' && upstream.waiver && hasRef(upstream.waiver.owner_approval_ref) && hasRef(upstream.waiver.reason))continue;
      if(upstream.status!=='COMPLETED')failures.push('PARENT_NOT_COMPLETED:'+dep);
      if(upstream.status==='COMPLETED'&&!validArtifacts(upstream.artifacts))failures.push('PARENT_MISSING_VERIFIED_ARTIFACTS:'+dep);
    }
    const ownComplete=stage.status==='COMPLETED'&&validArtifacts(stage.artifacts);
    if(stage.status==='COMPLETED'&&!ownComplete)failures.push('MISSING_VERIFIED_ARTIFACTS');
    states[id]={ready:failures.length===0,satisfied:failures.length===0&&ownComplete,
      reason:unique(failures)};
  }
  return {valid:errors.length===0,errors,states};
}
function validArtifacts(artifacts){
  return Array.isArray(artifacts)&&artifacts.length>0 &&
    artifacts.some(x=>x&&x.required!==false) &&
    artifacts.every(x=>x&& (x.required===false|| (pinned(x.ref)&&x.verified===true&&
      (!x.source_revision||SHA.test(x.source_revision))&&(!x.current_revision||x.current_revision===x.source_revision))));
}

export function evaluateDesignGate(input={}){
  const routing=routeAgents(input),reasons=[];
  if(!routing.valid)return {status:'BLOCKED',coding_authorized:false,reasons:routing.errors};
  const deps=evaluateStageDependencies(input);
  if(!deps.valid)reasons.push(...deps.errors.map(e=>e.reason+':'+(e.detail||'')));
  const required=(input.stages||[]).filter(s=>s&&s.required!==false);
  for(const stage of required){
    const state=deps.states[stage.id];
    if(!state?.satisfied)reasons.push('UNSATISFIED_STAGE:'+stage.id);
  }
  if(routing.architect_required&&!required.some(s=>s.agent==='solution-architect'))reasons.push('MISSING_ARCHITECT_STAGE');
  if(routing.ui_required&&!required.some(s=>s.agent==='ui-ux-designer'))reasons.push('MISSING_UI_STAGE');
  if(!hasRef(input.feature_spec_ref)||!pinned(input.feature_spec_ref))reasons.push('UNVERSIONED_FEATURE_SPEC');
  if((input.stages||[]).some(s=>s?.required!==false && s?.status==='STALE'))reasons.push('STALE_DESIGN');
  if(!Array.isArray(input.consistency_checks)||!input.consistency_checks.length||
     input.consistency_checks.some(x=>x.status!=='PASS'||!hasRef(x.evidence_ref)))reasons.push('MISSING_CONSISTENCY_EVIDENCE');
  if(input.material_change===true&&!hasRef(input.material_owner_approval_ref))reasons.push('MISSING_MATERIAL_OWNER_APPROVAL');
  const review=input.design_review||{};
  if(routing.independent_review_required){
    if(review.independent!==true||review.mode!=='DESIGN'||!hasRef(review.evidence_ref) ||
       !['APPROVE','APPROVE_WITH_CONDITIONS'].includes(review.decision))reasons.push('MANDATORY_DESIGN_REVIEW');
    else {
      const requiredHashes=required.flatMap(s=>(s.artifacts||[]).filter(a=>a.required!==false).map(a=>a.ref));
      if(!Array.isArray(review.reviewed_refs)||requiredHashes.some(x=>!review.reviewed_refs.includes(x)))
        reasons.push('STALE_OR_INCOMPLETE_REVIEW');
      if(review.findings?.some(f=>['P0','P1'].includes(f.severity)&&f.status!=='FIXED'))reasons.push('BLOCKING_DESIGN_FINDING');
      if(review.findings?.some(f=>f.severity==='P2'&&f.status!=='FIXED'&&
          !(hasRef(f.owner_risk_acceptance_ref)&&hasRef(f.acceptance_conditions))))reasons.push('P2_NOT_ACCEPTED');
    }
  } else if(!hasRef(input.review_skip_rationale) && review.independent!==true)reasons.push('MISSING_REVIEW_SKIP_RATIONALE');
  if(reasons.length)return {status:'BLOCKED',coding_authorized:false,reasons:unique(reasons),routing,dependencies:deps};
  const codingAuthorized=Boolean(hasRef(input.coding_authorization?.owner_approval_ref)&&
    hasRef(input.coding_authorization?.task_contract_ref)&&input.coding_authorization?.scope_confirmed===true);
  return {status:'DESIGN_READY',coding_authorized:codingAuthorized,
    execution_state:codingAuthorized?'CODING_AUTHORIZED':'AWAITING_OWNER_CODING_AUTHORIZATION',
    reasons:[],routing,dependencies:deps};
}
