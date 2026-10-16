# 随手账 · L1/L2/L3 UI Design Package
schema_version: padf.ui-design/v1
context_id: PADF-ISSUE-5-EXPENSE-ACCEPTANCE
original_feature_id: EXPENSE-ACCEPTANCE-005
linear_issue: null (GitHub Issue 5 is assigned tracker; no Linear ID fabricated)
feature: https://github.com/leohuqi/Personal_AI_Development_Framework/issues/5
profile_ref: UI-PROFILE.md@d7e9c679a0a435310ef76d63432917d7e1656078
profile_status: PROPOSED
system_baseline: SYSTEM-BASELINE.md@f4dbf0d3fac707db1b57252c529618c38d26f0bc
module_source: module@ad5a536bf2f6636d53ba51452cc555d54b82456b
level: L3 (merchant override, historical/current consent and import/refund interactions need actual transitions)
designer: /root/ui_designer
approval: PENDING; independent DESIGN review NOT RUN by author; coding_authorized false

## Philosophy and L1 concept
The primary user is one person keeping an offline ledger on iPhone. The job is to capture a small spend quickly and reconcile older exported bills without losing control of classification or provenance. This is an authored direction because no app, approved UI Profile, Figma or observed component library exists. Calm grouped surfaces, strong amount typography and a restrained green accent keep the ledger familiar. Privacy and correctness are conveyed by the actual flow: location is optional, old bill locations remain historical and every problematic row needs a decision.

IA: ledger root → (a) new-spend sheet → optional current observation consent → explicit save → ledger/detail; (b) import picker → progress → review cards → explicit whole-batch confirmation → ledger/detail. Detail allows an unresolved refund to be linked later. No app-wide dashboard, analytics, account system or extra backup screen is added.

Concept annotation / source: prototype.html is editable concept/high-fi/interactive source. The summary block is amount-first; the grouped list prioritizes merchant then date/category then place origin. Primary action is new entry, secondary is import. On a 390px phone the summary precedes list; at 1280px the same summary sits alongside the list. Task sheets preserve context and concentrate decisions; review cards replace wide tables. Source amounts/timestamps are read-only; corrections use exclude + separate manual record.

Alternatives considered: (1) chart-heavy dashboard, rejected because it crowds the core entry/review task; (2) conversational capture, rejected because it obscures explicit financial review; (3) a multi-step wizard, not chosen for a single spend because its overhead outweighs the form's short length. Complex import still has clear pick/check/confirm phases. These are design rationale, not user-research findings.

## L2 components, breakpoints and states
Canonical tokens and catalog: UI-PROFILE.md and tokens.css at pinned profile SHA. CSS tokens are embedded verbatim in prototype.html for offline self-contained operation. No third-party assets/fonts. Native HTML inputs/select/dialog demonstrate intended system controls; later SwiftUI mappings need actual device work.

| Screen / interaction | Components / tokens | Pattern / variation and reason | Breakpoint | Accessibility | Evidence |
|---|---|---|---|---|---|
| Ledger + empty | PageHeader, LedgerSummary, EntryRow; ink/action/surface, 16/20/24 spacing | New project proposal; amount-first grouping | 320/390 single; 768 centered; 1280 two columns | Signed money, text labels; keyboard entry/detail | ledger-mobile/wide.png; interaction 1,12,13 |
| Manual spend | Field, Button, CategorySuggestion; r-control, body/money | New task sheet; persistent labels and no silent overwrite | Sheet full width on phone, <=620px wide | Input labels, error/live feedback, native select, focus return | manual-mobile.png; interaction 2–6; adversarial focus |
| Location | LocationGroup, Dialog; warning/success text | Current observation separate from historical text; explicit reduced consent | Same sheet rules | Modal labelled heading, optional denial recovery | interaction 4–6 |
| Import pick + progress | Field, Button, Feedback | Local selection or synthetic examples; no login/integration | One column all sizes | Labelled picker, role=status, cancel | interaction 7–11; adversarial parsing cancel |
| Review / conflict / refund | ReviewRow, select, alert; warning/danger tokens | Card flow replaces dense table; explicit per-row inclusion/exclusion | Natural wrapping cards | No color-only meaning; controls labelled by row | import-mobile/review-conflict-mobile.png; interaction 7–11 |
| Error + retry / success | Feedback, disabled Button | Whole-batch receipt before UI success; failures preserve draft | All | role=alert/status; loading disables repeated action | interaction 6–11 |

State inventory: loading labels in save/import/location; ledger empty offers first-entry; unsupported/malformed/UTF-8/empty file is actionable; invalid/excess/overflow amount is rejected; cancel leaves ledger unchanged; permission denial and unavailable location leave saving available; reduced accuracy needs separate checkbox; duplicate/candidate/source conflict/unresolved refund each have labelled decisions; locked/full/stale errors keep review and require recheck; success updates ledger. Error recovery never optimistically inserts partial rows. Profile states are proposal, not approval.

