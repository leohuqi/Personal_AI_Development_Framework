import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizeJUnit,validateTestRun,validateTraceability,validateTestingArchitecture,validateEvidence,summarizeEngineering} from '../../lib/engineering.mjs';
import {fixture} from './fixtures.mjs';
const bridge=fileURLToPath(new URL('../../scripts/engineering-junit.py',import.meta.url));
const cli=fileURLToPath(new URL('../../scripts/engineering-report.mjs',import.meta.url));
const parse=xml=>spawnSync('python3',[bridge],{input:xml,encoding:'utf8'});
const valid='<testsuites tests="2"><testsuite name="outer" tests="2"><testsuite name="inner" tests="2"><testcase classname="A" name="same[x]"/><testcase classname="A" name="same[y]"><skipped/></testcase></testsuite></testsuite></testsuites>';
const parsedResult=parse(valid);assert.equal(parsedResult.status,0,parsedResult.stdout);const parsed=JSON.parse(parsedResult.stdout);const cases=parsed.suites.flatMap(s=>s.cases);assert.equal(cases.length,2);assert.notEqual(cases[0].report_case_key,cases[1].report_case_key);
for(const xml of ['', '<testsuite/>','<testsuite>','<other/>','<testsuite tests="2"><testcase name="one"/></testsuite>','<!DOCTYPE x [<!ENTITY x SYSTEM "file:///etc/passwd">]><testsuite><testcase name="&x;"/></testsuite>','<?xml version="1.0" encoding="UTF-16"?><testsuite/>',Buffer.from([0xff,0xfe,0,0]),'<testsuite>'+ '<testsuite>'.repeat(65)+'</testsuite>'.repeat(66)])assert.equal(parse(xml).status,2);
const {run,trace,versions}=fixture();const manifest={...run,default_layer:'integration',selector_map:cases.map((c,i)=>({report_case_key:c.report_case_key,selector:`test_${i}`,tc_ids:[`TC${i+1}`],types:['functional'],layer:'integration',assertion_ids:['correct'],evidence_refs:['raw.xml#'+i]}))};delete manifest.tests;delete manifest.diagnostics;
const normalized=normalizeJUnit(parsed,manifest);assert.equal(normalized.valid,true,JSON.stringify(normalized));assert.equal(normalized.run.tests[1].status,'SKIPPED');assert.equal(normalizeJUnit(parsed,{...manifest,selector_map:[...manifest.selector_map,...manifest.selector_map]}).valid,false);
assert.equal(normalizeJUnit({...parsed,suites:[...parsed.suites,...parsed.suites]},manifest).valid,false);
const duplicate=structuredClone(run);duplicate.tests[0].tc_ids=['TC1','TC2'];duplicate.tc_evidence=[];const t=structuredClone(trace);t.test_cases[1].selector='test_0';assert.equal(summarizeEngineering(t,[duplicate],versions).execution.PASS,1);assert.equal(summarizeEngineering(t,[duplicate],versions).fullPass,0);
for(const status of ['SKIPPED','BLOCKED','NOT_RUN']){const r=structuredClone(run);r.tests[0].status=status;const s=summarizeEngineering(trace,[r],versions);assert.equal(s.executionCoverage,0);assert.equal(s.fullPass,0);}
for(const target of [{...versions,source_revision:'other'},{...versions,test_definition_revision:'other'},{...versions,environment_id:'other'},{...versions,strategy_ref:{id:'other',revision:'s1'}}])assert.equal(validateEvidence(trace,[run],target).valid,false);
for(const value of [null,[],1,'text',{}, {requirements:4,test_cases:'x',nodes:null,links:{}}, {tests:8,tc_evidence:{},coverage:null}]){for(const fn of [validateTraceability,validateTestRun,validateTestingArchitecture])assert.equal(fn(value).valid,false);assert.equal(summarizeEngineering(value,[value],value).valid,false);}
assert.equal(validateTestRun({...run,command:{argv:['echo','x','x'],exit_code:0}}).valid,true);
const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'engineering-test-'));
try{
 await fs.writeFile(path.join(tmp,'raw.xml'),valid);const hash=createHash('sha256').update(valid).digest('hex');manifest.raw_reports=[{path:'raw.xml',sha256:hash}];await fs.writeFile(path.join(tmp,'manifest.json'),JSON.stringify(manifest));
 const invoke=args=>spawnSync(process.execPath,[cli,...args,'--report-root',tmp],{encoding:'utf8'});
 assert.equal(invoke(['normalize','--manifest','manifest.json','--junit','raw.xml','--out','normalized.json']).status,0);
 assert.equal(invoke(['normalize','--manifest','manifest.json','--junit','raw.xml','--out','normalized.json']).status,2,'never overwrite');
 assert.equal(invoke(['normalize','--manifest','manifest.json','--junit','raw.xml','--out','../escape.json']).status,2);
 await fs.symlink(os.tmpdir(),path.join(tmp,'outside'));assert.equal(invoke(['normalize','--manifest','manifest.json','--junit','raw.xml','--out','outside/escape.json']).status,2);
 assert.equal(invoke(['normalize','--manifest','manifest.json','--junit','raw.xml','--out','x.json','--shell','touch x']).status,2);
 assert.equal(invoke(['normalize','--manifest','manifest.json','--junit','raw.xml','--out','x.json','--out','y.json']).status,2);
 manifest.command.exit_code=1;await fs.writeFile(path.join(tmp,'failed.json'),JSON.stringify(manifest));assert.equal(invoke(['normalize','--manifest','failed.json','--junit','raw.xml','--out','failed-run.json']).status,1);
 await fs.writeFile(path.join(tmp,'raw.xml'),'<broken>');assert.equal(invoke(['normalize','--manifest','manifest.json','--junit','raw.xml','--out','hash-mismatch.json']).status,2);
}finally{await fs.rm(tmp,{recursive:true,force:true});}
const meta=structuredClone(run);meta.runner={name:[],version:9};meta.environment.id={};assert.equal(validateTestRun(meta).valid,false);assert.equal(validateTraceability({...trace,trace_id:44,requirements_revision:[]}).valid,false);const badCoverage=structuredClone(run);badCoverage.coverage=[{tool:'x',version:'1',metric:'line',covered:1,total:1,include:[],exclude:[],source_revision:run.source_revision,raw_ref:42}];assert.equal(validateTestRun(badCoverage).valid,false);
console.log('XML, CLI, traceability, version and malformed input assertions PASS');
