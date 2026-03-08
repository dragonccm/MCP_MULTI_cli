# Personal Expense Manager (PEM) - Demo Dashboard v2

Personal Expense Manager (PEM) is a comprehensive solution for managing your personal finances, consisting of a robust backend and a feature-rich mobile app.

## Project Structure

- `pem-backend/`: Node.js Express server with TypeScript and Prisma.
- `pem-mobile/`: React Native Expo mobile app with TypeScript and Zustand.

## Features

- **Authentication**: JWT-based secure login and registration.
- **Dashboard**: High-level overview of incomes and expenses.
- **Transactions**: Full CRUD for tracking transactions with categories.
- **Categories**: Personalized categories for expenses and incomes.

## Getting Started

### Backend
1. Go to `pem-backend/`.
2. Install dependencies: `npm install`.
3. Set up environment: Copy `.env.example` to `.env`.
4. Run migrations: `npx prisma migrate dev`.
5. Start development: `npm run dev`.

### Mobile
1. Go to `pem-mobile/`.
2. Install dependencies: `npm install`.
3. Start Expo: `npx expo start`.

## Build Status

- **Backend**: `tsc` build passed.
- **Mobile**: Lint and TypeScript checks passed.

## Release Info
- Version: **1.2.1**
- Release Date: **2026-03-08**
- Status: **APPROVED**
