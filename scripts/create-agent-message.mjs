#!/usr/bin/env node
// Local draft generation only; no network, persistence or approval inference.
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const types=new Set(['TASK_REQUEST','CLARIFICATION_REQUEST','RESPONSE','ARTIFACT_READY','BLOCKER','CHANGE_REQUEST','REVIEW_FINDING','HANDOFF']);
const text=x=>typeof x==='string'&&x.trim().length>0;
export function createAgentMessage(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Input must be a message object');
 if(input.schema_version!==undefined&&input.schema_version!=='padf.agent-message/v1')throw Error('SCHEMA_VERSION');
 for(const key of ['context_id','project','repository','sender','receiver','subject','body','requested_action'])
  if(!text(input[key]))throw Error('Missing '+key);
 if(!types.has(input.type))throw Error('MESSAGE_TYPE');
 if(!Array.isArray(input.source_refs)||!input.source_refs.length||!input.source_refs.every(text))throw Error('SOURCE_REFS');
 if(typeof input.requires_response!=='boolean')throw Error('REQUIRES_RESPONSE');
 if(!Object.hasOwn(input,'linear_issue')||!(input.linear_issue===null||text(input.linear_issue)))throw Error('LINEAR_ISSUE_OR_EXPLICIT_NA');
 if(!Array.isArray(input.original_feature_ids)||!input.original_feature_ids.every(text))throw Error('FEATURE_IDS_OR_EXPLICIT_NA');
 if(input.type==='RESPONSE'&&(!text(input.thread_id)||!text(input.in_reply_to)))throw Error('RESPONSE_CORRELATION');
 if(input.in_reply_to!=null&&(!text(input.in_reply_to)||!text(input.thread_id)))throw Error('REPLY_CORRELATION');
 if(input.type==='TASK_REQUEST'&&!text(input.owner_approval_ref))throw Error('TASK_REQUEST_APPROVAL_REFERENCE');
 if(input.status!==undefined&&input.status!=='OPEN')throw Error('Draft generator cannot perform lifecycle transitions');
 for(const key of ['message_id','thread_id'])if(input[key]!==undefined&&!text(input[key]))throw Error('INVALID_'+key);
 if(input.created_at!==undefined&&(!text(input.created_at)||!Number.isFinite(Date.parse(input.created_at))||!/(Z|[+-]\d{2}:\d{2})$/.test(input.created_at)))throw Error('CREATED_AT');
 if(input.priority!==undefined&&!['NORMAL','HIGH','BLOCKING'].includes(input.priority))throw Error('PRIORITY');
 return {...input,schema_version:'padf.agent-message/v1',message_id:input.message_id??'MSG-'+randomUUID(),
  thread_id:input.thread_id??'THREAD-'+randomUUID(),in_reply_to:input.in_reply_to??null,
  created_at:input.created_at??new Date().toISOString(),source_refs:[...input.source_refs],
  original_feature_ids:[...input.original_feature_ids],priority:input.priority??'NORMAL',
  status:'OPEN',resolution_ref:null,owner_approval_ref:input.owner_approval_ref??null};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  if(!process.argv[2])throw Error('Usage: node scripts/create-agent-message.mjs <input.json>');
  const result=createAgentMessage(JSON.parse(readFileSync(process.argv[2],'utf8')));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write('DRAFT / NOT_PERSISTED — verify sources and contract before authorized publication.\n');
 }catch(e){process.stderr.write(e.message+'\n');process.exitCode=1}
}
