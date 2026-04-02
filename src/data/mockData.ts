import { Transaction, TransactionType } from '../types';
import { subDays, format } from 'date-fns';

const categories = [
  'Food & Dining',
  'Shopping',
  'Housing',
  'Transportation',
  'Entertainment',
  'Salary',
  'Freelance',
  'Investments',
  'Utilities',
  'Healthcare'
];

export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 50 }).map((_, i) => {
  const isIncome = Math.random() > 0.7;
  const amount = isIncome 
    ? Math.floor(Math.random() * 5000) + 1000 
    : Math.floor(Math.random() * 500) + 10;
  
  const type = (isIncome ? 'income' : 'expense') as TransactionType;
  const category = isIncome 
    ? categories[Math.floor(Math.random() * 3) + 5] // Salary, Freelance, Investments
    : categories[Math.floor(Math.random() * 5)]; // Food, Shopping, Housing, Transportation, Entertainment

  return {
    id: `tx-${i}`,
    date: format(subDays(new Date(), Math.floor(Math.random() * 90)), 'yyyy-MM-dd'),
    amount,
    category,
    type,
    description: `${category} payment ${i + 1}`
  } as Transaction;
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
