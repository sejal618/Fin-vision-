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

export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 60 }).map((_, i) => {
  const isIncome = Math.random() > 0.75;
  
  // More balanced amounts
  const amount = isIncome 
    ? Math.floor(Math.random() * 3000) + 2000 // Income: 2000 - 5000
    : Math.floor(Math.random() * 400) + 50;   // Expense: 50 - 450
  
  const type = (isIncome ? 'income' : 'expense') as TransactionType;
  
  // Ensure all categories are used
  let category;
  if (isIncome) {
    const incomeCats = ['Salary', 'Freelance', 'Investments'];
    category = incomeCats[Math.floor(Math.random() * incomeCats.length)];
  } else {
    const expenseCats = [
      'Food & Dining', 
      'Shopping', 
      'Housing', 
      'Transportation', 
      'Entertainment', 
      'Utilities', 
      'Healthcare',
      'Other'
    ];
    category = expenseCats[Math.floor(Math.random() * expenseCats.length)];
  }

  return {
    id: `tx-${i}`,
    date: format(subDays(new Date(), Math.floor(Math.random() * 120)), 'yyyy-MM-dd'),
    amount,
    category,
    type,
    description: `${category} activity #${i + 1}`
  } as Transaction;
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
