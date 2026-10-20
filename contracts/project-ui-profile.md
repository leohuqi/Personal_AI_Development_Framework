# Project UI Design Profile — PADF V0.3

Schema: `padf.ui-profile/v1`. **Each consuming application** maintains its own versioned UI baseline (example: `docs/design/ui-profile.md` plus token/component references). PADF supplies this contract, **not shared mandated colors**.

## Required contents
- `project_id`, profile path/approved revision/Owner approval, status APPROVED|PROPOSED, responsible UI Designer; exact source references.
- **Design philosophy:** primary user roles, workflows, usability goals, visual tone, target information density and evidence/assumptions.
- **Visual tokens:** color role semantics (success, warning, destructive, price movement when relevant), typography, spacing scale, radius/border, elevation, icons, chart tokens and light/dark behavior.
- **Component catalog:** canonical component path/version, variants, keyboard behavior, defaults, validation/empty/loading/error/permission states and usage/exception rules.
- **Layout/navigation:** responsive breakpoints, grid, nav and detail-page patterns, table/chart density, modal/drawer behavior.
- **Interaction conventions:** feedback/confirmation, selection, optimistic state, error recovery, accessibility WCAG targets, localization and motion.
- **Exceptions:** affected screen, requested deviation, reason, impact, Owner approval ref; deviations remain local unless profile revision is approved.
- Reference existing source design system/Figma/source code where available. No invented Figma URLs, tokens or screenshots.

## Bootstrapping a legacy project
1. Examine implemented UI, screenshots, component library and current UX spec. **Observed** values are not automatically approved.
2. Propose missing token/interaction definitions with `PROPOSED` status; record conflicts and provide representative screens.
3. Obtain Owner authorization for a new project-wide baseline or major change. Until then, minimize deviation from observed UI and mark profile dependency unresolved as needed.
4. Every UI Feature Package pins profile revision; mismatched profile or changed components make the dependent design STALE until revalidated.

## 传入 Design Gate 的批准元数据（V0.3.1）

Profile 文档中的 `status` 与 `owner_approval_ref` 由协调者核验后传入门禁。使用以下字段明确批准所针对的版本；不能从 pinned 引用、旧批准、观察到的 UI 或设计者自查推定 APPROVED。

```yaml
ui_profile_ref: docs/design/ui-profile.md@<exact-approved-commit>
ui_profile_status: APPROVED
ui_profile_approved_ref: docs/design/ui-profile.md@<exact-approved-commit>
ui_profile_approval_ref: "<verified-owner-decision-permalink>"
```

阶段的 `profile_ref`、任务的 `ui_profile_ref` 与批准绑定的 `ui_profile_approved_ref` 必须完全一致。未取得批准时保留 PROPOSED，依赖该 Profile 的正式 Design Gate 保持 BLOCKED；不影响获授权的草稿设计工作。既有项目可以另行批准任务范围内的替代基线，但也须固定版本并记录真实 Owner 决定，不能把“映射既有 UI”直接当作新基线批准。

门禁是只读元数据检查器，无法认证远程批准内容。Master/Reviewer 须核验真实批准、权限、范围和被批准版本。协议 schema 仍为 `padf.ui-profile/v1`，不因新增门禁字段改名。

## Sample schema fragment (illustrative, no actual PQA approval)
```yaml
schema_version: padf.ui-profile/v1
project_id: EXAMPLE
status: PROPOSED
profile_ref: docs/design/ui-profile.md@<commit>
design_philosophy:
  information_density: high
tokens_ref: src/styles/tokens.css@<commit>
component_catalog_ref: src/components/README.md@<commit>
breakpoints: ["<project-defined>"]
exceptions: []
owner_approval_ref: null
```
