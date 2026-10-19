/**
 * PADF V0.3 Master dispatch chain metadata validator.
 * Read-only; validates claimed chronological/identity/link consistency.
 * Does NOT authenticate ChatGPT sessions, URLs, real executions or Owner approval.
 */
const PINS=/@[0-9a-f]{40}$/i;
const ROLES=new Set(['solution-architect','module-architect','ui-ux-designer','feature-coder','qa-tester','independent-reviewer']);
const MODES=new Set(['ROLE_SIMULATION','HUMAN_RELAY','RUNTIME_DISPATCH']);
const DECISIONS=new Set(['CONTINUE','BLOCKED','NEEDS_REFINEMENT']);
const nonempty=x=>typeof x==='string'&&x.trim().length>5;
const pinned=x=>nonempty(x)&&PINS.test(x);
const when=s=>typeof s==='string'&&Number.isFinite(Date.parse(s))?Date.parse(s):NaN;
function problem(errors,stage,code){errors.push({stage,code})}
function claimRef(x){return nonempty(x)&&(/^(https:\/\/|session:|runtime:)/.test(x))}
export function evaluateOrchestrationChain(input={}){
 const errors=[];
 if(input.schema_version!=='padf.agent-dispatch/v1')problem(errors,-1,'SCHEMA_VERSION');
 if(!nonempty(input.context_id))problem(errors,-1,'CONTEXT_ID');
 if(!claimRef(input.master_session_ref))problem(errors,-1,'MASTER_SESSION_REF');
 if(!Array.isArray(input.chain)||input.chain.length===0)
   return {eligible:false,level:'INSUFFICIENT_EVIDENCE',errors:[...errors,{stage:-1,code:'MISSING_CHAIN'}]};
 const ids=new Set(),modes=new Set();
 for(let i=0;i<input.chain.length;i++){
  const item=input.chain[i]||{},d=item.dispatch||{},e=item.execution||{},
        h=item.handoff||{},r=item.reconciliation||{},prev=input.chain[i-1];
  if(!nonempty(d.dispatch_id)||ids.has(d.dispatch_id))problem(errors,i,'DUPLICATE_OR_MISSING_DISPATCH_ID');
  ids.add(d.dispatch_id);
  if(d.context_id!==input.context_id||e.dispatch_id!==d.dispatch_id||
     h.dispatch_id!==d.dispatch_id||r.dispatch_id!==d.dispatch_id)
    problem(errors,i,'CONTEXT_OR_DISPATCH_MISMATCH');
  if(!ROLES.has(d.target_role)||e.executor_role!==d.target_role||h.sender_role!==d.target_role)
    problem(errors,i,'ROLE_MISMATCH');
  if(d.master_session_ref!==input.master_session_ref||r.master_session_ref!==input.master_session_ref)
    problem(errors,i,'MASTER_REF_MISMATCH');
  if(!claimRef(d.dispatch_ref)||!claimRef(d.task_contract_ref)||!pinned(d.skill_ref))
    problem(errors,i,'INVALID_DISPATCH_REFERENCE');
  if(!MODES.has(d.execution_mode))problem(errors,i,'INVALID_EXECUTION_MODE');
  modes.add(d.execution_mode);
  if(!nonempty(d.routing_rationale)||!Array.isArray(d.expected_artifact_types)||!d.expected_artifact_types.length)
    problem(errors,i,'DISPATCH_SCOPE_NOT_DEFINED');
  if(e.dispatch_ref_read!==d.dispatch_ref||e.skill_ref_used!==d.skill_ref ||
     !nonempty(e.execution_id)||!claimRef(e.executor_session_ref))
    problem(errors,i,'EXECUTION_NOT_LINKED_TO_DISPATCH');
  if(e.executor_session_ref===input.master_session_ref)
    problem(errors,i,'SAME_SESSION_NOT_INDEPENDENT');
  if(d.execution_mode==='ROLE_SIMULATION')problem(errors,i,'ROLE_SIMULATION_NOT_ORCHESTRATION');
  if(d.execution_mode==='HUMAN_RELAY'){
    if(d.initiated_by!=='HUMAN_OWNER'||!claimRef(e.human_start_ref)||
       !['OWNER_ATTESTED','SESSION_VERIFIED'].includes(e.evidence_method))
      problem(errors,i,'HUMAN_RELAY_EVIDENCE_MISSING');
  }
  if(d.execution_mode==='RUNTIME_DISPATCH'){
    if(d.initiated_by!=='MASTER_RUNTIME_TOOL'||e.evidence_method!=='RUNTIME_ISSUED'||
       !claimRef(e.runtime_task_ref)||!claimRef(d.runtime_dispatch_ref))
      problem(errors,i,'RUNTIME_DISPATCH_NOT_PROVEN');
  }
  if(!nonempty(h.handoff_id)||!claimRef(h.handoff_ref)||h.execution_id!==e.execution_id||
     !Array.isArray(h.artifact_refs)||!h.artifact_refs.length||
     h.artifact_refs.some(a=>!nonempty(a.kind)||!pinned(a.ref)))
    problem(errors,i,'HANDOFF_EVIDENCE_INCOMPLETE');
  if(!claimRef(r.reconciliation_ref)||!claimRef(r.evidence_check_ref)||
     r.reviewed_handoff_ref!==h.handoff_ref||!DECISIONS.has(r.decision))
    problem(errors,i,'RECONCILIATION_EVIDENCE_INCOMPLETE');
  const times=[when(d.created_at),when(e.started_at),when(h.submitted_at),when(r.observed_at)];
  if(times.some(x=>!Number.isFinite(x))||times.some((x,j)=>j>0&&x<=times[j-1]))
    problem(errors,i,'CHRONOLOGY_INVALID');
  if(prev){
    const pd=prev.dispatch||{},ph=prev.handoff||{},pr=prev.reconciliation||{};
    if(pr.decision!=='CONTINUE')problem(errors,i,'PREDECESSOR_DID_NOT_CONTINUE');
    if(!Array.isArray(d.depends_on_dispatch_ids)||!d.depends_on_dispatch_ids.includes(pd.dispatch_id)||
       d.prior_handoff_ref!==ph.handoff_ref||d.prior_reconciliation_ref!==pr.reconciliation_ref)
      problem(errors,i,'MISSING_DEPENDENCY_RECONCILIATION_LINK');
    if(pr.next_dispatch_id!==d.dispatch_id)
      problem(errors,i,'MASTER_DID_NOT_AUTHORIZE_NEXT_DISPATCH');
    if(!(when(d.created_at)>when(pr.observed_at)))problem(errors,i,'DISPATCH_BEFORE_RECONCILIATION');
  } else if(Array.isArray(d.depends_on_dispatch_ids)&&d.depends_on_dispatch_ids.length)
    problem(errors,i,'MISSING_PREDECESSOR');
  // Module Architect cannot claim formal completion under an unapproved or stale SYSTEM.
  if(d.target_role==='module-architect'){
    const earlierSystem=input.chain.slice(0,i).find(s=>s.dispatch?.target_role==='solution-architect');
    if(!pinned(d.system_baseline_ref)||d.system_baseline_status!=='APPROVED'||
       !claimRef(d.system_baseline_owner_approval_ref))
      problem(errors,i,'UNAPPROVED_MODULE_BASELINE');
    if(earlierSystem){
      const systemRef=earlierSystem.handoff?.artifact_refs?.find(a=>a.kind==='solution-architecture')?.ref;
      if(systemRef!==d.system_baseline_ref)problem(errors,i,'MODULE_BASELINE_SOURCE_MISMATCH');
    }
  }
  if(d.target_role==='ui-ux-designer'&&(!pinned(d.ui_profile_ref)&&!claimRef(d.ui_profile_creation_approval_ref)))
    problem(errors,i,'UI_PROFILE_OR_CREATION_AUTHORIZATION_MISSING');
  if(i<input.chain.length-1&&r.decision!=='CONTINUE')
    problem(errors,i,'DOWNSTREAM_DISPATCH_AFTER_BLOCKER');
 }
 const eligible=errors.length===0;
 const level=!eligible?'INSUFFICIENT_OR_SIMULATED':
   modes.size===1&&modes.has('RUNTIME_DISPATCH')?'RUNTIME_DISPATCH_METADATA_ELIGIBLE':
   modes.size===1&&modes.has('HUMAN_RELAY')?'HUMAN_RELAY_METADATA_ELIGIBLE':
   'MIXED_EXECUTION_METADATA_ELIGIBLE';
 return {eligible,level,errors,stage_count:input.chain.length,
   verification_boundary:'METADATA_ONLY_NOT_LIVE_RUNTIME_PROOF'};
}
