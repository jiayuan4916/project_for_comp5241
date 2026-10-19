import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

export function Progress({ className, value = 0, ...props }) {
  const clamped = Math.max(0, Math.min(100, value));
  return <ProgressPrimitive.Root className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[var(--line)]', className)} value={clamped} {...props}><ProgressPrimitive.Indicator className="h-full w-full bg-[var(--accent)] transition-transform duration-200" style={{ transform: `translateX(-${100 - clamped}%)` }} /></ProgressPrimitive.Root>;
}