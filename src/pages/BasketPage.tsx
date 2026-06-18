import { ShoppingBasket, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AdCard } from '../components/AdCard';
import { Button } from '../components/ui/Button';
import { EmptyState, LoadingState } from '../components/ui/StateBlocks';
import { useAppState } from '../AppState';
import { apiClient } from '../lib/api/client';
import { formatPrice, resolveMediaUrl } from '../lib/utils';

export function BasketPage() {
  const { cart, removeFromCart, isFavorite, toggleFavorite, addToCart, inCart } = useAppState();
  const adsQuery = useQuery({ queryKey: ['ads', 'public'], queryFn: () => apiClient.listAds().then((response) => response.data) });
  const ads = adsQuery.data ?? [];
  const cartAds = ads.filter((ad) => cart.includes(ad.id));
  const total = cartAds.reduce((sum, ad) => sum + ad.price, 0);
  const suggestions = ads.filter((ad) => !cart.includes(ad.id)).slice(0, 4);

  if (adsQuery.isLoading) return <LoadingState />;

  if (!cartAds.length) {
    return <EmptyState icon={ShoppingBasket} title="Sepetin boş" description="Beğendiğin ilanları sepete ekleyerek burada görebilirsin." />;
  }

  return (
    <div className="grid gap-5 desktop:grid-cols-[1fr_330px]">
      <section className="space-y-4">
        <h1 className="hidden text-2xl font-extrabold desktop:block">Sepet</h1>
        {cartAds.map((ad) => {
          const image = resolveMediaUrl(ad.image_urls[0]);
          return (
            <article key={ad.id} className="flex gap-3 rounded-lg bg-surface p-3 shadow-card">
              {image ? <img src={image} alt={ad.title} className="h-[90px] w-[90px] rounded-md object-cover" /> : null}
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 font-bold">{ad.title}</div>
                <div className="mt-1 text-sm font-extrabold text-primary">{formatPrice(ad.price)}</div>
                <div className="mt-1 text-xs text-muted">{ad.seller_full_name}</div>
              </div>
              <Button variant="icon" aria-label="Sepetten kaldır" onClick={() => removeFromCart(ad.id)}>
                <Trash2 className="h-4 w-4 text-error" />
              </Button>
            </article>
          );
        })}

        <section>
          <h2 className="mb-3 font-extrabold">Senin için öneriler</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 tablet:grid tablet:grid-cols-3 desktop:grid-cols-4">
            {suggestions.map((ad) => (
              <AdCard
                key={ad.id}
                compact
                ad={ad}
                favorite={isFavorite(ad.id)}
                inCart={inCart(ad.id)}
                onToggleFavorite={toggleFavorite}
                onAddCart={addToCart}
              />
            ))}
          </div>
        </section>
      </section>

      <aside className="fixed inset-x-0 bottom-0 z-30 rounded-t-auth bg-surface p-5 shadow-2xl desktop:sticky desktop:top-24 desktop:h-max desktop:rounded-auth desktop:shadow-card">
        <div className="flex items-center justify-between">
          <span className="font-bold">Toplam</span>
          <span className="text-2xl font-extrabold text-primary">{formatPrice(total)}</span>
        </div>
        <Button className="mt-4 h-14 w-full rounded-lg" onClick={() => toast.info('Ödeme altyapısı yakında.')}>Ödemeye Geç</Button>
      </aside>
    </div>
  );
}
