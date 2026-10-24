# Impeccable：UI 质量指南与审查适配

采用[上游 Impeccable](https://github.com/pbakaus/impeccable)加强任务体验与跨界面一致性，复用现有 Agent 环境中的插件/Skill；PADF 不自建服务、不安装或静默升级插件，不启用后台 hooks。项目记录实际安装版本及不可变 Skill 源，任务 impeccable_skill_ref 与审查 skill_ref 必须相同。路径可固定至 commit，或本地受版本控制的 Skill 文件 blob；只写名称或 latest 不够。

本次核对本机插件 4.3.1 的主 Skill、critique/audit 指南；上游观察到的[固定源](https://github.com/pbakaus/impeccable/tree/936867543ac2576920d663cc9803597f6044f3ac)为 4.7.1（2026-10-24）。二者不能混称，不强制升级；接入项目自行固定实际可用版。此说明不代表已运行任何界面审查。

## 如何使用

1. UI Designer 从产品任务、现有界面和获批准 Profile 出概念，方向不明确才比较少量方案。普通工具界面优先 Operate 的清楚、精确和一致，不能以视觉创意扩大已批准范围。
2. Owner 或有效授权团队成员确认准确概念后，按批准前端栈和有边界原型授权直接生成 Mockup，不经强制 Figma 阶段。
3. 依据实际安装 Skill 使用 critique 检查任务/层级/认知负担与一致性，依据 audit 检查真实前端的键盘/焦点、响应式、对比度及实现问题；只有相关风险才深入性能等专项。按该版本的实际能力执行，工具不可用时报告降级/NOT RUN，不能把读指南、评分或截图冒充检测器/浏览器实测。
4. 将问题合并为一份有位置、证据、影响、优先级和建议的报告；修复一批再确认，不无限打磨。人先看[短卡片](../templates/stage-delivery.md)，详细检测结果作附录。
5. 报告绑定准确 Mockup、Profile、Skill 源，按[UI 契约](../contracts/ui-design.md)进入门禁；Impeccable 报告不是独立 Reviewer 或 Owner 批准的替代品。

## 保持一份设计真相

项目已批准的产品规格、UI Profile、组件/tokens 为权威来源；如工具需 PRODUCT.md / DESIGN.md，用原文链接或明确来源版本的派生视图，不建立冲突的第二套基线。工具建议偏离批准方向时先报影响，不自动重设品牌、技术栈或产品行为。

不要求每个任务重建全套 tokens、所有页面或全站审查。已有概念/确认有效可复用，只审本次受影响部分；当前交互与必要风险可判定后停止。缺实际 Skill 或所需审查证据时保留未完成状态，可继续其他授权工作；不得伪造 impeccable-review PASS。

CLI 可能使用本地引擎或首次下载；使用前按项目权限和实际插件说明核验。PADF 不把可选引擎、可视化伴随服务、遥测或 hooks 作为接入前置，不自动开启它们。若只能按 Skill 指南人工审查，报告明确方法/局限，并给出实际源检查与可用的浏览器证据，不冒称 CLI 已执行。
