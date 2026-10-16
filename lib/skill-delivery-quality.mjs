/**
 * PADF V0.3 owner-facing quality sheet *metadata* checker.
 * Never evaluates actual technical design or authenticates the Owner.
 */
const SHA=/@[0-9a-f]{40}$/i;
const mandatory={
 'solution-architect':['SA-Q1','SA-Q2','SA-Q3','SA-Q4','SA-Q5'],
 'module-architect':['MA-Q1','MA-Q2','MA-Q3','MA-Q4','MA-Q5'],
 'ui-ux-designer':['UI-Q1','UI-Q2','UI-Q3','UI-Q4','UI-Q5']
};
const critical=new Set(['SA-Q1','SA-Q2','SA-Q3','SA-Q4','MA-Q1','MA-Q2','MA-Q3','MA-Q4','UI-Q1','UI-Q2','UI-Q3','UI-Q4']);
const ref=x=>typeof x==='string'&&x.trim().length>8;
export function evaluateSkillDeliveryQuality(sheet={}){
 const issues=[],role=sheet.skill_role,expected=mandatory[role];
 if(sheet.schema_version!=='padf.skill-delivery-evaluation/v1')issues.push('INVALID_SCHEMA');
 if(!expected)issues.push('UNKNOWN_SPECIALIST');
 if(!ref(sheet.context_id)||!ref(sheet.dispatch_id)||!ref(sheet.execution_id))
   issues.push('EXECUTION_LINK_MISSING');
 if(!SHA.test(sheet.skill_ref||'')||!SHA.test(sheet.artifact_manifest_ref||''))
   issues.push('UNPINNED_SKILL_OR_ARTIFACTS');
 const reviews=Array.isArray(sheet.criteria)?sheet.criteria:[];
 const seen=new Set();
 for(const item of reviews){
   if(!item||seen.has(item.id)){issues.push('DUPLICATE_OR_INVALID_CRITERION');continue}
   seen.add(item.id);
   if(!expected?.includes(item.id))issues.push('WRONG_ROLE_CRITERION:'+item.id);
   if(item.score==='N/A'){
     if(critical.has(item.id)&&!(role==='ui-ux-designer'&&item.id==='UI-Q4'&&sheet.ui_level!=='L3'))
       issues.push('CRITICAL_ITEM_NOT_APPLICABLE:'+item.id);
     if(!ref(item.na_reason))issues.push('MISSING_NA_REASON:'+item.id);
   }else if(![0,1,2,3].includes(item.score)){
     issues.push('INVALID_SCORE:'+item.id);
   }else{
     if(item.score<2&&critical.has(item.id))issues.push('CRITICAL_QUALITY_FAIL:'+item.id);
     if(!ref(item.evidence_ref))issues.push('CRITERION_EVIDENCE_MISSING:'+item.id);
   }
 }
 for(const id of expected||[])if(!seen.has(id))issues.push('MISSING_CRITERION:'+id);
 if(sheet.owner_decision!=='ACCEPT')issues.push('OWNER_NOT_ACCEPTED');
 if(!ref(sheet.owner_evaluation_ref))issues.push('OWNER_EVALUATION_EVIDENCE_MISSING');
 if(sheet.unresolved_p0_p1===true)issues.push('BLOCKING_FINDINGS');
 // Required tools are verified manually. A check mark without actual evidence is not enough.
 if(['solution-architect','module-architect'].includes(role)&&
    (!ref(sheet.diagram_tool_execution_ref)||!ref(sheet.diagram_render_verification_ref)))
     issues.push('ACTUAL_DIAGRAM_TOOL_PROOF_MISSING');
 if(role==='ui-ux-designer'&&sheet.ui_level==='L3'&&
    (!ref(sheet.interactive_prototype_ref)||!ref(sheet.interaction_test_ref)))
     issues.push('WORKING_L3_PROTOTYPE_EVIDENCE_MISSING');
 return {eligible:issues.length===0,decision:issues.length?'NOT_ACCEPTED':'PILOT_DELIVERY_ACCEPTED_METADATA_ONLY',
   issues,verification_boundary:'ONLY_METADATA_OWNER_MUST_INSPECT_ACTUAL_ARTIFACTS'};
}
