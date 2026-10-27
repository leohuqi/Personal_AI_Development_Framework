#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {normalizeJUnit,summarizeEngineering,renderEngineeringHtml} from '../lib/engineering.mjs';
const max=10*1024*1024;
const digest=data=>createHash('sha256').update(data).digest('hex');
async function main(){
 const [command,...args]=process.argv.slice(2);if(!['normalize','summary'].includes(command))throw new Error('COMMAND_REQUIRED');const options={};const allowed=command==='normalize'?['manifest','junit','report-root','out']:['trace','run','versions','report-root','out','html'];
 for(let i=0;i<args.length;i+=2){const key=args[i]?.slice(2),value=args[i+1];if(!args[i]?.startsWith('--')||!allowed.includes(key)||!value||value.startsWith('--')||(options[key]&&key!=='run'))throw new Error('INVALID_ARGUMENT');if(key==='run')(options.run??=[]).push(value);else options[key]=value;}
 for(const k of command==='normalize'?['manifest','junit','report-root','out']:['trace','run','versions','report-root','out'])if(!options[k])throw new Error('MISSING_ARGUMENT');
 const root=await fs.realpath(options['report-root']);if(!(await fs.stat(root)).isDirectory())throw new Error('REPORT_ROOT');
 const inside=p=>p===root||p.startsWith(root+path.sep);
 async function resolve(p,output=false){if(typeof p!=='string'||p.split(/[\\/]/).includes('..'))throw new Error('PATH_ESCAPE');const absolute=path.resolve(root,p);if(!inside(absolute))throw new Error('PATH_ESCAPE');const real=output?path.join(await fs.realpath(path.dirname(absolute)),path.basename(absolute)):await fs.realpath(absolute);if(!inside(real))throw new Error('SYMLINK_ESCAPE');if(output){try{await fs.lstat(real);throw new Error('OUTPUT_EXISTS');}catch(e){if(e.code!=='ENOENT')throw e;}}return real;}
 async function read(p){const real=await resolve(p);const stat=await fs.stat(real);if(!stat.isFile()||stat.size>max)throw new Error('INPUT_LIMIT');const data=await fs.readFile(real);if(data.length>max)throw new Error('INPUT_LIMIT');return data;}
 const json=async p=>JSON.parse((await read(p)).toString('utf8'));
 async function publish(p,data){const real=await resolve(p,true),temporary=path.join(path.dirname(real),'.engineering-'+randomUUID()+'.tmp');try{await fs.writeFile(temporary,data,{flag:'wx',mode:0o600});await fs.link(temporary,real);}finally{await fs.unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});}}
 // References are data; local artifact refs must still be contained and hash-bound.
 async function verifyRef(ref){const p=typeof ref==='string'?ref:ref?.path;if(p&&!/^https:/i.test(p)){const data=await read(p);if(ref?.sha256&&digest(data)!==ref.sha256)throw new Error('RAW_HASH_MISMATCH');return true;}return false;}
 async function verifyRun(run){for(const raw of run.raw_reports??[]){const data=await read(raw.path);if(digest(data)!==raw.sha256)throw new Error('RAW_HASH_MISMATCH');}for(const c of run.coverage??[])if(!await verifyRef(c.raw_ref))(run.diagnostics??=[]).push({code:'REMOTE_COVERAGE_NOT_VERIFIED',path:'coverage.raw_ref',message:'Remote original report was not fetched or verified',severity:'warning'});}
 let output,code=0;
 if(command==='normalize'){
  const manifest=await json(options.manifest),xml=await read(options.junit);if(!Array.isArray(manifest.raw_reports)||manifest.raw_reports.length!==1)throw new Error('RAW_REPORT_INPUT_MISMATCH');const expected=await resolve(manifest.raw_reports[0].path);if(expected!==await resolve(options.junit)||manifest.raw_reports[0].sha256!==digest(xml))throw new Error('RAW_REPORT_INPUT_MISMATCH');
  const bridge=spawnSync('/usr/bin/python3',[fileURLToPath(new URL('./engineering-junit.py',import.meta.url))],{input:xml,encoding:'utf8',timeout:15000,maxBuffer:32*1024*1024,shell:false});if(bridge.error||bridge.signal)throw new Error('XML_BRIDGE_BLOCKED');let parsed;try{parsed=JSON.parse(bridge.stdout);}catch{throw new Error('XML_BRIDGE_INVALID_OUTPUT');}output=normalizeJUnit(parsed,manifest);if(bridge.status!==0||!output.valid)code=2;else if(output.run.command.exit_code!==0||output.run.tests.some(t=>['FAIL','BLOCKED'].includes(t.status)))code=1;
  // Preserve diagnostics even for an invalid report. Summary consumes the run directly.
  await publish(options.out,JSON.stringify(output.valid?output.run:output,null,2)+'\n');
 }else{
  const trace=await json(options.trace),versions=await json(options.versions),runs=[];for(const p of options.run){const run=await json(p);await verifyRun(run);runs.push(run);}output=summarizeEngineering(trace,runs,versions);code=!output.valid?2:output.knownFailure?1:0;await publish(options.out,JSON.stringify(output,null,2)+'\n');if(options.html)await publish(options.html,renderEngineeringHtml(output));
 }
 console.log(JSON.stringify({valid:output.valid,exit_code:code}));return code;
}
main().then(code=>{process.exitCode=code;}).catch(error=>{console.error(JSON.stringify({valid:false,code:error.code??'REPORT_ERROR',message:['OUTPUT_EXISTS','PATH_ESCAPE','SYMLINK_ESCAPE','RAW_HASH_MISMATCH','RAW_REPORT_INPUT_MISMATCH','INPUT_LIMIT','XML_BRIDGE_BLOCKED','COMMAND_REQUIRED','INVALID_ARGUMENT','MISSING_ARGUMENT'].includes(error.message)?error.message:'Report input or output error'}));process.exitCode=2;});