## UI ↔ typed MODULE contract consistency
Every API below refers to INTERFACES.swift.txt / STATE-CONTRACT.json / CORE-DATA-MODEL.json at module SHA above. These are mapped in-memory design simulations; no Swift/API integration is claimed.

| UI event | Typed contract / event timing | Domain guard and UI state | Evidence / limitation |
|---|---|---|---|
| Save spend | SaveManual / saveManual after explicit submit | Checked positive CNY minor units, merchant/category/date, user vs suggested category, separate HistoricalInput/CurrentObservation; saving → success or recoverable | Exact BigInt parsing; no floating money arithmetic; tests 2–6. Demo upper bound <=JS safe integer minor units, stricter than Int64; not full money engine |
| Merchant typing / category dropdown | CategoryPort.suggest / CategoryChoice.user | Deterministic local keyword v1; user selection survives merchant edit; explicit apply suggestion resets | test 3; no remote inference or persisted merchant mapping |
| Consent to attach current | ExplicitConsentRequest / sampleCurrent | Purpose + explicit consent; reduced acceptance; denial/unavailable optional; sampledAt distinct from occurredAt | tests 4–6; virtual coordinate label/accuracy only, no GPS API |
| Pick file | PreviewImport / previewImport | selected provider + one fixed local account namespace; UTF-8 synthetic marker/header; no real adapter guessing | tests 9–10; synthetic-only boundary outside ordinary ledger in DemoPanel/README |
| Review rows | ReviewRow / RowDecision / reviseReview | Source economics read-only; display merchant/category/historical location editable; included must resolve duplicate/refund; invalid/nonsettled/conflict must exclude | tests 7–8. No raw IDs shown/logged; prototype in-memory IDs only, no HMAC/Core Data simulation claim |
| Confirm import | CommitImport / commitImport | every included row valid; strong duplicate cannot keep separate; candidate may keep separate; refund links bounded by original balance including same batch; one array replacement after checks | tests 7–11; not native atomicity/durability; memory only |
| Failed save + retry | STORE_LOCKED/FULL/STALE_REVIEW, reviewAgain | Whole batch unchanged; revision recheck and reset include decisions to review | tests 6–7; stale simulation selectable in separate panel |
| Cancel | cancelReview | parsing token invalidates async result; before commit discard; committing waits for result | test 10 and adversarial 2; process crash/durable commandStatus NOT RUN |
| Unresolved refund detail | LinkRefund / linkRefund | explicit unresolved retention excluded from settled net; later bounded original link changes net | test 8 |
| Ledger total | LedgerPage / CheckedTotals | CNY-only, signed settled net, unresolved separate; BigInt string formatting | tests 1,8; no cross-currency aggregation, other currencies rejected in this prototype |

## L3 startup and boundaries
Open prototype.html directly in Chrome/Safari; no server, install or network needed. Its inline stylesheet/script carries pinned Profile meta. A browser supporting modern dialog and BigInt is required. Use bundled .csv samples only. With JavaScript disabled this interactive artifact is NOT RUN (not a complete static application). Screenshot evidence is distinct from editable source and from actual interaction logs.

This is bounded design code, not the production iOS app. Whole app source layout, storage, identity HMAC, staging encryption, migration/backups, device lock, OS permissions, GPS, signing, real provider compatibility, native accessibility/performance and disk-fault tests remain NOT RUN. Single CNY synthetic fixtures and one fixed local account are intentionally narrower demonstrations than the typed design. Parsing is bounded but is not the production streaming adapter. Refresh resets memory. No credentials, real bills, telemetry, backend, hosting, deployment or production writes.

## Verification and review boundary
verify-interactions.cjs and verify-adversarial.cjs execute real local Chrome clicks/keyboard/file selection, assert visible outcomes, and save JSON reports. Simulation controls are separate from product controls. Actual OS/native behavior is not represented as tested. PNGs were generated from real browser rendering and visually inspected: clear labels, no clipping or horizontal page overflow in tested widths; task sheets scroll internally and keep confirmation accessible. Further opinion on professional quality belongs to a fresh Independent DESIGN Reviewer; Owner UI-Q1–5 and material profile approval are pending.

Screenshot publication boundary: PNG files are actual local rendered/inspected evidence in `/Users/leohu/Documents/Codex/2026-10-16/referenced-chatgpt-conversation-this-is-an/outputs/issue-5/ui/`. Binary upload was stopped while outcome was unknown; no PNG GitHub publication is claimed. Source/test code can regenerate them; SHA-256s are in manifest. Only textual sources/reports/manifest are in this source commit.
