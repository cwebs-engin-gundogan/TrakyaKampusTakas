import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Phone, Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Avatar } from '../components/ui/Avatar';
import { ErrorState, LoadingState } from '../components/ui/StateBlocks';
import { SellerAdCard } from '../components/SellerAdCard';
import { reviews } from '../data/mockData';
import { apiClient } from '../lib/api/client';
import { formatMemberSince } from '../lib/utils';

export function SellerPage() {
  const { id } = useParams();
  const sellerQuery = useQuery({ queryKey: ['seller', id], queryFn: () => apiClient.seller(String(id)).then((response) => response.data) });
  const reviewQuery = useQuery({ queryKey: ['reviews', id], queryFn: () => Promise.resolve(reviews.filter((review) => review.seller_id === id)) });

  if (sellerQuery.isLoading) return <LoadingState />;
  if (!sellerQuery.data) return <ErrorState message="Satıcı bulunamadı." />;

  const seller = sellerQuery.data;
  return (
    <div className="space-y-5">
      <section className="rounded-auth bg-surface p-6 text-center shadow-card">
        <div className="flex justify-center"><Avatar name={seller.full_name} src={seller.avatar_url} size={96} /></div>
        <h1 className="mt-4 text-2xl font-extrabold">{seller.full_name}</h1>
        <div className="mt-1 text-sm text-muted">{seller.university}</div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-pill bg-[color:var(--primary-12)] px-4 py-2 text-sm font-bold text-primary">
          <BadgeCheck className="h-4 w-4" /> {seller.is_email_verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
        </div>
        <div className="mt-6 grid grid-cols-3 divide-x divide-[color:var(--outline-variant)]/60">
          <Stat value={seller.rating.toFixed(1)} label="Puan" />
          <Stat value={seller.total_sales} label="Satış" />
          <Stat value={seller.total_reviews} label="Yorum" />
        </div>
      </section>

      <div className="grid gap-5 desktop:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-card bg-surface p-5 shadow-card">
            <h2 className="mb-3 font-extrabold">İletişim Bilgileri</h2>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-5 w-5 text-primary" />
              <span>{seller.phone ?? 'Telefon mevcut değil'}</span>
            </div>
            <div className="mt-3 text-sm text-muted">Üye: {formatMemberSince(seller.member_since)}</div>
          </section>
        </aside>

        <section className="space-y-5">
          <SectionTitle title="İlanlar" count={seller.ads.length} />
          <div className="flex gap-3 overflow-x-auto pb-2 desktop:grid desktop:grid-cols-3 desktop:overflow-visible">
            {seller.ads.map((ad) => <SellerAdCard key={ad.id} ad={ad} />)}
          </div>

          <SectionTitle title="Yorumlar" count={reviewQuery.data?.length ?? 0} />
          <div className="space-y-3">
            {(reviewQuery.data ?? []).map((review) => (
              <article key={review.id} className="rounded-card bg-surface p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <Avatar name={review.author_name} size={40} />
                  <div className="font-bold">{review.author_name}</div>
                  <div className="ml-auto flex text-tertiary">
                    {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" opacity={index < review.rating ? 1 : 0.25} />)}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{review.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="text-xl font-extrabold text-primary">{value}</div>
      <div className="text-xs font-semibold text-muted">{label}</div>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-base font-extrabold">{title}</h2>
      <span className="rounded-pill bg-[color:var(--primary-12)] px-3 py-1 text-xs font-bold text-primary">{count}</span>
    </div>
  );
}
