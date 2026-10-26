/**
 * PADF V0.3 Master dispatch chain metadata validator.
 * Read-only; validates claimed chronological/identity/link consistency.
 * Does NOT authenticate ChatGPT sessions, URLs, real executions or Owner approval.
 */
import {createHash} from 'node:crypto';
const PINS=/@[0-9a-f]{40}$/i;
const ROLES=new Set(['solution-architect','module-architect','ui-ux-designer','feature-coder','qa-tester','independent-reviewer','context-coordinator','product-analyst']);
const MODES=new Set(['ROLE_SIMULATION','HUMAN_RELAY','RUNTIME_DISPATCH']);
const DECISIONS=new Set(['CONTINUE','BLOCKED','NEEDS_REFINEMENT']);
const nonempty=x=>typeof x==='string'&&x.trim().length>5;
const pinned=x=>nonempty(x)&&PINS.test(x);
const when=s=>typeof s==='string'&&Number.isFinite(Date.parse(s))?Date.parse(s):NaN;
function problem(errors,stage,code){errors.push({stage,code})}
function claimRef(x){return nonempty(x)&&(/^(https:\/\/|session:|runtime:)/.test(x))}
export function evaluateOrchestrationChain(input={}){
 if(input===null||typeof input!=='object'||Array.isArray(input))input={};
 const errors=[];
 if(input.schema_version!=='padf.agent-dispatch/v1')problem(errors,-1,'SCHEMA_VERSION');
 if(!nonempty(input.context_id))problem(errors,-1,'CONTEXT_ID');
 if(!claimRef(input.master_session_ref))problem(errors,-1,'MASTER_SESSION_REF');
 if(!Array.isArray(input.chain)||input.chain.length===0)
   return {eligible:false,level:'INSUFFICIENT_EVIDENCE',errors:[...errors,{stage:-1,code:'MISSING_CHAIN'}]};
 const progressRequired=input.progress_reconciliation_required===true||input.chain.some(s=>s?.progress_identity!==undefined||s?.dispatch?.progress_identity!==undefined);
 if(input.progress_reconciliation_required!==undefined&&typeof input.progress_reconciliation_required!=='boolean')problem(errors,-1,'INVALID_PROGRESS_REQUIREMENT');
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
    const systems=input.chain.filter(s=>s?.dispatch?.target_role==='solution-architect');
    if(!pinned(d.system_baseline_ref)||d.system_baseline_status!=='APPROVED'||
       !claimRef(d.system_baseline_owner_approval_ref))
      problem(errors,i,'UNAPPROVED_MODULE_BASELINE');
    if(systems.length){
      const sources=systems.filter(s=>Array.isArray(s.handoff?.artifact_refs)&&
        s.handoff.artifact_refs.some(a=>a?.kind==='solution-architecture'&&a.ref===d.system_baseline_ref));
      if(sources.length!==1)problem(errors,i,'MODULE_BASELINE_SOURCE_MISMATCH');
      else {
        if(input.chain.indexOf(sources[0])>=i)problem(errors,i,'MODULE_BEFORE_SYSTEM_BASELINE_SOURCE');
        if(!Array.isArray(d.depends_on_dispatch_ids)||
           !d.depends_on_dispatch_ids.includes(sources[0].dispatch.dispatch_id))
          problem(errors,i,'MISSING_MODULE_BASELINE_SOURCE_DEPENDENCY');
      }
    }
  }
  if(d.target_role==='ui-ux-designer'&&(!pinned(d.ui_profile_ref)&&!claimRef(d.ui_profile_creation_approval_ref)))
    problem(errors,i,'UI_PROFILE_OR_CREATION_AUTHORIZATION_MISSING');
  if(i<input.chain.length-1&&r.decision!=='CONTINUE')
    problem(errors,i,'DOWNSTREAM_DISPATCH_AFTER_BLOCKER');
  if(progressRequired){
   const identity=item.progress_identity??d.progress_identity;
   const identityErrors=validateProgressIdentity(identity).errors;
   if(identityErrors.length)problem(errors,i,'PROGRESS_IDENTITY_REQUIRED');
   else if(identity.context_id!==input.context_id||identity.repository!==d.repository||identity.task_contract_ref!==d.task_contract_ref||
     (item.progress_identity&&d.progress_identity&&!progressSame(item.progress_identity,d.progress_identity)))problem(errors,i,'PROGRESS_IDENTITY_MISMATCH');
   else if(identity.tracker==='linear'||r.progress_receipt!==undefined){
    const receipt=r.progress_receipt,v=validateProgressSyncReceipt(receipt);
    if(!v.valid)problem(errors,i,'PROGRESS_RECEIPT_MISSING_OR_INVALID');
    else if(identity.tracker==='linear'&&(!['HANDOFF_ACKNOWLEDGED','REVIEW_COMPLETED','DONE_REQUESTED'].includes(receipt.event?.type)||
      !['IMPLEMENTATION_READY','REVIEW_IN_PROGRESS','REVIEWED_WITH_CONDITIONS','OWNER_ACCEPTANCE_PENDING','DONE'].includes(receipt.stage)))problem(errors,i,'PROGRESS_RECEIPT_NOT_POST_HANDOFF');
    else if(!progressSame(receipt.identity,identity)||receipt.handoff?.handoff_id!==h.handoff_id||receipt.handoff?.handoff_ref!==h.handoff_ref||
      receipt.source_head_sha!==h.source_head_sha||!progressSame(receipt.master_ack,r.master_ack)||
      !claimRef(r.master_ack?.ack_ref)||when(receipt.synced_at)>when(r.observed_at))problem(errors,i,'PROGRESS_RECEIPT_STAGE_MISMATCH');
   }
  }
 }
 const eligible=errors.length===0;
 const level=!eligible?'INSUFFICIENT_OR_SIMULATED':
   modes.size===1&&modes.has('RUNTIME_DISPATCH')?'RUNTIME_DISPATCH_METADATA_ELIGIBLE':
   modes.size===1&&modes.has('HUMAN_RELAY')?'HUMAN_RELAY_METADATA_ELIGIBLE':
   'MIXED_EXECUTION_METADATA_ELIGIBLE';
 return {eligible,level,errors,stage_count:input.chain.length,
   verification_boundary:'METADATA_ONLY_NOT_LIVE_RUNTIME_PROOF'};
}

