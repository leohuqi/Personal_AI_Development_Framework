import assert from 'node:assert/strict';
import {fixture} from './fixtures.mjs';
import {validateEvidence,summarizeEngineering} from '../../lib/engineering.mjs';

// Public Reviewer repro: two exact test-function mappings exercise one TC.
const {trace,run,versions}=fixture();
trace.requirements[0].required_tc_ids=['TC1'];
trace.test_cases=trace.test_cases.slice(0,1);
delete trace.test_cases[0].selector;
trace.test_cases[0].required_assertions=['a','b'];
trace.links=trace.links.slice(0,1);
trace.links[0].required_assertion_ids=['a','b'];
run.tests=[{...run.tests[0],selector:'test_a',assertion_ids:['a']},{...run.tests[0],result_id:'r2',selector:'test_b',assertion_ids:['b']}];
run.tc_evidence[0].assertion_ids=['a','b'];
assert.equal(validateEvidence(trace,[run],versions).valid,true);
const summary=summarizeEngineering(trace,[run],versions);
assert.equal(summary.execution.PASS,2);
assert.equal(summary.fullPass,1,'same-run PASS assertion union must fulfill the whole TC');
assert.equal(summary.automationCoverage,1,'exact function mappings prove automation without a single static selector');
assert.equal(summary.testCases[0].full,true);
assert.equal(summary.verification_sufficient,true);
assert.equal(summary.owner_acceptance,'NOT_ASSESSED');

// Required assertion evidence cannot be assembled across separate runs.
const first=structuredClone(run),second=structuredClone(run);
first.tests=first.tests.slice(0,1);
second.run_id='run2';second.tests=second.tests.slice(1);
assert.equal(summarizeEngineering(trace,[first,second],versions).fullPass,0);
for(const status of ['FAIL','BLOCKED']){
 const failed=structuredClone(run);failed.tests[1].status=status;
 assert.equal(summarizeEngineering(trace,[failed],versions).fullPass,0);
}
for(const mutate of [
 r=>r.tc_evidence[0].assertion_ids=['a'],
 r=>r.tc_evidence[0].steps_verified=false,
 r=>r.tc_evidence[0].preconditions_verified=false,
 r=>r.tc_evidence[0].scope='PARTIAL',
 r=>r.tc_evidence[0].evidence_refs=[],
 r=>r.command.exit_code=1,
 r=>r.tests[1].status='SKIPPED',
]){
 const incomplete=structuredClone(run);mutate(incomplete);
 assert.equal(summarizeEngineering(trace,[incomplete],versions).fullPass,0);
}
for(const mutate of [r=>r.environment.id='other',r=>r.strategy_ref.id='other']){
 const incompatible=structuredClone(run);mutate(incompatible);
 assert.equal(summarizeEngineering(trace,[incompatible],versions).valid,false);
}
console.log('Same-run multi-function TC aggregation and isolation assertions PASS');
