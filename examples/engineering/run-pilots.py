#!/usr/bin/env python3
"""Fixed two-stack demonstration commands; never consumes commands from a manifest.

Run with the pinned pytest environment: python run-pilots.py ARTIFACT_DIR JAR_DIR.
Every real subprocess receipt retains argv, cwd, UTC times, environment and exit code.
"""
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import shutil
import sqlite3
import importlib.metadata
import xml.etree.ElementTree as ET
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(sys.argv[1]).resolve()
JARS = Path(sys.argv[2]).resolve()
OUT.mkdir(parents=True, exist_ok=False)
LOCKS = {
 'junit-platform-console-standalone-1.11.4.jar': 'b016ef6b1c3454d6d7c2c88ce081dabf289699686af6622d6e4e2e1b54b4a2fc',
 'org.jacoco.agent-0.8.12-runtime.jar': '115e8e6e6593ca3a9892dfef695df4d487c706e59e71e64dc0ab95716ee02622',
 'org.jacoco.cli-0.8.12-nodeps.jar': '594c01125b84864a7fc5a9efab19b71b7de36b27346863f6d7cd0cd45400ceb0',
}
for name, expected in LOCKS.items():
    if hashlib.sha256((JARS / name).read_bytes()).hexdigest() != expected:
        raise ValueError('Dependency digest mismatch: ' + name)

def version(argv):
    p = subprocess.run(argv, capture_output=True, text=True, check=True)
    return (p.stdout + p.stderr).strip()

ci_ref = None
ci_context = None
if os.environ.get('GITHUB_ACTIONS') == 'true':
    checkout = os.environ['GITHUB_SHA']
    pr_head = None
    event_path = os.environ.get('GITHUB_EVENT_PATH')
    if event_path:
        event = json.loads(Path(event_path).read_text())
        pr_head = event.get('pull_request', {}).get('head', {}).get('sha')
    ci_ref = dict(url=os.environ['GITHUB_SERVER_URL'] + '/' + os.environ['GITHUB_REPOSITORY'] + '/actions/runs/' + os.environ['GITHUB_RUN_ID'], revision=checkout)
    ci_context = dict(checkout_revision=checkout, pr_head_revision=pr_head, event_name=os.environ.get('GITHUB_EVENT_NAME'))

environment = dict(id='fixed-pilot', os=sys.platform, python=sys.version, java=version(['java', '-version']), javac=version(['javac', '-version']), pytest=version([sys.executable, '-m', 'pytest', '--version']), jars=LOCKS, timezone='UTC', sqlite=sqlite3.sqlite_version, pytest_cov=importlib.metadata.version('pytest-cov'), coverage=importlib.metadata.version('coverage'), junit_platform='1.11.4', junit_jupiter='5.11.4', jacoco='0.8.12')

def execute(name, argv, cwd, expected=0, extra_env=None):
    env = dict(os.environ, TZ='UTC', **(extra_env or {}))
    started = datetime.now(timezone.utc).isoformat()
    p = subprocess.run([str(a) for a in argv], cwd=cwd, env=env, capture_output=True, text=True)
    finished = datetime.now(timezone.utc).isoformat()
    (OUT / (name + '.log')).write_text(p.stdout + p.stderr)
    receipt = dict(argv=[str(a) for a in argv], cwd=str(cwd), exit_code=p.returncode, started_at=started, finished_at=finished, environment=environment, expected_exit_code=expected, control_fixture=(expected != 0), ci_ref=ci_ref, ci_context=ci_context)
    (OUT / (name + '-receipt.json')).write_text(json.dumps(receipt, indent=2) + '\n')
    if p.returncode != expected:
        print(p.stdout + p.stderr, file=sys.stderr)
        raise SystemExit(p.returncode or 2)
    return receipt

py = ROOT / 'examples/engineering/python'
execute('python', [sys.executable, '-m', 'pytest', '-q', '--junitxml=' + str(OUT / 'python.xml'), '--cov=.', '--cov-branch', '--cov-report=xml:' + str(OUT / 'python-coverage.xml'), '--cov-report=html:' + str(OUT / 'python-coverage-html')], py)
execute('weakfix', [sys.executable, '-m', 'pytest', '-q', '--junitxml=' + str(OUT / 'weakfix.xml')], py, expected=1, extra_env=dict(PADF_STORE_IMPLEMENTATION='weakfix'))
weak_xml = ET.parse(OUT / 'weakfix.xml')
weak_cases = {c.get('name'): c for c in weak_xml.findall('.//testcase')}
if len(weak_cases) != 8 or weak_xml.findall('.//error') or weak_cases.get('test_owner_can_update_and_read') is None or weak_cases['test_owner_can_update_and_read'].find('failure') is None or weak_cases['test_other_owner_cannot_change_record'].find('failure') is not None:
    raise SystemExit('Weak repair control did not fail for the intended behavior')
(OUT / 'weakfix-control.json').write_text(json.dumps(dict(expected='legitimate owner update fails, cross-owner rejection passes, no runner errors', verified=True), indent=2))
classes = OUT / 'java-classes'
classes.mkdir()
java_src = ROOT / 'examples/engineering/java'
junit = JARS / 'junit-platform-console-standalone-1.11.4.jar'
execute('javac', ['javac', '-g', '-cp', junit, '-d', classes, *sorted((java_src / 'src').glob('*.java')), *sorted((java_src / 'test').glob('*.java'))], ROOT)
execute('java', ['java', '-javaagent:' + str(JARS / 'org.jacoco.agent-0.8.12-runtime.jar') + '=destfile=' + str(OUT / 'java.exec'), '-jar', junit, 'execute', '--class-path', classes, '--scan-class-path', '--reports-dir', OUT / 'java-reports', '--disable-ansi-colors'], ROOT)
shutil.copyfile(OUT / 'java-reports/TEST-junit-jupiter.xml', OUT / 'java.xml')
execute('jacoco', ['java', '-jar', JARS / 'org.jacoco.cli-0.8.12-nodeps.jar', 'report', OUT / 'java.exec', '--classfiles', classes / 'RecordStore.class', '--classfiles', classes / 'Untouched.class', '--sourcefiles', java_src / 'src', '--xml', OUT / 'java-coverage.xml', '--html', OUT / 'java-coverage-html'], ROOT)
print('Fixed pilots passed; weak repair failed as expected. Raw logs and real receipts retained.')
