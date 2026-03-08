# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-03-08

### Added
- Complete Personal Expense Manager (PEM) dashboard and backend.
- Authentication system (Register/Login) with JWT.
- Transaction management (CRUD) with categories.
- Dashboard statistics and visualization using Recharts.
- Responsive UI built with React, Vite, and Tailwind CSS.
- Prisma ORM integration with PostgreSQL (Prisma 7).

### Improved
- Build process: Integrated `npx prisma generate` into the build script.
- Type safety: Removed `any` in backend routes and middleware.
- UI: Improved mobile responsiveness with hamburger menu.

### Fixed
- Frontend and backend port inconsistencies.
- CORS configuration for frontend-backend communication.
- Statistical data processing optimizations.

### Security
- Password hashing using bcrypt.
- Protected routes using JWT middleware.
