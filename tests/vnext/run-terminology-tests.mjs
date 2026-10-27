#!/usr/bin/env node
// Independent expectations fixed from Owner D3/D5/D6/G6, the shared terminology
// contract and VNEXT-QA-01 terminology follow-up before checking API signatures.
// 1. Reject malformed glossary structure, unresolved references and metadata that
//    claims unverified formal definitions/official Chinese translation authority.
// 2. Select only requested domains; return independent objects and nested arrays.
// 3. Correct message consumers, programming closures and specific ML drift remain
//    untouched; a document's "规范消费闭包" may produce a conditional advisory hint.
// 4. Never rewrite supplied text or declare contextual/technical semantics proven.
// 5. Detect actual changes to code, API/Schema/class names, IDs, SHA, state enums,
//    caller protected tokens and complete historical records; test destructive
//    edits, not only identity comparisons.
// 6. Unchanged protected tokens do not prove intent, permission or recovery/order
//    equivalence. Every comparison remains semantic_status=NOT_VERIFIED.
// 7. Use all 17 supplied cases as bounded contextual inputs, never translate their
//    expected_action labels into a regex or an automated semantic oracle.
// 8. Generate the reading view from the sole glossary source; changes propagate,
//    rendering is deterministic, and source objects remain unchanged.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateGlossary,selectTerms,terminologyHints,compareProtectedText,renderGlossary} from '../../lib/terminology.mjs';

const glossary=JSON.parse(await readFile(new URL('../../standards/terminology/GLOSSARY.yaml',import.meta.url),'utf8'));
const cases=JSON.parse(await readFile(new URL('../../standards/terminology/REGRESSION-CASES.json',import.meta.url),'utf8')).cases;
const readingView=await readFile(new URL('../../standards/terminology/GLOSSARY.md',import.meta.url),'utf8');
const tests=[];
const contextualObservations=[];
const clone=x=>structuredClone(x);
function check(id,requirement,name,fn){
  try {fn();tests.push({id,requirement,name,status:'PASS'});}
  catch(error){tests.push({id,requirement,name,status:'FAIL',actual:error.message});}
}
function reject(data,label){
  const before=clone(data),out=validateGlossary(data);
  assert.equal(out.valid,false,label+': '+JSON.stringify(out));
  assert(Array.isArray(out.errors)&&out.errors.length>0,label+': explicit validation errors required');
  assert.deepEqual(data,before,label+': validation changed caller source');
}
function protect(before,after,options={}){
  const out=compareProtectedText(before,after,options);
  assert.equal(out.semantic_status,'NOT_VERIFIED','Protected-token matching cannot verify meaning');
  assert.equal(out.approval_status,'NOT_VERIFIED','Protected-token matching cannot verify approval');
  assert(Array.isArray(out.changed));
  return out;
}
function detects(before,after,category,options={}){
  const out=protect(before,after,options);
  assert.equal(out.protection_status,'CHANGED',JSON.stringify({before,after,out}));
  assert(out.changed.includes(category),category+' change not detected: '+JSON.stringify(out));
}
function hints(text,domains){
  const snapshot=clone(glossary),selected=clone(domains);
  const out=terminologyHints(text,glossary,domains);
  assert.equal(out.action,'ADVISORY_ONLY');assert.equal(out.semantic_status,'NOT_VERIFIED');
  assert(Array.isArray(out.hints));assert.deepEqual(glossary,snapshot);assert.deepEqual(domains,selected);
  assert.equal(Object.hasOwn(out,'rewritten_text'),false,'No automatic rewritten text may be returned');
  assert.equal(Object.hasOwn(out,'replacement_text'),false,'No automatic replacement may be returned');
  for(const hint of out.hints){
    assert.equal(hint.action,'CONTEXT_REVIEW_REQUIRED');
    assert(Number.isInteger(hint.line)&&hint.line>=1);
    assert(typeof hint.context_rule==='string'&&hint.context_rule.trim().length>0,'Hint must retain the context condition');
    assert(selectTerms(glossary,domains).some(term=>term.term_id===hint.term_id),'Hint loaded a term outside the selected domains');
  }
  return out;
}

