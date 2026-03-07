import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  // Create default categories
  const categories = [
    { name: "Salary", type: "income", icon: "💰", color: "#22c55e", isDefault: true },
    { name: "Freelance", type: "income", icon: "💻", color: "#3b82f6", isDefault: true },
    { name: "Investment", type: "income", icon: "📈", color: "#8b5cf6", isDefault: true },
    { name: "Other Income", type: "income", icon: "💵", color: "#06b6d4", isDefault: true },
    { name: "Food", type: "expense", icon: "🍔", color: "#ef4444", isDefault: true },
    { name: "Transport", type: "expense", icon: "🚗", color: "#f97316", isDefault: true },
    { name: "Shopping", type: "expense", icon: "🛍️", color: "#ec4899", isDefault: true },
    { name: "Entertainment", type: "expense", icon: "🎬", color: "#a855f7", isDefault: true },
    { name: "Bills", type: "expense", icon: "📄", color: "#64748b", isDefault: true },
    { name: "Health", type: "expense", icon: "🏥", color: "#14b8a6", isDefault: true },
    { name: "Education", type: "expense", icon: "📚", color: "#6366f1", isDefault: true },
    { name: "Other Expense", type: "expense", icon: "📦", color: "#78716c", isDefault: true },
  ];

  // Clear all data in dependency order, then re-create
  await prisma.debtPayment.deleteMany();
  await prisma.aiInsight.deleteMany();
  await prisma.marketPrice.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.createMany({ data: categories });

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "test@wtfnote.com" },
    update: {},
    create: {
      email: "test@wtfnote.com",
      password: hashedPassword,
      name: "Test User",
      currency: "VND",
    },
  });

  // Get category IDs
  const allCategories = await prisma.category.findMany();
  const catMap = new Map(allCategories.map((c) => [c.name, c.id]));

  // Create sample transactions
  const now = new Date();
  const transactions = [
    { amount: 15000000, type: "income", categoryId: catMap.get("Salary")!, date: new Date(now.getFullYear(), now.getMonth(), 1), note: "Monthly salary", userId: user.id },
    { amount: 5000000, type: "income", categoryId: catMap.get("Freelance")!, date: new Date(now.getFullYear(), now.getMonth(), 5), note: "Freelance project", userId: user.id },
    { amount: 500000, type: "expense", categoryId: catMap.get("Food")!, date: new Date(now.getFullYear(), now.getMonth(), 2), note: "Groceries", userId: user.id },
    { amount: 200000, type: "expense", categoryId: catMap.get("Transport")!, date: new Date(now.getFullYear(), now.getMonth(), 3), note: "Grab rides", userId: user.id },
    { amount: 1500000, type: "expense", categoryId: catMap.get("Shopping")!, date: new Date(now.getFullYear(), now.getMonth(), 4), note: "Clothes", userId: user.id },
    { amount: 300000, type: "expense", categoryId: catMap.get("Entertainment")!, date: new Date(now.getFullYear(), now.getMonth(), 6), note: "Movie tickets", userId: user.id },
    { amount: 2000000, type: "expense", categoryId: catMap.get("Bills")!, date: new Date(now.getFullYear(), now.getMonth(), 7), note: "Electricity + water", userId: user.id },
    { amount: 800000, type: "expense", categoryId: catMap.get("Health")!, date: new Date(now.getFullYear(), now.getMonth(), 8), note: "Gym membership", userId: user.id },
    { amount: 1000000, type: "expense", categoryId: catMap.get("Education")!, date: new Date(now.getFullYear(), now.getMonth(), 9), note: "Online course", userId: user.id },
    { amount: 350000, type: "expense", categoryId: catMap.get("Food")!, date: new Date(now.getFullYear(), now.getMonth(), 10), note: "Restaurant dinner", userId: user.id },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }

  // Create sample debts
  await prisma.debt.createMany({
    data: [
      { creditorDebtor: "Nguyen Van A", amount: 5000000, remainingBalance: 3000000, type: "owed", dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15), status: "active", userId: user.id },
      { creditorDebtor: "Tran Van B", amount: 2000000, remainingBalance: 2000000, type: "owing", dueDate: new Date(now.getFullYear(), now.getMonth() + 2, 1), status: "active", userId: user.id },
      { creditorDebtor: "Le Thi C", amount: 1000000, remainingBalance: 0, type: "owed", status: "paid", userId: user.id },
    ],
  });

  // Create sample assets
  await prisma.asset.createMany({
    data: [
      { type: "stock", ticker: "AAPL", stockQuantity: 10, purchasePrice: 150, purchaseDate: new Date(2024, 0, 15), userId: user.id },
      { type: "stock", ticker: "GOOGL", stockQuantity: 5, purchasePrice: 130, purchaseDate: new Date(2024, 3, 20), userId: user.id },
      { type: "crypto", coinSymbol: "BTC", cryptoQuantity: 0.05, avgBuyPrice: 60000, walletExchange: "Binance", userId: user.id },
      { type: "crypto", coinSymbol: "ETH", cryptoQuantity: 2, avgBuyPrice: 3000, walletExchange: "Binance", userId: user.id },
      { type: "real_estate", propertyName: "Studio Apartment", address: "District 7, HCMC", realEstatePurchasePrice: 2000000000, estimatedValue: 2500000000, propertyType: "apartment", ownershipPercentage: 100, userId: user.id },
    ],
  });

  // Create sample budgets
  await prisma.budget.createMany({
    data: [
      { categoryId: catMap.get("Food")!, amount: 3000000, month: now.getMonth() + 1, year: now.getFullYear(), userId: user.id },
      { categoryId: catMap.get("Transport")!, amount: 1000000, month: now.getMonth() + 1, year: now.getFullYear(), userId: user.id },
      { categoryId: catMap.get("Shopping")!, amount: 2000000, month: now.getMonth() + 1, year: now.getFullYear(), userId: user.id },
      { categoryId: catMap.get("Entertainment")!, amount: 1000000, month: now.getMonth() + 1, year: now.getFullYear(), userId: user.id },
    ],
  });

  // Seed market prices
  await prisma.marketPrice.createMany({
    data: [
      { symbol: "AAPL", type: "stock", price: 178.5, change24h: 1.2 },
      { symbol: "GOOGL", type: "stock", price: 141.2, change24h: -0.8 },
      { symbol: "BTC", type: "crypto", price: 67500, change24h: 2.5 },
      { symbol: "ETH", type: "crypto", price: 3450, change24h: -1.1 },
    ],
  });

  console.log("Seed data created successfully!");
  console.log(`Test user: test@wtfnote.com / password123`);
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
