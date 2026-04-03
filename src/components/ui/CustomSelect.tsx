import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  icon?: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  icon, 
  className,
  isDarkMode 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 bg-card/40 backdrop-blur-md border border-border/50 px-3 py-2 rounded-2xl shadow-soft w-full transition-all hover:bg-accent/30",
          isOpen && "ring-2 ring-primary/20 border-primary/30"
        )}
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest truncate">
          {selectedOption.label}
        </span>
        <ChevronDown 
          size={14} 
          className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 top-full left-0 w-full min-w-[160px] border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl",
              isDarkMode 
                ? "bg-zinc-900/95 border-zinc-800 text-white" 
                : "bg-white/95 border-slate-200 text-slate-900"
            )}
          >
            <div className="py-1 max-h-[300px] overflow-y-auto no-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                    value === option.value 
                      ? "bg-primary text-primary-foreground" 
                      : (isDarkMode ? "hover:bg-zinc-800" : "hover:bg-slate-100")
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
