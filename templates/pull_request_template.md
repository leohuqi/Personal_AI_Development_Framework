## 结论 / 请审查什么

<先说明解决的问题、结果与需要审查/决定的事项；重要风险在前。>

按[共用文档与评审规则](../workflow/role-work-method.md#文档评审与沟通同样最小充分)只保留适用项；已有规格、测试与审查写简短结论并链接原文的准确版本，不复制完整报告。下方证据项按实际影响使用，不能把未测或缺失批准写成通过。

## Tracking and approved scope
- Linear / tracker issue: TEAM-___
- Original stable Feature ID: ___
- Approved Feature Spec / owner instruction:
- Scope delivered:
- Explicitly out of scope:

## Implementation and regression
- Code/API/schema/UI changes:
- Requirements/acceptance mapping:
- Backward compatibility, migrations and rollback considerations:

## Tests and evidence
- [ ] Focused tests (commands and result below)
- [ ] Project checks / GitHub Actions (run URL or PENDING)
- [ ] Project database integration / migration checks where applicable
- [ ] Playwright desktop/mobile where applicable
- [ ] Independent review requested for important/high-risk PR
- [ ] Affected docs/Feature Catalog updated or N/A
- Test evidence and NOT RUN checks:
- UI screenshots/video when relevant:
- Known P0–P3 issues or residual risks:

## Gate
- [ ] No secrets, sensitive project data, production credentials or unrelated changes.
- [ ] No unapproved production deployment/destructive migration.
- Owner acceptance: PENDING (PR merge does not imply Linear Done).
