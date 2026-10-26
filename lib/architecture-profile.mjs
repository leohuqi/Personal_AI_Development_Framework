import {routeAgents} from './design-gate.mjs';

// Method advice only. Does not change routing, Design Gate, approval or execution.
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const complexities=new Set(['low','medium','high']);
const baselines=new Set(['APPROVED','PROPOSED','MISSING']);
const security=new Set(['auth','permissions','privacy','security','sensitive-data','trust-boundary']);
const recovery=new Set(['file-delete','file-deletion','destructive-operation','destructive-migration',
  'risky-schema-migration','cache-sync','synchronization','recovery','data-recovery','restore','backup']);
const data=new Set(['database','financial-data','concurrency','data-consistency',...recovery]);
const workflow=new Set(['workflow','critical-workflow','integration','concurrency',...recovery]);
const knownRisks=new Set([...security,...data,...workflow,'breaking-api','critical-business-rule',
  'design-system','shared-component','cross-module']);
const knownImpacts=new Set([...knownRisks,'new-product','architecture','system-boundary','platform',
  'technology-stack','deployment','infrastructure','api','module-design','code-structure',
  'product-definition','product-behavior','ui','interaction','documentation','bugfix','bug',
  'text','copy','presentation','local-ui','read-only','content']);
const strings=xs=>Array.isArray(xs)&&xs.every(x=>typeof x==='string'&&x.trim()===x&&x.length>0);

/**
 * Select depth for the affected change, independently of architecture_scope.
 * Optional counts describe affected runtime units / changed external dependencies,
 * not the entire project's installed fleet. Advice never waives existing gates.
 */
export function selectArchitectureProfile(raw={}){
  const invalid=errors=>({valid:false,profile:null,views:[],reasons:[],errors,
    gate_policy:'UNCHANGED',review_recommended:true});
  if(!record(raw))return invalid(['INVALID_PROFILE_INPUT']);
  const impacts=raw.impacts===undefined?[]:raw.impacts,risks=raw.risk_flags===undefined?[]:raw.risk_flags;
  if(!strings(impacts)||!strings(risks))return invalid(['INVALID_IMPACTS_OR_RISKS']);
  if(raw.change_complexity!==undefined&&!complexities.has(raw.change_complexity))
    return invalid(['INVALID_CHANGE_COMPLEXITY']);
  if(raw.baseline_state!==undefined&&!baselines.has(raw.baseline_state))
    return invalid(['INVALID_BASELINE_STATE']);
  for(const field of ['runtime_nodes','external_dependencies'])
    if(raw[field]!==undefined&&(!Number.isInteger(raw[field])||raw[field]<0))
      return invalid(['INVALID_'+field.toUpperCase()]);
  if(raw.source_conflicts!==undefined&&typeof raw.source_conflicts!=='boolean')
    return invalid(['INVALID_SOURCE_CONFLICTS']);
  const routing=routeAgents({task_class:raw.task_class,architecture_scope:raw.architecture_scope,
    product_scope:raw.product_scope,impacts:[...impacts],risk_flags:[...risks]});
  if(!routing.valid)return invalid([...routing.errors]);
  const scope=routing.architecture_scope,signals=new Set([...impacts,...risks]);
  const unknown=[...impacts.filter(x=>!knownImpacts.has(x)),...risks.filter(x=>!knownRisks.has(x))];
  const risky=unknown.length>0||[...signals].some(x=>knownRisks.has(x));
  const assessed=raw.impacts!==undefined&&raw.risk_flags!==undefined&&
    raw.change_complexity!==undefined&&raw.baseline_state!==undefined&&
    raw.runtime_nodes!==undefined&&raw.external_dependencies!==undefined;
  const nodes=raw.runtime_nodes??1,dependencies=raw.external_dependencies??0;
  const local=['none','module'].includes(scope);
  const lite=assessed&&local&&raw.change_complexity==='low'&&raw.baseline_state==='APPROVED'&&
    !risky&&!raw.source_conflicts&&dependencies===0&&(scope==='none'||nodes<=2);
  const full=!lite&&(raw.change_complexity==='high'||
    (['system','both'].includes(scope)&&(nodes>=4||dependencies>=3))||
    (risky&&nodes>=3&&raw.change_complexity==='medium'));
  const profile=lite?'Lite':full?'Full':'Standard';
  const views=new Set(profile==='Full'?
    ['overview','context','container','component','deployment','runtime','data']:['overview']);
  if(scope==='module'||scope==='both')views.add('module');
  if(profile!=='Lite'&&['system','both'].includes(scope))views.add('container');
  if(profile!=='Lite'&&nodes>1&&['system','both'].includes(scope))views.add('deployment');
  if([...signals].some(x=>security.has(x))){
    views.add('security-quality');views.add('runtime');views.add('data');
  }
  if([...signals].some(x=>data.has(x)))views.add('data');
  if([...signals].some(x=>workflow.has(x)))views.add('runtime');
  if(profile!=='Lite'&&(['system','both'].includes(scope)||raw.change_complexity==='high'))
    views.add('decisions');
  if(raw.source_conflicts)views.add('source-map');
  const reasons=[lite?'LOCAL_LOW_RISK_REUSE':full?'COMPLEX_AFFECTED_DESIGN':'BOUNDED_STANDARD_DESIGN'];
  if(!assessed)reasons.push('INCOMPLETE_SELECTION_CONTEXT');
  if(unknown.length)reasons.push('UNASSESSED_RISK_OR_IMPACT');
  if(risky)reasons.push('RISK_SPECIFIC_VIEWS_AND_REVIEW');
  if(local&&raw.baseline_state!=='APPROVED')reasons.push('VERIFY_APPROVED_BASELINE_BEFORE_FORMAL_USE');
  if(raw.source_conflicts)reasons.push('RESOLVE_AUTHORITY_CONFLICT');
  if(routing.independent_review_required)reasons.push('EXISTING_DESIGN_REVIEW_REQUIRED');
  return {valid:true,profile,architecture_scope:scope,views:[...views],reasons,errors:[],
    independent_review_required:routing.independent_review_required,
    review_recommended:routing.independent_review_required||risky||!assessed||!!raw.source_conflicts,
    gate_policy:'UNCHANGED',
    limitations:['METHOD_ADVICE_NOT_DESIGN_READY_OR_CODING_AUTHORIZATION',
      'VIEWS_MAY_REUSE_VALID_SOURCES_EXISTING_REQUIRED_ARTIFACTS_STILL_APPLY']};
}
