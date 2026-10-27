#!/usr/bin/env python3
"""Synthetic documentation exercises only. Not a PADF portal/RTM runtime or project dependency."""
import copy
import hashlib
import json
import re
import subprocess
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
MULTI = HERE / 'fixtures/multi'
INPUTS = ['README.md', 'CATALOG.json', 'RELATIONS.json', 'SPEC.md', 'QUALITY.md', 'DECISIONS.md', 'sample.py']


def load(root):
    return json.loads((root / 'CATALOG.json').read_text()), json.loads((root / 'RELATIONS.json').read_text())


def validate(root, catalog, graph):
    nodes = {n['id']: n for n in graph['nodes']}
    if len(nodes) != len(graph['nodes']) or len({f['id'] for f in catalog}) != len(catalog):
        raise ValueError('duplicate ID')
    if {f['id'] for f in catalog} != {n['id'] for n in nodes.values() if n['kind'] == 'Feature'}:
        raise ValueError('Catalog mismatch')
    for a, _, b in graph['edges']:
        if a not in nodes or b not in nodes:
            raise ValueError('orphan relationship')
    for ref in [n['ref'] for n in nodes.values()] + [f['ref'] for f in catalog if f['ref']]:
        path, _, anchor = ref.partition('#')
        target = (root / path).resolve()
        if not target.is_relative_to(root.resolve()) or not target.is_file():
            raise ValueError('missing/outside source')
        if anchor and anchor not in re.findall(r'^#+ ([a-z0-9-]+)$', target.read_text(), re.M):
            raise ValueError('missing anchor')


def render(root, adapter_revision='fixture-adapter-v1'):
    catalog, graph = load(root)
    validate(root, catalog, graph)
    # A test-only derived view: titles/IDs/relations come from originals, never copied requirement or test bodies.
    goal = next(line for line in (root / 'README.md').read_text().splitlines() if line.startswith('目标：'))
    out = ['# 合成项目统一入口', '', goal, '',
           '| 阅读目的 | 回答的问题 | 来源 |', '| --- | --- | --- |',
           '| 产品与功能 | 用户要求和正式功能有哪些？ | [原Catalog](CATALOG.json)、[规格](SPEC.md) |',
           '| 架构与设计 | 模块如何工作？ | [设计依据](SPEC.md#design) |',
           '| 工程与质量 | 实际测试和完整AC结论是什么？ | [原QA结论](QUALITY.md#ac-verification) |',
           '| 审阅与决定 | 当前需要决定什么？ | [当前决定](DECISIONS.md#current) |',
           '| 历史与参考 | 当时批准了哪个版本？ | [历史批准](DECISIONS.md#history) |', '', '## 功能索引', '']
    for f in catalog:
        ref = f"[{f['name']}]({f['ref']})" if f['ref'] else f['name'] + '（资料缺口：尚无设计、实现或测试）'
        out.append(f"- {f['id']} / {f['milestone']} / {f['state']}：{ref}")
    out += ['', '## 双向关联', '', '| 起点 | 关系 | 终点 |', '| --- | --- | --- |']
    out += [f'| {a} | {rel} | {b} |' for a, rel, b in graph['edges']]
    out += ['', '## 状态来源', '', '以下全为合成快照，非实时核验；观察时间不同于生成时间。']
    out += [f"- {i}: {o['state']} / 观察于 {o['observed_at']} / {o['source']}" for i, o in graph['observations'].items()]
    out += ['', '## 来源校验元数据', '', f'仅用于演练的适配器版本：{adapter_revision}']
    out += [f'- {p}: sha256={hashlib.sha256((root / p).read_bytes()).hexdigest()}' for p in INPUTS]
    out += ['', '校验摘要仅用于派生过期检查，不是Git修订、批准或可用性证据。来源修订见原规范的文档版本；本地Git版本练习另在临时仓库执行。', '']
    return '\n'.join(out)


def check_saved(root, adapter_revision='fixture-adapter-v1'):
    # Compare without overwriting the submitted output.
    if (root / 'INDEX.md').read_text() != render(root, adapter_revision):
        raise ValueError('stale derived view')


def git(root, *args):
    return subprocess.run(['git', '-C', str(root), *args], check=True, capture_output=True).stdout


def verify_revision(root, path, revision):
    if not re.fullmatch(r'[a-f0-9]{40}', revision):
        raise ValueError('exact revision required')
    if git(root, 'show', f'{revision}:{path}') != (root / path).read_bytes():
        raise ValueError('displayed source differs from fixed revision')


def refresh(observations, item, state=None, observed_at=None):
    result = copy.deepcopy(observations)
    if state is None:
        result[item]['refresh_error'] = 'unavailable; previous observation retained'
    else:
        result[item].update(state=state, observed_at=observed_at)
    return result