/** Pre-dispatch policy check of a caller-verified snapshot; never grants permission or launches work. */
const DELEGATED_ACTIONS=new Set(['ANALYZE','DESIGN_PROPOSAL','DESIGN','TEST','REVIEW','COORDINATE']);
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const textId=x=>typeof x==='string'&&x.trim().length>0;
const uniqueIds=xs=>Array.isArray(xs)&&xs.length>0&&xs.every(textId)&&new Set(xs).size===xs.length;
export function evaluateDispatchAuthorization(input={}){
 const errors=[];
 const a=record(input?.authorization)?input.authorization:{},d=record(input?.dispatch)?input.dispatch:{};
 const fail=code=>{if(!errors.includes(code))errors.push(code)};
 if(a.schema_version!=='padf.dispatch-authorization/v1'||!claimRef(a.authorization_ref)||!claimRef(a.owner_approval_ref))
  fail('MISSING_AUTHORIZATION');
 if(a.status!=='APPROVED')fail('AUTHORIZATION_NOT_ACTIVE');
 for(const field of ['context_id','repository','task_contract_ref','environment'])
  if(!textId(a[field])||a[field]!==d[field])fail('AUTHORIZATION_SCOPE_MISMATCH');
 if(!claimRef(a.task_contract_ref))fail('INVALID_TASK_CONTRACT');
 if(!ROLES.has(d.target_role))fail('ROLE_NOT_ALLOWED');
 if(!DELEGATED_ACTIONS.has(d.action))fail('ACTION_REQUIRES_SEPARATE_AUTHORIZATION');
 const scopes=Array.isArray(a.scope_items)?a.scope_items:[];
 if(!scopes.length||scopes.some(s=>!record(s))||!uniqueIds(scopes.map(s=>s?.id)))
  fail('INVALID_AUTHORIZED_SCOPE');
 if(!uniqueIds(d.scope_ids))fail('INVALID_DISPATCH_SCOPE');
 const approvals=Array.isArray(input?.decision_approvals)?input.decision_approvals:[];
 if(input?.decision_approvals!==undefined&&!Array.isArray(input.decision_approvals))fail('INVALID_DECISION_APPROVALS');
 for(const id of Array.isArray(d.scope_ids)?d.scope_ids:[]){
  const scope=scopes.find(s=>record(s)&&s.id===id);
  if(!scope){fail('SCOPE_NOT_AUTHORIZED');continue}
  if(!uniqueIds(scope.allowed_roles)||!scope.allowed_roles.includes(d.target_role))fail('ROLE_NOT_ALLOWED');
  if(!uniqueIds(scope.allowed_actions)||!scope.allowed_actions.includes(d.action))fail('ACTION_NOT_ALLOWED');
  if(!Array.isArray(scope.required_decisions)){fail('INVALID_DECISION_REQUIREMENTS');continue}
  const requirements=scope.required_decisions;
  if(requirements.length&&(!requirements.every(record)||!uniqueIds(requirements.map(r=>r?.decision_id))))
   fail('INVALID_DECISION_REQUIREMENTS');
  const hasKind=k=>requirements.some(r=>record(r)&&r.kind===k);
  if(d.action==='DESIGN'&&d.target_role==='module-architect'&&!hasKind('SYSTEM_BASELINE'))
   fail('SYSTEM_APPROVAL_REQUIREMENT_MISSING');
  if(d.action==='DESIGN'&&d.target_role==='ui-ux-designer'&&!hasKind('UI_PROFILE')&&!hasKind('UI_PROFILE_CREATION'))
   fail('UI_APPROVAL_REQUIREMENT_MISSING');
  for(const r of requirements){
   if(!record(r)||!textId(r.decision_id)||!textId(r.kind)||!pinned(r.subject_ref)){
    fail('INVALID_DECISION_REQUIREMENTS');continue;
   }
   const matches=approvals.filter(p=>record(p)&&p.decision_id===r.decision_id);
   if(matches.length!==1||matches[0].status!=='APPROVED'||matches[0].kind!==r.kind||
      matches[0].subject_ref!==r.subject_ref||!claimRef(matches[0].owner_approval_ref))
    fail('REQUIRED_DECISION_NOT_APPROVED');
  }
 }
 return {allowed:errors.length===0,decision:errors.length?'BLOCKED':'CONTINUE',errors,
  authorization_ref:a.authorization_ref??null,
  verification_boundary:'SNAPSHOT_ONLY_NOT_LIVE_AUTHORIZATION_OR_EXECUTION'};
}

