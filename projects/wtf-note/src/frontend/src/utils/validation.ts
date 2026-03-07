import { z } from 'zod/v4';

export const loginSchema = z.object({
  email: z.email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters'),
});

export const registerSchema = z.object({
  profileName: z.string().min(2, 'Min 2 characters'),
  email: z.email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string().min(8, 'Min 8 characters'),
}).check(
  (ctx) => {
    if (ctx.value.password !== ctx.value.confirmPassword) {
      ctx.issues.push({
        code: 'custom',
        message: 'Passwords must match',
        input: ctx.value.confirmPassword,
        path: ['confirmPassword'],
      });
    }
  }
);

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category required'),
  date: z.string().min(1, 'Date required'),
  note: z.string().optional(),
});

export const debtSchema = z.object({
  contactName: z.string().min(1, 'Name required'),
  type: z.enum(['owed', 'owing']),
  totalAmount: z.number().positive('Amount must be positive'),
  remainingBalance: z.number().min(0),
  dueDate: z.string().min(1, 'Due date required'),
  isRecurring: z.boolean(),
  recurrenceInterval: z.enum(['monthly', 'weekly']).optional(),
});

export const assetSchema = z.object({
  type: z.enum(['stock', 'crypto', 'real_estate']),
  name: z.string().min(1, 'Name required'),
  symbol: z.string().optional(),
  quantity: z.number().positive('Quantity required'),
  purchasePrice: z.number().min(0, 'Price required'),
  purchaseDate: z.string().min(1, 'Date required'),
  address: z.string().optional(),
  propertyType: z.string().optional(),
  walletName: z.string().optional(),
  ownershipPercentage: z.number().min(0).max(100).optional(),
});

export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category required'),
  monthlyLimit: z.number().positive('Limit must be positive'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name required').max(30, 'Max 30 characters'),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type TransactionForm = z.infer<typeof transactionSchema>;
export type DebtForm = z.infer<typeof debtSchema>;
export type AssetForm = z.infer<typeof assetSchema>;
export type BudgetForm = z.infer<typeof budgetSchema>;
export type CategoryForm = z.infer<typeof categorySchema>;
