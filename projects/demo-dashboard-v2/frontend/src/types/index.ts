export type User = {
  id: string;
  email: string;
  name: string;
};

export type CategoryType = 'INCOME' | 'EXPENSE';

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  userId: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  categoryId: string;
  userId: string;
  category?: Category;
};

export type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export type ChartData = {
  name: string;
  value: number;
};
