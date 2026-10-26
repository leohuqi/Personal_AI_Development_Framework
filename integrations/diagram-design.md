# diagram-design integration — V0.3 (external Skill, pinned)

**Upstream:** https://github.com/cathrynlavery/diagram-design  
**Skill entry:** https://github.com/cathrynlavery/diagram-design/tree/main/skills/diagram-design  
**Pin:** [diagram-design.lock.json](diagram-design.lock.json) — upstream commit `11b08eade8049c441ed3df1895e3b527c26c0fbe` (observed 2026-10-14).

## Purpose
The Architect Skill **must invoke a genuine installed diagram-design Skill** when a required publishable diagram is needed; the external dependency is not silently vendored, and PADF neither asserts a runtime was configured nor assumes network access. Only use a compatible installed version verified against the lock SHA (or explicitly accepted change). Upstream is MIT licensed: observe notices if redistributing assets.

Supported diagram-design formats include architecture, architecture delta, database schema, ER/data model, flowchart, sequence, swimlane, state machine, data flow, deployment, dependency graph and UML; typical result is **one self-contained HTML containing SVG**, optionally exportable to SVG/PNG. It is not a canonical editable domain model and is not a substitute for SQL, API contracts, machine-readable workflow or ADR.

## Install / invoke (environment specific)
- Codex with supported marketplace: `codex plugin marketplace add cathrynlavery/diagram-design`, `codex plugin add diagram-design@diagram-design`. This can fetch current upstream; **verify installed revision**, do not assume it equals the lock.
- Skills host: `npx skills add cathrynlavery/diagram-design` or deploy a verified checkout of the exact locked commit. The CLI may follow later upstream; lock/reverify for reproducible deliveries.
- Load the installed `skills/diagram-design/SKILL.md` and only relevant diagram type references. Do **not** import or execute unreviewed upstream scripts just to satisfy a visual requirement.
- The first-time **style-guide gate** is mandatory: use a project profile/style token mapping or ask Owner to select/default explicitly; do not assume the shipped diagram colors match every application.
- Verify visibility, render/layout, field/entity/edge accuracy and stable source references; report NOT RUN if browser/export verification was not performed.

## Required artifact manifest
For each required diagram record: `diagram_type`, `purpose`, `authoritative_source_ref` (spec/schema/API/DDL + revision), `html_path` and `svg/png_path` if exported, `generator=diagram-design`, `external_skill_sha`, `project_style_profile_ref`, `render_test_status` (PASS/FAIL/BLOCKED/NOT RUN), and content review evidence. No fabricated files or test claims.

## Security and limitations
- Review upstream permission/privacy policy before use; generated SVG/HTML may reference Google Fonts and external requests. For private/offline projects use system-font/offline mode and no external brand scraping unless explicitly authorized.
- Missing installation, incompatible revision or unresolved branding gate -> BLOCKED/NEEDS_REFINEMENT; produce descriptive technical draft only, **not** a claimed completed diagram.
- Preserve required technical detail even if editorial diagram-design splits complex systems into overview/detail; never omit critical entities/security boundaries to satisfy aesthetic density.

## Architecture model, project style and real verification

[Shared method](../standards/architecture/README.md) owns C4 levels and tailoring. Keep model IDs, node responsibilities, ownership, directed edges, ordered messages and guards independently from layout. Architecture/Component, Deployment instances, Runtime/Sequence and conceptual ER/physical schema have distinct questions; do not flatten them into one picture or enforce a diagram count per Profile. Required diagrams already triggered by scope/Gate remain required, including Lite module work.

Read the actual pinned Skill and relevant type/export references. The upstream package may expose `SKILL.md` at its checkout root; verify actual location and content hash rather than infer invocation from a catalog version. Record instruction consumption separately from generation, browser render, export and content checks. For this pin the root Skill SHA256 is `1b30bb3c0da29a05e5b05c0a4510ce6f286a0d0f1da97b9aa6aaf03c92e98618`.

State type/size/cuts before drawing; reuse an explicit Owner default-style choice. Keep project tokens/font mode local; never rewrite the installed Skill or personal profile library without authorization. Offline Chinese output extends the font stack with available Chinese system fonts, omits remote fonts, and verifies actual platform fonts. Use self-contained static HTML and requested exports, accessible title/desc, local horizontal scrolling, readable preview and enlargement links with a short reading guide.

Render in a real browser; verify text bounds, label/node and connector collisions, source/model correspondence and semantic directions/branches; actually view exported images. A set-equality or geometry pass alone cannot prove authorization/branch correctness. Record renderer/dependency versions, source hashes, offline requests, exceptions, actual inspected diagrams and limits. Missing renderer or actual inspection is BLOCKED/NOT RUN. [Neutral reproducible examples](../examples/architecture-method/README.md) demonstrate this bounded workflow; their render success does not validate any product runtime or grant approval.
