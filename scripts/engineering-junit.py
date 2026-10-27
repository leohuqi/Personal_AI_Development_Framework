#!/usr/bin/env python3
"""Bounded JUnit XML -> parsed data, never a test runner. Python stdlib only."""
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET

LIMIT = 10 * 1024 * 1024

def parse(data):
    if not data or len(data) > LIMIT:
        raise ValueError('INPUT_LIMIT_OR_EMPTY')
    text = data.decode('utf-8-sig', errors='strict')
    if '\x00' in text or re.search(r'<!\s*(DOCTYPE|ENTITY)', text, re.I):
        raise ValueError('UNSAFE_XML')
    decl = re.match(r'\s*<\?xml[^>]*encoding\s*=\s*[\'"]([^\'"]+)', text, re.I)
    if decl and decl.group(1).lower().replace('-', '') != 'utf8':
        raise ValueError('UNSUPPORTED_ENCODING')
    root = ET.fromstring(text)
    if any(n.tag.startswith('{http://www.w3.org/2001/XInclude}') for n in root.iter()):
        raise ValueError('UNSAFE_XML')
    digest = hashlib.sha256(data).hexdigest()
    suites, diagnostics = [], []
    count = 0
    def walk(element, path, depth):
        nonlocal count
        if depth > 64:
            raise ValueError('INPUT_LIMIT')
        if element.tag not in ('testsuite', 'testsuites'):
            raise ValueError('INVALID_JUNIT_ROOT')
        own = []
        totals = dict(tests=0, failures=0, errors=0, skipped=0)
        for index, child in enumerate(element):
            if child.tag == 'testcase':
                count += 1
                if count > 100000:
                    raise ValueError('INPUT_LIMIT')
                name = child.get('name')
                if not name:
                    raise ValueError('MISSING_CASE_NAME')
                failures = [n for n in child if n.tag in ('failure', 'error')]
                skipped = any(n.tag == 'skipped' for n in child)
                outcome = 'FAIL' if failures else 'SKIPPED' if skipped else 'PASS'
                ordinal = len(own)
                # JSON encoding makes delimiters and duplicate suite names unambiguous.
                key = 'sha256:' + digest + '/' + json.dumps(path, ensure_ascii=True, separators=(',', ':')) + '/' + str(ordinal)
                own.append(dict(report_case_key=key, classname=child.get('classname', ''), name=name,
                                outcome=outcome, details='\n'.join((n.get('message', '') + '\n' + ''.join(n.itertext()))[:20000] for n in failures), ordinal=ordinal))
                totals['tests'] += 1
                totals['errors'] += int(any(n.tag == 'error' for n in failures))
                totals['failures'] += int(bool(failures) and not any(n.tag == 'error' for n in failures))
                totals['skipped'] += int(skipped and not failures)
            elif child.tag in ('testsuite', 'testsuites'):
                subtotal = walk(child, path + [f'{index}:{child.get("name", child.tag)}'], depth + 1)
                for k in totals:
                    totals[k] += subtotal[k]
            elif child.tag.startswith('{http://www.w3.org/2001/XInclude}'):
                raise ValueError('UNSAFE_XML')
        declared = {}
        for k, actual in totals.items():
            if element.get(k) is not None:
                try:
                    declared[k] = int(element.get(k))
                except ValueError:
                    raise ValueError('INVALID_SUITE_COUNT')
                if declared[k] != actual:
                    diagnostics.append(dict(code='SUITE_COUNT_MISMATCH', path='/'.join(path), message=k, severity='error'))
        suites.append(dict(path=path, declared_counts=declared, cases=own))
        return totals
    walk(root, ['0:' + root.get('name', root.tag)], 0)
    if count == 0:
        raise ValueError('EMPTY_RUN')
    return dict(suites=suites, diagnostics=diagnostics)

if __name__ == "__main__":
    try:
        output = parse(sys.stdin.buffer.read(LIMIT + 1))
        print(json.dumps(output))
        sys.exit(2 if output['diagnostics'] else 0)
    except (ValueError, UnicodeError, ET.ParseError, RecursionError):
        # Do not echo XML contents, parser text, secrets or local filesystem details.
        print(json.dumps(dict(suites=[], diagnostics=[dict(code='XML_PARSE_OR_LIMIT', path='junit', message='Invalid, unsafe, empty or oversized JUnit XML', severity='error')])))
        sys.exit(2)
