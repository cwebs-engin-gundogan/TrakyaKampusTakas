import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdCard } from '../components/AdCard';
import { defaultFilters, FilterPanel } from '../components/FilterPanel';
import { Button } from '../components/ui/Button';
import { EmptyState, LoadingState } from '../components/ui/StateBlocks';
import { SearchField } from '../components/ui/SearchField';
import { useAppState } from '../AppState';
import { apiClient } from '../lib/api/client';
import { filterAds } from '../lib/utils';
import type { Filters } from '../types';

export function DiscoverPage({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const { favorites, isFavorite, toggleFavorite, addToCart, inCart } = useAppState();
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ['ads', favoritesOnly ? 'favorites' : 'discover', filters, favorites],
    queryFn: async () => {
      const params = toAdParams(filters);
      const response = favoritesOnly ? await apiClient.listAds() : await apiClient.discover(params);
      const serverAds = response.data;
      const textFiltered = filters.q ? filterAds(serverAds, { q: filters.q }) : serverAds;
      return favoritesOnly ? textFiltered.filter((ad) => favorites.includes(ad.id)) : textFiltered;
    },
  });

  const ads = useMemo(() => query.data ?? [], [query.data]);

  return (
    <div className="grid gap-5 desktop:grid-cols-[1fr_310px]">
      <section className="min-w-0">
        <div className="mb-4 hidden items-center desktop:flex">
          <div>
            <h1 className="text-2xl font-extrabold">{favoritesOnly ? 'Favoriler' : 'Keşfet'}</h1>
            <p className="text-sm text-muted">{ads.length} ilan</p>
          </div>
        </div>

        {!favoritesOnly ? (
          <div className="mb-4 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchField value={filters.q} onChange={(q) => setFilters((prev) => ({ ...prev, q }))} />
            </div>
            <Button
              variant="tonal"
              aria-label="Filtre"
              className="h-12 w-12 shrink-0 px-0 desktop:hidden"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        ) : null}

        {query.isLoading ? (
          <LoadingState />
        ) : ads.length ? (
          <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-3 wide:grid-cols-4">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                favorite={isFavorite(ad.id)}
                inCart={inCart(ad.id)}
                onToggleFavorite={toggleFavorite}
                onAddCart={addToCart}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title={favoritesOnly ? 'Henüz favori ilan yok.' : 'Bu arama için ilan bulunamadı.'}
            description={favoritesOnly ? 'Beğendiğin bir şey bulmak için ilanları keşfet.' : 'Filtreleri değiştirmeyi dene.'}
            cta={favoritesOnly ? "Keşfet'e göz at" : undefined}
            onClick={() => navigate('/kesfet')}
          />
        )}
      </section>
      {!favoritesOnly ? (
        <div className="hidden desktop:block">
          <FilterPanel open={filterOpen} filters={filters} onChange={setFilters} onClose={() => setFilterOpen(false)} />
        </div>
      ) : null}
      {!favoritesOnly ? (
        <div className="desktop:hidden">
          <FilterPanel open={filterOpen} filters={filters} onChange={setFilters} onClose={() => setFilterOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}

function toAdParams(filters: Filters) {
  const params: Record<string, string> = {};
  if (filters.category !== 'ALL') params.category = filters.category;
  if (filters.condition !== 'ALL') params.condition = filters.condition;
  if (filters.min_price) params.min_price = filters.min_price;
  if (filters.max_price) params.max_price = filters.max_price;
  if (filters.is_swap !== 'ALL') params.is_swap = filters.is_swap;
  return params;
}
