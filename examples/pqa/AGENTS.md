# PQA adoption rules

These project-specific rules apply only to this PQA example and to a separately authorized PQA adoption. Load the consuming project's current AGENTS.md and approved requirements before applying the checks.

## Domain-specific review
- For affected financial calculations, check money precision, currency/rounding rules and position invariants against the approved Feature Spec.
- For affected market-data or strategy workflows, check raw market data/provider lineage, timestamps, versioning and immutable audit history against the project's data contracts.
- Use the project's documented test commands and real datastore requirements; generic PADF Skills do not prescribe PQA-only commands.

## Repository boundary
Do not modify, close or merge Personal Quant Analyst Draft PR #7 as a side effect of PADF maintenance. PQA adoption or changes to that PR require separate explicit Owner direction. See [adoption guidance](ADOPTION.md).
