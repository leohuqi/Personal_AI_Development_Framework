# ADR-001 — Modular monolith for personal expense recording

**State: PROPOSED. Not Owner-approved.**

## Context
The APP imports user-exported WeChat/Alipay personal spending records, manual expenses, merchant-based suggestions and location provenance. Scope is one small application with modest volume and sensitive data, not a payment service provider.

## Decision proposed
Vue SPA + FastAPI modular monolith + PostgreSQL. Domain/application/adapter/storage layering. No broker or microservice per parser. Use locally processed export files and an authenticated server principal, never online payment credentials.

## Rationale
One deployable service and relational transaction boundary reduces complexity and makes duplicates, user-scoped writes and financial totals easier to reason about. Typed provider adapters let future sources be added without changing core expense domain.

## Alternatives and consequences
- Microservices: unnecessary operational cost, distributed transactions and credential boundaries.
- Browser-only local store: attractive for privacy but complicated cross-device multi-user persistence/backup; can be considered as separate profile.
- Django: viable alternate if auth/admin ecosystem outweighs light API needs.
- OCR and live personal payment integrations are deferred; no guaranteed consumer API.

## Conditions before approval
Agree auth/tenant model, production-grade SQL schema isolation, file retention/security, version pins and browser/data privacy controls. ADR remains a proposal until Owner approves.
