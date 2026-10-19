# ExpenseRecord module design
Open [module-viewer.html](module-viewer.html) locally. The viewer contains all five diagrams and expandable full source contracts. Works offline and without JavaScript; keyboard-accessible section links and disclosure controls. Diagrams scroll inside their frame on phones; print includes every figure. It is a design reader, not an expense application prototype.

## Source contracts
- [Module design and exact algorithms](MODULE-DESIGN.md)
- [Concrete files/classes/packages](CODE-STRUCTURE.md)
- [Typed internal APIs and DTOs](INTERFACES.swift.txt)
- [Core Data logical entities, attributes, relationships, uniqueness and indexes](CORE-DATA-MODEL.json)
- [Synthetic profiles and security quotas](PROFILES.md)
- [State/error/transaction rules](STATE-CONTRACT.json)
- [Implementation test plan and NOT_RUN cases](TEST-PLAN.md)
- [Execution receipt](EXECUTION-RECEIPT.md)

## Actual diagrams
[Components](component-ports.html), [import sequence](import-sequence.html), [identity/provenance](source-identity.html), [ledger/refunds](ledger-model.html), [transaction states](import-state.html). Each has matching editable SVG and actual browser-rendered PNG. Actual viewer screenshots: [desktop](viewer-desktop.png), [mobile](viewer-mobile.png).

Source is the exact Owner-approved SYSTEM-BASELINE.md and SYSTEM-MODEL.json@f4dbf0d3fac707db1b57252c529618c38d26f0bc; later actual Owner approval is OWNER-SYSTEM-APPROVAL.md@05ba2117e2fbb5ac924913accb76b763a2fc268c. Dispatch MODULE-DISPATCH.md@9b0395177352f449ace247e5c1054acbe60b6594. Prior SYSTEM Handoff and Master reconciliation are in receipt. Historical SYSTEM PROPOSED status is superseded by later actual approval, without rewriting history.

## Reproduction and evidence
Run `python3 generate-diagrams.py`, `python3 verify-contracts.py`, `python3 verify-skill.py`, `python3 verify-alignment.py`, then bundled Node `verify-render.cjs` from any directory. Scripts resolve package paths. The Skill verifier requires a genuine installed diagram-design checkout at pin 11b08eade8049c441ed3df1895e3b527c26c0fbe; DIAGRAM_DESIGN_ROOT can point to it. Render script accepts PLAYWRIGHT_MODULE_DIR and CHROME_PATH; defaults record the actual installed bundled runtime and Chrome used here. Run `python3 verify-manifest.py` to check recorded artifact hashes. No dependencies were installed. Chrome requires host process permission in this environment; ordinary filesystem sandbox launch failed, approved host launch passed. These scripts do not implement the iOS app.

[Contract checks](contract-test-report.json), [Skill/offline/geometry checks](skill-test-report.json), [browser checks](browser-test-report.json), [source fidelity](source-consistency-report.json), [hash manifest](ARTIFACT-MANIFEST.json). Actual counts/statuses belong to these reports. Source verification is author self-check, not independent DESIGN review or Owner scoring. Swift compilation, Core Data crash atomicity, provider compatibility, GPS/device, backup/migration/performance/security are NOT_RUN.

Default minimal-light project style was explicitly Owner-selected in the approval above. Reuses SYSTEM DEFAULT-STYLE.md@123aa014962289feccf527f8e063a19299c1e975. Offline system font fallback is intentional; no global profile edited, no application UI Profile implied. Type selection: architecture for compile dependency/ports, sequence for ordered import messages, two ER views for Core Data relationships, ordinary state machine for commit/retry guards. Five doc-wide 1280×720 figures; <=9 nodes/12 arrows each. HTML generation followed loaded pinned Skill and template/reference guidance, SVG export used its actual packaged helper, PNGs captured by actual Chrome.

Fidelity: adapter implementations aggregate in component view, all six ports named. Source ER omits crossing namespace→observation/batch and Entry→identity edges, documented and checked in full JSON. Ledger view text-lists MerchantMapping and StoreMetadata instead of disconnected boxes; RefundLink original and refund roles are separately drawn. Sequence combines parser/rules calls and omits final UI reply (specified result envelope); failure/cancel detailed in state contracts. State view shows main route and common recovery, with unsupported/idle/parse cancellation in notes/full table. No source truth is replaced by visuals.

Fresh independent DESIGN review for L, Master dependency reconciliation and Owner MA-Q1–5 scores remain pending. Delivery does not grant coding/merge/release/production permission.
