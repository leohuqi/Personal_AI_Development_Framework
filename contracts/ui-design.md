# UI/UX Design Package — PADF V0.3

Schema: `padf.ui-design/v1`. Owner of content: UI/UX Designer. Master routes; independent Reviewer audits required high-risk work.

## Identity / baseline
`context_id`, Linear issue, immutable Feature ID(s), feature spec@approved SHA, project UI Profile@approved SHA, affected components, Designer, approval/status, prototype level L1/L2/L3 and reason.

## Levels and evidence
- **L1 Concept:** design philosophy **for this feature**, user journey, IA/navigation, annotated conceptual wireframe/visual, alternatives and constraints; for small fixes existing annotated UI/description with N/A justification may suffice.
- **L2 High-fidelity:** L1 plus design source reference (editable Figma components or versioned front-end design file), screens for selected desktop/mobile viewports, component variants, tokens and responsive rules; annotated error/empty/loading/success/permission/disabled states; acceptance trace.
- **L3 Interactive:** L2 plus an **actually working** prototype (clickable supported tool or runnable HTML/application), documented entry URL/file and startup, supported interactions, realistic synthetic test content, tested navigation/state transitions. Static screenshot/diagram cannot substitute for L3.

## UI consistency matrix (mandatory for UI changes)
`screen/interaction | component/design token ref | existing pattern | variation (if any) | reason/approval | breakpoint | a11y | test evidence`.
Check profile revision and core design tokens, nav structure, component API/variants, table/chart semantics, keyboard focus, contrast, no horizontal overflow, loading/empty/error/perms and interactions.

## Architecture alignment
For each UI data interaction cite approved API/schema/contract revision, event timing, states and errors. Unsupported API/UI assumptions -> CLARIFICATION_REQUEST to Architect; material product/contract changes -> Master/Owner, not silent UX redefinition.

## Artifact evidence
`artifact_id | concept/high-fi/interactive | location | source revision | screenshot/video/build ref | actual test status PASS/FAIL/BLOCKED/NOT RUN | limitations`.
A mock visual is not proof of implemented behavior, a Figma prototype is not production, and rendered image is not an editable design source. Missing tool/asset -> NOT RUN/BLOCKED.

UI Designer submits [Agent Handoff](agent-handoff.md); Master checks the Design Gate, Reviewer independently examines selected design outcomes.
