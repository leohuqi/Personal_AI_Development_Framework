# 需求与测试追溯约定

用已有稳定ID与引用连接`Feature → Requirement/AC → Design → Implementation → TC/Test Function → Run/Result`，支持多对多。可使用项目已有Markdown、JSON、测试元数据或报告工具，不新增PADF机器Schema、专用软件或全量填表要求。

需要发现/定义需求时，按[产品定义](product-definition.md#需求发现与定义requirements-discovery--definition-v01)向上关联 Business Goal、必要 Capability/Process/Use Case；小项目可合并层次。来源类别与决定状态留在原需求/规则记录，CONFIRMED可反查真实确认及适用版本；RTM只引用，不能因出现关联就把候选纳入已确认基线。Feature定义产品内容，Work Package/Agent Run仅关联交付工作及执行，不用其完成计数替代需求验证。

- 需求、步骤、测试代码和运行结果各保留原权威来源；RTM记录关联及必要覆盖说明，不复制正文和手工PASS。
- QA从当前AC找必要TC/证据，也能从测试函数反查规则/不变量；同一TC可由多个函数共同证明，但不能将不相容版本/环境的片段随意拼为完整结果。
- 单个技术测试可支持多个AC的PARTIAL证据。只有当前AC全部必要步骤/断言有充分证据才算完整验证；空用例、关系数量或大量Unit PASS不能推导完成。
- Feature、需求、AC、TC、测试结果和关系边各按其对象解释，不能混为计数。候选/已批准、已设计/自动化/执行/通过、完整AC与Owner验收分别保留。
- 被测实现、需求与测试定义/代码的版本及环境须能反查；旧报告可以读，但复用到当前结论要明确未变依据和适用范围。合并不自动证明验收或当前业务覆盖。

不要求每个Unit人工填完整链。先关联当前切片关键AC与真实风险；缺关联只表示该处证据缺口，不让所有历史项目自动失败。大量派生关系可供检索，不以边数衡量收益。适用细节见[工程标准](../standards/engineering/README.md#追溯与交付报告)。

## 文档入口和反向查询

有Catalog时以其稳定ID枚举所有正式Feature，未来功能也可定位且明确资料缺口。关联可双向查证：Requirement/AC ↔ Feature ↔ Design ↔ Implementation ↔ TC ↔ Run/Result；按需关联目标、Use Case、ADR和批准，不假定一对一。

最小关系记录为`起点ID | 关系类型 | 终点ID | 权威引用 | 来源修订 | 必要核验状态`，字段可映射已有项目格式，不新增机器Schema。对象元数据回到其原来源；同一对象可关联多个功能，不能按关系条数计算测试执行。引用版本和缺口按[文档标准](../standards/documentation/README.md#来源版本与过期检查)维护，Feature视图/RTM只派生读取，不重复编辑正文或计算AC验收。
