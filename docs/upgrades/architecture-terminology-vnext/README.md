# 架构设计与术语治理能力升级候选

**候选已实现，保持Draft；尚未满足完整验收。** [PR25](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/25)独立交付，不自动合并/发布。当前剩余：准确提交的独立Review，以及因审批服务403未执行的浏览器渲染/实看。状态以本文、[验证](VALIDATION.md)及PR准确HEAD为准。

## 先看成果

| 当前需要 | 直接阅读 |
| --- | --- |
| 小改不重做架构 | [Lite列表/卡片](../../../examples/architecture-method/lite/DESIGN.md)，scope none复用基线，无新C4 |
| 普通Web/API技术方案 | [Standard Overview](../../../examples/architecture-method/standard/OVERVIEW.md)，只补Container及当前模块/接口 |
| 复杂系统按问题查设计 | [Full长期入口](../../../examples/architecture-method/full/README.md)，系统/模块/运行/数据/未批决定各有完整权威 |
| 架构图 | [Standard Container SVG](../../../examples/architecture-method/diagrams/standard-container.svg)、[Full图入口](../../../examples/architecture-method/full/views/structure.md)。8份HTML/SVG真实生成导出；**实际浏览器/PNG/实看仍BLOCKED** |
| 文字优化效果 | [术语Before/After](../../../standards/terminology/BEFORE-AFTER.md)及[生成词表](../../../standards/terminology/GLOSSARY.md)，正确专业词保留，全部通用词条PROPOSED |
| Skill/Contract变化与兼容 | [变更矩阵](CHANGES.md)，9角色+1共享能力，原门禁/授权代码未改 |
| 实际验证及遗漏 | [验证包](VALIDATION.md)、[两位独立Reader原始结果](../../../examples/architecture-method/validation/README.md)及[真实分派/收件](EXECUTION.md) |

## 行为变化与经验复用

以前容易从项目规模推出整包设计、按目录要求通读、重复正文或从词面改名。现在Master按范围/复杂度/风险自动获得有理由的Profile建议；现有SA/MA按C4+轻量arc42+ADR深化当前系统/模块，角色从长期入口只读所需权威。Pilot的方法与图模型、Refinement的单源/最小阅读、Terminology Pilot的语境/保护/来源范围共同进入现有角色、契约、Workflow和有界检查，见矩阵及各标准的来源页，不复制PKMS私有技术/皮肤/审计包。

只读选择器不改变architecture_scope或放宽旧Gate；Lite不能跳过已触发图/批准基线/Review。术语脚本只提示候选并检查部分受保护形式，不自动替换，也不证明语义等价或真实批准。角色、阶段与审批不增加；产品PA→SA/UI→Module两阶段、概念确认→前端Mockup及Impeccable、Agent接续、DESIGN Review和G-01保持。

## 待决定及限制

1. 完整图表视觉验证尚未完成，不能把SVG存在当看图通过；恢复工具执行后补真实证据。
2. 独立准确版本Review完成并处理发现后，才提交最终Owner验收；本入口不预填APPROVE。
3. 本PR显式复用未合并PR24的接续文档，Owner决定合并顺序；不由Master代替合并或发布。
4. 未来若允许有实质module设计却无原必需图，须另行兼容分析及决定；本轮保留旧阻断，不夹带放宽。

输入PADF main/v0.3.5均为b0c2bb06…；PKMS原Architecture源f222867…、Terminology head343a3ec…；最新核验PKMS PR7已合并main23c40d4…，与固定术语head无文件差异。历史来源/真实状态见执行记录，项目术语接受不升级为PADF接受或系统技术批准。本轮授权限框架设计、修改、验证和Draft PR；不执行项目升级、业务编码、生产、历史tag或审批改写。
