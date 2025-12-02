import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  subtitle?: string | ReactNode;
  children: ReactNode;
};

export function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <motion.section
      className="border border-ivory/10 bg-ash/30 p-4 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        borderColor: 'rgba(245, 245, 245, 0.15)',
        transition: { duration: 0.3 },
      }}
    >
      <motion.div
        className="mb-5 space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-ivory/60">{title}</p>
        {subtitle && <p className="text-sm text-ivory/80">{subtitle}</p>}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

