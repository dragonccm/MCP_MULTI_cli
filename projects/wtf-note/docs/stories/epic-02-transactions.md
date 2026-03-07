# Epic 2: Income & Expense Management (Core)

## Story 2.1: Add Transaction (Manual Entry)
- **As a** user
- **I want** to quickly add income or expense transactions
- **So that** I can track my daily cash flow accurately

**Acceptance Criteria:**
- [ ] Given user taps "+" button, when form opens, then show amount, type (income/expense), category, date, note fields
- [ ] Given valid transaction data, when user submits, then transaction is saved and reflected in dashboard balance
- [ ] Edge case: Offline mode → Save locally and sync when online
- [ ] Edge case: Duplicate entry detection → Show warning if similar transaction exists within 1 hour

**Story Points**: 8

## Story 2.2: View Transaction History
- **As a** user
- **I want** to browse all my transactions with filters
- **So that** I can review my spending patterns

**Acceptance Criteria:**
- [ ] Given user opens history, when page loads, then display transactions sorted by date (newest first)
- [ ] Given user applies filters (date range, category, type), when applied, then list updates accordingly
- [ ] Edge case: Empty state → Show "No transactions yet" with CTA to add first transaction
- [ ] Edge case: Large dataset (>1000 transactions) → Implement infinite scroll with pagination

**Story Points**: 5

## Story 2.3: Edit/Delete Transaction
- **As a** user
- **I want** to modify or remove existing transactions
- **So that** I can correct mistakes or update records

**Acceptance Criteria:**
- [ ] Given user long-presses a transaction, when edit option selected, then pre-filled form opens with current data
- [ ] Given user confirms delete, when action completed, then transaction removed and balances recalculated
- [ ] Edge case: Transaction already synced → Show "This will affect your reports" confirmation
- [ ] Edge case: Bulk delete → Allow multi-select with confirmation dialog

**Story Points**: 3

## Story 2.4: Category Management
- **As a** user
- **I want** to create and customize spending categories
- **So that** I can organize transactions according to my needs

**Acceptance Criteria:**
- [ ] Given user opens category settings, when viewed, then display default categories (Food, Transport, Shopping, etc.)
- [ ] Given user creates custom category, when saved, then category appears in transaction form dropdown
- [ ] Edge case: Duplicate category name → Show error "Category already exists"
- [ ] Edge case: Deleting category with existing transactions → Show reassign option

**Story Points**: 5
