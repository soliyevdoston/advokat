import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
const MotionButton = motion.button;

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const variants = {
    primary:
      'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)] shadow-[0_10px_30px_-14px_rgba(22,77,136,0.8)]',
    secondary:
      'bg-[var(--color-secondary)] text-[var(--color-surface-950)] hover:bg-[var(--color-secondary-500)] shadow-[0_10px_24px_-14px_rgba(212,169,102,0.8)]',
    outline:
      'border border-[var(--color-primary-300)] text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800',
    ghost:
      'text-slate-600 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-lg',
    md: 'h-11 px-6 text-sm rounded-xl',
    lg: 'h-12 px-8 text-base rounded-xl',
    icon: 'h-10 w-10 p-0 flex items-center justify-center rounded-xl',
  };

  return (
    <MotionButton
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </MotionButton>
  );
});

Button.displayName = 'Button';

export default Button;
