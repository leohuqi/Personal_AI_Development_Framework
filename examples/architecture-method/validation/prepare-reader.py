#!/usr/bin/env python3
"""Prepare equal-fact, differently organized synthetic reading packets; never run Agents."""
import hashlib, json, shutil, sys
from pathlib import Path
source = Path(__file__).resolve().parents[1] / 'full'
target = Path(sys.argv[1]).resolve()
target.mkdir(exist_ok=False, parents=True)
files = sorted(source.rglob('*.md'))
manifest = []
flat = ['# SYN-FULL-F01 Architecture packet (synthetic)\n']
for path in files:
    name = str(path.relative_to(source))
    content = path.read_text()
    dest = target / 'new' / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content)
    flat.append('\n===== SOURCE ' + name + ' =====\n' + content)
    manifest.append({'path': name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'characters': len(content)})
(target / 'old').mkdir()
(target / 'old' / 'README.md').write_text('# Architecture packet\n\n完整设计材料见 ARCHITECTURE.txt，各原始来源名在分节标记中保留。\n')
(target / 'old' / 'ARCHITECTURE.txt').write_text('\n'.join(flat))
(target / 'manifest.json').write_text(json.dumps({'case': 'SYN-FULL-F01', 'source_files': manifest,
    'scope': 'Same synthetic document bodies, concatenated versus layered. Does not represent a historical PADF product implementation.',
    'budget': {'requests': 10, 'returned_characters': 24000}, 'model_and_diagrams': 'Outside reading task; validated separately'}, ensure_ascii=False, indent=2) + '\n')
shutil.copyfile(Path(__file__).with_name('reader.py'), target / 'reader.py')
print(target)
