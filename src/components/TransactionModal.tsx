import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types';
import { cn } from '../utils/cn';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction }) => {
  const { addTransaction, updateTransaction, isDarkMode } = useFinance();
  const categories = [
    'Food & Dining', 'Shopping', 'Housing', 'Transportation', 
    'Entertainment', 'Salary', 'Freelance', 'Investments', 
    'Utilities', 'Healthcare', 'Other'
  ];

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food & Dining',
    customCategory: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (transaction) {
      const isPredefined = categories.includes(transaction.category) && transaction.category !== 'Other';
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        category: isPredefined ? transaction.category : 'Other',
        customCategory: isPredefined ? '' : transaction.category,
        type: transaction.type,
        date: transaction.date
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        category: 'Food & Dining',
        customCategory: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = formData.category === 'Other' 
      ? (formData.customCategory.trim() || 'Other') 
      : formData.category;

    const data = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: finalCategory,
      type: formData.type,
      date: formData.date
    };

    if (transaction) {
      updateTransaction(transaction.id, data);
    } else {
      addTransaction(data);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300",
              isDarkMode 
                ? "bg-[#0a0a0a] text-white border-zinc-800" 
                : "bg-white text-slate-900 border-slate-200"
            )}
          >
            <div className={cn(
              "p-6 border-b flex items-center justify-between",
              isDarkMode ? "border-zinc-800 bg-zinc-900/50" : "border-slate-100 bg-slate-50"
            )}>
              <h3 className="text-xl font-bold">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button onClick={onClose} className={cn(
                "p-2 rounded-lg transition-colors",
                isDarkMode ? "hover:bg-zinc-800 text-slate-400" : "hover:bg-slate-200 text-slate-500"
              )}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className={cn("text-sm font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>Description</label>
                <input
                  required
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={cn(
                    "w-full border rounded-xl px-4 py-2.5 focus:ring-2 ring-primary transition-all outline-none",
                    isDarkMode 
                      ? "bg-zinc-900 text-white border-zinc-800 placeholder:text-zinc-600" 
                      : "bg-slate-50 text-slate-900 border-slate-200 placeholder:text-slate-400"
                  )}
                  placeholder="e.g. Grocery Shopping"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={cn("text-sm font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>Amount ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className={cn(
                      "w-full border rounded-xl px-4 py-2.5 focus:ring-2 ring-primary transition-all outline-none",
                      isDarkMode 
                        ? "bg-zinc-900 text-white border-zinc-800" 
                        : "bg-slate-50 text-slate-900 border-slate-200"
                    )}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className={cn("text-sm font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>Date</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={cn(
                      "w-full border rounded-xl px-4 py-2.5 focus:ring-2 ring-primary transition-all outline-none",
                      isDarkMode 
                        ? "bg-zinc-900 text-white border-zinc-800" 
                        : "bg-slate-50 text-slate-900 border-slate-200"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={cn("text-sm font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>Type</label>
                <div className={cn(
                  "grid grid-cols-2 gap-2 p-1 rounded-xl border",
                  isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-slate-100 border-slate-200"
                )}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={cn(
                      "py-2 rounded-lg text-sm font-bold transition-all",
                      formData.type === 'income' 
                        ? (isDarkMode ? "bg-zinc-800 text-success shadow-sm border border-zinc-700" : "bg-white text-success shadow-sm border border-slate-200")
                        : (isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900")
                    )}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={cn(
                      "py-2 rounded-lg text-sm font-bold transition-all",
                      formData.type === 'expense' 
                        ? (isDarkMode ? "bg-zinc-800 text-danger shadow-sm border border-zinc-700" : "bg-white text-danger shadow-sm border border-slate-200")
                        : (isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900")
                    )}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={cn("text-sm font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className={cn(
                    "w-full border rounded-xl px-4 py-2.5 focus:ring-2 ring-primary transition-all cursor-pointer outline-none",
                    isDarkMode 
                      ? "bg-zinc-900 text-white border-zinc-800" 
                      : "bg-slate-50 text-slate-900 border-slate-200"
                  )}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className={isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-slate-900"}>{cat}</option>
                  ))}
                </select>
              </div>

              <AnimatePresence>
                {formData.category === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className={cn("text-sm font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>Custom Category Name</label>
                    <input
                      required
                      type="text"
                      value={formData.customCategory}
                      onChange={e => setFormData({ ...formData, customCategory: e.target.value })}
                      className={cn(
                        "w-full border rounded-xl px-4 py-2.5 focus:ring-2 ring-primary transition-all outline-none",
                        isDarkMode 
                          ? "bg-zinc-900 text-white border-zinc-800 placeholder:text-zinc-600" 
                          : "bg-slate-50 text-slate-900 border-slate-200 placeholder:text-slate-400"
                      )}
                      placeholder="e.g. Gift, Bonus, etc."
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {transaction ? 'Update Transaction' : 'Create Transaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;
