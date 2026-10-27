#!/usr/bin/env python3
"""Prepare fixed pilot evidence metadata from actual runner artifacts, not a runner.

Usage: python3 examples/engineering/prepare-reports.py /absolute/artifact-directory
The caller ran pytest/JUnit first and copied python.xml, java.xml and coverage XMLs.
"""
import hashlib
import importlib.util
import json
import shutil
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(sys.argv[1]).resolve()
spec = importlib.util.spec_from_file_location('junit_bridge', ROOT / 'scripts/engineering-junit.py')
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)

def digest(data):
    return hashlib.sha256(data).hexdigest()

def content_version(paths):
    files = {str(p.relative_to(ROOT)): digest(p.read_bytes()) for p in sorted(paths)}
    return 'sha256:' + digest(json.dumps(files, sort_keys=True).encode()), files

def write(name, value):
    with (OUT / name).open('x') as f:
        json.dump(value, f, indent=2)
        f.write('\n')

for language in ['python', 'java']:
    project = ROOT / 'examples/engineering' / language
    source_files = [project / 'store.py', project / 'untouched.py'] if language == 'python' else list((project / 'src').glob('*.java'))
    test_files = [project / 'test_store.py'] if language == 'python' else list((project / 'test').glob('*.java'))
    revision, impl_hashes = content_version(source_files)
    test_revision, test_hashes = content_version(test_files)
    definition_revision, _ = content_version([Path(__file__)])
    raw_name = language + '.xml'
    raw = (OUT / raw_name).read_bytes()
    parsed = bridge.parse(raw)
    if parsed['diagnostics']:
        raise ValueError(parsed['diagnostics'])
    cases = [case for suite in parsed['suites'] for case in suite['cases']]
    receipt = json.loads((OUT / (language + '-receipt.json')).read_text())
    environment = dict(receipt['environment'], id='engineering-pilot-' + language)
    target = dict(repository='leohuqi/Personal_AI_Development_Framework', source_revision=revision,
                  dirty_tree_digest=None, requirements_revision=definition_revision,
                  test_definition_revision=test_revision, strategy_ref=dict(id=language + '-strategy', revision='sha256:' + digest((project / 'testing-architecture.json').read_bytes())),
                  environment_id=environment['id'])
    source_ref = dict(path=str(test_files[0].relative_to(ROOT)), revision=test_revision, sha256=digest(test_files[0].read_bytes()))
    definition_ref = dict(path='examples/engineering/prepare-reports.py', revision=definition_revision, sha256=digest(Path(__file__).read_bytes()))
    # Exact fixed case inventory from test definitions; unknown XML case is an error.
    names = {
        'python': ['test_value_rule[0-True]', 'test_value_rule[2-True]', 'test_value_rule[-1-False]', 'test_value_rule[text-False]', 'test_owner_can_update_and_read', 'test_other_owner_cannot_change_record', 'test_failure_rolls_back_and_connection_recovers', 'test_invalid_value_preserves_data'],
        'java': ['ownerRoundTrip()', 'otherOwnerCannotOverwrite()', 'rejectsNegativeValue()'],
    }[language]
    if sorted(c['name'] for c in cases) != sorted(names):
        raise ValueError('Unexpected pilot case inventory')
    maps, tcs, links, tce = [], [], [], []
    for case in cases:
        name = case['name']
        unit = name.startswith('test_value_rule') or name == 'rejectsNegativeValue()'
        layer = 'unit' if unit else 'integration'
        types = ['functional', 'rule'] if unit else ['functional']
        tc_id = language + ':' + name
        selector = ('test_store.py::' + name) if language == 'python' else '[engine:junit-jupiter]/[class:RecordStoreTest]/[method:' + name + ']'
        evidence_ref = raw_name + '#' + case['report_case_key']
        maps.append(dict(report_case_key=case['report_case_key'], selector=selector, tc_ids=[tc_id], types=types, layer=layer, assertion_ids=['observable-result'], evidence_refs=[evidence_ref]))
        tcs.append(dict(id=tc_id, source_ref=source_ref, types=types, layer=layer, selector=selector, required_assertions=['observable-result'], preconditions_ref=source_ref, steps_ref=source_ref))
        links.append(dict(id='tests:' + tc_id, **{'from': tc_id, 'to': language + ':AC1'}, relation='tests', evidence_scope='FULL' if not unit else 'PARTIAL', required_assertion_ids=['observable-result']))
        tce.append(dict(tc_id=tc_id, scope='FULL' if not unit else 'PARTIAL', preconditions_verified=True, steps_verified=True, assertion_ids=['observable-result'], evidence_refs=[evidence_ref]))
    coverage_name = language + '-coverage.xml'
    cov_data = (OUT / coverage_name).read_bytes()
    cov = ET.fromstring(cov_data)
    coverage = []
    if language == 'python':
        # coverage.py counts are native absolute counts, not averaged percentages.
        metrics = [('line', int(cov.get('lines-covered')), int(cov.get('lines-valid'))), ('branch', int(cov.get('branches-covered')), int(cov.get('branches-valid')))]
        zero = [c for c in cov.findall('.//class') if c.get('filename') == 'untouched.py']
        assert len(zero) == 1 and all(n.get('hits') == '0' for n in zero[0].findall('./lines/line'))
        runner = dict(name='pytest', version='8.4.2')
        tool, tool_version = 'coverage.py', '7.10.7'
    else:
        metrics = [(c.get('type').lower(), int(c.get('covered')), int(c.get('covered')) + int(c.get('missed'))) for c in cov.findall('./counter') if c.get('type') in ['LINE', 'BRANCH']]
        zero = cov.find("./package/class[@name='Untouched']/counter[@type='LINE']")
        assert zero is not None and zero.get('covered') == '0' and int(zero.get('missed')) > 0
        runner = dict(name='JUnit Platform console', version='1.11.4', junit_jupiter_version='5.11.4')
        tool, tool_version = 'JaCoCo', '0.8.12'
    for metric, covered, total in metrics:
        coverage.append(dict(tool=tool, version=tool_version, metric=metric, covered=covered, total=total, include=list(impl_hashes), exclude=['tests', 'weakfix'], source_revision=revision, raw_ref=dict(path=coverage_name, revision=revision, sha256=digest(cov_data))))
    write(language + '-source-manifest.json', dict(source_revision=revision, source_files=impl_hashes, test_definition_revision=test_revision, test_files=test_hashes))
    write(language + '-versions.json', target)
    trace = dict(schema_version='padf.traceability/v1', context_id='ENGINEERING-PILOT-' + language, trace_id=language + '-trace', requirements_revision=definition_revision, test_definition_revision=test_revision,
        requirements=[dict(id=language + ':AC1', feature_ids=['engineering-pilot-' + language], kind='ac', approval='approved', approval_ref=definition_ref, source_ref=definition_ref, required_tc_ids=[t['id'] for t in tcs if t['layer'] == 'integration'])], test_cases=tcs, nodes=[], links=links)
    write(language + '-trace.json', trace)
    metadata = dict(target)
    del metadata['environment_id']
    # Copy fixed source evidence so the offline report has working direct source links.
    for source in source_files + test_files + [Path(__file__), project / 'testing-architecture.json']:
        dest = OUT / source.relative_to(ROOT)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, dest)
    manifest = dict(schema_version='padf.test-run/v1', context_id=trace['context_id'], run_id=language + '-' + digest(raw)[:20], **metadata,
        runner=runner, environment=environment, command=dict(argv=receipt['argv'], exit_code=receipt['exit_code']), started_at=receipt['started_at'], finished_at=receipt['finished_at'], ci_ref=receipt.get('ci_ref'), ci_context=receipt.get('ci_context'),
        raw_reports=[dict(path=raw_name, sha256=digest(raw))], coverage=coverage, tc_evidence=tce, selector_map=maps, default_layer='integration')
    write(language + '-manifest.json', manifest)
