# 合成项目统一入口

目标：协助小团队创建、分配和查找工作项。全部资料为框架合成演练，不代表产品已实现或Owner已批准。

| 阅读目的 | 回答的问题 | 来源 |
| --- | --- | --- |
| 产品与功能 | 用户要求和正式功能有哪些？ | [原Catalog](CATALOG.json)、[规格](SPEC.md) |
| 架构与设计 | 模块如何工作？ | [设计依据](SPEC.md#design) |
| 工程与质量 | 实际测试和完整AC结论是什么？ | [原QA结论](QUALITY.md#ac-verification) |
| 审阅与决定 | 当前需要决定什么？ | [当前决定](DECISIONS.md#current) |
| 历史与参考 | 当时批准了哪个版本？ | [历史批准](DECISIONS.md#history) |

## 功能索引

- EX-F101 / Iteration A / 进行中：[创建工作项](SPEC.md#create-item)
- EX-F102 / Iteration A / 待实施：[分配负责人](SPEC.md#assign-owner)
- EX-F103 / Iteration B / 未来：保存筛选条件（资料缺口：尚无设计、实现或测试）

## 双向关联

| 起点 | 关系 | 终点 |
| --- | --- | --- |
| [REQ-101](SPEC.md#create-item) | scopes | [EX-F101](CATALOG.json) |
| [REQ-102](SPEC.md#assign-owner) | scopes | [EX-F101](CATALOG.json) |
| [REQ-102](SPEC.md#assign-owner) | scopes | [EX-F102](CATALOG.json) |
| [AC-101](SPEC.md#create-item) | accepts | [EX-F101](CATALOG.json) |
| [AC-102](SPEC.md#assign-owner) | accepts | [EX-F102](CATALOG.json) |
| [EX-F101](CATALOG.json) | designed-by | [DESIGN-101](SPEC.md#design) |
| [EX-F102](CATALOG.json) | designed-by | [DESIGN-101](SPEC.md#design) |
| [AC-101](SPEC.md#create-item) | partly-tested-by | [TC-101](QUALITY.md#cases) |
| [AC-102](SPEC.md#assign-owner) | partly-tested-by | [TC-101](QUALITY.md#cases) |
| [TC-101](QUALITY.md#cases) | has-run | [RUN-101](QUALITY.md#run) |
| [EX-F101](CATALOG.json) | partly-implemented-by | [IMPL-101](sample.py) |

实现关系中partly-implemented-by仅表示标题校验的局部依据；其余业务实现缺口见原规格。

## 状态来源

以下全为合成快照，非实时核验；观察时间不同于生成时间。
- EX-F101: 进行中 / 观察于 2026-01-01T10:00:00Z / synthetic://tracker/work-1
- EX-F102: 待实施 / 观察于 2026-01-01T09:00:00Z / synthetic://tracker/work-2

## 来源校验元数据

仅用于演练的适配器版本：fixture-adapter-v1
- README.md: sha256=e835149ed1fef41808f3d33816b93ab5e068341bdf44b2f9ead661b498dc28f7
- CATALOG.json: sha256=58b894d970b0c7b5218fd6de87f4e3272831788f8be5931a68224bb4d8da15d2
- RELATIONS.json: sha256=07a028d2b65b061d5c5daea17dcabe208a6bc9060e0878191449959a8f315cbb
- SPEC.md: sha256=08c0b4640f1027abd3266ba198b6a8b37b9e54b980e7a5552148ed084275ea02
- QUALITY.md: sha256=e21cdda0bdad089d30bef6f36cfe269519fb85da2c8e27b404cdfd288a403eb2
- DECISIONS.md: sha256=a0b6f28403a79f0df0070e8dede1ed6750d3e68b4d18668c9b7c7f59ecfd0939
- sample.py: sha256=e3ccc5a233af043a1427cfc411857be11996b3f536e734632ef1ad3cab463c13
- history/design-v1.md: sha256=5ea7505c3800c723909c86888fa83316ab2c5a0b2f7569f8db7036b7129b2049
- history/approval-v1.md: sha256=9b0078a7223aa59e25709202bc43a4ef4f6a5fce2d35cd3b94c31e7306303d61

校验摘要仅用于派生过期检查，不是Git修订、批准或可用性证据。来源修订见原规范的文档版本；本地Git版本练习另在临时仓库执行。
