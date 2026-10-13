#!/usr/bin/env node
// Regression checks for CACF-F01 through F04; disposable fixtures only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const script=fileURLToPath(new URL('./run-validation.mjs',import.meta.url));
const root=fs.mkdtempSync(path.join(os.tmpdir(),'padf-cacf-regressions-'));
const results=[];
function check(test,fn){fn();results.push({test,status:'PASS'});}
function run(dir,args=[],exit=0){
  const r=spawnSync(process.execPath,[script,...args],{encoding:'utf8',env:{...process.env,PADF_CACF_STORE_DIR:dir}});
  assert.equal(r.status,exit,r.stderr||r.stdout);
  return r.stdout.trim() ? JSON.parse(r.stdout.trim()) : null;
}
try{
  const parent=path.join(root,'caller-owned');fs.mkdirSync(parent);
  const sentinel=path.join(parent,'unrelated.txt');fs.writeFileSync(sentinel,'preserve me');
  const existingStore=path.join(parent,'shared-context.json');fs.writeFileSync(existingStore,'caller-owned data');
  check('F01 successful suite preserves caller directory, files and existing store',()=>{
    assert.equal(run(parent).result,'PASS');
    assert.equal(fs.readFileSync(sentinel,'utf8'),'preserve me');
    assert.equal(fs.readFileSync(existingStore,'utf8'),'caller-owned data');
    assert.deepEqual(fs.readdirSync(parent).sort(),['shared-context.json','unrelated.txt']);
  });
  check('F01 filesystem root rejected without deletion',()=>{
    const r=spawnSync(process.execPath,[script],{encoding:'utf8',env:{...process.env,PADF_CACF_STORE_DIR:path.parse(root).root}});
    assert.notEqual(r.status,0);assert.match(r.stderr,/existing non-root directory/);
  });
  check('F01 failed suite cleans only its child and preserves caller files',()=>{
    const preload=path.join(root,'fail-agent.cjs');
    fs.writeFileSync(preload,"if(process.argv.includes('--agent')) process.exit(17);\n");
    const r=spawnSync(process.execPath,[script],{encoding:'utf8',env:{...process.env,
      PADF_CACF_STORE_DIR:parent,NODE_OPTIONS:'--require '+JSON.stringify(preload)}});
    assert.notEqual(r.status,0);
    assert.match(r.stderr,/coder\/send/);
    assert.equal(fs.readFileSync(sentinel,'utf8'),'preserve me');
    assert.equal(fs.readFileSync(existingStore,'utf8'),'caller-owned data');
    assert.deepEqual(fs.readdirSync(parent).sort(),['shared-context.json','unrelated.txt']);
  });
  const dir=path.join(root,'agent-fixture');fs.mkdirSync(dir);
  const store=path.join(dir,'shared-context.json');
  const initial={context_id:'PADF-TEST-001',ownerApproval:'OWNER-PILOT-001',head:'sha-test-v1',spec:'spec-v1',messages:[],handoff:null,checkpoint:null};
  function load(){return JSON.parse(fs.readFileSync(store,'utf8'));}
  function save(s){fs.writeFileSync(store,JSON.stringify(s));}
  function agent(role,cmd,id='',exit=0){return run(dir,['--agent',role,cmd,id],exit);}
  save(initial);
  check('F02/F04 uncertain-write send and reply retries preserve logical IDs',()=>{
    agent('coder','send','MSG-001');agent('architect','reply','MSG-001');
    assert.equal(agent('coder','send','MSG-001').duplicate,true);
    assert.equal(agent('architect','reply','MSG-001').duplicate,true);
    assert.deepEqual(load().messages.map(m=>m.message_id),['MSG-001','MSG-001-reply']);
  });
  check('F02/F04 same ID with changed immutable request or reply payload is blocked',()=>{
    const s=load();s.spec='spec-v2';save(s);
    const before=fs.readFileSync(store,'utf8');
    assert.equal(agent('coder','send','MSG-001',3).reason,'MESSAGE_ID_CONFLICT');
    assert.equal(agent('architect','reply','MSG-001',3).reason,'MESSAGE_ID_CONFLICT');
    assert.equal(fs.readFileSync(store,'utf8'),before);
    s.spec='spec-v1';save(s);
  });
  check('F03 new reply OPEN; request RESPONDED; non-terminal replies remain discoverable',()=>{
    assert.equal(load().messages[0].status,'RESPONDED');
    assert.equal(load().messages[1].status,'OPEN');
    for(const status of ['OPEN','ACKNOWLEDGED','RESPONDED','BLOCKED','ESCALATED']){
      const s=load();s.messages[1].status=status;save(s);
      agent('coder','checkpoint');
      assert.deepEqual(load().checkpoint.pending_message_ids,['MSG-001-reply']);
      assert.deepEqual(agent('coder','resume').read_messages,['MSG-001-reply']);
    }
  });
  check('F03 blocked replies require reconciliation; wrong recipient cannot consume',()=>{
    assert.equal(agent('coder','consume','MSG-001-reply',3).reason,'REQUIRES_RECONCILIATION');
    assert.equal(agent('architect','consume','MSG-001-reply',3).reason,'WRONG_RECEIVER');
  });
  check('F03 explicit consumption closes event with evidence and excludes it on resume',()=>{
    const s=load();s.messages[1].status='ACKNOWLEDGED';save(s);
    assert.equal(agent('coder','consume','MSG-001-reply').status,'CLOSED');
    assert.equal(load().messages[1].resolution_ref,'fixture-consumption:MSG-001-reply');
    assert.deepEqual(agent('coder','resume').read_messages,[]);
    assert.equal(agent('architect','reply','MSG-001').duplicate,true);
    assert.equal(load().messages[1].status,'CLOSED');
  });
  console.log(JSON.stringify({suite:'CACF review regressions',result:'PASS',count:results.length,tests:results}));
}finally{
  // This regression runner deletes only the unique directory it created.
  fs.rmSync(root,{recursive:true,force:true});
}
