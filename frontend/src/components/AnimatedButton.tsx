import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary';
}

/**
 * Animated button with suprematist-inspired hover effects
 */
export function AnimatedButton({
  children,
  variant = 'default',
  className = '',
  disabled,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, borderColor: 'rgba(210, 4, 45, 0.6)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

