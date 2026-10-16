# Framework verification at pilot start
Observed 2026-10-16T05:56:06Z. Candidate baseline: f1b6a6e4a90d547127bd95bceaa12880a7c39855.
74 baseline text files were retrieved through the GitHub connector at that exact SHA into a local working snapshot. Local Git clone was unavailable due to the host proxy connection; these results are source-snapshot tests, not proof of a successful Git checkout. The connector remains the authoritative repository transport.

All commands below actually ran with exit 0:
| Check | Result |
| --- | --- |
| node scripts/validate-cacf.mjs | PASS, 44 framework files and local links |
| node tests/v0.3/run-tests.mjs | PASS, 39 routing/dependency/gate fixtures |
| node tests/v0.3/run-orchestration-tests.mjs | PASS, 19 synthetic provenance fixtures |
| node tests/v0.3/run-skill-quality-tests.mjs | PASS, 14 synthetic Owner sheet fixtures |
| node tests/v0.3/verify-expense-pilot.mjs | PASS, historical Issue 4 negative control correctly has BLOCKED Gate |
| node tests/cacf/run-validation.mjs | PASS, 7 cross-process protocol fixtures |
| node tests/cacf/run-regressions.mjs | PASS, 8 regressions |

GitHub Actions independently completed SUCCESS for actual initial evidence commit ccf9c79610e71e19fea2924a6c51eb07dee98f03:
- [CACF](https://github.com/leohuqi/Personal_AI_Development_Framework/actions/runs/38858341893)
- [Specialist design validation](https://github.com/leohuqi/Personal_AI_Development_Framework/actions/runs/38858341915)

87 fixture cases passing plus structural validation do not certify separate specialist execution, professional design quality, external diagram tool execution, L3 interaction behavior, Owner approval or overall Issue 5 PASS. Later artifact revisions require their own checks and exact-head CI observation. Master will separately retrieve real specialist Handoffs, verify sources and reconcile dependencies.