class DocumentationExercises(unittest.TestCase):
    def test_small_project_lite(self):
        small = HERE / 'fixtures/small'
        self.assertEqual([p.name for p in small.iterdir()], ['README.md'])
        original = (small / 'README.md').read_text()
        with tempfile.TemporaryDirectory() as temp:
            target = Path(temp) / 'README.md'
            target.write_text(original)
            target.write_text(target.read_text().replace('复用现有导出函数', '复用现有导出函数的格式化选项'))
            self.assertIn('当前无待决事项', target.read_text())
            self.assertIn('NOT_RUN', target.read_text())
            self.assertEqual(len(list(Path(temp).iterdir())), 1)

    def test_catalog_navigation_and_new_future_feature(self):
        catalog, graph = load(MULTI)
        rendered = render(MULTI)
        for feature in catalog:
            self.assertIn(feature['id'], rendered)
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for p in INPUTS: (root / p).write_bytes((MULTI / p).read_bytes())
            catalog.append(dict(id='EX-F104', name='归档工作项', milestone='Iteration C', state='未来', ref=None))
            graph['nodes'].append(dict(id='EX-F104', kind='Feature', ref='CATALOG.json'))
            (root / 'CATALOG.json').write_text(json.dumps(catalog))
            (root / 'RELATIONS.json').write_text(json.dumps(graph))
            output = render(root)
            self.assertIn('EX-F104', output)
            self.assertIn('资料缺口', output)
            self.assertFalse(any('EX-F104' in edge for edge in graph['edges']))

    def test_bidirectional_many_to_many(self):
        _, graph = load(MULTI)
        def neighbors(i):
            return {b for a, _, b in graph['edges'] if a == i} | {a for a, _, b in graph['edges'] if b == i}
        self.assertIn('TC-101', neighbors('AC-101'))
        self.assertIn('AC-101', neighbors('TC-101'))
        self.assertIn('AC-102', neighbors('TC-101'))
        self.assertIn('RUN-101', neighbors('TC-101'))
        self.assertTrue({'EX-F101', 'EX-F102'} <= neighbors('REQ-102'))

    def test_result_not_recomputed_as_acceptance(self):
        qa = (MULTI / 'QUALITY.md').read_text()
        self.assertIn('技术断言PASS', qa)
        self.assertIn('AC-101 PARTIAL', qa)
        self.assertIn('AC-102 NOT_VERIFIED', qa)
        self.assertIn('原QA结论', render(MULTI))
        self.assertNotIn('技术断言PASS', render(MULTI))  # link rather than duplicated results

    def test_saved_view_and_stale_before_rebuild(self):
        check_saved(MULTI)
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for p in INPUTS + ['INDEX.md']: (root / p).write_bytes((MULTI / p).read_bytes())
            saved = (root / 'INDEX.md').read_bytes()
            for source in INPUTS:
                original = (root / source).read_bytes()
                (root / source).write_bytes(original + b'\n')
                with self.assertRaisesRegex(ValueError, 'stale'): check_saved(root)
                self.assertEqual((root / 'INDEX.md').read_bytes(), saved)
                (root / source).write_bytes(original)
            with self.assertRaisesRegex(ValueError, 'stale'): check_saved(root, 'changed-template')

    def test_broken_ids_paths_and_anchors(self):
        catalog, graph = load(MULTI)
        for mutate in [lambda g:g['edges'].append(['UNKNOWN', 'tests', 'AC-101']),
                       lambda g:g['nodes'][0].update(ref='absent.md'),
                       lambda g:g['nodes'][0].update(ref='SPEC.md#absent'),
                       lambda g:g['nodes'].append(copy.deepcopy(g['nodes'][0]))]:
            changed = copy.deepcopy(graph); mutate(changed)
            with self.assertRaises(ValueError): validate(MULTI, catalog, changed)

    def test_git_source_change_and_old_approval(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            git(root, 'init', '-q'); git(root, 'config', 'user.name', 'Synthetic Reader'); git(root, 'config', 'user.email', 'reader@example.invalid')
            for p in INPUTS: (root / p).write_bytes((MULTI / p).read_bytes())
            git(root, 'add', '.'); git(root, 'commit', '-qm', 'synthetic source v1'); old = git(root, 'rev-parse', 'HEAD').decode().strip()
            approval = {'revision': old, 'scope': 'synthetic design v1 only'}
            (root / 'SPEC.md').write_text((root / 'SPEC.md').read_text() + '\n新增当前设计说明。\n')
            with self.assertRaisesRegex(ValueError, 'differs'): verify_revision(root, 'SPEC.md', old)
            git(root, 'add', 'SPEC.md'); git(root, 'commit', '-qm', 'synthetic source v2'); new = git(root, 'rev-parse', 'HEAD').decode().strip()
            verify_revision(root, 'SPEC.md', new)
            self.assertEqual(approval['revision'], old)
            self.assertIn(b'create-item', git(root, 'show', f'{old}:SPEC.md'))
            with self.assertRaises(subprocess.CalledProcessError): verify_revision(root, 'SPEC.md', '0' * 40)
            with self.assertRaises(subprocess.CalledProcessError): verify_revision(MULTI, 'SPEC.md', old)

    def test_local_observation_does_not_imply_global_freshness(self):
        _, graph = load(MULTI); original = graph['observations']
        changed = refresh(original, 'EX-F101', '受阻', '2026-01-02T10:00:00Z')
        self.assertEqual(changed['EX-F102'], original['EX-F102'])
        failed = refresh(changed, 'EX-F101')
        self.assertEqual(failed['EX-F101']['observed_at'], changed['EX-F101']['observed_at'])
        self.assertEqual(failed['EX-F101']['state'], '受阻')
        self.assertIn('refresh_error', failed['EX-F101'])
        self.assertNotEqual(original['EX-F101']['observed_at'], changed['EX-F101']['observed_at'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
