import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { FilterChip } from './ui/FilterChip';
import type { CategoryEnum, ConditionEnum, Filters } from '../types';
import { categoryLabels, conditionLabels, cn } from '../lib/utils';

const categories: Array<CategoryEnum | 'ALL'> = ['ALL', 'HOUSEHOLD_GOODS', 'TEXTBOOKS', 'STUDENT_ESSENTIALS', 'ELECTRONICS', 'CLOTHING', 'SPORTS', 'OTHER'];
const conditions: Array<ConditionEnum | 'ALL'> = ['ALL', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];

interface FilterPanelProps {
  open: boolean;
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClose: () => void;
}

export const defaultFilters: Filters = {
  q: '',
  category: 'ALL',
  condition: 'ALL',
  min_price: '',
  max_price: '',
  is_swap: 'ALL',
};

export function FilterPanel({ open, filters, onChange, onClose }: FilterPanelProps) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <>
      <div className={cn('fixed inset-0 z-40 bg-black/30 transition desktop:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')} onClick={onClose} />
      <aside
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-auto rounded-t-auth bg-surface p-5 shadow-2xl transition desktop:static desktop:z-auto desktop:max-h-none desktop:rounded-card desktop:p-5 desktop:shadow-card',
          open ? 'translate-y-0' : 'translate-y-full desktop:translate-y-0',
        )}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="text-lg font-extrabold">Filtrele</div>
          <div className="flex-1" />
          <button type="button" className="desktop:hidden" onClick={onClose} aria-label="Filtreyi kapat">
            <X className="h-5 w-5" />
          </button>
        </div>

        <FilterGroup title="Kategori">
          {categories.map((category) => (
            <FilterChip key={category} selected={filters.category === category} onClick={() => update({ category })}>
              {category === 'ALL' ? 'Tümü' : categoryLabels[category]}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup title="Durum">
          {conditions.map((condition) => (
            <FilterChip key={condition} selected={filters.condition === condition} onClick={() => update({ condition })}>
              {condition === 'ALL' ? 'Tümü' : conditionLabels[condition]}
            </FilterChip>
          ))}
        </FilterGroup>

        <div className="mt-5">
          <div className="mb-2 text-sm font-bold">Fiyat Aralığı (TL)</div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={filters.min_price}
              onChange={(event) => update({ min_price: event.target.value })}
              inputMode="numeric"
              placeholder="Min"
              className="h-12 rounded-md border border-[color:var(--primary-35)] bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <input
              value={filters.max_price}
              onChange={(event) => update({ max_price: event.target.value })}
              inputMode="numeric"
              placeholder="Max"
              className="h-12 rounded-md border border-[color:var(--primary-35)] bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <FilterGroup title="Takas">
          <FilterChip selected={filters.is_swap === 'ALL'} onClick={() => update({ is_swap: 'ALL' })}>Tümü</FilterChip>
          <FilterChip selected={filters.is_swap === 'true'} onClick={() => update({ is_swap: 'true' })}>Takasa Açık</FilterChip>
          <FilterChip selected={filters.is_swap === 'false'} onClick={() => update({ is_swap: 'false' })}>Sadece Satış</FilterChip>
        </FilterGroup>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => onChange(defaultFilters)}>Temizle</Button>
          <Button onClick={onClose}>Uygula</Button>
        </div>
      </aside>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <div className="mb-2 text-sm font-bold">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}
