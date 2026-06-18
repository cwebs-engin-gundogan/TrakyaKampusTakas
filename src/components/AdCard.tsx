import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AdvertisementResponse } from '../types';
import { Button } from './ui/Button';
import { categoryLabels, cn, formatPrice, resolveMediaUrl } from '../lib/utils';

interface AdCardProps {
  ad: AdvertisementResponse;
  favorite: boolean;
  inCart?: boolean;
  onToggleFavorite: (id: number) => void;
  onAddCart?: (id: number) => void;
  compact?: boolean;
}

export function AdCard({ ad, favorite, inCart, onToggleFavorite, onAddCart, compact }: AdCardProps) {
  const image = resolveMediaUrl(ad.image_urls[0]);
  return (
    <article className={cn('card-lift rounded-card bg-surface p-2.5 shadow-card', compact ? 'min-w-40' : '')}>
      <div className="relative overflow-hidden rounded-lg bg-[color:var(--primary-12)]">
        <Link to={`/ilan/${ad.id}`} aria-label={`${ad.title} detayını aç`}>
          {image ? (
            <img src={image} alt={ad.title} className={cn('w-full object-cover', compact ? 'h-28' : 'h-32 tablet:h-36')} loading="lazy" />
          ) : (
            <div className="h-32 w-full animate-pulse bg-[color:var(--primary-12)]" />
          )}
        </Link>
        <button
          type="button"
          aria-label={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          onClick={() => onToggleFavorite(ad.id)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full p-0 text-on-surface leading-none"
        >
          <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface/95 shadow-card backdrop-blur-sm" />
          <Heart className={cn('relative z-10 h-5 w-5', favorite ? 'fill-error text-error' : '')} />
        </button>
      </div>
      <Link to={`/ilan/${ad.id}`} className="mt-2 block">
        <div className="line-clamp-2 min-h-10 text-sm font-bold leading-5">{ad.title}</div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-sm font-extrabold text-primary">{formatPrice(ad.price)}</span>
          <span className="truncate text-[11px] font-medium text-muted">{ad.location}</span>
        </div>
        <div className="mt-1 truncate text-xs text-muted">{ad.seller_full_name}</div>
        <div className="mt-1 text-[11px] font-semibold text-muted">{categoryLabels[ad.category]}</div>
      </Link>
      {onAddCart ? (
        <Button
          variant={inCart ? 'tonal' : 'primary'}
          className="mt-3 h-10 min-h-10 w-full rounded-sm px-3"
          onClick={() => onAddCart(ad.id)}
        >
          <ShoppingCart className="h-4 w-4" />
          {inCart ? 'Sepette' : 'Sepete Ekle'}
        </Button>
      ) : null}
    </article>
  );
}
