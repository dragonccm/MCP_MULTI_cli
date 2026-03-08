# Changelog

All notable changes to this project will be documented in this file.

## [1.2.2] - 2026-03-08

### Changed
- Finalizing release workflow and documentation.
- Updated `package.json` versions to 1.2.2.
- Updated `README.md` and `docs/release-report.md`.

## [1.2.1] - 2026-03-08

### Added
#### Backend (pem-backend)
- Express server with TypeScript.
- Prisma ORM integrated with Neon PostgreSQL.
- JWT-based Authentication.
- API endpoints for Transactions (CRUD).
- API endpoints for Categories (CRUD).
- Repository-Service-Controller architecture.

#### Mobile (pem-mobile)
- React Native Expo project with TypeScript.
- Navigation setup (React Navigation).
- Login screen with authentication logic.
- Dashboard screen for overview of transactions.
- Add Transaction screen with income/expense toggle.
- State management with Zustand.

### Build & Status
- Backend build: ✅ PASS
- Mobile lint check: ✅ PASS
