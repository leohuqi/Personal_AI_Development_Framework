// Controlled replay of Owner-reported CR-002 drift. No connector or live mutation.
export const SHA='8e60da55149243bba8ee23e886193fb1b22ed008';
export const NOW='2026-10-26T12:00:00.000Z';
export const ref=s=>'https://github.com/example/padf/'+s;
export const statuses=[
 {id:'backlog',name:'Backlog',type:'backlog'}, {id:'todo',name:'Todo',type:'unstarted'},
 {id:'progress',name:'In Progress',type:'started'}, {id:'review',name:'In Review',type:'started'},
 {id:'done',name:'Done',type:'completed'}, {id:'canceled',name:'Canceled',type:'canceled'}
];
export function fixture(issue='LEO-202'){
 const identity={tracker:'linear',context_id:'PQA-CR002',execution_context_id:'PQA-'+issue,repository:'example/padf',task_contract_ref:ref('issues/27'),parent_cr_id:'LEO-197',execution_issue_id:issue,binding_ref:ref('issues/27#binding')};
 const handoff={handoff_id:'HAND-'+issue,handoff_ref:ref('issues/27#handoff-'+issue),execution_context_id:identity.execution_context_id,execution_issue_id:issue,source_head_sha:SHA,evidence_ref:ref('blob/'+SHA+'/result.md'),submitted_at:'2026-10-26T11:40:00.000Z'};
 const master_ack={handoff_id:handoff.handoff_id,handoff_ref:handoff.handoff_ref,execution_context_id:identity.execution_context_id,execution_issue_id:issue,ack_ref:ref('issues/27#ack-'+issue),observed_at:'2026-10-26T11:45:00.000Z'};
 return {schema_version:'padf.progress-reconciliation/v1',identity,event:{event_id:'EVENT-'+issue,type:'HANDOFF_ACKNOWLEDGED',occurred_at:'2026-10-26T11:45:00.000Z',work_kind:'coding'},handoff,master_ack,
  evidence:{source_head_sha:SHA,evidence_ref:handoff.evidence_ref,implementation_ready:true,pr_ref:ref('pull/13'),pr_draft:true,review:{decision:'APPROVE',conditions:[]}},
  authorization:{status:'APPROVED',identity:structuredClone(identity),evidence_ref:ref('issues/27#scope')},
  issue:{id:issue,uuid:'controlled-'+issue,team_id:'team',parent_id:'LEO-197',state_id:'backlog',blocked_by:[],updated_at:'2026-10-26T11:30:00.000Z',evidence_ref:ref('issues/27#read'),observed_at:NOW},
  statuses:structuredClone(statuses),dependencies:[],now:NOW};
}
export function mockAdapter(input,options={}){
 let state=structuredClone(input.issue);const receipts=new Map();const calls={reads:0,writes:[],persists:0,receiptReads:0};
 const adapter={calls,now:()=>input.now,get state(){return state},set state(x){state=x},receipts,
  async readIssue(id){calls.reads++;if(options.readError)throw Error('read unavailable');if(options.onRead)await options.onRead(calls.reads,state);return structuredClone(state)},
  async readStatuses(){return structuredClone(input.statuses)},
  async updateIssue(id,patch,meta){calls.writes.push({id,patch:structuredClone(patch),meta:structuredClone(meta)});if(options.writeError)throw Error('write forbidden');if(patch.state_id)state.state_id=patch.state_id;state.blocked_by=[...new Set([...state.blocked_by,...patch.add_blocked_by])].filter(x=>!patch.remove_blocked_by.includes(x));state.updated_at='2026-10-26T11:59:00.000Z';if(options.afterWrite)options.afterWrite(state);return {success:true,evidence_ref:ref('issues/27#write')};},
  async persistReceipt(receipt){calls.persists++;if(options.persistError)throw Error('receipt write forbidden');const receipt_ref=ref('issues/27#receipt-'+calls.persists);receipts.set(receipt_ref,structuredClone(receipt));return {receipt_ref}},
  async readReceipt(receipt_ref){calls.receiptReads++;if(options.receiptReadError)throw Error('receipt unavailable');const r=structuredClone(receipts.get(receipt_ref));if(options.tamperReceipt)options.tamperReceipt(r);return r}
 };return adapter;
}
export function chainFixture(input=fixture()){
 const id='DISP-CODER',skill='.agents/skills/feature-coder/SKILL.md@'+SHA;
 return {schema_version:'padf.agent-dispatch/v1',context_id:input.identity.context_id,master_session_ref:'session:master',chain:[{
  progress_identity:structuredClone(input.identity),
  dispatch:{dispatch_id:id,context_id:input.identity.context_id,repository:input.identity.repository,target_role:'feature-coder',master_session_ref:'session:master',dispatch_ref:ref('issues/27#dispatch'),task_contract_ref:input.identity.task_contract_ref,skill_ref:skill,created_at:'2026-10-26T11:00:00.000Z',routing_rationale:'Bounded coding scope',expected_artifact_types:['implementation'],execution_mode:'RUNTIME_DISPATCH',initiated_by:'MASTER_RUNTIME_TOOL',runtime_dispatch_ref:'runtime:dispatch-coder',depends_on_dispatch_ids:[],progress_identity:structuredClone(input.identity)},
  execution:{execution_id:'EXEC-CODER',dispatch_id:id,executor_role:'feature-coder',executor_session_ref:'runtime:coder',started_at:'2026-10-26T11:10:00.000Z',dispatch_ref_read:ref('issues/27#dispatch'),skill_ref_used:skill,evidence_method:'RUNTIME_ISSUED',runtime_task_ref:'runtime:coder'},
  handoff:{...structuredClone(input.handoff),dispatch_id:id,execution_id:'EXEC-CODER',sender_role:'feature-coder',artifact_refs:[{kind:'implementation',ref:'result.md@'+SHA}]},
  reconciliation:{dispatch_id:id,master_session_ref:'session:master',reconciliation_ref:ref('issues/27#reconcile'),evidence_check_ref:ref('issues/27#check'),observed_at:'2026-10-26T11:50:00.000Z',reviewed_handoff_ref:input.handoff.handoff_ref,decision:'CONTINUE',next_dispatch_id:null,master_ack:structuredClone(input.master_ack)}
 }]};
}
export function doneInput(input){
 const i=input.identity,subject={repository:i.repository,context_id:i.context_id,execution_context_id:i.execution_context_id,execution_issue_id:i.execution_issue_id,task_contract_ref:i.task_contract_ref,environment:'isolated',target_ref:'main',base_sha:'a'.repeat(40),head_sha:input.evidence.source_head_sha};
 const proof=status=>({status,head_sha:subject.head_sha,evidence_ref:ref('issues/27#proof')});
 return {schema_version:'padf.action-preflight/v1',now:input.now,verification:{verified:true,observed_at:input.now,valid_until:'2026-10-26T12:02:00.000Z',evidence_ref:ref('issues/27#read')},action:'MARK_ISSUE_DONE',subject,authorization:{status:'APPROVED',owner_approval_ref:ref('issues/27#done-owner'),action:'MARK_ISSUE_DONE',subject:structuredClone(subject)},policy:{evidence_ref:ref('issues/27#policy'),review_required:true,qa_required:true,task_class:'M',impacts:[],risk_flags:[]},implementation:proof('COMPLETE'),ci:{...proof('PASS'),checks:[{...proof('PASS'),name:'tests',required:true}]},qa:{...proof('PASS'),untested_required:0},execution_context:{implementer_session_ref:'runtime:coder',master_session_ref:'runtime:master'},review:{status:'COMPLETED',decision:'APPROVE',mode:'IMPLEMENTATION',base_sha:subject.base_sha,head_sha:subject.head_sha,actual_diff_reviewed:true,diff_ref:ref('compare/'+subject.base_sha+'...'+subject.head_sha),execution:{execution_id:'review-task',session_ref:'runtime:reviewer',execution_mode:'RUNTIME_DISPATCH',evidence_ref:ref('issues/27#review-execution'),runtime_task_ref:'runtime:reviewer'},handoff_ref:ref('issues/27#review'),conditions:[]},acceptance:{...proof('ACCEPTED'),context_id:i.context_id,execution_context_id:i.execution_context_id,execution_issue_id:i.execution_issue_id,task_contract_ref:i.task_contract_ref},findings:[],blockers:[]};
}
