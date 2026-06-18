import { cn } from '../../lib/utils';

interface FilterChipProps {
  selected?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function FilterChip({ selected, children, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 whitespace-nowrap rounded-pill border px-4 text-sm font-semibold transition active:scale-[0.98]',
        selected
          ? 'border-primary bg-primary text-on-primary'
          : 'border-outline-variant bg-surface text-on-surface hover:bg-[color:var(--primary-12)]',
      )}
    >
      {children}
    </button>
  );
}
