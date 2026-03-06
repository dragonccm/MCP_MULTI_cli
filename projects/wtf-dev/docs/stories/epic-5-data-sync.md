# Epic 5: Data & Sync

## Story 5.1: Local Data Persistence
**Priority**: P1 | **Story Points**: 8

### User Story
- **As a** user
- **I want** my data saved locally on my device
- **So that** I can use the app offline

### Acceptance Criteria
- [ ] Given I add/edit data, when I close the app, then my changes persist when I reopen
- [ ] Given I'm offline, when I use the app, then all features work with local data
- [ ] Edge case: Storage limit reached → Warn user and offer cleanup suggestions
- [ ] Edge case: App crash during write → Implement transaction rollback to prevent corruption

### Technical Notes
- SQLite via expo-sqlite or WatermelonDB for offline-first architecture
- ACID compliance for financial transactions
- Storage monitoring and cleanup utilities

---

## Story 5.2: Cloud Backup & Sync
**Priority**: P1 | **Story Points**: 13

### User Story
- **As a** user
- **I want** my data backed up to the cloud
- **So that** I don't lose it if I change devices

### Acceptance Criteria
- [ ] Given I create an account, when I log in on a new device, then all my data syncs automatically
- [ ] Given I make changes offline, when I go online, then changes sync to cloud in background
- [ ] Edge case: Conflict (same record edited on 2 devices) → Use last-write-wins with user notification
- [ ] Edge case: Sync failure → Retry with exponential backoff, notify after 3 failures

### Technical Notes
- JWT authentication for API calls
- Sync queue for offline changes
- Conflict resolution strategy: last-write-wins with audit log
- Background sync with expo-background-fetch
