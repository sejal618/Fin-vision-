import React, { useMemo, useState } from 'react';
import CustomSelect from './ui/CustomSelect';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Calendar,
  ChevronDown,
  Edit2,
  Trash2,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Sector
} from 'recharts';
import { 
  format, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO, 
  startOfYear, 
  endOfYear,
  isSameMonth,
  isSameYear,
  startOfDay,
  endOfDay
} from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import TransactionModal from './TransactionModal';

interface DashboardProps {
  onViewAll?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewAll }) => {
  const { transactions, role, deleteTransaction, isDarkMode } = useFinance();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  // Date Filter State
  const [dateRangeType, setDateRangeType] = useState<'all' | 'month' | 'year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    // Filter out the unwanted string and ensure 'Other' is available
    const filteredCats = Array.from(cats).filter(c => c !== "6WS7T1`8YTW`87W`" && c !== "Other");
    return ['all', ...filteredCats.sort(), 'Other'];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let filtered = transactions.filter(t => {
      // Date Filtering
      const txDate = parseISO(t.date);
      let dateMatch = true;
      if (dateRangeType === 'month') {
        dateMatch = isSameMonth(txDate, now);
      } else if (dateRangeType === 'year') {
        dateMatch = isSameYear(txDate, now);
      } else if (dateRangeType === 'custom') {
        dateMatch = isWithinInterval(txDate, {
          start: startOfDay(parseISO(customStartDate)),
          end: endOfDay(parseISO(customEndDate))
        });
      }

      // Category Filtering
      const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;

      return dateMatch && categoryMatch;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });
  }, [transactions, dateRangeType, customStartDate, customEndDate, selectedCategory, sortBy, sortOrder]);

  const handleEdit = (tx: any) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={fill} className="text-[10px] font-black uppercase tracking-[0.15em]">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs font-black">
          {`$${value.toLocaleString()}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={32} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-[9px] font-bold uppercase tracking-widest">
          {`${(percent * 100).toFixed(1)}% of total`}
        </text>
      </g>
    );
  };

  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    return {
      balance: totalIncome - totalExpenses,
      income: totalIncome,
      expenses: totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    };
  }, [filteredTransactions]);

  const trendData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const monthStr = format(date, 'MMM');
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthTransactions = transactions.filter(t => 
        isWithinInterval(parseISO(t.date), { start, end })
      );

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      return {
        name: monthStr,
        income,
        expenses,
        balance: income - expenses
      };
    });
    return last6Months;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Financial Intelligence</h2>
          <p className="text-muted-foreground mt-1">Welcome back, Sejal. Here's your real-time financial performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {role === 'admin' && (
            <button 
              onClick={handleAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              New Transaction
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-card/40 backdrop-blur-md border border-border/50 p-1 sm:p-1.5 rounded-2xl shadow-soft w-full sm:w-auto overflow-x-auto sm:overflow-visible no-scrollbar">
          <button 
            onClick={() => setDateRangeType('all')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              dateRangeType === 'all' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            All Time
          </button>
          <button 
            onClick={() => setDateRangeType('month')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              dateRangeType === 'month' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            Monthly
          </button>
          <button 
            onClick={() => setDateRangeType('year')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              dateRangeType === 'year' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            Yearly
          </button>
          <button 
            onClick={() => setDateRangeType('custom')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap",
              dateRangeType === 'custom' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <Calendar size={12} className="shrink-0" />
            Custom
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <CustomSelect
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories.map(cat => ({ 
              value: cat, 
              label: cat === 'all' ? 'All Categories' : cat 
            }))}
            icon={<Filter size={14} />}
            isDarkMode={isDarkMode}
            className="flex-1 lg:flex-none"
          />

          <CustomSelect
            value={`${sortBy}-${sortOrder}`}
            onChange={(val) => {
              const [newSortBy, newSortOrder] = val.split('-') as [any, any];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            options={[
              { value: 'date-desc', label: 'Newest First' },
              { value: 'date-asc', label: 'Oldest First' },
              { value: 'amount-desc', label: 'Highest Amount' },
              { value: 'amount-asc', label: 'Lowest Amount' },
            ]}
            icon={<ArrowUpDown size={14} />}
            isDarkMode={isDarkMode}
            className="flex-1 lg:flex-none"
          />
        </div>
      </div>

      <AnimatePresence>
        {dateRangeType === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-6 shadow-soft flex flex-wrap items-center gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</label>
                <input 
                  type="date" 
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-accent/30 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                />
              </div>
              <div className="w-4 h-px bg-border mt-6" />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Date</label>
                <input 
                  type="date" 
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-accent/30 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                />
              </div>
              <div className="ml-auto text-xs text-muted-foreground font-medium italic">
                Showing data from {format(parseISO(customStartDate), 'MMM dd')} to {format(parseISO(customEndDate), 'MMM dd, yyyy')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Balance" 
          amount={stats.balance} 
          icon={Wallet} 
          trend="+12.5%" 
          isPositive={stats.balance >= 0}
        />
        <SummaryCard 
          title="Total Income" 
          amount={stats.income} 
          icon={TrendingUp} 
          trend="+8.2%" 
          isPositive={true}
          color="success"
        />
        <SummaryCard 
          title="Total Expenses" 
          amount={stats.expenses} 
          icon={TrendingDown} 
          trend="+5.1%" 
          isPositive={false}
          color="danger"
        />
        <SummaryCard 
          title="Savings Rate" 
          amount={stats.savingsRate} 
          isPercentage 
          icon={ArrowUpRight} 
          trend="+2.4%" 
          isPositive={true}
          color="primary"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-soft focus:outline-none outline-none">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Balance Analytics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Cash flow trend over time</p>
            </div>
            <CustomSelect
              value="Last 6 Months"
              onChange={() => {}}
              options={[
                { value: 'Last 6 Months', label: 'Last 6 Months' },
                { value: 'Last Year', label: 'Last Year' },
              ]}
              isDarkMode={isDarkMode}
              className="w-32"
            />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => `$${value}`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-strong)',
                    border: '1px solid hsl(var(--border))',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', color: 'hsl(var(--muted-foreground))' }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                />
                <Area 
                  name="Income"
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  animationDuration={1500}
                />
                <Area 
                  name="Expenses"
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray="5 5"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-soft flex flex-col focus:outline-none outline-none">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Category Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Spending by category</p>
            </div>
            <CustomSelect
              value="Last 6 Months"
              onChange={() => {}}
              options={[
                { value: 'Last 6 Months', label: 'Last 6 Months' },
                { value: 'Last Year', label: 'Last Year' },
                { value: 'All Time', label: 'All Time' },
              ]}
              isDarkMode={isDarkMode}
              className="w-32"
            />
          </div>
          <div className="h-[320px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
              <span className={cn(
                "font-black tracking-tighter",
                stats.expenses >= 1000000 ? "text-lg" : "text-2xl"
              )}>
                ${stats.expenses >= 1000000 
                  ? `${(stats.expenses / 1000000).toFixed(2)}M` 
                  : stats.expenses.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="space-y-4 mt-8 flex-1 overflow-y-auto pr-2">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${item.value.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{((item.value / stats.expenses) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Mini Table */}
      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl overflow-hidden shadow-soft">
        <div className="p-8 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Recent Transactions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your latest financial activities</p>
          </div>
          <button 
            onClick={onViewAll}
            className="text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/10 px-4 py-2 rounded-xl transition-all"
          >
            View All Activity
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em]">
              <tr>
                <th className="px-8 py-4">Transaction</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4 text-right">Amount</th>
                {role === 'admin' && <th className="px-8 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTransactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-accent/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                        tx.type === 'income' ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                      )}>
                        {tx.type === 'income' ? <ArrowUpRight size={18} strokeWidth={2.5} /> : <ArrowDownRight size={18} strokeWidth={2.5} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{tx.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-lg bg-accent/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-muted-foreground">{format(parseISO(tx.date), 'MMM dd, yyyy')}</td>
                  <td className={cn(
                    "px-8 py-5 text-sm font-black text-right",
                    tx.type === 'income' ? "text-success" : "text-danger"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </td>
                  {role === 'admin' && (
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleEdit(tx)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }} 
        transaction={selectedTransaction}
      />
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: any;
  trend: string;
  isPositive: boolean;
  isPercentage?: boolean;
  color?: 'primary' | 'success' | 'danger' | 'warning';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  amount, 
  icon: Icon, 
  trend, 
  isPositive, 
  isPercentage,
  color = 'primary' 
}) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    danger: "text-danger bg-danger/10",
    warning: "text-warning bg-warning/10",
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-7 shadow-soft hover:shadow-strong transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", colorClasses[color])}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
          isPositive ? "bg-success/15 text-success border border-success/20" : "bg-danger/15 text-danger border border-danger/20"
        )}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-black mt-2 tracking-tighter">
          {isPercentage ? `${amount.toFixed(1)}%` : `$${amount.toLocaleString()}`}
        </h4>
      </div>
    </motion.div>
  );
};

export default Dashboard;
