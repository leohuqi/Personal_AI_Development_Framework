import {evaluateOrchestrationChain} from './orchestration-evidence.mjs';

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
const record = x => x !== null && typeof x === 'object' && !Array.isArray(x);

const SYSTEM_IMPACTS = new Set(['new-product','architecture','system-boundary','platform','technology-stack','deployment','infrastructure']);
const MODULE_IMPACTS = new Set(['api','database','workflow','integration','module-design','code-structure','security']);
const ARCH_SCOPES = new Set(['none','system','module','both']);
const PRODUCT_SCOPES = new Set(['reuse','define','refine']);
// Definition impacts mean current missing/changed behavior; a new app may already have valid specs.
const PRODUCT_IMPACTS = new Set(['product-definition','product-behavior']);

export function routeAgents({task_class,impacts=[],risk_flags=[],architecture_scope,product_scope}={}) {
  if(!SIZES.has(task_class))return {valid:false,errors:['INVALID_TASK_CLASS']};
  if(!Array.isArray(impacts)||!Array.isArray(risk_flags))return {valid:false,errors:['INVALID_IMPACTS_OR_RISKS']};
  if(architecture_scope!==undefined&&!ARCH_SCOPES.has(architecture_scope))
    return {valid:false,errors:['INVALID_ARCHITECTURE_SCOPE']};
  if(product_scope!==undefined&&!PRODUCT_SCOPES.has(product_scope))
    return {valid:false,errors:['INVALID_PRODUCT_SCOPE']};
  const productImpact=impacts.some(x=>PRODUCT_IMPACTS.has(x));
  const productScope=product_scope??((productImpact||impacts.includes('new-product'))?(impacts.includes('product-behavior')?'refine':'define'):'reuse');
  if(productImpact&&productScope==='reuse')
    return {valid:false,errors:['PRODUCT_IMPACT_REQUIRES_DEFINITION']};
  const product_analyst_required=productScope!=='reuse';
  const systemImpact=impacts.some(x=>SYSTEM_IMPACTS.has(x));
  const moduleImpact=impacts.some(x=>MODULE_IMPACTS.has(x));
  const suggested=systemImpact?(moduleImpact?'both':'system'):moduleImpact?'module':'none';
  const scope=architecture_scope??suggested;
  // Master 可以扩大范围，但不能排除已知影响所必需的任一架构角色。
  if(systemImpact&&!['system','both'].includes(scope))
    return {valid:false,errors:['SYSTEM_ARCHITECTURE_IMPACT_REQUIRES_SOLUTION_ARCHITECT']};
  if(moduleImpact&&!['module','both'].includes(scope))
    return {valid:false,errors:['MODULE_DESIGN_IMPACT_REQUIRES_MODULE_ARCHITECT']};
  const solution_architect_required=['system','both'].includes(scope);
  const module_architect_required=['module','both'].includes(scope);
  const ui_required=impacts.some(x=>UI_IMPACTS.has(x))||risk_flags.some(x=>['design-system','shared-component'].includes(x));
  // 已声明的高风险影响不能因 risk_flags 漏填而降级为可跳过审查。
  const independent_review_required=['L','XL'].includes(task_class)||
    impacts.some(x=>MANDATORY_RISKS.has(x))||risk_flags.some(x=>MANDATORY_RISKS.has(x));
  return {valid:true,product_scope:productScope,product_analyst_required,architecture_scope:scope,scope_source:architecture_scope?'master-explicit':'suggested-from-impacts',
    solution_architect_required,module_architect_required,
    architect_required:solution_architect_required||module_architect_required,
    ui_required,independent_review_required,
    stages:['master-orchestrator',
      ...(product_analyst_required?['product-analyst']:[]),
      ...(solution_architect_required?['solution-architect']:[]),
      ...(module_architect_required?['module-architect']:[]),
      ...(ui_required?['ui-ux-designer']:[]),
      ...(independent_review_required?['independent-reviewer:DESIGN']:[]),
      'master-orchestrator:DESIGN_GATE','feature-coder','qa-tester','independent-reviewer:IMPLEMENTATION']};
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
    artifacts.every(x=>x&&(x.required===false||(
      pinned(x.ref)&&x.verified===true&&hasRef(x.evidence_ref)&&
      (!x.source_revision||SHA.test(x.source_revision))&&
      (!x.current_revision||x.current_revision===x.source_revision)&&
      (!x.type?.endsWith('-diagram') || (x.generator==='diagram-design'&&SHA.test(x.generator_sha)&&x.render_status==='PASS'))&&
      (x.type!=='interactive-prototype'||(x.interaction_test_status==='PASS'&&x.editable_source===true))
    )));
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
  if(routing.architect_required&&!input.architecture_scope)
    reasons.push('MISSING_MASTER_ARCHITECTURE_SCOPE_DECISION');
  if(routing.solution_architect_required&&!required.some(s=>s.agent==='solution-architect'))
    reasons.push('MISSING_SOLUTION_ARCHITECT_STAGE');
  if(routing.module_architect_required&&!required.some(s=>s.agent==='module-architect'))
    reasons.push('MISSING_MODULE_ARCHITECT_STAGE');
  if(!pinned(input.feature_spec_ref))reasons.push('UNVERSIONED_FEATURE_SPEC');

  const twoPhase=Object.hasOwn(input,'product_spec_ref');
  const productSpecRef=twoPhase?input.product_spec_ref:input.feature_spec_ref;
  if(twoPhase&&!pinned(productSpecRef))reasons.push('UNVERSIONED_PRODUCT_SPEC');
  const productStages=required.filter(s=>s.agent==='product-analyst');
  if(routing.product_analyst_required&&!productStages.length)reasons.push('MISSING_PRODUCT_ANALYST_STAGE');
  for(const product of productStages){
    if(product.status!=='COMPLETED'||!validArtifacts(product.artifacts))
      reasons.push('UNREADY_PRODUCT_DEFINITION:'+product.id);
    const artifacts=(product.artifacts||[]).filter(a=>a?.required!==false);
    for(const type of ['product-definition','feature-specification'])
      if(!artifacts.some(a=>a.type===type))reasons.push('MISSING_PRODUCT_ARTIFACT:'+type);
    if(!artifacts.some(a=>a.type==='feature-specification'&&a.ref===productSpecRef))
      reasons.push('PRODUCT_FEATURE_SPEC_MISMATCH');
  }
  // A formal downstream stage must depend on the product definition, directly or transitively.
  const stageMap=new Map(required.map(s=>[s.id,s]));
  function dependsOn(id,parent,seen=new Set()){
    if(seen.has(id))return false;seen.add(id);
    const parents=stageMap.get(id)?.depends_on;
    return Array.isArray(parents)&&parents.some(p=>p===parent||dependsOn(p,parent,seen));
  }
  if(routing.product_analyst_required)for(const stage of required.filter(s=>
    ['solution-architect','module-architect','ui-ux-designer'].includes(s.agent)))
    for(const product of productStages)
      if(!dependsOn(stage.id,product.id))reasons.push('MISSING_PRODUCT_TO_DESIGN_DEPENDENCY:'+stage.id);
  const solutions=required.filter(s=>s.agent==='solution-architect');
  const uiStages=required.filter(s=>s.agent==='ui-ux-designer');
  // New two-phase tasks distinguish product intent from implementable specification.
  const modules=required.filter(s=>s.agent==='module-architect');
  if(twoPhase){
    if(!modules.length){
      const simple=input.simple_spec_refinement;
      if(!hasRef(simple?.rationale)||!hasRef(simple?.evidence_ref)||simple?.feature_spec_ref!==input.feature_spec_ref)
        reasons.push('MISSING_IMPLEMENTATION_SPEC_REFINEMENT');
    }
    for(const m of modules){
      if(m.status!=='COMPLETED'||!validArtifacts(m.artifacts))reasons.push('UNREADY_FEATURE_REFINEMENT:'+m.id);
      if(m.product_spec_ref!==productSpecRef)reasons.push('MODULE_PRODUCT_SPEC_MISMATCH:'+m.id);
      if(!hasRef(m.spec_handoff_ref))reasons.push('MISSING_SPEC_HANDOFF:'+m.id);
      if(!(m.artifacts||[]).some(a=>a?.required!==false&&a?.type==='feature-specification'&&a.ref===input.feature_spec_ref))
        reasons.push('MISSING_IMPLEMENTATION_FEATURE_SPEC:'+m.id);
    }
  }
  if(input.ui_delivery_mode!==undefined&&!['concept-mockup','staged'].includes(input.ui_delivery_mode))
    reasons.push('INVALID_UI_DELIVERY_MODE');
  if(input.ui_delivery_mode!==undefined&&!routing.ui_required)reasons.push('UI_DELIVERY_REQUIRES_UI_IMPACT');
  // 路由要求 UI 时必须存在必需阶段，且后续逐个校验，不能只信任首个阶段。
  if(routing.ui_required&&!uiStages.length)reasons.push('MISSING_UI_DESIGN_STAGE');
  const artifactTypes=s=>new Set((s?.artifacts||[]).filter(x=>x?.required!==false).map(x=>x.type));
  const architects=[...solutions,...modules];
  for(const stage of architects){
    for(const visual of (stage.artifacts||[]).filter(x=>x?.type?.endsWith('-diagram')&&x?.required!==false)){
      if(visual.generator_sha!==input.diagram_skill_sha||!SHA.test(input.diagram_skill_sha||''))
        reasons.push('DIAGRAM_SKILL_VERSION_MISMATCH');
    }
  }
  for(const solution of solutions){
    const kinds=artifactTypes(solution);
    for(const kind of ['solution-architecture','technology-stack','application-code-structure','architecture-diagram'])
      if(!kinds.has(kind))reasons.push('MISSING_SYSTEM_ARTIFACT:'+kind);
  }
  for(const module of modules){
    const kinds=artifactTypes(module);
    for(const kind of ['module-design','module-code-structure','module-interface-contract','module-component-diagram'])
      if(!kinds.has(kind))reasons.push('MISSING_MODULE_ARTIFACT:'+kind);
    if(!pinned(input.system_baseline_ref))reasons.push('MISSING_APPROVED_SYSTEM_BASELINE');
    if(input.system_baseline_status!=='APPROVED'||!hasRef(input.system_baseline_approval_ref))
      reasons.push('SYSTEM_BASELINE_NOT_APPROVED');
    if(module.system_baseline_ref!==input.system_baseline_ref)
      reasons.push('MODULE_SYSTEM_BASELINE_MISMATCH');
    if(routing.architecture_scope==='both'){
      const sources=solutions.filter(s=>(s.artifacts||[]).some(a=>
        a?.required!==false&&a.type==='solution-architecture'&&a.ref===input.system_baseline_ref));
      if(sources.length!==1)reasons.push(sources.length?'AMBIGUOUS_SYSTEM_BASELINE_STAGE':'NEW_SYSTEM_BASELINE_REF_MISMATCH');
      if(sources.length!==1||!(module.depends_on||[]).includes(sources[0]?.id))
        reasons.push('MISSING_SYSTEM_TO_MODULE_DEPENDENCY');
    }
  }
  if(architects.length){
    const kinds=new Set(architects.flatMap(s=>[...artifactTypes(s)]));
    if(input.impacts.includes('database')&&
       !(kinds.has('database-schema')&&kinds.has('database-schema-diagram')))
      reasons.push('MISSING_DATABASE_SCHEMA_AND_DIAGRAM');
    if(input.impacts.includes('workflow')&&!kinds.has('workflow-diagram'))
      reasons.push('MISSING_WORKFLOW_DIAGRAM');
  }
  if(routing.ui_required&&uiStages.length){
    if(!['L1','L2','L3'].includes(input.ui_level))
      reasons.push(input.ui_delivery_mode==='staged'?'INVALID_STAGED_UI_LEVEL':'INVALID_UI_LEVEL');
    if(!pinned(input.ui_profile_ref))reasons.push('UNVERSIONED_PROJECT_UI_PROFILE');
    if(input.ui_profile_status!=='APPROVED'||!hasRef(input.ui_profile_approval_ref))
      reasons.push('PROJECT_UI_PROFILE_NOT_APPROVED');
    if(input.ui_profile_approved_ref!==input.ui_profile_ref)
      reasons.push('UI_PROFILE_APPROVAL_VERSION_MISMATCH');
    for(const ux of uiStages){
      const kinds=artifactTypes(ux);
      if(ux.profile_ref!==input.ui_profile_ref)reasons.push('UI_PROFILE_VERSION_MISMATCH');
      if(!kinds.has('ui-design'))reasons.push('MISSING_UI_SPECIFICATION');
      if(![...kinds].some(x=>['ui-concept','ui-prototype','interactive-prototype'].includes(x)))reasons.push('MISSING_UI_DESIGN_VISUAL');
      if(input.ui_level==='L3'&&!kinds.has('interactive-prototype'))reasons.push('MISSING_INTERACTIVE_PROTOTYPE');
      // All input modes use the same concept -> confirmation -> frontend flow.
      // Omitting the mode, retaining "staged", or an old Figma field cannot bypass it.
      if(ux.status!=='COMPLETED'||!validArtifacts(ux.artifacts))reasons.push('UNREADY_UI:'+ux.id);
      const artifacts=(ux.artifacts||[]).filter(a=>a?.required!==false);
      const concepts=artifacts.filter(a=>a.type==='ui-concept');
      const concept=concepts.length===1?concepts[0]:undefined;
      if(!concept)reasons.push('MISSING_OR_AMBIGUOUS_UI_CONCEPT:'+ux.id);
      if(['L2','L3'].includes(input.ui_level)||(twoPhase&&modules.length)){
        const c=ux.concept_confirmation;
        if(!concept||!record(c)||c.concept_ref!==concept.ref||
           !['OWNER','TEAM_MEMBER'].includes(c.reviewer_role)||
           typeof c.reviewer_id!=='string'||!c.reviewer_id.trim()||!hasRef(c.confirmation_ref))
          reasons.push('UNCONFIRMED_UI_CONCEPT:'+ux.id);
        if(c?.reviewer_role==='TEAM_MEMBER'&&!hasRef(c.delegation_ref))
          reasons.push('MISSING_TEAM_CONFIRMATION_AUTHORITY:'+ux.id);
        if((input.material_change===true||(input.impacts||[]).includes('design-system')||
            (input.risk_flags||[]).includes('design-system'))&&c?.reviewer_role!=='OWNER')
          reasons.push('MATERIAL_UI_REQUIRES_OWNER_CONFIRMATION:'+ux.id);
        if(twoPhase&&concept)for(const m of modules)
          if(m.ui_design_ref!==concept.ref)reasons.push('MODULE_UI_DESIGN_MISMATCH:'+m.id);
      }
      const frontend=artifacts.filter(a=>a.type==='interactive-prototype'||a.runtime==='frontend');
      if(input.ui_level!=='L3'&&frontend.length)reasons.push('FRONTEND_PROTOTYPE_REQUIRES_L3:'+ux.id);
      const reviews=artifacts.filter(a=>a.type==='impeccable-review');
      if((input.ui_level==='L3'||reviews.length)&&!pinned(input.impeccable_skill_ref))
        reasons.push('MISSING_IMPECCABLE_SKILL_PIN');
      if(input.ui_level==='L3'){
        if(!pinned(input.frontend_stack_ref))reasons.push('MISSING_FRONTEND_STACK_BASELINE');
        if(!hasRef(input.frontend_prototype_authorization_ref))reasons.push('MISSING_FRONTEND_PROTOTYPE_AUTHORIZATION');
        if(!frontend.length||frontend.some(a=>a.type!=='interactive-prototype'||a.runtime!=='frontend'||
           a.fidelity!=='high'||a.editable_source!==true||a.frontend_stack_ref!==input.frontend_stack_ref||
           a.concept_ref!==concept?.ref))
          reasons.push('MISSING_FRONTEND_HIGH_FIDELITY_PROTOTYPE:'+ux.id);
        for(const p of frontend)
          if(reviews.filter(r=>r.target_ref===p.ref).length!==1)reasons.push('MISSING_IMPECCABLE_REVIEW:'+ux.id);
      }
      // A supplied current UI review cannot hide known findings at concept levels.
      for(const r of reviews){
          if(r.tool!=='impeccable'||!pinned(r.skill_ref)||r.skill_ref!==input.impeccable_skill_ref||
             (r.target_ref!==concept?.ref&&!frontend.some(p=>p.ref===r.target_ref))||r.profile_ref!==input.ui_profile_ref||r.status!=='PASS')
            reasons.push('INVALID_OR_STALE_IMPECCABLE_REVIEW:'+ux.id);
          if(!Array.isArray(r.findings)||r.findings.some(f=>!record(f)||
             !['P0','P1','P2','P3'].includes(f.severity)||typeof f.status!=='string'||!f.status.trim()))
            reasons.push('INVALID_UI_REVIEW_FINDINGS:'+ux.id);
          if(Array.isArray(r.findings)){
            if(r.findings.some(f=>['P0','P1'].includes(f?.severity)&&f.status!=='FIXED'))
              reasons.push('BLOCKING_UI_REVIEW_FINDING:'+ux.id);
            if(r.findings.some(f=>f?.severity==='P2'&&f.status!=='FIXED'&&
               !(hasRef(f.owner_risk_acceptance_ref)&&hasRef(f.acceptance_conditions))))
              reasons.push('UI_REVIEW_P2_NOT_ACCEPTED:'+ux.id);
          }
      }
    }
  }

  // Opt-in formal cross-session acceptance: metadata checks cannot authenticate
  // external runtime/session identity. Independent Owner/reviewer verification required.
  let orchestrationAssessment=null;
  if(input.orchestration_validation_required===true){
    orchestrationAssessment=evaluateOrchestrationChain(input.orchestration_chain);
    if(!orchestrationAssessment.eligible)reasons.push('ORCHESTRATION_CHAIN_INCOMPLETE');
    const chain=input.orchestration_chain;
    const entries=Array.isArray(chain?.chain)?chain.chain:[];
    if(!hasRef(input.context_id)||chain?.context_id!==input.context_id||
       typeof input.repository!=='string'||!input.repository.trim()||chain?.repository!==input.repository||
       !hasRef(input.task_contract_ref)||chain?.task_contract_ref!==input.task_contract_ref)
      reasons.push('ORCHESTRATION_TASK_MISMATCH');
    if(entries.some(e=>e?.dispatch?.repository!==input.repository))
      reasons.push('ORCHESTRATION_REPOSITORY_MISMATCH');
    const usedDispatches=new Set();
    const specialistRoles=['product-analyst','solution-architect','module-architect','ui-ux-designer'];
    const dispatchMap=new Map(entries.filter(e=>record(e?.dispatch)).map(e=>[e.dispatch.dispatch_id,e]));
    function dispatchDependsOn(id,parent,seen=new Set()){
      if(seen.has(id))return false;seen.add(id);
      const parents=dispatchMap.get(id)?.dispatch?.depends_on_dispatch_ids;
      return Array.isArray(parents)&&parents.some(p=>p===parent||dispatchDependsOn(p,parent,seen));
    }
    function specialistAncestors(id,seen=new Set(),found=new Set()){
      if(seen.has(id))return found;seen.add(id);
      for(const parentId of stageMap.get(id)?.depends_on||[]){
        const parent=stageMap.get(parentId);
        if(!parent)continue;
        if(specialistRoles.includes(parent.agent))found.add(parentId);
        specialistAncestors(parentId,seen,found);
      }
      return found;
    }
    for(const stage of required.filter(s=>specialistRoles.includes(s.agent))){
      const b=stage.orchestration_binding;
      if(!record(b)||typeof b.dispatch_id!=='string'||!b.dispatch_id.trim()||
         typeof b.execution_id!=='string'||!b.execution_id.trim()){
        reasons.push('MISSING_STAGE_ORCHESTRATION_BINDING:'+stage.id);continue;
      }
      if(usedDispatches.has(b.dispatch_id))reasons.push('REUSED_STAGE_DISPATCH:'+stage.id);
      usedDispatches.add(b.dispatch_id);
      const matches=entries.filter(e=>e?.dispatch?.dispatch_id===b.dispatch_id);
      if(matches.length!==1){reasons.push('STAGE_EXECUTION_NOT_FOUND:'+stage.id);continue;}
      const e=matches[0];
      const taskRef=Object.hasOwn(b,'task_contract_ref')?b.task_contract_ref:input.task_contract_ref;
      if(e.execution?.execution_id!==b.execution_id||e.dispatch?.target_role!==stage.agent||
         !hasRef(taskRef)||e.dispatch?.task_contract_ref!==taskRef)
        reasons.push('STAGE_EXECUTION_BINDING_MISMATCH:'+stage.id);
      for(const parentId of specialistAncestors(stage.id)){
        const parent=stageMap.get(parentId);
        const parentDispatchId=parent.orchestration_binding?.dispatch_id;
        const parentMatches=entries.filter(item=>item?.dispatch?.dispatch_id===parentDispatchId);
        if(!parentDispatchId||parentMatches.length!==1||
           entries.indexOf(parentMatches[0])>=entries.indexOf(e)||
           !dispatchDependsOn(b.dispatch_id,parentDispatchId))
          reasons.push('STAGE_EXECUTION_DEPENDENCY_MISMATCH:'+stage.id+':'+parentId);
      }
      if(stage.agent==='module-architect'&&
         (e.dispatch?.system_baseline_ref!==input.system_baseline_ref||
          e.dispatch?.system_baseline_ref!==stage.system_baseline_ref||
          e.dispatch?.system_baseline_status!==input.system_baseline_status||
          e.dispatch?.system_baseline_owner_approval_ref!==input.system_baseline_approval_ref))
        reasons.push('STAGE_EXECUTION_BASELINE_MISMATCH:'+stage.id);
      if(stage.agent==='module-architect'&&routing.architecture_scope==='both'){
        const sources=solutions.filter(s=>(s.artifacts||[]).some(a=>
          a?.required!==false&&a.type==='solution-architecture'&&a.ref===input.system_baseline_ref));
        const sourceId=sources.length===1?sources[0].orchestration_binding?.dispatch_id:undefined;
        const sourceIndex=entries.findIndex(item=>item?.dispatch?.dispatch_id===sourceId);
        if(!sourceId||sourceIndex<0||sourceIndex>=entries.indexOf(e)||
           !Array.isArray(e.dispatch?.depends_on_dispatch_ids)||
           !e.dispatch.depends_on_dispatch_ids.includes(sourceId))
          reasons.push('STAGE_EXECUTION_SYSTEM_DEPENDENCY_MISMATCH:'+stage.id);
      }
      if(stage.agent==='ui-ux-designer'&&
         (e.dispatch?.ui_profile_ref!==input.ui_profile_ref||
          e.dispatch?.ui_profile_ref!==stage.profile_ref))
        reasons.push('STAGE_EXECUTION_UI_PROFILE_MISMATCH:'+stage.id);
      const refs=new Set((Array.isArray(e.handoff?.artifact_refs)?e.handoff.artifact_refs:[]).map(a=>a?.ref));
      if(stage.status!=='COMPLETED'||!(stage.artifacts||[]).filter(a=>a?.required!==false).every(a=>refs.has(a.ref)))
        reasons.push('STAGE_HANDOFF_ARTIFACT_MISMATCH:'+stage.id);
    }
    const roles=[
      ...(routing.product_analyst_required?['product-analyst']:[]),
      ...(routing.solution_architect_required?['solution-architect']:[]),
      ...(routing.module_architect_required?['module-architect']:[]),
      ...(routing.ui_required?['ui-ux-designer']:[])
    ];
    for(const role of roles)if(!entries.some(s=>s?.dispatch?.target_role===role))
      reasons.push('MISSING_SPECIALIST_EXECUTION:'+role);
    if(!hasRef(input.owner_live_evidence_review_ref))
      reasons.push('ORCHESTRATION_LIVE_EVIDENCE_NOT_REVIEWED');
  }
  if((input.stages||[]).some(s=>s?.required!==false && s?.status==='STALE'))reasons.push('STALE_DESIGN');
  if(!Array.isArray(input.consistency_checks)||!input.consistency_checks.length||
     input.consistency_checks.some(x=>x.status!=='PASS'||!hasRef(x.evidence_ref)))reasons.push('MISSING_CONSISTENCY_EVIDENCE');
  if(input.material_change===true&&!hasRef(input.material_owner_approval_ref))reasons.push('MISSING_MATERIAL_OWNER_APPROVAL');
  const supplied=input.design_review!==undefined;
  const review=record(input.design_review)?input.design_review:{};
  const acceptedReview=record(input.design_review)&&review.independent===true&&review.mode==='DESIGN'&&
    hasRef(review.evidence_ref)&&['APPROVE','APPROVE_WITH_CONDITIONS'].includes(review.decision);
  if(routing.independent_review_required&&!acceptedReview)reasons.push('MANDATORY_DESIGN_REVIEW');
  if(supplied){
    if(!acceptedReview)reasons.push('INVALID_DESIGN_REVIEW');
    if(review.decision==='REQUEST_CHANGES')reasons.push('DESIGN_REVIEW_REQUEST_CHANGES');
    if(!Array.isArray(review.findings)||review.findings.some(f=>!record(f)||
       !['P0','P1','P2','P3'].includes(f.severity)||typeof f.status!=='string'||!f.status.trim()))
      reasons.push('INVALID_DESIGN_REVIEW_FINDINGS');
    if(Array.isArray(review.findings)){
      if(review.findings.some(f=>['P0','P1'].includes(f?.severity)&&f.status!=='FIXED'))reasons.push('BLOCKING_DESIGN_FINDING');
      if(review.findings.some(f=>f?.severity==='P2'&&f.status!=='FIXED'&&
         !(hasRef(f.owner_risk_acceptance_ref)&&hasRef(f.acceptance_conditions))))reasons.push('P2_NOT_ACCEPTED');
    }
    if(review.independent===true){
      const requiredHashes=required.flatMap(s=>(s.artifacts||[]).filter(a=>a.required!==false).map(a=>a.ref));
      if(!Array.isArray(review.reviewed_refs)||requiredHashes.some(x=>!review.reviewed_refs.includes(x)))
        reasons.push('STALE_OR_INCOMPLETE_REVIEW');
    }
  } else if(!routing.independent_review_required&&!hasRef(input.review_skip_rationale))reasons.push('MISSING_REVIEW_SKIP_RATIONALE');
  if(reasons.length)return {status:'BLOCKED',coding_authorized:false,reasons:unique(reasons),routing,dependencies:deps,orchestration:orchestrationAssessment};
  const codingAuthorized=Boolean(hasRef(input.coding_authorization?.owner_approval_ref)&&
    hasRef(input.coding_authorization?.task_contract_ref)&&input.coding_authorization?.scope_confirmed===true);
  return {status:'DESIGN_READY',coding_authorized:codingAuthorized,
    execution_state:codingAuthorized?'CODING_AUTHORIZED':'AWAITING_OWNER_CODING_AUTHORIZATION',
    reasons:[],routing,dependencies:deps,orchestration:orchestrationAssessment};
}