// Pure additive progress evidence checks. Legacy chains without the extension keep
// their original semantics. These checks do not authenticate live tool evidence.
const progressCanonical=x=>Array.isArray(x)?x.map(progressCanonical):record(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,progressCanonical(x[k])])):x;
const progressSame=(a,b)=>JSON.stringify(progressCanonical(a))===JSON.stringify(progressCanonical(b));
const progressHash=x=>createHash('sha256').update(JSON.stringify(progressCanonical(x))).digest('hex');
const progressEvents=new Set(['READY','EXECUTION_STARTED','HANDOFF_ACKNOWLEDGED','REVIEW_COMPLETED','REWORK_STARTED','DEPENDENCIES_CHANGED','DONE_REQUESTED']);
const progressStages={WAITING_DEPENDENCIES:'Backlog',READY:'Todo',DESIGN_IN_PROGRESS:'In Progress',CODING_IN_PROGRESS:'In Progress',IMPLEMENTATION_READY:'In Review',REVIEW_IN_PROGRESS:'In Review',REVIEWED_WITH_CONDITIONS:'In Review',OWNER_ACCEPTANCE_PENDING:'In Review',DESIGN_REWORK:'In Progress',CODING_REWORK:'In Progress',DONE:'Done'};
export function validateProgressIdentity(i){
 const errors=[],fail=s=>errors.push(s);
 if(!record(i)){fail('EXECUTION_IDENTITY_REQUIRED');return {valid:false,errors}}
 if(!['linear','none'].includes(i.tracker))fail('TRACKER_APPLICABILITY_REQUIRED');
 if(!['context_id','execution_context_id','repository'].every(k=>textId(i[k]))||!claimRef(i.task_contract_ref)||!claimRef(i.binding_ref))fail('EXECUTION_CONTEXT_BINDING_REQUIRED');
 if(i.tracker==='linear'){
  if(!textId(i.execution_issue_id))fail('EXECUTION_ISSUE_ID_REQUIRED');
  if(i.parent_cr_id!==null&&!textId(i.parent_cr_id))fail('PARENT_ID_MUST_BE_EXPLICIT');
  if(i.parent_cr_id===i.execution_issue_id)fail('PARENT_CANNOT_REPLACE_EXECUTION_ISSUE');
 }else if(i.tracker==='none'&&(i.execution_issue_id!==null||i.parent_cr_id!==null))fail('NON_LINEAR_IDENTITY_MUST_BE_EXPLICIT');
 return {valid:errors.length===0,errors};
}
export function progressReceiptCore(receipt){
 if(!record(receipt))return null;
 const {receipt_ref,persistence,...core}=receipt;return core;
}
export function validateProgressSyncReceipt(receipt){
 const r=record(receipt)?receipt:{},errors=[],fail=s=>{if(!errors.includes(s))errors.push(s)};
 if(r.schema_version!=='padf.progress-sync-receipt/v1')fail('INVALID_PROGRESS_RECEIPT_SCHEMA');
 for(const e of validateProgressIdentity(r.identity).errors)fail(e);
 if(!['SYNCED','NO_CHANGE_REQUIRED'].includes(r.result))fail('PROGRESS_NOT_VERIFIED');
 if(!textId(r.receipt_id)||!textId(r.attempt_id)||!textId(r.operation_key))fail('RECEIPT_IDENTITY_REQUIRED');
 if(r.identity?.tracker==='none'){
  if(r.result!=='NO_CHANGE_REQUIRED'||r.applicability!=='NOT_APPLICABLE'||!Array.isArray(r.write_results)||r.write_results.length)fail('INVALID_NOT_APPLICABLE_RECEIPT');
  return {valid:errors.length===0,errors,verification_boundary:'METADATA_ONLY_NOT_LIVE_LINEAR_PROOF'};
 }
 if(!claimRef(r.receipt_ref)||r.persistence?.verified!==true||r.persistence?.core_sha256!==progressHash(progressReceiptCore(r)))fail('RECEIPT_PERSISTENCE_NOT_VERIFIED');
 if(r.verification_boundary!=='READ_BACK_OBSERVED_NOT_ATOMIC'||!Number.isFinite(when(r.observed_at))||!Number.isFinite(when(r.synced_at))||when(r.synced_at)<when(r.observed_at))fail('RECEIPT_OBSERVATION_REQUIRED');
 if(!/^[a-f0-9]{40}$/i.test(r.source_head_sha??'')||r.source_head_sha!==r.evidence?.source_head_sha||!claimRef(r.evidence?.evidence_ref)||!(r.evidence.evidence_ref.includes('/blob/'+r.source_head_sha+'/')||r.evidence.evidence_ref.endsWith('/commit/'+r.source_head_sha)||r.evidence.evidence_ref.includes('/tree/'+r.source_head_sha+'/')||r.evidence.evidence_ref.endsWith('@'+r.source_head_sha)))fail('RECEIPT_SOURCE_REQUIRED');
 if(!record(r.event)||!progressEvents.has(r.event.type)||!textId(r.event.event_id)||!Number.isFinite(when(r.event.occurred_at))||when(r.event.occurred_at)>when(r.synced_at))fail('RECEIPT_EVENT_REQUIRED');
 if(!progressSame(r.review,r.evidence?.review??null))fail('RECEIPT_REVIEW_CONDITIONS_MISMATCH');
 if(r.stage==='DEPENDENCIES_CHANGED'?r.event?.type!=='DEPENDENCIES_CHANGED'||r.original_issue?.state_id!==r.target_state?.id:progressStages[r.stage]!==r.target_state?.name)fail('RECEIPT_STAGE_TARGET_MISMATCH');
 if(!Array.isArray(r.failure_items)||r.failure_items.length||!Array.isArray(r.reasons)||r.reasons.length)fail('RECEIPT_HAS_FAILURES');
 const before=r.original_issue,after=r.readback,i=r.identity;
 const pre=r.pre_write_issue;
 if(!record(pre)||!Number.isFinite(when(before?.observed_at))||!Number.isFinite(when(pre.observed_at))||
   when(pre.observed_at)<when(before?.observed_at)||when(after?.observed_at)<when(pre.observed_at)||
   when(after?.observed_at)<when(r.observed_at)||when(r.synced_at)-when(after?.observed_at)>300000||
   when(r.synced_at)-when(pre.observed_at)>300000)fail('RECEIPT_READBACK_STALE_OR_OUT_OF_ORDER');
 if(!Array.isArray(r.statuses)||r.statuses.filter(s=>s?.id===r.target_state?.id&&s.name===r.target_state?.name&&s.type===r.target_state?.type).length!==1)fail('RECEIPT_TEAM_STATUS_MAPPING_INVALID');
 if(!textId(r.stage)||!textId(r.target_state?.name)||!Number.isFinite(when(after?.observed_at))||when(after.observed_at)>when(r.synced_at)||when(after.updated_at)>when(r.synced_at)||when(after.updated_at)<when(before?.updated_at))fail('RECEIPT_STAGE_OR_READBACK_TIME_INVALID');
 if(!record(before)||!record(after)||!record(r.target_state)||!textId(r.target_state.id)||!['id','uuid','team_id','parent_id'].every(k=>before[k]===after[k])||before.id!==i?.execution_issue_id||before.parent_id!==i?.parent_cr_id||after.state_id!==r.target_state.id||!Number.isFinite(when(after.updated_at))||!claimRef(after.evidence_ref))fail('LINEAR_READBACK_MISMATCH');
 const changes=Array.isArray(r.dependency_changes)?r.dependency_changes:[];
 if(!Array.isArray(r.dependency_changes)||changes.some(d=>!record(d)||!['ADD','REMOVE'].includes(d.action)||!textId(d.issue_id)||d.issue_id===i?.parent_cr_id||d.issue_id===i?.execution_issue_id||!claimRef(d.evidence_ref))||new Set(changes.map(d=>d.issue_id)).size!==changes.length)fail('RECEIPT_DEPENDENCY_EVIDENCE_INVALID');
 if(Array.isArray(before?.blocked_by)&&Array.isArray(after?.blocked_by)){
  const expected=[...new Set([...before.blocked_by,...changes.filter(d=>d.action==='ADD').map(d=>d.issue_id)])].filter(id=>!changes.some(d=>d.action==='REMOVE'&&d.issue_id===id));
  if(!progressSame([...expected].sort(),[...after.blocked_by].sort()))fail('RECEIPT_DEPENDENCY_READBACK_MISMATCH');
 }else fail('RECEIPT_DEPENDENCY_READBACK_REQUIRED');
 const writes=Array.isArray(r.write_results)?r.write_results:[];
 if(!Array.isArray(r.write_results)||writes.some(w=>w?.status!=='SUCCESS'||w.issue_id!==i?.execution_issue_id||w.response?.success!==true||!claimRef(w.response?.evidence_ref)))fail('RECEIPT_WRITE_NOT_VERIFIED');
 if(r.result==='SYNCED'&&!writes.length)fail('SYNCED_REQUIRES_ACTUAL_WRITE');
 if(r.result==='NO_CHANGE_REQUIRED'&&(writes.length||before?.state_id!==r.target_state?.id||changes.length))fail('NO_CHANGE_REQUIRES_ZERO_WRITES');
 if(r.result==='SYNCED'){
  const add=[],remove=[],stateWrites=[];
  for(const w of writes){const p=w.patch;
   if(!record(p)||Object.keys(p).some(k=>!['state_id','add_blocked_by','remove_blocked_by'].includes(k))||!Array.isArray(p.add_blocked_by)||!Array.isArray(p.remove_blocked_by)){fail('RECEIPT_WRITE_PATCH_MISMATCH');continue}
   add.push(...p.add_blocked_by);remove.push(...p.remove_blocked_by);if(p.state_id!==undefined)stateWrites.push(p.state_id);
  }
  if(!progressSame([...new Set(add)].sort(),changes.filter(d=>d.action==='ADD').map(d=>d.issue_id).sort())||!progressSame([...new Set(remove)].sort(),changes.filter(d=>d.action==='REMOVE').map(d=>d.issue_id).sort())||stateWrites.some(id=>id!==r.target_state?.id)||(before?.state_id!==r.target_state?.id&&!stateWrites.length))fail('RECEIPT_WRITE_PATCH_MISMATCH');
 }
 if(['HANDOFF_ACKNOWLEDGED','REVIEW_COMPLETED','DONE_REQUESTED'].includes(r.event?.type)){
  const h=r.handoff,a=r.master_ack;
  if(!record(h)||!record(a)||!textId(h.handoff_id)||!claimRef(h.handoff_ref)||!claimRef(a.ack_ref)||h.handoff_id!==a.handoff_id||h.handoff_ref!==a.handoff_ref||h.source_head_sha!==r.source_head_sha||h.evidence_ref!==r.evidence?.evidence_ref||[h,a].some(x=>x.execution_issue_id!==i?.execution_issue_id||x.execution_context_id!==i?.execution_context_id)||!Number.isFinite(when(h.submitted_at))||!Number.isFinite(when(a.observed_at))||when(h.submitted_at)>when(a.observed_at)||when(a.observed_at)>when(r.event.occurred_at))fail('RECEIPT_HANDOFF_ACK_MISMATCH');
 }
 if(r.target_state?.type==='completed'||r.event?.type==='DONE_REQUESTED'){
  if(r.event?.type!=='DONE_REQUESTED'||r.done_verification?.decision!=='READY'||r.done_verification?.execution_issue_id!==i?.execution_issue_id||r.done_verification?.execution_context_id!==i?.execution_context_id)fail('RECEIPT_DONE_GATE_NOT_VERIFIED');
  if(!Array.isArray(r.dependencies)||r.dependencies.some(d=>d?.satisfied!==true)||!Array.isArray(after?.blocked_by)||after.blocked_by.length||changes.some(d=>d.action==='ADD'||d.satisfied!==true))fail('RECEIPT_DONE_HAS_UNSATISFIED_DEPENDENCIES');
 }
 return {valid:errors.length===0,errors,verification_boundary:'METADATA_ONLY_NOT_LIVE_LINEAR_PROOF'};
}
