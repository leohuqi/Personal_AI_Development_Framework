# Expense Ledger architecture viewer
Open **architecture-viewer.html** in a modern browser. Everything runs locally with no server or internet connection.

Use System, Deployment, Packages, Adapters and Import to switch views. Select a node for its responsibility, or open “Inspect a node by name”. Keyboard: Tab, then Enter or Space. Zoom is bounded from 50% to 200%; Reset returns to 100% and the left edge. Wide diagrams scroll inside their own frame on a phone. Without JavaScript, all five static diagrams remain visible; printing includes all five.

## Editable and static deliverables
- [Interactive viewer](architecture-viewer.html)
- [System / trust boundaries](system-trust.html) · [SVG](system-trust.svg) · [PNG](system-trust.png)
- [Technical / deployment](technical-deployment.html) · [SVG](technical-deployment.svg) · [PNG](technical-deployment.png)
- [Package overview](package-core.html) · [SVG](package-core.svg) · [PNG](package-core.png)
- [Adapter expansion](package-adapters.html) · [SVG](package-adapters.svg) · [PNG](package-adapters.png)
- [Import workflow](import-workflow.html) · [SVG](import-workflow.svg) · [PNG](import-workflow.png)
- [Desktop viewer screenshot](viewer-desktop.png) · [Mobile viewer screenshot](viewer-mobile.png)

HTML contains editable inline SVG and CSS. Standalone diagrams remain readable without scripting; node responsibilities appear below each diagram in its HTML. Platform fonts intentionally fall back in offline mode, so typography may differ across devices. PNGs are actual Chromium renders, not synthetic images.

## Authoritative sources
- [Approved system baseline](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/f4dbf0d3fac707db1b57252c529618c38d26f0bc/examples/issue-5-acceptance/system/SYSTEM-BASELINE.md)
- [Approved structured model](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/f4dbf0d3fac707db1b57252c529618c38d26f0bc/examples/issue-5-acceptance/system/SYSTEM-MODEL.json)
- [Owner approval and default style selection](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/05ba2117e2fbb5ac924913accb76b763a2fc268c/examples/issue-5-acceptance/OWNER-SYSTEM-APPROVAL.md)
- [Bounded refinement dispatch](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/fc6cf84f1a532a482d0157ce4013571a6a50147e/examples/issue-5-acceptance/SYSTEM-REFINEMENT-DISPATCH.md)

No material baseline decisions changed. The historical baseline still says PROPOSED; the later linked Owner decision records its approval without rewriting history. This is a design visualization package, not an application prototype or implementation.

## Verification and fidelity
[Browser checks](browser-test-report.json), [Skill checks](skill-check-report.json), [source consistency](source-consistency-report.json), [artifact hashes](ARTIFACT-MANIFEST.json), [style record](DEFAULT-STYLE.md).

Actual browser checks cover five views and all 36 nodes, click/keyboard/name-index inspection, zoom bounds/reset, 390px local scrolling, print and no-JavaScript fallback, zero external requests/page errors, static text bounds and screenshots. Five static self-checks and geometry checks passed. A source consistency comparison expands the overview’s named adapter aggregate to exactly all 19 approved package edges.

Fidelity: system overview shows 9 model participants; OS location/file-provider flows expand in Deployment. Deployment collapses all app packages into one native executable, with canonical protected store inside its sandbox and OS-auth service from baseline ADR-005. Core package view names all five aggregated adapters and expands them in the Adapters view. User, external input/provider, sandbox, store and OS-service boundaries remain explicit. Import expands ADR-003 with unsupported/cancel/failure outcomes, retained refund evidence and atomic commit. No source relationship or invariant is silently removed.

PASS records author verification, not independent DESIGN review, Owner Skill grades, final Issue acceptance, application build/performance/security validation, coding approval, merge or deployment. Those decisions remain with their assigned roles.
