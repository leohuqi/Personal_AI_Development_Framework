# Issue #5 · Expense Ledger design acceptance pilot

Three real specialist design packages, actual runtime dispatch/handoff/reconciliation evidence and independent design review. **Overall acceptance remains PENDING_OWNER_DECISIONS; Design Gate BLOCKED; coding not authorized.** SYSTEM proposal and default diagram style have actual Owner approval; UI Profile and professional quality scores remain separate pending decisions.

| Package | Open locally in browser | Authoritative source |
|---|---|---|
| SYSTEM | [Interactive architecture viewer](system/architecture-viewer.html): five views, node details, keyboard and 50–200% zoom | Baseline/model f4dbf0d3fac707db1b57252c529618c38d26f0bc; visual source123aa014962289feccf527f8e063a19299c1e975; [baseline](system/SYSTEM-BASELINE.md), [manifest](system/ARTIFACT-MANIFEST.json) |
| MODULE | [Five-diagram module viewer](module/module-viewer.html): anchored navigation and local diagram scrolling | ad5a536bf2f6636d53ba51452cc555d54b82456b; [design](module/MODULE-DESIGN.md), [typed internal API](module/INTERFACES.swift.txt), [12-entity logical model](module/CORE-DATA-MODEL.json), [manifest](module/ARTIFACT-MANIFEST.json) |
| UI L3 | [Working clickable prototype](ui/prototype.html): manual entry/category override, location-consent simulation, synthetic import/review/duplicates/refunds | 86a71f24fa612403cb741d859251b2f715347f3d; [Profile](ui/UI-PROFILE.md) d7e9c679a0a435310ef76d63432917d7e1656078 remains PROPOSED; [manifest](ui/ARTIFACT-MANIFEST.json) |

Start at [index.html](index.html). Download the complete folder and open that file or the individual viewer in a modern browser. No server, installation, login or remote font/API is required. GitHub's blob view displays HTML source; it is not a hosted live prototype. Source HTML embeds its styles and diagrams. SVG/PNG exports are included for static viewing.

UI author screenshots and Reviewer screenshot evidence are actual local PNGs, explicitly LOCAL_ONLY in their manifests/reports, available in the Owner's local delivery bundle. No missing GitHub PNG links or public hosting claims. Source and reproducible verification scripts are in this PR. SYSTEM/MODULE author PNGs are published in their source tree.

## Review and verification

Final independent technical design conclusion: **APPROVE WITH CONDITIONS**, limited to UI source86a71f24fa612403cb741d859251b2f715347f3d plus frozen SYSTEM/MODULE. **52 actual independent browser assertions PASS/0 FAIL; F01–F05 individually CLOSED**, no new professional finding. Owner UI Profile approval, separate quality scores and qualified execution-provenance disposition remain pending. [Final UI report](review/REPORT-V3.md), [independent architecture supplement](review/SA-MA-SUPPLEMENT.md); initial REQUEST CHANGES reports remain historical. Final UI author59 grouped checks also PASS; author tests are not independent acceptance.

Independent SYSTEM/MODULE supplement: 60 static/source/export and85 actual browser checks PASS; all ten figures independently rendered/visually inspected; all36 SYSTEM node interactions and65 manifest files verified; ten regenerated SVGs byte-equal. Actual installed diagram-design pin11b08eade8049c441ed3df1895e3b527c26c0fbe verified, with MIT license preserved in THIRD-PARTY-NOTICES.txt.

[Execution/acceptance audit](ACCEPTANCE-AUDIT.md) provides exact per-stage refs, actual runtime origin, correction chronology, OC-01–OC-06 evidence and explicit provenance limits. Independent Reviewer could observe MODULE/UI tasks; historical SYSTEM tasks were no longer in its live list. Parent tool receipts remain recorded; no invented session UUID/Owner attestation or automatic CROSS_SESSION PASS.

## Owner acceptance

Open [OWNER-REVIEW.md](OWNER-REVIEW.md): review concrete UI Profile approval and15 quality criteria with evidence, then separately decide SA, MA and UI ACCEPT/CHANGES_REQUESTED/DEFER. Three unscored sheets: [SA](system/OWNER-EVALUATION-V2.json), [MA](module/OWNER-EVALUATION.json), [UI](ui/OWNER-EVALUATION-V2.json). Master and Reviewer assign no Owner score. Review execution provenance separately.

## Scope

The native app is designed, not implemented. SwiftUI/Core Data/GPS/device/VoiceOver/real provider compatibility/backup/migration/performance/security tests are NOT_RUN. The browser prototype uses synthetic CNY/fixed-namespace/safe-integer/in-memory data and virtual consent; refresh resets state. Test scope and negative cases are explicit in each report. No actual bills, credentials, production/PQA writes, deployment or scheduler. [Issue #5](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/5) stays open; [Draft PR #6](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/6) stays unmerged, on an isolated branch based on PR #3's actual pinned test-start SHA f1b6a6e4a90d547127bd95bceaa12880a7c39855.
