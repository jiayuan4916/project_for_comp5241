import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export function DialogContent({ className, children, ...props }) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/45 data-[state=open]:animate-in" /><DialogPrimitive.Content className={cn('fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(540px,calc(100vw-28px))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-bureau border border-[var(--line)] bg-[var(--surface)] p-5 text-[var(--ink)] shadow-[var(--shadow)] focus:outline-none', className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]" aria-label="關閉視窗"><X size={16} /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}
export function DialogTitle({ className, ...props }) { return <DialogPrimitive.Title className={cn('pr-10 text-lg font-bold', className)} {...props} />; }
export function DialogDescription({ className, ...props }) { return <DialogPrimitive.Description className={cn('mt-1 text-sm leading-relaxed text-[var(--muted)]', className)} {...props} />; }