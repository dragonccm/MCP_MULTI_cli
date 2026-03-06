# Epic 1: Asset Management

## Story 1.1: Add Manual Asset
**Priority**: P0 | **Story Points**: 5

### User Story
- **As a** user
- **I want** to manually add an asset (cash, e-wallet, crypto, stock, debt)
- **So that** I can track all my financial holdings in one place

### Acceptance Criteria
- [ ] Given I'm on the Assets screen, when I tap "Add Asset", then I see a form with asset type selector
- [ ] Given I've filled all required fields, when I submit, then the asset is saved and displayed in the assets list
- [ ] Edge case: Duplicate asset name → Show warning and ask for confirmation
- [ ] Edge case: Negative balance for cash/debt → Allow but highlight in red

### Technical Notes
- Asset types: CASH, E_WALLET, CRYPTO, STOCK, DEBT
- Validation: name (required), balance (required), currency (required)

---

## Story 1.2: View Asset Dashboard
**Priority**: P0 | **Story Points**: 8

### User Story
- **As a** user
- **I want** to see a summary of all my assets with total value
- **So that** I can quickly understand my financial position

### Acceptance Criteria
- [ ] Given I open the app, when I land on Home screen, then I see total net worth and asset breakdown
- [ ] Given I have multiple assets, when I view the dashboard, then assets are grouped by type
- [ ] Edge case: No assets added → Show empty state with CTA to add first asset
- [ ] Edge case: API failure for crypto/stock prices → Show cached data with "Last updated" timestamp

### Technical Notes
- Calculate net worth by summing all asset balances (convert to base currency)
- Group by asset type for visual organization

---

## Story 1.3: Edit/Delete Asset
**Priority**: P0 | **Story Points**: 3

### User Story
- **As a** user
- **I want** to edit or delete an existing asset
- **So that** I can keep my portfolio up to date

### Acceptance Criteria
- [ ] Given I view an asset detail, when I tap Edit, then I can modify all fields
- [ ] Given I want to delete an asset, when I confirm deletion, then the asset is removed
- [ ] Edge case: Asset has transaction history → Warn about data loss before deletion
- [ ] Edge case: Last asset in portfolio → Prevent deletion, suggest adding new one first

### Technical Notes
- Cascade delete: Consider what happens to related transactions
- Soft delete option for audit trail
