#!/usr/bin/env python3
"""Validate real pilot instances against the published, stack-neutral contracts.

Test-only dependency: jsonschema==4.25.0. No remote schema resolution or runner.
Usage: python3 tests/engineering/validate-schemas.py /absolute/pilot-artifacts
"""
import copy
import json
from pathlib import Path
import sys

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = Path(sys.argv[1]).resolve()
validators = {}
for name in ('testing-architecture', 'traceability', 'test-run'):
    schema = json.loads((ROOT / 'contracts/engineering' / (name + '.schema.json')).read_text())
    Draft202012Validator.check_schema(schema)
    validators[name] = Draft202012Validator(schema, format_checker=FormatChecker())

count = 0
for language in ('python', 'java'):
    for kind, file in (
        ('testing-architecture', ROOT / 'examples/engineering' / language / 'testing-architecture.json'),
        ('traceability', ARTIFACTS / (language + '-trace.json')),
        ('test-run', ARTIFACTS / (language + '-run.json')),
    ):
        value = json.loads(file.read_text())
        validators[kind].validate(value)
        # These are transport-contract negatives, not duplicate business tests.
        bad = copy.deepcopy(value)
        bad['schema_version'] = 'another-project/v0'
        assert not validators[kind].is_valid(bad), (kind, 'wrong protocol accepted')
        bad = copy.deepcopy(value)
        if kind == 'testing-architecture':
            bad['status'], bad['approval_ref'] = 'APPROVED', None
        elif kind == 'traceability':
            bad['requirements'][0]['approval'] = 'unknown'
        else:
            bad['tests'][0]['status'] = 'EXPECTED_TO_PASS'
        assert not validators[kind].is_valid(bad), (kind, 'invalid state accepted')
        count += 1
        print('PASS', language, kind)
print('PASS', count, 'actual instances; wrong protocol and state rejected')
