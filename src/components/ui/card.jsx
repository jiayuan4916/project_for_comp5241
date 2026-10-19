import { cn } from '@/lib/utils';

export function Card({ className, ...props }) { return <section className={cn('rounded-bureau border border-[var(--line)] bg-[var(--surface)] shadow-[0_2px_5px_rgba(35,30,24,.035)]', className)} {...props} />; }
export function CardHeader({ className, ...props }) { return <div className={cn('p-4 pb-3', className)} {...props} />; }
export function CardTitle({ className, ...props }) { return <h2 className={cn('text-base font-bold leading-tight', className)} {...props} />; }
export function CardDescription({ className, ...props }) { return <p className={cn('text-sm leading-relaxed text-[var(--muted)]', className)} {...props} />; }
export function CardContent({ className, ...props }) { return <div className={cn('px-4 pb-4', className)} {...props} />; }