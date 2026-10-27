// Case D: reuse actual unit executions, retain designed functional cases as NOT_RUN.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {summarizeEngineering,renderEngineeringHtml} from '../../lib/engineering.mjs';
const root=path.resolve(process.argv[2]);const load=async name=>JSON.parse(await fs.readFile(path.join(root,name),'utf8'));
const trace=await load('python-trace.json'),run=await load('python-run.json'),versions=await load('python-versions.json');
run.run_id+='-unit-only-view';run.tests=run.tests.filter(t=>t.layer==='unit');run.tc_evidence=run.tc_evidence.filter(e=>run.tests.some(t=>t.tc_ids.includes(e.tc_id)));
const summary=summarizeEngineering(trace,[run],versions);
assert.equal(summary.valid,true);assert.equal(summary.execution.FAIL,0);assert.ok(summary.execution.PASS>0);assert.equal(summary.fullPass,0);assert.equal(summary.verification_sufficient,false);assert.equal(summary.owner_acceptance,'NOT_ASSESSED');assert.ok(summary.requirements.every(r=>r.status==='NOT_RUN'));
summary.view_note='Subset of actual executed unit results. Functional evidence intentionally excluded; this is an incomplete-evidence fixture, not a new runner execution.';
await fs.writeFile(path.join(root,'incomplete-summary.json'),JSON.stringify(summary,null,2),{flag:'wx'});await fs.writeFile(path.join(root,'incomplete-summary.html'),renderEngineeringHtml(summary),{flag:'wx'});console.log('Actual unit PASS + Functional NOT_RUN => incomplete, Owner NOT_ASSESSED');
