import { prisma } from "../config/database";

export const categoryRepository = {
  findByUser(userId: string, type?: string) {
    return prisma.category.findMany({
      where: {
        deletedAt: null,
        OR: [{ userId }, { isDefault: true }],
        ...(type ? { type } : {}),
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  },

  findById(id: string) {
    return prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
  },

  findByNameAndUser(name: string, userId: string, type: string) {
    return prisma.category.findFirst({
      where: { name, type, deletedAt: null, OR: [{ userId }, { isDefault: true }] },
    });
  },

  create(data: { name: string; type: string; icon?: string; color?: string; userId: string }) {
    return prisma.category.create({ data });
  },

  update(id: string, data: { name?: string; icon?: string; color?: string }) {
    return prisma.category.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  countTransactions(categoryId: string) {
    return prisma.transaction.count({
      where: { categoryId, deletedAt: null },
    });
  },

  async reassignTransactions(fromCategoryId: string, toCategoryId: string) {
    const result = await prisma.transaction.updateMany({
      where: { categoryId: fromCategoryId, deletedAt: null },
      data: { categoryId: toCategoryId },
    });
    return result.count;
  },

  createDefaults() {
    const defaults = [
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
    return prisma.category.createMany({ data: defaults });
  },
};
