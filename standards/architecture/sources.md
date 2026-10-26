# 方法输入与核验范围

核验日期：2026-10-26。以下是方法参考及本次阅读记录，不把项目技术提案升级为 PADF 标准，也不宣称 ISO 认证或官方中文译文。

| 一手来源 | 实际读取范围 | 本方法采用/限制 |
| --- | --- | --- |
| [C4 Diagrams](https://c4model.com/diagrams) | 官方页面 static/supporting diagrams 与按价值选择层级 | Context/Container/Component/Code；不强制四层齐全 |
| [C4 Container](https://c4model.com/abstractions/container) | 官方 Container定义及FAQ | 软件/数据运行边界，非Docker；部署独立；代码模块通常不是Container |
| [arc42 Overview](https://arc42.org/overview/) | 官方十二关注点及可裁剪说明 | 作为覆盖检查；未完整读取全部章节/书籍，不声称逐项符合完整标准 |
| [Michael Nygard ADR原文](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) | Context/Decision/Status/Consequences及保留替代历史 | 重大决定短记录；批准权限仍按PADF。中文为本框架说明 |

网页由 search_service 的实际 open 读取；直接 web 入口当次403后使用可用连接器，不以摘要代替正文。未核验付费标准正文。

## PKMS 只读素材

仓库 [Personal-Knowledge-Library](https://github.com/leohuqi/Personal-Knowledge-Library) 固定 main `f22286701db4f4946922972eb116ef893beef430`；术语候选 PR7 `343a3ecdd22a3406ef6721e7478d14a3bdf00c45` 由 PA 另处理。本 SA 实际读取：

- `docs/architecture/pilot-v0.1/standard/ARCHITECTURE-DESIGN-STANDARD.md`、`ARCHITECTURE-VISUAL-STYLE.md`、`OVERVIEW.md`；views 下 context/container/deployment/runtime/data/security-quality 全部 Markdown。
- Pilot `modules/document-management/DESIGN.md`（完整）、`evaluation/PILOT-EVALUATION.md`、独立 `review/REVIEW.md` 与 `RE-REVIEW.md`；语义图源 `diagrams/runtime-import.mmd` 与真实 `render.cjs` 方法。
- Refinement README、长期 Architecture README、SOURCE-MAP、Document Management README/完整 CONTRACT、共同 COMMON-API。
- Refinement `validation/METHOD.md`、before/after 两份真实 `ANSWER.md` 和 `review/FINAL-REVIEW.md`。

吸收：分层导航、完整契约合并、逐事实来源状态、有界模块渐进深化、真实渲染与语义检查、同任务独立 Reader。首轮 Review 的在线/本地路径分支缺陷说明ID相等不能证明语义；来源映射缺陷说明摘要不能冒充完整规则。Refinement Reader 只是单案例文字消费验证，不能推导普遍效率。

Pilot/Refinement 文档已被 Owner 接受并合并，系统技术仍 PROPOSED；历史交付时的 PENDING 不覆盖后来的文档接受，也不意味着技术获批。PADF 样例独立合成，不复制 PKMS 私人产品正文、拓扑、术语表、数值预算、皮肤或大型审计包。

## Diagram-Design 实际消费

固定上游 `11b08eade8049c441ed3df1895e3b527c26c0fbe`，根 `SKILL.md` SHA256 `1b30bb3c0da29a05e5b05c0a4510ce6f286a0d0f1da97b9aa6aaf03c92e98618`。读取主 Skill、profiles/style-guide/output-spec、architecture/deployment/sequence/ER 类型、semantic-patterns、primitives-core、export refs；检查 export_svg/self_check/geometry 工具后使用。环境路径不写入可复现工具；运行与限制见[样例证据](../../examples/architecture-method/evidence/RESULTS.md)。这是指令 Skill + 本地生成/浏览器渲染，不是云图表API。

## 当前来源状态补充

Master实时REST核验PKMS术语PR7已于2026-10-26 04:17:33 UTC合并，main为`23c40d445ceb8a2db01d68065e3ee351b3c44449`。固定研究输入head `343a3ecdd22a3406ef6721e7478d14a3bdf00c45`与合并提交compare为0文件差异，原专业分析不变；早期“未合并”记录不代表当前状态。项目词条已接受不授予PADF通用词条或系统技术批准，详见[执行增量](../../docs/upgrades/architecture-terminology-vnext/EXECUTION.md)。