check('T01','D2/D4','Current single-source glossary is valid without changing it',()=>{
  const before=clone(glossary);assert.deepEqual(validateGlossary(glossary),{valid:true,errors:[]});assert.deepEqual(glossary,before);
});
check('T02','D4','Malformed roots, schema, domains and duplicate stable IDs are rejected',()=>{
  for(const input of [undefined,null,[],42,'glossary',{}])reject(input,'malformed root');
  for(const mutate of [d=>{d.schema_version='padf.terminology/unknown';},d=>{d.domains=['unknown'];},
    d=>{d.terms.push(clone(d.terms[0]));},d=>{d.terms[0].term_id='';},d=>{d.terms[0].domain='unknown';},
    d=>{d.sources.push(clone(d.sources[0]));}]){const d=clone(glossary);mutate(d);reject(d,'invalid glossary classification/identity');}
});
check('T03','D1/D4','Required source metadata and actual reference targets cannot be omitted',()=>{
  for(const field of ['reference_id','title','url','source_class','verified_scope','observed_at','access_limitations']){
    const d=clone(glossary);delete d.sources[0][field];reject(d,'missing source '+field);
  }
  for(const reference of [[],['SOURCE-NOT-DECLARED'],null,'PMI-LEXICON']){
    const d=clone(glossary);d.terms[0].reference=reference;reject(d,'invalid source reference '+JSON.stringify(reference));
  }
});
check('T04','D1/D3','Unverified formal-definition and official-Chinese-translation metadata is rejected',()=>{
  for(const [field,value] of [['definition_basis','formal_standard'],['zh_translation_status','official_translation'],
    ['zh_translation_status','official_standard_translation']]){
    const d=clone(glossary);d.terms[0][field]=value;reject(d,'unverified authority '+field+':'+value);
  }
});
check('T05','D4/E','Explicit domains return exactly their terms; empty selection is rejected',()=>{
  assert.throws(()=>selectTerms(glossary,[]),TypeError,'Empty selection must not silently load all terms');
  for(const domains of [['Engineering'],['Architecture'],['AI','PADF_Governance'],['Engineering','Engineering']]){
    const before=clone(domains),out=selectTerms(glossary,domains);
    const expected=glossary.terms.filter(term=>domains.includes(term.domain));
    assert.deepEqual(out,expected,'Selected domains silently expanded or omitted terms');assert.deepEqual(domains,before);
  }
});
check('T06','D4/E','Selected entries, references and aliases are independent copies across calls',()=>{
  const before=clone(glossary),out=selectTerms(glossary,['Engineering']);
  assert(out.length>0);out[0].preferred_zh='QA mutation';
  out[0].allowed_aliases.push('QA mutation');out[0].reference.push('QA mutation');
  assert.deepEqual(glossary,before);
  assert.deepEqual(selectTerms(glossary,['Engineering']),before.terms.filter(t=>t.domain==='Engineering'));
});
check('T07','D3/G6','Correct consumer, programming closure and specific ML drift are retained',()=>{
  for(const [id,domains] of [['EXAMPLE-CONSUMER',['Engineering']],['SYN-CLOSURE',['Engineering']],['SYN-DRIFT',['AI']]]){
    const c=cases.find(x=>x.case_id===id);assert(c,'Missing contextual fixture '+id);
    assert.deepEqual(hints(c.before,domains).hints,[],id+': correct professional language must not be a lexical ban');
    assert.equal(c.before,c.after,id+': source fixture should preserve the correct professional phrase');
  }
});
check('T08','D3/D4/G6','Document closure wording yields a conditional candidate only in the selected field',()=>{
  const text='请保留原意。\n完成规范消费闭包。';
  const out=hints(text,['Engineering']);
  const closure=glossary.terms.find(term=>term.english_term==='Closure');assert(closure);
  const candidate=out.hints.find(hint=>hint.term_id===closure.term_id);
  assert(candidate,'The documented awkward phrase should produce a candidate for contextual review');
  assert.equal(candidate.line,2);assert(candidate.phrase.includes('规范消费闭包'));
  assert.deepEqual(hints(text,['AI']).hints,[],'Excluded Engineering terms must not leak into AI-only review');
  assert.throws(()=>terminologyHints(text,glossary,[]),TypeError,'Empty field selection must not scan the full glossary');
});
check('T09','D3/D5/G6','Technical inline and fenced content is not rewritten by a terminology hint',()=>{
  const text='技术记录 `source_version`、`PROPOSED`、`规范消费闭包`。\n```js\nconst source_version = "规范消费闭包";\n```';
  const out=hints(text,['Engineering']);
  assert.equal(typeof text,'string');
  // Hints may conservatively flag code for human review, but cannot supply an
  // automatic edited text or claim that a term-trigger justifies code changes.
  assert.equal(out.action,'ADVISORY_ONLY');assert.equal(out.semantic_status,'NOT_VERIFIED');
});
check('T10','D5/G6','Actual Markdown code and inline identifier changes are detected',()=>{
  detects('说明 `source_version` 保持不变。','说明 `source_revision` 保持不变。','code');
  detects('```js\nconst permission = false;\n```','```js\nconst permission = true;\n```','code');
  detects('~~~json\n{"restore":false}\n~~~','~~~json\n{"restore":true}\n~~~','code');
});
check('T11','D5/G6','Actual API, stable ID, SHA and machine state changes are detected',()=>{
  detects('调用 POST /api/items。','调用 DELETE /api/items。','apis');
  detects('Feature DEMO-F001','Feature DEMO-F002','ids');
  detects('决策 ADR-0001','决策 ADR-0002','ids');
  detects('revision '+('a'.repeat(40)),'revision '+('b'.repeat(40)),'shas');
  detects('系统仍为 PROPOSED。','系统已经 APPROVED。','states');
  detects('任务状态 BLOCKED','任务状态 COMPLETED','states');
});
check('T12','D5/G6','Caller-protected Schema/class/extra identifiers and exact history are protected',()=>{
  for(const [before,after,token] of [['字段 source_version','字段 source_revision','source_version'],
    ['类 KnowledgeFragment','类 KnowledgeUnit','KnowledgeFragment'],['Coder读取规范','Reader读取规范','Coder']])
    detects(before,after,'extra',{extraProtected:[token]});
  detects('Owner拒绝了此设计。','Owner接受了此设计。','historical_record',{historical:true});
  detects('ADR：保留本地副本。','ADR：删除本地副本。','historical_record',{historical:true});
  const out=protect('Owner拒绝了此设计。','Owner拒绝了此设计。',{historical:true});
  assert.equal(out.protection_status,'NO_DETECTED_CHANGE');assert.deepEqual(out.changed,[]);
});
check('T13','D5/G6','Unchanged tokens do not prove original intent, permissions or recovery order',()=>{
  const pairs=[
    ['用户可以选择保留副本。','系统自动删除副本。'],
    ['仅获授权角色可以删除。','任何角色都可以删除。'],
    ['失败时保留恢复输入，先验证副本再切换引用。','失败时丢弃恢复输入，先切换引用再验证副本。'],
    ['Owner尚未接受该方案。','Owner已经接受该方案。']
  ];
  for(const [before,after] of pairs){
    const out=protect(before,after);assert.equal(out.protection_status,'NO_DETECTED_CHANGE');assert.deepEqual(out.changed,[]);
  }
});
check('T14','D3/D5/G6','All 17 bounded synthetic cases retain advisory and unverified semantics',()=>{
  assert.equal(cases.length,17,'This run is scoped to the provided 17-case version');
  const before=clone(cases);
  // Mapping expresses QA's selected field context, independent of expected_action.
  const selectedDomains={
    'EXAMPLE-READ':['Architecture'],'EXAMPLE-PATH':['Architecture','PADF_Governance'],
    'EXAMPLE-C4':['Architecture'],'EXAMPLE-VERSION':['Architecture'],'EXAMPLE-CONSUMER':['Engineering'],
    'SYN-CLOSURE':['Engineering'],'SYN-DOC-CLOSURE':['Engineering'],'SYN-DRIFT':['AI'],
    'SYN-C4-DOCKER':['Architecture'],'SYN-AGENT-MODEL':['AI','PADF_Governance'],
    'SYN-PROTECTED':['Engineering'],'SYN-STATE':['PADF_Governance'],'SYN-ROLE':['AI'],
    'SYN-RAG':['AI'],'SYN-FRAGMENT':['AI'],'SYN-PERMISSION':['Engineering','PADF_Governance'],
    'SYN-EVAL':['AI','PADF_Governance']
  };
  for(const c of cases){
    assert(selectedDomains[c.case_id],'Case context was not independently assigned');
    const out=hints(c.before,selectedDomains[c.case_id]);
    const comparison=protect(c.before,c.after,{extraProtected:c.protected_tokens});
    assert.equal(comparison.protection_status,'NO_DETECTED_CHANGE',c.case_id+': fixture pair must preserve listed protected strings');
    contextualObservations.push({case_id:c.case_id,origin:c.origin,domains:selectedDomains[c.case_id],
      hint_count:out.hints.length,protection_status:comparison.protection_status,semantic_status:comparison.semantic_status,
      interpretation:'Bounded helper observation; not validation of expected_action or meaning_preserved'});
  }
  assert.deepEqual(cases,before);
});
check('T15','D4 single source','Generated reading view matches the sole source and updates when the source changes',()=>{
  const before=clone(glossary),first=renderGlossary(glossary);
  assert.equal(typeof first,'string');assert.equal(renderGlossary(glossary),first);
  assert.equal(first,readingView,'Saved reading view drifted from its sole source');
  for(const term of glossary.terms)for(const value of [term.term_id,term.preferred_zh,term.english_term,term.definition])
    assert(first.includes(value),'Generated reading view omitted source content: '+term.term_id);
  const changed=clone(glossary);changed.terms[0].preferred_zh='QA-唯一源显示词';changed.terms[0].definition='QA-唯一源定义';
  const updated=renderGlossary(changed);assert(updated.includes('QA-唯一源显示词'));assert(updated.includes('QA-唯一源定义'));
  assert.notEqual(updated,first);assert.deepEqual(glossary,before);
});
check('T16','Read-only API','No shared state or caller-protected arrays change between hint/comparison calls',()=>{
  const options={extraProtected:['source_version'],historical:false};const snapshot=clone(options);
  const first=protect('source_version','source_revision',options),saved=clone(first);
  protect('PROPOSED','APPROVED');assert.deepEqual(first,saved);assert.deepEqual(options,snapshot);
  const out=hints('规范消费闭包',['Engineering']);out.hints.length=0;
  assert(hints('规范消费闭包',['Engineering']).hints.length>0,'Prior result mutation leaked into later hints');
});

const failed=tests.filter(t=>t.status==='FAIL').length;
console.log(JSON.stringify({suite:'PADF vNext independent advisory terminology and protected-text behavior',
  source_kind:'SYNTHETIC_BOUNDED_CASES',semantic_verification:'NOT_VERIFIED',
  status:failed?'FAIL':'PASS',count:tests.length,passed:tests.length-failed,failed,tests,contextualObservations},null,2));
if(failed)process.exitCode=1;
