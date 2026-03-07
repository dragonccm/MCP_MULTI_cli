import { transactionRepository } from "../repositories/transaction.repository";
import { debtRepository } from "../repositories/debt.repository";
import { assetRepository } from "../repositories/asset.repository";
import { prisma } from "../config/database";

export const settingsService = {
  async exportData(userId: string, options?: { startDate?: string; endDate?: string }) {
    const [transactions, debts, assets] = await Promise.all([
      transactionRepository.getAllForExport(
        userId,
        options?.startDate ? new Date(options.startDate) : undefined,
        options?.endDate ? new Date(options.endDate) : undefined
      ),
      debtRepository.getAllForExport(userId),
      assetRepository.getAllForExport(userId),
    ]);

    const transactionCsv = generateTransactionCsv(transactions);
    const debtCsv = generateDebtCsv(debts);
    const assetCsv = generateAssetCsv(assets);

    return {
      transactions: { csv: transactionCsv, count: transactions.length },
      debts: { csv: debtCsv, count: debts.length },
      assets: { csv: assetCsv, count: assets.length },
      exportedAt: new Date().toISOString(),
    };
  },

  async importTransactions(userId: string, csvData: string) {
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      return { imported: 0, skipped: 0, errors: ["CSV must have header and at least one data row"] };
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["amount", "type", "category", "date"];
    const missing = requiredHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      return { imported: 0, skipped: 0, errors: [`Missing required columns: ${missing.join(", ")}`] };
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCsvLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

        const amount = parseFloat(row.amount);
        if (isNaN(amount) || amount <= 0) {
          errors.push(`Row ${i + 1}: Invalid amount`);
          skipped++;
          continue;
        }

        const type = row.type.toLowerCase();
        if (type !== "income" && type !== "expense") {
          errors.push(`Row ${i + 1}: Type must be 'income' or 'expense'`);
          skipped++;
          continue;
        }

        const categories = await prisma.category.findMany({
          where: { name: row.category, deletedAt: null, OR: [{ userId }, { isDefault: true }] },
        });
        if (categories.length === 0) {
          errors.push(`Row ${i + 1}: Category '${row.category}' not found`);
          skipped++;
          continue;
        }

        await transactionRepository.create({
          amount,
          type,
          categoryId: categories[0].id,
          date: new Date(row.date),
          note: row.note || undefined,
          userId,
        });
        imported++;
      } catch {
        errors.push(`Row ${i + 1}: Parse error`);
        skipped++;
      }
    }

    return { imported, skipped, errors };
  },

  async getBackupData(userId: string) {
    const [user, transactions, debts, assets, budgets, categories] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, currency: true, locale: true },
      }),
      prisma.transaction.findMany({ where: { userId, deletedAt: null }, include: { category: true } }),
      prisma.debt.findMany({ where: { userId, deletedAt: null }, include: { payments: true } }),
      prisma.asset.findMany({ where: { userId, deletedAt: null } }),
      prisma.budget.findMany({ where: { userId, deletedAt: null }, include: { category: true } }),
      prisma.category.findMany({ where: { OR: [{ userId }, { isDefault: true }], deletedAt: null } }),
    ]);

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      user,
      data: { transactions, debts, assets, budgets, categories },
    };
  },
};

function generateTransactionCsv(
  transactions: { amount: number; type: string; date: Date; note: string | null; category: { name: string } }[]
): string {
  const header = "Date,Type,Category,Amount,Note";
  const rows = transactions.map((t) =>
    `${t.date.toISOString().split("T")[0]},${t.type},${escapeCsv(t.category.name)},${t.amount},${escapeCsv(t.note || "")}`
  );
  return [header, ...rows].join("\n");
}

function generateDebtCsv(debts: { creditorDebtor: string; amount: number; remainingBalance: number; type: string; status: string; dueDate: Date | null }[]): string {
  const header = "CreditorDebtor,Type,Amount,RemainingBalance,Status,DueDate";
  const rows = debts.map((d) =>
    `${escapeCsv(d.creditorDebtor)},${d.type},${d.amount},${d.remainingBalance},${d.status},${d.dueDate?.toISOString().split("T")[0] || ""}`
  );
  return [header, ...rows].join("\n");
}

function generateAssetCsv(assets: { type: string; ticker: string | null; coinSymbol: string | null; propertyName: string | null }[]): string {
  const header = "Type,Symbol/Name,Details";
  const rows = assets.map((a) => {
    const name = a.ticker || a.coinSymbol || a.propertyName || "N/A";
    return `${a.type},${escapeCsv(name)},${JSON.stringify(a)}`;
  });
  return [header, ...rows].join("\n");
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
