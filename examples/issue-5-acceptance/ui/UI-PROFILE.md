# 随手账 · Project UI Profile v1
schema_version: padf.ui-profile/v1
project_id: EXPENSE-LEDGER
status: PROPOSED
responsible_designer: UI Designer /root/ui_designer
owner_approval_ref: null
profile_path: examples/issue-5-acceptance/ui/UI-PROFILE.md
source_feature: GitHub Issue 5 / EXPENSE-ACCEPTANCE-005
source_system: SYSTEM-BASELINE.md@f4dbf0d3fac707db1b57252c529618c38d26f0bc (Owner approved by OWNER-SYSTEM-APPROVAL.md@05ba2117e2fbb5ac924913accb76b763a2fc268c)
source_module: module@ad5a536bf2f6636d53ba51452cc555d54b82456b
creation_scope: MASTER-MODULE-RECONCILIATION.md@b1452c10d3d6f42d8828ac36aabffbf8cd1215fe

No existing app/screens/components/Figma were available. These are authored proposals for a single-user iPhone-first private ledger, not observed or approved values. Default diagram styling is not an app UI approval. Material visual baseline and Owner UI-Q1–5 scores remain pending.

## Philosophy
Make a small personal ledger calm, legible and truthful. Amount and merchant are primary; the user's category choice is final. Show a clear cost before confirmation. Historical place and present observation have distinct labels. A potentially duplicate or unresolved refund needs a deliberate decision. Never silently discard an invalid source row. Use Chinese as the product language and tabular Arabic numerals for money. Avoid decorative charts, scores, gamification and technical audit jargon in the ledger.

## Tokens (canonical source tokens.css, v1, same commit as this file)
Colors: paper #f3f4f6, surface #ffffff, ink #17201c, secondary #5b665f, border #d8ded9, action #176344, actionTint #e8f3ec, success #176344, warning #86520b / #fff3dc, destructive #b12b36 / #fff0f1, focus #215fa6. Positive spend uses ink with minus sign in ledger; refund uses green plus sign and explicit 退款. Never rely on color alone.
Typography: system -apple-system/BlinkMacSystemFont, PingFang SC, sans-serif. Body 16px/1.55; support 14px/1.5; labels 14px medium; screen title 30px/1.2 bold; money 40px/1.2 semibold/tabular. Min product text 14px; no text inside raster graphics.
Spacing 4,8,12,16,20,24,32,40px. Page gutter 20px; mobile group gap 20px. Radius 12px controls/16px groups/24px sheets; border 1px. Shadow reserved for dialog 0 16px 60px #17201c22. Icons are simple Unicode/text marks with accessible labels; no icon-only essential actions. Light scheme only in v1; declare color-scheme light for predictable controls. Dark mode is deferred, not a fabricated baseline.

## Component catalog v1 (editable prototype.html + tokens.css)
- PageHeader: ledger title + month; primary new-entry action, secondary import. Natural reading order.
- LedgerSummary: one CNY net amount; unresolved refund separate, excluded from net. No mixed-currency total.
- GroupedList/EntryRow: merchant + date/category/place label; signed amount; touch >=44px. Empty state offers a first entry.
- Button: primary/secondary/danger/text; min-height 44px; disabled visually and semantically; visible :focus-visible 3px ring. Loading label replaces normal text and blocks repeat submission.
- Field: persistent label above input/select; error text associated with aria-describedby; text remains on failure. Native select supports category keyboard arrows. Amount decimal input, exact checked minor units.
- CategorySuggestion: explicit reason and apply action; automatic suggestion only until user selects a category; merchant changes never replace a user selection.
- LocationGroup: historical text editable; current sample requires explicit purpose dialog; deny/unavailable/reduced are independent outcomes; no GPS API called by this prototype.
- ImportReviewRow: immutable source economics, merchant/category/historical-place correction controls; include/exclude/review; duplicate decision; refund link or explicit unresolved retention. Warning words and state labels accompany color.
- Feedback: role=status for progression/success; role=alert for actionable validation/failure. Retry requires revalidation, never partial optimistic import writes.
- Dialog: native modal dialog, labelled heading, initial focus to first actionable field, Escape/cancel, focus returned to trigger. Mobile bottom sheet/full width, desktop centered width <=620px, internal scrolling.
- DemoPanel: separate disclosure outside normal ledger; simulation controls and file-profile boundary. Not production controls.

## Layout and navigation
Single ledger root with two focused task sheets: new entry and import/review. No dashboard sidebar or unrelated navigation. 320–599px: one column, safe-area gutter, actions wrap, sheet max 92dvh with internal scroll. 600–899px: centered ledger <=720px. >=900px: ledger <=1040px, summary beside entries, same reading order and actions. Review uses cards, not a wide table. Text wraps; no horizontal page overflow. At 200% text zoom keep natural reflow and scroll. Dense review is opt-in via task sheet, never compact touch targets.

## Interaction and accessibility
Target WCAG 2.2 AA: normal text contrast >=4.5:1, visible focus, native controls, logical DOM/keyboard order, labels and live feedback; 44px primary touch targets. Reduced-motion preference disables transitions. Success closes task sheet only after simulated atomic save receipt. Cancel before commit leaves ledger unchanged; while committing wait for result. Locked/full failure keeps draft/review, retry revalidates. Empty, unsupported, invalid, denied, unavailable, success and loading states are required.
Prototype is local synthetic in-memory design evidence. Reload resets all entries. No telemetry, real bills, GPS, server or installed application. Native VoiceOver/Dynamic Type, OS sheets, actual Core Data and device performance remain NOT RUN.

## Alternatives and exceptions
Selected: restrained system-like green-accent grouped ledger, because repeated amount entry and careful review need familiarity. Rejected for this scope: chart-heavy dashboard (weakens entry focus); chat-first capture (hides explicit financial review). HTML demonstrates native-intended flow; OS controls/blur/navigation bars need later SwiftUI mapping. No exceptions approved. No unsolicited profile expansion beyond ledger/import/manual tasks.
