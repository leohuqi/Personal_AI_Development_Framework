#!/usr/bin/env python3
"""Audited read-only task helper. Instruction-bounded, not an OS security sandbox."""
import datetime, hashlib, json, sys
from pathlib import Path
root = Path(__file__).resolve().parent
arm, command, *args = sys.argv[1:]
if arm not in ['old', 'new']: raise SystemExit('Unknown arm')
packet = root / arm
log = root / (arm + '-reads.jsonl')
previous = [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []
if len(previous) >= 10: raise SystemExit('Request budget exhausted')
used = sum(item['returned_characters'] for item in previous)
if command == 'list' and not args:
    result = '\n'.join(str(p.relative_to(packet)) for p in sorted(packet.rglob('*')) if p.is_file())
    source = None
elif command == 'read' and len(args) == 3:
    name, start, end = args
    path = (packet / name).resolve()
    if not path.is_relative_to(packet.resolve()) or not path.is_file(): raise SystemExit('Outside packet or missing file')
    lines = path.read_text().splitlines()
    start, end = int(start), int(end)
    if start < 1 or end < start or start > len(lines): raise SystemExit('Invalid line range')
    result = '\n'.join(f'{i}: {lines[i-1]}' for i in range(start, min(end, len(lines)) + 1))
    source = {'path': name, 'start': start, 'end': min(end, len(lines)), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
else: raise SystemExit('Usage: reader.py old|new list OR old|new read path first_line last_line')
remaining = 24000 - used
if remaining <= 0: raise SystemExit('Character budget exhausted')
if len(result) > remaining:
    marker = '\n[CHARACTER BUDGET TRUNCATED]'
    result = result[:max(0, remaining-len(marker))] + marker[:remaining]
entry = {'observed_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'request': len(previous)+1,
    'arm': arm, 'command': command, 'source': source, 'returned_characters': len(result),
    'remaining_characters': max(0, 24000-used-len(result)), 'result': result}
with log.open('a') as stream: stream.write(json.dumps(entry, ensure_ascii=False) + '\n')
print(result)
