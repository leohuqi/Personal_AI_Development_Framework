# 方法输入与核验范围

核验日期：2026-10-26。以下是方法参考及本次阅读记录，不把项目技术提案升级为 PADF 标准，也不宣称 ISO 认证或官方中文译文。

| 一手来源 | 实际读取范围 | 本方法采用/限制 |
| --- | --- | --- |
| [C4 Diagrams](https://c4model.com/diagrams) | 官方页面 static/supporting diagrams 与按价值选择层级 | Context/Container/Component/Code；不强制四层齐全 |
| [C4 Container](https://c4model.com/abstractions/container) | 官方 Container定义及FAQ | 软件/数据运行边界，非Docker；部署独立；代码模块通常不是Container |
| [arc42 Overview](https://arc42.org/overview/) | 官方十二关注点及可裁剪说明 | 作为覆盖检查；未完整读取全部章节/书籍，不声称逐项符合完整标准 |
| [Michael Nygard ADR原文](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) | Context/Decision/Status/Consequences及保留替代历史 | 重大决定短记录；批准权限仍按PADF。中文为本框架说明 |

网页由 search_service 的实际 open 读取；直接 web 入口当次403后使用可用连接器，不以摘要代替正文。未核验付费标准正文。

## Diagram-Design 实际消费

固定上游 `11b08eade8049c441ed3df1895e3b527c26c0fbe`，根 `SKILL.md` SHA256 `1b30bb3c0da29a05e5b05c0a4510ce6f286a0d0f1da97b9aa6aaf03c92e98618`。读取主 Skill、profiles/style-guide/output-spec、architecture/deployment/sequence/ER 类型、semantic-patterns、primitives-core、export refs；检查 export_svg/self_check/geometry 工具后使用。环境路径不写入可复现工具；运行与限制见[样例证据](../../examples/architecture-method/evidence/RESULTS.md)。这是指令 Skill + 本地生成/浏览器渲染，不是云图表API。
