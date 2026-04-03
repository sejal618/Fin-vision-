export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
}

export type UserRole = 'viewer' | 'admin';

export interface UserProfile {
  name: string;
  email: string;
  joined: string;
  location: string;
  phone: string;
  bio: string;
  profilePic: string | null;
}

export interface FinanceState {
  transactions: Transaction[];
  role: UserRole;
  isDarkMode: boolean;
  user: UserProfile;
}

export interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}
