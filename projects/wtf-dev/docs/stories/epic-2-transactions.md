# Epic 2: Transaction Tracking

## Story 2.1: Add Transaction
**Priority**: P0 | **Story Points**: 5

### User Story
- **As a** user
- **I want** to record income and expense transactions
- **So that** I can track my spending patterns

### Acceptance Criteria
- [ ] Given I'm on Home screen, when I tap "+" button, then I can quickly add a transaction with amount, category, and asset
- [ ] Given I've entered transaction details, when I save, then the transaction is recorded and asset balance is updated
- [ ] Edge case: Transaction amount > asset balance → Show warning for cash/e-wallet, allow for crypto/stock
- [ ] Edge case: Offline mode → Save locally and sync when online

### Technical Notes
- Transaction types: INCOME, EXPENSE
- Update asset balance atomically with transaction creation

---

## Story 2.2: Categorize Transactions
**Priority**: P0 | **Story Points**: 8

### User Story
- **As a** user
- **I want** to assign categories to transactions
- **So that** I can analyze my spending by category

### Acceptance Criteria
- [ ] Given I'm adding a transaction, when I select a category, then it's saved with the transaction
- [ ] Given I have recurring merchants, when I add similar transactions, then AI suggests the last used category
- [ ] Edge case: No matching category → Allow creating custom category on the fly
- [ ] Edge case: AI suggestion wrong → Allow manual override and learn from correction

### Technical Notes
- System categories: Food, Transport, Shopping, Entertainment, Bills, Salary, Investment, etc.
- AI learning: Store user corrections for future suggestions

---

## Story 2.3: View Transaction History
**Priority**: P0 | **Story Points**: 5

### User Story
- **As a** user
- **I want** to browse and search my transaction history
- **So that** I can review past spending

### Acceptance Criteria
- [ ] Given I'm on Transactions screen, when I scroll, then I see transactions grouped by date
- [ ] Given I want to find a specific transaction, when I search by keyword, then matching transactions are filtered
- [ ] Edge case: Large history (>1000 transactions) → Implement pagination with infinite scroll
- [ ] Edge case: No search results → Show helpful message with tips

### Technical Notes
- Date grouping: Today, Yesterday, This Week, Last Week, This Month, Older
- Search: description, amount, category name
