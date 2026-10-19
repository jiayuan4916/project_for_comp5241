import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45', {
  variants: {
    variant: {
      default: 'border-transparent bg-[var(--accent)] text-white hover:brightness-95',
      outline: 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--background)]',
      ghost: 'border-transparent bg-transparent text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]',
      dark: 'border-transparent bg-[var(--code)] text-[var(--code-ink)] hover:brightness-110',
      gold: 'border-transparent bg-[var(--gold)] text-[var(--gold-ink)] hover:brightness-95',
      danger: 'border-transparent bg-[var(--error)] text-white hover:brightness-95'
    },
    size: { default: '', sm: 'min-h-8 px-2.5 py-1.5 text-xs', icon: 'h-10 w-10 p-0' }
  },
  defaultVariants: { variant: 'default', size: 'default' }
});

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };