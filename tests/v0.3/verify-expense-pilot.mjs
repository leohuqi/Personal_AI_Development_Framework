#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {routeAgents,evaluateDesignGate} from '../../lib/design-gate.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dir=path.join(root,'examples/expense-ledger-pilot');
const pilot=JSON.parse(fs.readFileSync(path.join(dir,'PILOT-MANIFEST.json'),'utf8'));
const route=routeAgents(pilot);
assert.equal(route.valid,true);
assert.equal(route.architecture_scope,'both');
assert.equal(route.solution_architect_required,true);
assert.equal(route.module_architect_required,true);
assert.equal(route.independent_review_required,true); // task L
assert.deepEqual(pilot.stages.map(x=>x.id),['SYSTEM','MODULE']);
assert.deepEqual(pilot.stages[1].depends_on,['SYSTEM']);
assert.equal(pilot.stages[1].system_baseline_ref,pilot.system_baseline_ref);
for(const stage of pilot.stages)for(const a of stage.artifacts){
 const p=a.ref.replace(/@[0-9a-f]{40}$/i,'');
 assert.ok(p.startsWith('examples/expense-ledger-pilot/'));
 assert.ok(fs.existsSync(path.join(root,p)),'missing '+p);
 if(p.endsWith('.svg')){
  const svg=fs.readFileSync(path.join(root,p),'utf8');
  assert.match(svg,/<svg\s+xmlns=/); assert.match(svg,/<\/svg>/);
  // Deliberately do NOT claim XML parse, browser render or upstream Skill invocation.
  assert.equal(a.render_status,'NOT_RUN');
  assert.equal(a.verified,false);
 }
}
const result=evaluateDesignGate(pilot);
assert.equal(result.status,'BLOCKED');
assert.equal(result.coding_authorized,false);
for(const reason of ['SYSTEM_BASELINE_NOT_APPROVED','MANDATORY_DESIGN_REVIEW','UNSATISFIED_STAGE:SYSTEM','UNSATISFIED_STAGE:MODULE'])
  assert.ok(result.reasons.includes(reason),JSON.stringify({reason,actual:result.reasons}));
console.log(JSON.stringify({suite:'PADF V0.3 Master-led two-Architect expense pilot',status:'PASS',
 scope:route.architecture_scope,checked_artifacts:pilot.stages.reduce((n,s)=>n+s.artifacts.length,0),
 gate_result:result.status,coding_authorized:result.coding_authorized,
 reasons:result.reasons,real_agent_sessions:'NOT_RUN',external_diagram_skill:'NOT_RUN'},null,2));
