import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'tonal' | 'outline' | 'text' | 'destructive' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:brightness-95',
  secondary: 'bg-secondary text-on-secondary hover:brightness-95',
  tonal: 'bg-[color:var(--primary-12)] text-primary hover:bg-[color:var(--primary-15)]',
  outline: 'border border-outline-variant bg-transparent text-primary hover:bg-[color:var(--primary-12)]',
  text: 'bg-transparent text-primary hover:bg-[color:var(--primary-12)]',
  destructive: 'bg-error text-white hover:brightness-95',
  icon: 'h-11 w-11 rounded-full bg-surface text-on-surface shadow-card hover:bg-[color:var(--primary-12)]',
};

export function Button({ className, variant = 'primary', loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        variant === 'icon' ? 'px-0' : '',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
