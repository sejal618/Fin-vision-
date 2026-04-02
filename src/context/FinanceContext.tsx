import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, UserRole, FinanceState } from '../types';
import { MOCK_TRANSACTIONS } from '../data/mockData';

interface FinanceContextType extends FinanceState {
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setRole: (role: UserRole) => void;
  toggleDarkMode: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finvision_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('finvision_role');
    return (saved as UserRole) || 'admin';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('finvision_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('finvision_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finvision_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('finvision_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: `tx-${Date.now()}` };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updatedFields } : tx));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <FinanceContext.Provider value={{ 
      transactions, 
      role, 
      isDarkMode, 
      addTransaction, 
      updateTransaction, 
      deleteTransaction, 
      setRole, 
      toggleDarkMode 
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
