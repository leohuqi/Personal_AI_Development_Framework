# PADF V0.3 — Specialist Agent & Design Gate Validation

## Automated checks (declarative, not a running agent platform)

```bash
node scripts/validate-cacf.mjs
node --check lib/design-gate.mjs
node --check tests/v0.3/run-tests.mjs
node tests/v0.3/run-tests.mjs
```

25 deterministic fixture tests exercise routing, mandatory L/XL design review, S/M risk escalation, stage graph validity, blocked/STALE dependencies, immutable artifact references, project UI Profile version match, structured Architecture+diagram alignment, database source+diagram, L3 interactive prototype, handoff review versions, Owner approval and coding authorization separation. Test numbers are determined from the actual suite. **No external diagram-design execution or UI generation is implied.**

## Manual independent specialist-agent pilot — NOT RUN until separately executed

Use an isolated **non-PQA** sample Feature and approved sandbox with a stable issue, immutable Feature ID and sample data; no production data.
1. Master classifies L/XL or S/M scope/risks and builds minimal Stage Dependency manifest; record excluded/included roles and why.
2. Architect resolves the locked external diagram-design dependency in its runtime, obtains applicable project style profile, produces exact architecture/schema/workflow **structured sources and matching HTML/SVG**; inspect rendering and schema/edge accuracy.
3. UI Designer reads independent project UI Profile, produces concept, high fidelity or working interactive prototype by justified level, checks responsive and interaction states. Record real paths and revisions; no invented Figma assets.
4. Designers publish V0.2 Design Handoffs and actual artifact SHA; recipient ACK or NEEDS_REFINEMENT. Test an upstream revision change and expect STALE/blocked downstream.
5. In a separate fresh Reviewer session, inspect approved Feature Spec and exact artifact revisions. For L/XL independent DESIGN Review is mandatory. Test a P1 rejection and a P2 with/without Owner risk acceptance.
6. Master assesses Design Gate, verifies Owner material decisions and separately requests coding authorization. Check DESIGN_READY without coding authorization cannot trigger coding.
7. Optional separately authorized Coder/QA pilot verifies implementation conforms to approved design; this is **not** part of automated unit simulation.

Record external plugin revision, actual artifact permalinks, screenshot/browser validation, Coder authorization, risk decisions, reviewed SHA, PASS/FAIL/BLOCKED/NOT RUN and session boundary evidence. Missing external tool, project design profile or interactive prototype means BLOCKED/NOT RUN, not PASS.

## Rollout policy
V0.3 remains a Draft PR pending Owner approval and independent review. The v0.2.0 release/tag is immutable; PQA Draft PR #7 is untouched. Do not adopt V0.3 in PQA before an explicit separate authorization.
