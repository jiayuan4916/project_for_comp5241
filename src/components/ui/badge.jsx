import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-[.08em]', {
  variants: { variant: { default: 'border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)]', success: 'border-[var(--success-soft)] bg-[var(--success-soft)] text-[var(--success)]', warning: 'border-[var(--warning-soft)] bg-[var(--warning-soft)] text-[var(--warning)]', error: 'border-[var(--error-soft)] bg-[var(--error-soft)] text-[var(--error)]', muted: 'border-[var(--line)] bg-[var(--background)] text-[var(--muted)]', gold: 'border-[#e6d18a] bg-[#f8f0d9] text-[#66521c]' } },
  defaultVariants: { variant: 'muted' }
});

export function Badge({ className, variant, ...props }) { return <span className={cn(badgeVariants({ variant }), className)} {...props} />; }