import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  ShieldCheck,
  ShieldAlert,
  Menu,
  X,
  User
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { isDarkMode, toggleDarkMode, role, setRole, user } = useFinance();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'insights', label: 'Insights', icon: PieChart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 border-r border-border bg-card/50 backdrop-blur-xl p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/30">
            FV
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-display">FinVision</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25" 
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon size={20} className={cn("transition-transform duration-300", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
              <span className="font-semibold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-border/50 space-y-6">
          <div className="bg-accent/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Access Level</span>
              <button 
                onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  role === 'admin' ? "bg-success/20 text-success border border-success/20" : "bg-warning/20 text-warning border border-warning/20"
                )}
              >
                {role === 'admin' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                {role}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {role === 'admin' ? 'Full administrative privileges enabled.' : 'Read-only access to financial data.'}
            </p>
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            <span className="font-semibold tracking-tight">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className={cn(
                "fixed inset-y-0 left-0 w-72 border-r z-50 p-8 md:hidden transition-colors duration-300",
                isDarkMode 
                  ? "bg-[#0a0a0a] text-white border-zinc-800" 
                  : "bg-white text-slate-900 border-slate-200"
              )}
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
                    FV
                  </div>
                  <h1 className="text-xl font-bold tracking-tight font-display">FinVision</h1>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isDarkMode ? "hover:bg-zinc-800 text-slate-400" : "hover:bg-slate-200 text-slate-500"
                  )}
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all",
                      activeTab === item.id 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : (isDarkMode ? "hover:bg-zinc-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900")
                    )}
                  >
                    <item.icon size={20} />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
          <button 
            className="md:hidden p-2 hover:bg-accent rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div 
            className="flex items-center gap-6 ml-auto cursor-pointer group"
            onClick={() => setActiveTab('profile')}
          >
            <div className="text-right hidden sm:block">
              <p className={cn(
                "text-sm font-bold tracking-tight transition-colors",
                activeTab === 'profile' ? "text-primary" : "group-hover:text-primary"
              )}>
                {user.name}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{role} Account</p>
            </div>
            <div className="relative">
              <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm transition-all duration-300 overflow-hidden",
                activeTab === 'profile' 
                  ? "bg-primary shadow-xl shadow-primary/30 scale-110" 
                  : "bg-gradient-to-tr from-primary to-blue-400 shadow-lg shadow-primary/20 group-hover:scale-105"
              )}>
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-card rounded-full shadow-sm" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-4 px-6 pb-6 md:pt-6 md:px-10 md:pb-10 scroll-smooth">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
