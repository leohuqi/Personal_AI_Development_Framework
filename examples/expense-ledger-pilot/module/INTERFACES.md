# Module Interfaces — draft Python type & API contracts

System proposal: `examples/expense-ledger-pilot/system/SOLUTION-ARCHITECTURE.md@5a907d75973296239e5e5c81d91548f3f945897d`. These interfaces are **design pseudocode**, not executable implementation.

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Protocol, Literal

Provider = Literal["WECHAT", "ALIPAY", "MANUAL"]
Direction = Literal["EXPENSE", "REFUND", "INCOME", "TRANSFER"]

@dataclass(frozen=True)
class Money:
    amount_minor: int                 # integer minor units, amount > 0
    currency: str                     # ISO-4217 code

@dataclass(frozen=True)
class ExpenseDraft:
    source: Provider
    source_txn_id: str | None
    occurred_at: datetime             # offset-aware, time precision preserved
    original_time: str
    money: Money
    direction: Direction
    merchant_raw: str
    bill_location: str | None
    row_provenance: str                # batch/row evidence handle, not secret

@dataclass(frozen=True)
class CategorySuggestion:
    category_id: str | None
    reason: str
    confidence: float                 # advisory only
    rule_id: str | None

class BillParser(Protocol):
    def supports(self, filename: str, header: bytes) -> bool: ...
    def parse(self, file_bytes: bytes) -> tuple[list[ExpenseDraft], list[str]]: ...

class CategoryPolicy(Protocol):
    def suggest(self, user_id: str, merchant_id: str | None, draft: ExpenseDraft) -> CategorySuggestion: ...

class ExpenseRepository(Protocol):
    def confirm_idempotently(self, *, user_id: str, draft: ExpenseDraft,
                             final_category_id: str, manual_place: str | None,
                             remember_merchant: bool) -> str: ...
```

## REST contracts (proposed)
- `POST /api/v1/imports/preview`: multipart export file + explicitly declared source; 200 preview rows/draft token with row-level errors, 400 unsupported type/encoding, 413 max-size, 401/403 auth, 422 invalid contents. Does NOT permanently add financial expenses.
- `POST /api/v1/expenses/confirm`: draft token **or manual payload**, category ID and optional merchant rule, optional location/user edits; 201 newly saved, 200 duplicate confirmed with existing record ID (or explicitly documented 409 ambiguous source conflict), 401/403/422 invalid tenant/category/amount. Server derives user_id.
- `GET /api/v1/categories`: tenant-scoped dropdown options; never expose other users' records.

Refer to [expense-api.yaml](expense-api.yaml) for example payload shape. Exact response semantics and product auth flow need independent design review and Owner baseline approval.
