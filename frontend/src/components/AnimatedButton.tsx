import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: 'default' | 'primary';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: unknown;
}

/**
 * Animated button with suprematist-inspired hover effects
 */
export function AnimatedButton({
  children,
  variant = 'default',
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      disabled={disabled}
      type={type}
      onClick={onClick}
      whileHover={!disabled ? { scale: 1.02, borderColor: 'rgba(210, 4, 45, 0.6)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}

