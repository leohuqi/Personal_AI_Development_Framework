#!/usr/bin/env node
// PADF V0.2 protocol-level simulator: isolated child processes exchange
// messages through a durable local fixture store. No live AI agent implied.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const file = fileURLToPath(import.meta.url);
const testRoot = process.env.PADF_CACF_STORE_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'padf-cacf-'));
const store = path.join(testRoot, 'shared-context.json');
const inAgentMode = process.argv[2] === '--agent';
function load(){return JSON.parse(fs.readFileSync(store, 'utf8'));}
function save(s){fs.writeFileSync(store, JSON.stringify(s, null, 2));}
function output(value){process.stdout.write(JSON.stringify(value) + '\n');}
function blocked(reason){output({ok:false, status:'BLOCKED',reason});process.exitCode=3;}

if (inAgentMode){
  const [, , , role, command, id] = process.argv;
  const s=load();
  if (command === 'send'){
    if (role!=='coder') blocked('WRONG_SENDER');
    else if(!s.messages.find(m=>m.message_id===id)){
      s.messages.push({schema_version:'padf.agent-message/v1',message_id:id,thread_id:'THREAD-001',context_id:s.context_id,
        sender:'coder',receiver:'architect',type:'CLARIFICATION_REQUEST',status:'OPEN',requires_response:true,
        source_refs:['docs/api-spec.md@'+s.spec]});save(s);output({ok:true,persisted:true,count:s.messages.length});
    }else output({ok:true,duplicate:true,count:s.messages.length});
  }else if(command === 'reply'){
    const request=s.messages.find(m=>m.message_id===id);
    if(role!=='architect'||!request||request.receiver!=='architect') blocked('NO_DELIVERABLE_MESSAGE');
    else {
      request.status='RESPONDED';
      s.messages.push({schema_version:'padf.agent-message/v1',message_id:id+'-reply',in_reply_to:id,thread_id:request.thread_id,
        context_id:s.context_id,sender:'architect',receiver:'coder',type:'RESPONSE',status:'OPEN',body:'Per strategy isolation within approved spec; owner approval required for scope expansion',source_refs:['docs/api-spec.md@'+s.spec]});
      save(s);output({ok:true,response_to:id});
    }
  }else if(command === 'checkpoint'){
    if(role!=='coder'||!s.ownerApproval)blocked('NO_OWNER_APPROVAL');
    else {s.checkpoint={schema_version:'padf.context-checkpoint/v1',checkpoint_id:'CP-001',context_id:s.context_id,
      approved_scope:'TEST-001',owner_approval_ref:s.ownerApproval,observed_head_sha:s.head,approved_spec:s.spec,
      pending_message_ids:s.messages.filter(m=>m.receiver==='coder'&&m.status==='OPEN').map(m=>m.message_id),
      next_authorized_action:'continue assigned task'}; save(s);output({ok:true,checkpoint_id:'CP-001'});}
  }else if(command === 'resume'){
    if(!s.checkpoint)blocked('NO_CHECKPOINT');
    else if(!s.ownerApproval||s.ownerApproval!==s.checkpoint.owner_approval_ref)blocked('NO_OWNER_APPROVAL');
    else if(s.head!==s.checkpoint.observed_head_sha)blocked('SHA_DRIFT');
    else if(s.spec!==s.checkpoint.approved_spec)blocked('SPEC_DRIFT');
    else output({ok:true,context_id:s.context_id,read_messages:s.messages.filter(m=>m.receiver===role&&m.status==='OPEN').map(m=>m.message_id),
      next_action:s.checkpoint.next_authorized_action});
  }else if(command === 'handoff'){
    if(role!=='coder'||!s.ownerApproval)blocked('NO_OWNER_APPROVAL');
    else {s.handoff={schema_version:'padf.agent-handoff/v1',handoff_id:'HO-001',context_id:s.context_id,
      sender:'coder',receiver:'qa-tester',head_sha:s.head,test_status:'NOT_RUN',owner_approval_ref:s.ownerApproval,status:'OPEN'};
      save(s);output({ok:true,handoff_id:'HO-001',head_sha:s.head});}
  }else if(command === 'ack'){
    if(role!=='qa-tester'||!s.handoff||s.handoff.receiver!==role)blocked('NO_HANDOFF');
    else if(s.head!==s.handoff.head_sha)blocked('STALE_HANDOFF');
    else {s.handoff.status='ACKNOWLEDGED';save(s);output({ok:true,status:'ACKNOWLEDGED',test_status:s.handoff.test_status});}
  }else blocked('UNKNOWN_ACTION');
}else{
  const results=[];
  function agent(role,cmd,id='',expectedExit=0){
    const r=spawnSync(process.execPath,[file,'--agent',role,cmd,id],{encoding:'utf8',env:{...process.env,PADF_CACF_STORE_DIR:testRoot}});
    assert.equal(r.status,expectedExit,role+'/'+cmd+': '+(r.stderr||r.stdout));
    return JSON.parse(r.stdout.trim());
  }
  function check(test, fn){fn();results.push({test,status:'PASS'});}
  try{
    const initial={context_id:'PADF-TEST-001',ownerApproval:'OWNER-PILOT-001',head:'sha-test-v1',spec:'spec-v1',messages:[],handoff:null,checkpoint:null};
    save(initial);
    check('Agent message persisted across distinct child processes',()=>{
      assert.equal(agent('coder','send','MSG-001').persisted,true);
      assert.equal(agent('architect','reply','MSG-001').response_to,'MSG-001');
      assert.equal(load().messages[1].in_reply_to,'MSG-001');
    });
    check('Idempotent message retry',()=>{
      assert.equal(agent('coder','send','MSG-001').duplicate,true);
      assert.equal(load().messages.length,2);
    });
    check('Checkpoint and resume in new process consumes addressed response',()=>{
      assert.equal(agent('coder','checkpoint').checkpoint_id,'CP-001');
      const r=agent('coder','resume');
      assert.deepEqual(r.read_messages,['MSG-001-reply']);
      assert.equal(r.next_action,'continue assigned task');
    });
    check('Role-bound handoff and explicit receiver acknowledgement',()=>{
      assert.equal(agent('coder','handoff').head_sha,'sha-test-v1');
      const ack=agent('qa-tester','ack');
      assert.equal(ack.status,'ACKNOWLEDGED');
      assert.equal(ack.test_status,'NOT_RUN');
    });
    check('Changed Git head blocks checkpoint resume',()=>{
      const s=load();s.head='sha-test-v2';save(s);
      assert.equal(agent('coder','resume','',3).reason,'SHA_DRIFT');
      assert.equal(agent('qa-tester','ack','',3).reason,'STALE_HANDOFF');
    });
    check('Changed approved Feature Spec blocks resume',()=>{
      const s=load();s.head='sha-test-v1';s.spec='spec-v2';save(s);
      assert.equal(agent('coder','resume','',3).reason,'SPEC_DRIFT');
    });
    check('Missing Owner approval blocks resume and new checkpoint',()=>{
      const s=load();s.spec='spec-v1';s.ownerApproval=null;save(s);
      assert.equal(agent('coder','resume','',3).reason,'NO_OWNER_APPROVAL');
      assert.equal(agent('coder','checkpoint','',3).reason,'NO_OWNER_APPROVAL');
    });
    output({suite:'PADF V0.2 CACF fixture-level cross-process protocol simulation',result:'PASS',count:results.length,tests:results,
      boundary:'Simulated persisted store and isolated Node processes; NOT live AI agents or Linear/GitHub connector delivery'});
  }finally{fs.rmSync(testRoot,{recursive:true,force:true});}
}
