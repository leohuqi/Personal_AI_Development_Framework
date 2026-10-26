# 变更与兼容性

本轮从PADF main `b0c2bb06ea5f612b2ea372e3d24c3a68644938df`增量修改；当前正式版仍为v0.3.5，不自动升级接入项目。

| 范围 | 处置及目的 |
| --- | --- |
| Architecture Pilot | 通用化C4、轻量arc42、ADR、固定Diagram-Design与风险裁剪；单一方法在[架构标准](../../../standards/architecture/README.md)，不复制PKMS技术拓扑/皮肤 |
| Architecture Refinement | 长期入口、L0–L3、按问题阅读与一个完整权威；只有真实迁移/冲突才启用来源表。见[Full入口](../../../examples/architecture-method/full/README.md)和[实际阅读对照](../../../examples/architecture-method/validation/README.md) |
| Terminology Pilot | 六领域、语境判断、来源范围、标识和语义保护；[结构化词表](../../../standards/terminology/GLOSSARY.yaml)单源生成阅读版，不搬入项目54词条或其ACCEPTED状态 |
| Master / SA / MA / PA / Reviewer | 增强既有职责：深度选择、系统/模块责任、资料路由、当前权威、术语、实质质量和影响范围；保留两阶段规格与原批准职责 |
| Coder / QA / Context Coordinator | 仅增加最小资料及术语引用，不要求重画架构、全词表维护或全仓检查 |
| UI Designer | 本轮无增量；v0.3.5概念确认→前端Mockup→Impeccable保持原样 |
| 共享能力 | 新增`terminology-governance` Skill；架构方法直接由现有SA/MA引用，不另建重复的Architecture Skill/Agent或新审批阶段 |
| Contracts / Workflow / AGENTS | 受影响架构、成果、Gate兼容说明及既有路由/协作/工作方法增量；没有变更原schema、授权语义或强制阻断代码 |
| Templates | 四个短架构模板，只放当前问题、权威来源和必要深度，不强制十二章或空表 |
| Automation / CI | 独立只读Profile建议；限定领域/明确文件的术语提示与保护对比；单源生成/验证；Profile、术语、图模型破坏负例及全部原回归 |
| 示例与证据 | Lite/Standard/Full、风险反例、8图HTML/SVG及实际检查状态；中性合成事实不算产品实现或审批 |

`lib/design-gate.mjs`、`lib/action-preflight.mjs`、`lib/orchestration-evidence.mjs`、`lib/skill-delivery-quality.mjs`、UI契约/Skill、审批策略及图工具lock与main逐字节一致。新增Profile输入属于本地方法选择辅助器，未塞入旧协议；输出不授予编码/合并/发布权限。Lite遇已触发module/system图、基线或Review仍按旧规则阻断，不以“可裁剪”删除现有要求。

本候选显式复用未合并[PR24](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/24)的7份Agent接续文档改动，保持其原文；未替Owner合并、关闭或取代PR24。Owner需决定合并顺序，合入前重新核对准确base/head；本PR不自动覆盖main新改动。
