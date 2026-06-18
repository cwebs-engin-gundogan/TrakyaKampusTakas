import { Link } from 'react-router-dom';
import type { AdvertisementResponse } from '../types';
import { formatPrice, resolveMediaUrl } from '../lib/utils';

export function SellerAdCard({ ad }: { ad: AdvertisementResponse }) {
  const image = resolveMediaUrl(ad.image_urls[0]);
  return (
    <Link to={`/ilan/${ad.id}`} className="card-lift block min-w-40 rounded-lg bg-surface p-2 shadow-card desktop:min-w-0">
      {image ? <img src={image} alt={ad.title} className="h-28 w-full rounded-md object-cover" /> : null}
      <div className="mt-2 line-clamp-2 text-sm font-bold">{ad.title}</div>
      <div className="mt-1 text-sm font-extrabold text-primary">{formatPrice(ad.price)}</div>
    </Link>
  );
}
