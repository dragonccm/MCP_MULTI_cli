# Personal Expense Manager (PEM) - Demo Dashboard V2

A comprehensive full-stack application for managing personal expenses, featuring a modern dashboard and robust backend.

## Features

- **Authentication**: Secure JWT-based login and registration.
- **Dashboard**: Real-time financial summary (Income, Expense, Net Balance) and category-based spending visualization.
- **Transactions**: Full CRUD management of transactions with filtering by date.
- **Categories**: Personalized category management.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, TanStack Query, Zustand, Recharts.
- **Backend**: Node.js, Express, Prisma 7, Zod, JWT.
- **Database**: PostgreSQL.

## Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL

### Installation

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```

2. Configure environment variables:
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   JWT_SECRET="your_secret_key"
   PORT=3001
   ```

3. Initialize Database:
   ```bash
   npx prisma generate
   # For first-time setup
   npx prisma db push
   ```

4. Build and Start:
   ```bash
   npm run build
   npm run start
   ```

## Development

Run the backend in development mode:
```bash
npm run dev
```

Run the frontend in development mode:
```bash
cd frontend
npm run dev
```

## Release Info

- Version: 1.2.0
- Date: 2026-03-08
- Status: APPROVED
