# Epic 1: Transaction Management

## Story 1.1: Create Transaction
- **As a** user
- **I want** to add new transactions (income, expense, debt, receivable, asset)
- **So that** I can track my financial activities

**Acceptance Criteria:**
- [ ] Given I'm on the transaction screen, when I tap "Add Transaction" and fill in required fields (type, amount, date, category), then the transaction is saved successfully
- [ ] Given I'm adding a transaction, when I select a type (income/expense/debt/receivable/asset), then relevant fields are shown/hidden accordingly
- [ ] Edge case: No internet connection → Transaction is saved locally and synced when online
- [ ] Edge case: Invalid amount (negative or zero) → Show validation error before saving

**Story Points**: 5

## Story 1.2: View Transaction List
- **As a** user
- **I want** to view all my transactions in a list with filters
- **So that** I can review my financial history

**Acceptance Criteria:**
- [ ] Given I'm on the home screen, when I scroll through transactions, then I see them sorted by date (newest first)
- [ ] Given I have many transactions, when I apply filters (date range, type, category), then only matching transactions are displayed
- [ ] Edge case: No transactions exist → Show empty state with "Add first transaction" CTA
- [ ] Edge case: Large dataset (>1000 transactions) → Implement pagination/infinite scroll

**Story Points**: 3

## Story 1.3: Edit/Delete Transaction
- **As a** user
- **I want** to edit or delete existing transactions
- **So that** I can correct mistakes or remove entries

**Acceptance Criteria:**
- [ ] Given I'm viewing a transaction, when I tap "Edit", then I can modify all fields and save changes
- [ ] Given I'm viewing a transaction, when I tap "Delete" and confirm, then the transaction is removed
- [ ] Edge case: Transaction was synced to server → Update/delete propagates to backend
- [ ] Edge case: User cancels edit → Changes are discarded, original data preserved

**Story Points**: 3
