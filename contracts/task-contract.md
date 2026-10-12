# Task Contract — Template

> Copy the relevant fields into the Linear issue or the explicit Codex task. Do not fill with invented approvals or test results.

## Identity and authorization
- Project/repository:
- Linear issue URL and identifier:
- Original immutable Feature ID(s):
- Module / Cycle:
- Task class (S bug / M feature / L cross-module / XL product):
- Owner approval reference and scope:
- Authorized environment: prototype / local / isolated CI
- Base branch/commit or approved release:

## Objective
- User-visible outcome:
- In scope:
- Out of scope:
- Business rules / invariants:

## Source documents — load only relevant parts
- Approved Feature Spec (file + section/commit):
- UI prototype / design baseline if applicable:
- API/database/architecture contract sections if applicable:
- Dependencies, with Feature ID and linked Linear blocking issue:
- Resolved blockers:
- Open questions requiring clarification:

## Acceptance criteria
| AC-ID | Behavior / observable result | Test type / expected evidence |
| --- | --- | --- |
| AC-1 | [specific observable behavior] | [pytest/API/PG/E2E/manual] |

Include success, invalid, empty/loading/error, authorization and regression cases when applicable.

## Implementation constraints
- Files/modules expected to be affected (indicative, not permission to broaden):
- Data source and fixture/real-data boundary:
- Migration/version/compatibility constraints:
- Performance/security/reliability constraints:
- Approval required for scope, architecture or environment changes:

## Execution and handoff
- Requested skill(s):
- Required tests / CI workflow:
- Independent review requirement:
- PR title: [Linear-ID] [Feature-ID] concise scope
- Required result: Delivery Report, PR URL, commit/head SHA, test/QA/review evidence.
- Forbidden without separate owner approval: production deployment, destructive migration, credential changes, deleting live data, declaring owner acceptance.
