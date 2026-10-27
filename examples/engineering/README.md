# Engineering 可复现案例

这里验证 PADF 的跨语言证据契约：Python 使用真实 SQLite，Java 使用真实临时文件系统。它们是固定的合成验证项目；不是应用服务、通用测试执行引擎，也不宣称已验证 Spring、Maven、.NET 或 Go。

测试策略由 SA 分别选择：[Python Testing Architecture](python/testing-architecture.json)、[Java Testing Architecture](java/testing-architecture.json)。策略文件的 PROPOSED、合成 RTM 中的 approved 和 Owner 实际批准是不同事实：RTM 的 approved 只标识已授权试验内固定的合成范围，不代表真实业务需求已获 Owner 验收。所有摘要的 Owner 状态始终 NOT_ASSESSED。

## 本地复现

在仓库根目录，使用隔离的 Python 3.12 环境安装 [固定案例依赖](python/requirements.txt)；框架报告工具本身只需 Node 22+ 和 `/usr/bin/python3` 标准库，不依赖 pytest。Java 案例需要 JDK 17。

Java 测试工具版本为 JUnit Platform Console 1.11.4（Jupiter 5.11.4）及 JaCoCo 0.8.12。将 jar 放在调用者选定的目录；[实际文件 SHA256](java/dependencies.sha256)及[CI 下载地址和校验步骤](../../.github/workflows/engineering-validation.yml)固定了所用字节。校验和是已观察文件摘要，不声称发行方签名。jar、虚拟环境、class、数据库及生成报告不提交仓库。

```sh
python -m pip install -r examples/engineering/python/requirements.txt
python examples/engineering/run-pilots.py /absolute/new-artifacts /absolute/dependencies
python examples/engineering/prepare-reports.py /absolute/new-artifacts
node scripts/engineering-report.mjs normalize --manifest python-manifest.json --junit python.xml --report-root /absolute/new-artifacts --out python-run.json
node scripts/engineering-report.mjs summary --trace python-trace.json --run python-run.json --versions python-versions.json --report-root /absolute/new-artifacts --out python-summary.json --html python-summary.html
node scripts/engineering-report.mjs normalize --manifest java-manifest.json --junit java.xml --report-root /absolute/new-artifacts --out java-run.json
node scripts/engineering-report.mjs summary --trace java-trace.json --run java-run.json --versions java-versions.json --report-root /absolute/new-artifacts --out java-summary.json --html java-summary.html
node examples/engineering/verify-incomplete.mjs /absolute/new-artifacts
node tests/engineering/run-tests.mjs
node tests/engineering/run-adapter-tests.mjs
node tests/engineering/independent-probes.mjs --repo-root . --artifact-root /absolute/new-qa-artifacts
PYTHONPATH=examples/engineering/python QA_STORE_IMPLEMENTATION=store python -m pytest -q -c examples/engineering/python/pytest.ini tests/engineering/independent_store.py
```

`python` 应指向上述隔离环境。`new-artifacts` 必须是不存在的新目录；每次运行独立目录。固定样例脚本只调用源码中明确的 pytest、javac、JUnit、JaCoCo 命令，不读取或执行 manifest 命令。所有真实调用保存准确 argv、cwd、UTC 起止、退出码和实际工具/环境版本 receipt；prepare 消费该 receipt，不用 XML 时间猜测时区或把模板命令冒充实际命令。首次手工 RED/GREEN 证据属于具体变更历史，重跑最终实现只产生当前 GREEN，不能重造 TDD 历史。

## 阅读与追溯

本轮代表性TDD的[原始失败/通过日志与阶段源码摘要](tdd/README.md)单独保留，当前最终运行不冒充首轮RED。

打开生成目录的 `python-summary.html`、`java-summary.html` 或 `incomplete-summary.html`。中文报告分别列五种执行状态、AC 已设计/自动化/执行/完整验证、TC 与逐项测试及失败详情、line/branch 命中与分母、原始报告/coverage/源码链接和剩余缺口；完整 JSON 为折叠附录。CI 对应 artifact 名为 `engineering-evidence-<SHA>`，实际运行地址与状态由当前 GitHub Actions 提供，本地运行 `ci_ref=null`，不冒称 CI 已通过。

`*-source-manifest.json` 精确绑定实际实现文件与测试文件的 SHA256。内容版本 `sha256:…` 不是 Git HEAD；规范化 run 独立保存实现、需求、测试定义和策略版本。报告里的 source 副本便于离线打开，不代替原版本源码。`prepare-reports.py` 是合成需求/TC 的单一关联源；测试代码中是前置、动作及可观察断言，不在多个文档重复维护步骤。

[Python 测试](python/test_store.py)包含合法 owner 更新/读取、跨 owner 拒绝且保持原值、写入后故障回滚与恢复、非法值不改数据。[Java 测试](java/test/RecordStoreTest.java)验证临时目录读写、owner 拒绝及非法值。Functional 是类型，Unit/Integration 是层级；同一 Unit 规则用例可同时具有 functional 类型，AC 的必需完整流程则明确绑定 Integration 用例，不能因 Unit 全绿推导完成。

Python [.coveragerc](python/.coveragerc)排除测试和故意薄弱的控制实现，但保留未调用的 `untouched.py`。JaCoCo 包含未调用的 `Untouched.class`。两套工具分别保留原生 line/branch 分母，不平均百分比。

## 负控制与不完整证据

[weakfix.py](python/weakfix.py)故意拒绝所有更新，只用于独立 QA 检查薄弱修复；合法更新、事务恢复等实际测试应失败。样例脚本明确要求此控制退出码为 1，并保存失败日志/XML/receipt。其他执行的非零退出码立即传播；CI 用 `always()` 保存已有报告，不以报告上传掩盖失败。该控制失败是预期试验结果，不能写成产品通过或真实产品缺陷。

Case D 只取实际已执行 Unit 结果作为有明确说明的证据子集，保留完整功能 TC 设计并排除其执行证据。摘要必须显示 Unit PASS、Functional NOT_RUN、AC 未完整验证、Owner NOT_ASSESSED；它不是另一次 runner 执行。

独立QA原始断言保留在[报告/追溯探针](../../tests/engineering/independent-probes.mjs)和[SQLite探针](../../tests/engineering/independent_store.py)，由Master原样集成。将上述SQLite命令的`QA_STORE_IMPLEMENTATION`设为`weakfix`可复现薄弱修复的预期失败（退出1、3 FAIL/1 PASS）；这是控制试验，不能写成产品测试通过。正确实现必须退出0、4 PASS。

[报告工具](../../scripts/engineering-report.mjs)只消费数据。未知/重复参数、覆盖现有文件、路径/符号链接逃逸、原件 hash 不符、坏 XML、过期或不兼容证据均非零。退出 0 只说明本次数据操作无已知错误；SKIPPED/NOT_RUN 仍可使功能不充分。不存在自动 ACCEPTED/DONE。远程原件不下载，只列未核验警告，不能冒称已核验其内容。旧 Design Gate/G-01 输入没有新增硬字段或全局门禁。
