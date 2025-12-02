type StatusPillProps = {
  status: 'idle' | 'pending' | 'success' | 'error';
  label: string;
};

const palette: Record<StatusPillProps['status'], string> = {
  idle: 'bg-transparent text-ivory/60 border-ivory/30',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
  error: 'bg-flare/10 text-flare border-flare/60',
};

export function StatusPill({ status, label }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 text-xs uppercase tracking-[0.3em] ${palette[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

