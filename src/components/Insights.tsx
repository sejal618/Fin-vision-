import React, { useMemo } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle2,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO, format } from 'date-fns';

const Insights: React.FC = () => {
  const { transactions } = useFinance();

  const insights = useMemo(() => {
    // 1. Highest Spending Category
    const categoryExpenses: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      });
    
    const topCategory = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])[0];

    // 2. Monthly Comparison
    const currentMonth = { start: startOfMonth(new Date()), end: endOfMonth(new Date()) };
    const lastMonth = { start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) };

    const currentExpenses = transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), currentMonth))
      .reduce((acc, t) => acc + t.amount, 0);
    
    const lastExpenses = transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), lastMonth))
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenseDiff = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;

    // 3. Savings Goal (Mock)
    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && isWithinInterval(parseISO(t.date), currentMonth))
      .reduce((acc, t) => acc + t.amount, 0);
    
    const savingsGoal = 2000;
    const currentSavings = monthlyIncome - currentExpenses;
    const goalProgress = Math.min(Math.max((currentSavings / savingsGoal) * 100, 0), 100);

    return {
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      expenseDiff,
      currentExpenses,
      lastExpenses,
      goalProgress,
      currentSavings
    };
  }, [transactions]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Smart Intelligence</h2>
        <p className="text-muted-foreground mt-1">AI-powered observations based on your spending habits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Top Spending Insight */}
        <InsightCard 
          title="Highest Spending"
          value={insights.topCategory ? insights.topCategory.name : 'N/A'}
          description={insights.topCategory ? `You've spent $${insights.topCategory.amount.toLocaleString()} on ${insights.topCategory.name.toLowerCase()} so far.` : 'No data yet.'}
          icon={TrendingDown}
          color="danger"
          action="View Breakdown"
        />

        {/* Monthly Comparison */}
        <InsightCard 
          title="Monthly Comparison"
          value={insights.expenseDiff > 0 ? `+${insights.expenseDiff.toFixed(1)}%` : `${insights.expenseDiff.toFixed(1)}%`}
          description={insights.expenseDiff > 0 
            ? "Your spending is higher than last month. Consider reviewing your subscriptions." 
            : "Great job! You've spent less than last month so far."}
          icon={insights.expenseDiff > 0 ? AlertCircle : CheckCircle2}
          color={insights.expenseDiff > 0 ? "warning" : "success"}
          action="Compare Months"
        />

        {/* Savings Goal */}
        <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-soft flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-2xl bg-primary/15 text-primary shadow-sm">
              <Target size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">Savings Goal</span>
          </div>
          <div className="flex-1">
            <h4 className="text-2xl font-black mb-1 tracking-tight">Monthly Savings</h4>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-8">Target: $2,000.00</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-primary">{insights.goalProgress.toFixed(0)}% Complete</span>
                <span className="text-foreground">${insights.currentSavings.toLocaleString()}</span>
              </div>
              <div className="h-4 w-full bg-accent/50 rounded-full overflow-hidden p-1 border border-border/30">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${insights.goalProgress}%` }}
                  transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full bg-primary rounded-full shadow-lg shadow-primary/30"
                />
              </div>
            </div>
          </div>
          <button className="mt-8 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-4 transition-all group">
            Adjust Goal <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Observations List */}
      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-10 shadow-soft">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-warning/15 text-warning rounded-2xl shadow-sm">
            <Lightbulb size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Key Observations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Deep dive into your financial patterns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ObservationItem 
            icon={Zap}
            title="Subscription Alert"
            description="We noticed 3 recurring payments to 'Entertainment' services. You could save $45/month by consolidating."
            color="warning"
          />
          <ObservationItem 
            icon={TrendingUp}
            title="Income Growth"
            description="Your freelance income has grown by 15% over the last 3 months. Keep up the great work!"
            color="success"
          />
          <ObservationItem 
            icon={AlertCircle}
            title="Unusual Activity"
            description="A $450 transaction in 'Shopping' is 3x higher than your average for this category."
            color="danger"
          />
          <ObservationItem 
            icon={CheckCircle2}
            title="Budget Milestone"
            description="You've stayed within your 'Food & Dining' budget for 4 consecutive weeks!"
            color="success"
          />
        </div>
      </div>
    </div>
  );
};

interface InsightCardProps {
  title: string;
  value: string;
  description: string;
  icon: any;
  color: 'primary' | 'success' | 'danger' | 'warning';
  action: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, value, description, icon: Icon, color, action }) => {
  const colorClasses = {
    primary: "text-primary bg-primary/15",
    success: "text-success bg-success/15",
    danger: "text-danger bg-danger/15",
    warning: "text-warning bg-warning/15",
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-soft hover:shadow-strong transition-all flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={cn("p-3 rounded-2xl shadow-sm", colorClasses[color])}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <span className={cn("text-[10px] font-black uppercase tracking-[0.15em]", `text-${color}`)}>{title}</span>
      </div>
      <div className="flex-1">
        <h4 className="text-4xl font-black mb-3 tracking-tighter">{value}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{description}</p>
      </div>
      <button className="mt-8 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-4 transition-all group">
        {action} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
};

const ObservationItem: React.FC<{ icon: any, title: string, description: string, color: string }> = ({ icon: Icon, title, description, color }) => {
  const colorClasses: Record<string, string> = {
    success: "bg-success/15 text-success",
    danger: "bg-danger/15 text-danger",
    warning: "bg-warning/15 text-warning",
    primary: "bg-primary/15 text-primary",
  };

  return (
    <div className="flex gap-5 group">
      <div className={cn("shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110", colorClasses[color])}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <div>
        <h5 className="text-lg font-bold mb-1 tracking-tight">{title}</h5>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
};

export default Insights;
