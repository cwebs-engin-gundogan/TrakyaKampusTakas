import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button } from './Button';

export function LoadingState({ label = 'Yükleniyor...' }: { label?: string }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  cta?: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-card text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--primary-12)] text-primary">
        <Icon className="h-9 w-9" />
      </div>
      <div className="text-lg font-bold">{title}</div>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      {cta && onClick ? <Button className="mt-2" onClick={onClick}>{cta}</Button> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-error/30 bg-surface p-5 text-sm font-semibold text-error">
      {message}
    </div>
  );
}
