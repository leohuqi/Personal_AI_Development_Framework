# Diagram source plan — BLOCKED, no rendered diagrams
Source of truth: SYSTEM-MODEL.json and SYSTEM-BASELINE.md version 0.1 in this commit.
These are descriptive technical drafts, not completed diagram-design artifacts.

| Required view | Purpose | Source | Planned diagram type | Status |
| --- | --- | --- | --- | --- |
| System/trust boundaries | Show selected exports entering device sandbox, no provider login or cloud backend | model zones, flows, invariants | Architecture / secure paved road | BLOCKED style gate |
| Technical/deployment | Single native process, OS services, protected local store, encrypted export boundary | model deployment, components | Deployment | BLOCKED style gate |
| Package direction | Composition root, inward domain dependencies, adapter ports | model package_dependencies | Dependency graph | BLOCKED style gate |
| Import data flow | Preview, confirm, atomic commit, rollback, unresolved refunds | baseline ADR-003 | Data flow | BLOCKED style gate |

Planned separate doc-wide diagrams keep overview below 9 nodes and 12 arrows each; import detail carries error branches rather than crowding overview. No authoritative data is to be dropped to achieve that layout.

## Dependency/gate evidence
PADF pin: cathrynlavery/diagram-design@11b08eade8049c441ed3df1895e3b527c26c0fbe.
Pinned Skill was fetched from GitHub; observed blob 359a32025f0e43192b2be1fdfb1a62601d4f3564. Its first-time setup explicitly requires a resolved project profile, customization or user selection of default before generation.
Actual installed directory: /Users/leohu/.codex/plugins/cache/diagram-design/diagram-design/2.6.98; its Skill was read. Its package directory label alone did not establish revision. Actual git rev-parse HEAD returned 11b08eade8049c441ed3df1895e3b527c26c0fbe; git status --short was clean and git hash-object of the installed Skill returned 359a32025f0e43192b2be1fdfb1a62601d4f3564, matching the pinned upstream blob. Thus the installed checkout is verified at the required pin. The catalog path omitted a directory level; actual path was found and read.
No project-approved style/profile supplied. Master confirms no existing Owner-approved style available. No approval to use default was inferred. Thus generation stops at the required style gate; no browser/export render was run.

generator: diagram-design (planned; generation NOT_RUN)
external_skill_sha: 11b08eade8049c441ed3df1895e3b527c26c0fbe (verified installed checkout; Skill loaded; generation blocked)
project_style_profile_ref: MISSING
html_path: null
svg_path: null
png_path: null
render_test_status: NOT_RUN
content_review: source topology self-checked; not independent DESIGN review
SA-Q4: BLOCKED; cannot satisfy critical diagram criterion

## Exact decision needed
Owner may explicitly select “keep default” or provide approved website/installed/local style, tokens or saved profile. After that choice, retain/recheck the verified locked revision, load relevant type/style/security references, generate and render all required views, inspect geometry/labels and record actual check logs. The current package must remain PROPOSED/incomplete until reconciled.
