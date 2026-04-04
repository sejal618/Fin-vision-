import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { 
  format, 
  parseISO, 
  isWithinInterval, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  startOfDay, 
  endOfDay 
} from 'date-fns';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'motion/react';
import TransactionModal from './TransactionModal';
import CustomSelect from './ui/CustomSelect';

const Transactions: React.FC = () => {
  const { 
    transactions, 
    role, 
    deleteTransaction, 
    isDarkMode,
    dateRangeType,
    setDateRangeType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate
  } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const itemsPerPage = 10;

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    // Filter out the unwanted string and ensure 'Other' is available
    const filteredCats = Array.from(cats).filter(c => c !== "6WS7T1`8YTW`87W`" && c !== "Other");
    return ['all', ...filteredCats.sort(), 'Other'];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
        
        // Date Filtering
        let matchesDate = true;
        const txDate = parseISO(t.date);
        
        if (dateRangeType === 'month') {
          matchesDate = isWithinInterval(txDate, {
            start: startOfMonth(now),
            end: endOfMonth(now)
          });
        } else if (dateRangeType === 'year') {
          matchesDate = isWithinInterval(txDate, {
            start: startOfYear(now),
            end: endOfYear(now)
          });
        } else if (dateRangeType === 'custom') {
          matchesDate = isWithinInterval(txDate, {
            start: startOfDay(parseISO(customStartDate)),
            end: endOfDay(parseISO(customEndDate))
          });
        }

        return matchesSearch && matchesType && matchesCategory && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportData = (formatType: 'csv' | 'json') => {
    const data = filteredTransactions;
    if (formatType === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.json';
      a.click();
    } else {
      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
      const csvContent = [
        headers.join(','),
        ...data.map(t => [t.date, t.description, t.category, t.type, t.amount].join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
    }
  };

  const handleEdit = (tx: any) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Transactions</h2>
          <p className="text-muted-foreground mt-1">Detailed history of your <span className="text-foreground font-bold">{transactions.length}</span> financial activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-card/40 backdrop-blur-md border border-border/50 px-5 py-3 rounded-2xl font-bold hover:bg-accent/50 transition-all shadow-soft">
              <Download size={18} strokeWidth={2.5} />
              Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-2xl shadow-strong opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
              <button onClick={() => exportData('csv')} className="w-full text-left px-5 py-3 hover:bg-accent text-sm font-semibold border-b border-border/50">CSV Spreadsheet</button>
              <button onClick={() => exportData('json')} className="w-full text-left px-5 py-3 hover:bg-accent text-sm font-semibold">JSON Data</button>
            </div>
          </div>
          {role === 'admin' && (
            <button 
              onClick={handleAdd}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { id: 'all', label: 'All Time' },
          { id: 'month', label: 'This Month' },
          { id: 'year', label: 'This Year' },
          { id: 'custom', label: 'Custom' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setDateRangeType(type.id as any)}
            className={cn(
              "px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-soft",
              dateRangeType === type.id 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                : "bg-card/40 backdrop-blur-md border border-border/50 hover:bg-accent/50"
            )}
          >
            {type.label}
          </button>
        ))}

        {dateRangeType === 'custom' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
            <input 
              type="date" 
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-card/40 backdrop-blur-md border border-border/50 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 ring-primary/20 outline-none"
            />
            <span className="text-muted-foreground font-bold text-xs">to</span>
            <input 
              type="date" 
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-card/40 backdrop-blur-md border border-border/50 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 ring-primary/20 outline-none"
            />
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="relative z-40 bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-5 shadow-soft flex flex-col lg:flex-row gap-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search description or category..." 
            className="w-full bg-accent/30 border-none rounded-2xl pl-12 pr-5 py-3.5 focus:ring-2 ring-primary/20 transition-all font-medium placeholder:text-muted-foreground/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative z-50 flex flex-wrap items-center gap-4">
          <CustomSelect
            value={typeFilter}
            onChange={(val) => setTypeFilter(val as any)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ]}
            icon={<Filter size={16} strokeWidth={2.5} />}
            isDarkMode={isDarkMode}
            className="flex-1 sm:flex-none"
          />

          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map(cat => ({ 
              value: cat, 
              label: cat === 'all' ? 'All Categories' : cat 
            }))}
            isDarkMode={isDarkMode}
            className="flex-1 sm:flex-none"
          />

          <div className="flex items-center gap-3 bg-accent/30 px-4 py-2 rounded-2xl border border-transparent focus-within:border-primary/20 transition-all flex-1 sm:flex-none">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Sort:</span>
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={[
                { value: 'date', label: 'Date' },
                { value: 'amount', label: 'Amount' },
              ]}
              isDarkMode={isDarkMode}
              className="flex-1"
            />
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors"
            >
              {sortOrder === 'asc' ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em]">
              <tr>
                <th className="px-8 py-5">Transaction</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence mode="popLayout">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((tx) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={tx.id} 
                      className="hover:bg-accent/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                            tx.type === 'income' ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                          )}>
                            {tx.type === 'income' ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight">{tx.description}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{tx.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded-lg bg-accent/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-muted-foreground">
                        {format(parseISO(tx.date), 'MMM dd, yyyy')}
                      </td>
                      <td className={cn(
                        "px-8 py-6 text-sm font-black text-right",
                        tx.type === 'income' ? "text-success" : "text-danger"
                      )}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          {role === 'admin' ? (
                            <>
                              <button 
                                onClick={() => handleEdit(tx)}
                                className="p-2.5 hover:bg-primary/15 hover:text-primary rounded-xl transition-all hover:scale-110"
                              >
                                <Edit2 size={16} strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={() => deleteTransaction(tx.id)}
                                className="p-2.5 hover:bg-danger/15 hover:text-danger rounded-xl transition-all hover:scale-110"
                              >
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Restricted</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 text-muted-foreground/50">
                        <div className="w-20 h-20 rounded-3xl bg-muted/20 flex items-center justify-center">
                          <Search size={40} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground/70">No transactions found</p>
                          <p className="text-sm font-medium">Try adjusting your filters or search term.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-border/50 flex items-center justify-between bg-muted/10">
            <p className="text-xs text-muted-foreground font-medium">
              Showing <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="font-bold text-foreground">{filteredTransactions.length}</span> entries
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2.5 border border-border/50 rounded-xl hover:bg-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-xs font-black transition-all",
                      currentPage === i + 1 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110" 
                        : "hover:bg-accent/50 text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2.5 border border-border/50 rounded-xl hover:bg-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          transaction={editingTransaction}
        />
      )}
    </div>
  );
};

export default Transactions;
