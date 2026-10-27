# 架构方法：三种中性文档练习

这些是**合成设计案例**，没有产品实现、真实Owner技术批准、编码/部署权限或产品测试。案例中的“练习批准基线”只是假设输入，不是PADF项目的真实APPROVED。框架候选待Owner评审；适用方法见[标准](../../standards/architecture/README.md)。

| 要验证的问题 | 最短入口 | 设计深度及边界 |
| --- | --- | --- |
| 低风险列表/卡片表现切换 | [Lite DESIGN](lite/DESIGN.md) | 复用[基线](lite/BASELINE.md)，scope none，无图/新API/ADR；状态、异常、验收仍明确 |
| 一般Web/API是否需全套Full | [Standard Overview](standard/OVERVIEW.md) → [Catalog模块](standard/MODULE.md) | 一个Container、必要接口与单模块边界；不增加无当前用途的部署/全量系统图 |
| 文件、解析、权限恢复如何逐层消费 | [Full长期架构入口](full/README.md) | L0–L3、Context/Container/Deployment/代表Runtime/Data/关键Component，只有两个当前模块细化 |
| 小功能为何增加深度 | [风险覆盖](RISK-OVERRIDE.md) | 权限/删除/恢复不能凭规模走Lite；保留旧门禁 |

Full 示例使用文档候选状态 PROPOSED 和 `system_approval_ref=null`，演示未知/停止点；不能从文档完整或图通过推导Module Ready。此合成示例不复制任何接入项目的架构、专属词条或批准结论。

## 模型、图与再现

独立语义源：[model.json](model.json)；项目呈现：[VISUAL-STYLE.md](VISUAL-STYLE.md)；各图的目的/层级/省略/权威来源由模型views记录。图提供HTML/SVG及紧凑PNG，按正文导航查看，不要求Coder读取全部JSON。

生成：`python3 examples/architecture-method/tools/build.py`。验证与导出见[工具说明](tools/README.md)；真实记录见[evidence/RESULTS](evidence/RESULTS.md)。HTML/SVG/PNG为派生资产，不能各自手工修改同一规则。检查只覆盖文档/模型/呈现；业务验收表仍NOT RUN。独立Reader由Master另行执行并保存准确版本和原答，不在此伪造结论。
