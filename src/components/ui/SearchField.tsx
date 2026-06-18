import { Search } from 'lucide-react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChange, placeholder = 'Ürün, kitap, elektronik ara...' }: SearchFieldProps) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-lg border border-[color:var(--primary-35)] bg-surface px-4 text-muted focus-within:border-primary">
      <Search className="h-5 w-5" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-muted"
        placeholder={placeholder}
      />
    </label>
  );
}
