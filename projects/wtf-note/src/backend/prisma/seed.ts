import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.syncLog.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'demo@wtfnote.com',
      password: hashedPassword,
      name: 'Demo User',
      currency: 'VND',
      isVerified: true,
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { userId: user.id, name: 'Salary', type: 'income', icon: '💰', color: '#22c55e' } }),
    prisma.category.create({ data: { userId: user.id, name: 'Freelance', type: 'income', icon: '💻', color: '#3b82f6' } }),
    prisma.category.create({ data: { userId: user.id, name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ef4444' } }),
    prisma.category.create({ data: { userId: user.id, name: 'Transportation', type: 'expense', icon: '🚗', color: '#f97316' } }),
    prisma.category.create({ data: { userId: user.id, name: 'Shopping', type: 'expense', icon: '🛒', color: '#a855f7' } }),
    prisma.category.create({ data: { userId: user.id, name: 'Entertainment', type: 'expense', icon: '🎬', color: '#ec4899' } }),
    prisma.category.create({ data: { userId: user.id, name: 'Bills & Utilities', type: 'expense', icon: '📱', color: '#6366f1' } }),
    prisma.category.create({ data: { userId: user.id, name: 'Healthcare', type: 'expense', icon: '🏥', color: '#14b8a6' } }),
  ]);

  // Create transactions
  const now = new Date();
  const transactions = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Income transactions (twice a month)
    if (i % 15 === 0) {
      transactions.push(
        prisma.transaction.create({
          data: {
            userId: user.id,
            categoryId: categories[0].id,
            type: 'income',
            amount: 25000000,
            currency: 'VND',
            description: 'Monthly salary',
            date,
            status: 'completed',
          },
        })
      );
    }

    // Expense transactions (daily)
    const expenseCategory = categories[2 + (i % 6)];
    const amounts = [50000, 120000, 85000, 200000, 150000, 300000, 75000, 180000];
    transactions.push(
      prisma.transaction.create({
        data: {
          userId: user.id,
          categoryId: expenseCategory.id,
          type: 'expense',
          amount: amounts[i % amounts.length],
          currency: 'VND',
          description: `${expenseCategory.name} expense`,
          date,
          status: 'completed',
        },
      })
    );
  }

  // Debt transaction
  transactions.push(
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'debt',
        amount: 5000000,
        currency: 'VND',
        description: 'Borrowed from Minh',
        date: new Date(),
        status: 'pending',
        note: 'Pay back by end of month',
      },
    })
  );

  // Receivable transaction
  transactions.push(
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'receivable',
        amount: 2000000,
        currency: 'VND',
        description: 'Lent to Hoa',
        date: new Date(),
        status: 'pending',
      },
    })
  );

  await Promise.all(transactions);

  // Create budgets
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  await Promise.all([
    prisma.budget.create({ data: { userId: user.id, categoryId: categories[2].id, amount: 3000000, month: currentMonth, year: currentYear } }),
    prisma.budget.create({ data: { userId: user.id, categoryId: categories[3].id, amount: 1500000, month: currentMonth, year: currentYear } }),
    prisma.budget.create({ data: { userId: user.id, categoryId: categories[4].id, amount: 2000000, month: currentMonth, year: currentYear } }),
    prisma.budget.create({ data: { userId: user.id, categoryId: categories[5].id, amount: 1000000, month: currentMonth, year: currentYear } }),
    prisma.budget.create({ data: { userId: user.id, categoryId: categories[6].id, amount: 2500000, month: currentMonth, year: currentYear } }),
  ]);

  // Create portfolio with assets
  const portfolio = await prisma.portfolio.create({
    data: {
      userId: user.id,
      name: 'My Investment Portfolio',
    },
  });

  await Promise.all([
    prisma.asset.create({
      data: {
        portfolioId: portfolio.id,
        symbol: 'VNM',
        name: 'Vinamilk',
        type: 'stock',
        quantity: 100,
        purchasePrice: 75000,
        purchaseDate: new Date('2025-01-15'),
        currentPrice: 78000,
        lastUpdated: new Date(),
        currency: 'VND',
      },
    }),
    prisma.asset.create({
      data: {
        portfolioId: portfolio.id,
        symbol: 'FPT',
        name: 'FPT Corporation',
        type: 'stock',
        quantity: 50,
        purchasePrice: 120000,
        purchaseDate: new Date('2025-02-10'),
        currentPrice: 135000,
        lastUpdated: new Date(),
        currency: 'VND',
      },
    }),
    prisma.asset.create({
      data: {
        portfolioId: portfolio.id,
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        quantity: 0.05,
        purchasePrice: 60000,
        purchaseDate: new Date('2025-03-01'),
        currentPrice: 65000,
        lastUpdated: new Date(),
        currency: 'USD',
      },
    }),
  ]);

  // Create sample news
  await Promise.all([
    prisma.newsArticle.create({
      data: {
        title: 'Vietnam Stock Market Reaches New Highs',
        summary: 'VN-Index surpassed 1,300 points driven by strong earnings from tech and banking sectors.',
        url: 'https://example.com/news/1',
        source: 'VN Finance',
        publishedAt: new Date(),
        symbols: 'VNM,FPT',
      },
    }),
    prisma.newsArticle.create({
      data: {
        title: 'Bitcoin Reaches $65,000 Amid Institutional Interest',
        summary: 'Cryptocurrency markets surge as more institutions adopt digital assets.',
        url: 'https://example.com/news/2',
        source: 'Crypto Daily',
        publishedAt: new Date(),
        symbols: 'BTC',
      },
    }),
  ]);

  // eslint-disable-next-line no-console
  console.log('Seed data created successfully!');
  console.log('  Demo user: demo@wtfnote.com / password123');
  console.log(`  ${categories.length} categories`);
  console.log('  30+ transactions');
  console.log('  5 budgets');
  console.log('  1 portfolio with 3 assets');
  console.log('  2 news articles');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
