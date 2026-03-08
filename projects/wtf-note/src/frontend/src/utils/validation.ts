import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(50, 'Tên tối đa 50 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'debt', 'receivable', 'asset']),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  description: z.string().optional(),
  date: z.string().min(1, 'Vui lòng chọn ngày'),
  creditorDebtor: z.string().optional(),
  currency: z.string().default('VND'),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

export const assetSchema = z.object({
  symbol: z.string().min(1, 'Vui lòng nhập mã chứng khoán').max(10),
  name: z.string().min(1, 'Vui lòng nhập tên tài sản'),
  assetType: z.enum(['stock', 'crypto', 'fund', 'bond', 'other']),
  quantity: z.number().positive('Số lượng phải lớn hơn 0'),
  purchasePrice: z.number().positive('Giá mua phải lớn hơn 0'),
  purchaseDate: z.string().min(1, 'Vui lòng chọn ngày mua'),
  currency: z.string().default('VND'),
  notes: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(50),
  currency: z.string().min(3).max(3),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  newPassword: z.string().min(8, 'Mật khẩu mới tối thiểu 8 ký tự'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu mới không khớp',
  path: ['confirmNewPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type AssetInput = z.infer<typeof assetSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
