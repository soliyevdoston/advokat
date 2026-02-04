import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const options = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-2 border border-slate-200 dark:border-slate-700 flex flex-col gap-1 mb-2"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    p-2 rounded-xl flex items-center gap-3 w-32 transition-colors
                                    ${theme === option.value 
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}
                                `}
                            >
                                <option.icon size={18} />
                                <span className="text-sm font-medium capitalize">{option.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={toggleOpen}
                className={`
                    p-4 rounded-full shadow-2xl transition-all duration-300
                    ${isOpen ? 'bg-blue-600 rotate-90 scale-110' : 'bg-white dark:bg-slate-800 hover:scale-105 active:scale-95'}
                    border border-slate-200 dark:border-slate-700
                `}
            >
                {theme === 'light' && <Sun size={24} className={isOpen ? 'text-white' : 'text-orange-500'} />}
                {theme === 'dark' && <Moon size={24} className={isOpen ? 'text-white' : 'text-blue-500'} />}
                {theme === 'system' && <Monitor size={24} className={isOpen ? 'text-white' : 'text-slate-600 dark:text-slate-400'} />}
            </button>
        </div>
    );
};

export default ThemeSwitcher;
