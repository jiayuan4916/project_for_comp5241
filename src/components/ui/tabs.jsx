import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }) { return <TabsPrimitive.List className={cn('inline-flex items-center rounded-md border border-[var(--line)] bg-[var(--background)] p-1', className)} {...props} />; }
export function TabsTrigger({ className, ...props }) { return <TabsPrimitive.Trigger className={cn('inline-flex min-h-9 items-center justify-center gap-2 rounded px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--ink)] data-[state=active]:shadow-sm', className)} {...props} />; }
export function TabsContent({ className, ...props }) { return <TabsPrimitive.Content className={cn('mt-2 focus-visible:outline-none', className)} {...props} />; }