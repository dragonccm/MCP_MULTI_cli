# Epic 3: Debt Management

## Story 3.1: Create Debt Record
- **As a** user
- **I want** to record money I owe or am owed
- **So that** I can track personal debts and repayments

**Acceptance Criteria:**
- [ ] Given user adds new debt, when form submitted, then record includes creditor/debtor name, amount, due date, type (owed/owing)
- [ ] Given debt created, when viewed in debt list, then show remaining balance and due date status (overdue/upcoming/paid)
- [ ] Edge case: Partial payment → Allow recording payment with updated remaining balance
- [ ] Edge case: Recurring debt → Support optional recurring schedule (monthly, weekly)

**Story Points**: 8

## Story 3.2: Debt Repayment Tracking
- **As a** user
- **I want** to log payments against my debts
- **So that** I can see progress toward clearing debts

**Acceptance Criteria:**
- [ ] Given user records a payment, when submitted, then debt balance decreases and payment history updated
- [ ] Given debt fully paid, when payment completes, then debt status changes to "Paid" with completion date
- [ ] Edge case: Overpayment → Show warning and ask if creating credit or refund
- [ ] Edge case: Payment reminder → Push notification 3 days before due date

**Story Points**: 5

## Story 3.3: Debt Overview Dashboard
- **As a** user
- **I want** to see summary of all my debts
- **So that** I understand my total liabilities and receivables

**Acceptance Criteria:**
- [ ] Given user opens debt dashboard, when loaded, then show total owed, total owing, net debt, overdue count
- [ ] Given debts exist, when viewed, then display list grouped by type with color coding (red=owed, green=owing)
- [ ] Edge case: No debts → Show empty state with "Add your first debt" CTA
- [ ] Edge case: Currency mismatch → Show converted amounts in user's base currency

**Story Points**: 5
