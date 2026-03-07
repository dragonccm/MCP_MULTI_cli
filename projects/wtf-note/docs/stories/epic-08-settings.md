# Epic 8: Settings & Data Management

## Story 8.1: Currency & Localization
- **As a** user
- **I want** to set my preferred currency and locale
- **So that** amounts display in my familiar format

**Acceptance Criteria:**
- [ ] Given user changes currency, when saved, then all amounts convert and display with correct symbol and formatting
- [ ] Given multi-currency transactions, when viewed, then show original amount and converted amount in base currency
- [ ] Edge case: Currency not supported → Allow custom currency code with manual symbol
- [ ] Edge case: Exchange rate update → Daily auto-refresh with manual refresh option

**Story Points**: 5

## Story 8.2: Data Export
- **As a** user
- **I want** to export my financial data
- **So that** I can backup or use in other applications

**Acceptance Criteria:**
- [ ] Given user requests export, when generated, then provide CSV/Excel with all transactions, assets, debts
- [ ] Given export complete, when downloaded, then file includes date range selector and category filters
- [ ] Edge case: Large dataset (>10k records) → Split into multiple files or async generation with email delivery
- [ ] Edge case: Export failure → Show retry with partial data option

**Story Points**: 5

## Story 8.3: Data Import
- **As a** user
- **I want** to import transactions from CSV/bank statements
- **So that** I can migrate data or auto-sync from bank

**Acceptance Criteria:**
- [ ] Given user uploads CSV, when parsed, then show preview with field mapping UI
- [ ] Given mapping confirmed, when imported, then transactions added with duplicate detection
- [ ] Edge case: Invalid format → Show error with sample template download
- [ ] Edge case: Partial import failure → Show skipped rows with error reasons

**Story Points**: 8

## Story 8.4: Backup & Sync
- **As a** user
- **I want** my data backed up to cloud
- **So that** I don't lose data if I change devices

**Acceptance Criteria:**
- [ ] Given user enables cloud sync, when activated, then auto-backup on every change with conflict resolution
- [ ] Given device change, when user logs in on new device, then restore all data with progress indicator
- [ ] Edge case: Sync conflict → Show "Local vs Cloud" diff with merge option
- [ ] Edge case: Offline changes → Queue and sync when reconnected with conflict detection

**Story Points**: 8
