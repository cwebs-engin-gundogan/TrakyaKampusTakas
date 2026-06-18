import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, Calendar, Heart, MapPin, MessageCircle, Pencil, Tag } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState, ErrorState } from '../components/ui/StateBlocks';
import { useAppState } from '../AppState';
import { apiClient, getApiErrorMessage } from '../lib/api/client';
import { categoryLabels, conditionLabels, cn, formatPrice, formatShortDate, resolveMediaUrl } from '../lib/utils';

export function AdDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isFavorite, toggleFavorite } = useAppState();
  const query = useQuery({ queryKey: ['ad', id], queryFn: () => apiClient.getAd(Number(id)).then((response) => response.data) });
  const favoriteQuery = useQuery({
    queryKey: ['ad-favorite', Number(id)],
    queryFn: async () => {
      try {
        const response = await apiClient.getAdFavoriteStatus(Number(id));
        return response.data;
      } catch {
        return {
          ad_id: Number(id),
          favorite_count: isFavorite(Number(id)) ? 1 : 0,
          is_favorited: isFavorite(Number(id)),
        };
      }
    },
    enabled: Boolean(id),
    retry: false,
  });
  const [active, setActive] = useState(0);

  if (query.isLoading) return <LoadingState />;
  if (!query.data) return <ErrorState message="İlan bulunamadı." />;

  const ad = query.data;
  const own = ad.seller_id === user?.id;
  const image = resolveMediaUrl(ad.image_urls[active] ?? ad.image_urls[0]);
  const favorited = isFavorite(ad.id);
  const favoriteCount = favoriteQuery.data?.favorite_count ?? (favorited ? 1 : 0);
  const handleFavorite = () => {
    const nextIsFavorite = !favorited;
    queryClient.setQueryData(['ad-favorite', ad.id], {
      ad_id: ad.id,
      favorite_count: Math.max(0, favoriteCount + (nextIsFavorite ? 1 : -1)),
      is_favorited: nextIsFavorite,
    });
    toggleFavorite(ad.id);
  };

  return (
    <div>
      <button className="mb-4 hidden items-center gap-2 text-sm font-bold text-muted desktop:flex" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" />
        Keşfet'e dön
      </button>
      <div className="grid gap-6 desktop:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
        <section className="min-w-0">
          <div className="overflow-hidden rounded-card bg-surface shadow-card">
            {image ? <img src={image} alt={ad.title} className="aspect-[4/3] w-full object-cover" /> : null}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {ad.image_urls.map((item, index) => {
              const src = resolveMediaUrl(item);
              return (
                <button
                  key={item}
                  className={cn('h-16 w-20 shrink-0 overflow-hidden rounded-md border-2', active === index ? 'border-primary' : 'border-transparent')}
                  onClick={() => setActive(index)}
                >
                  {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : null}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-card bg-surface p-5 shadow-card">
            <div className="mb-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-extrabold desktop:text-2xl">{ad.title}</h1>
                <div className="mt-2 text-[28px] font-extrabold leading-9 text-primary">{formatPrice(ad.price)}</div>
              </div>
              <div className="flex w-12 shrink-0 flex-col items-center gap-1">
                <button
                  aria-label={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--primary-12)] text-on-surface"
                  onClick={handleFavorite}
                >
                  <Heart className={cn('h-5 w-5', favorited ? 'fill-error text-error' : '')} />
                </button>
                <span className="text-center text-xs font-extrabold leading-none text-muted" aria-label="Beğeni sayısı">
                  {favoriteCount}
                </span>
              </div>
            </div>
            {own ? (
              <Link to={`/ilan/${ad.id}/duzenle`}>
                <Button className="w-full" variant="tonal"><Pencil className="h-4 w-4" /> Düzenle</Button>
              </Link>
            ) : (
              <div className="grid gap-3">
                {/*
                <Button onClick={() => addToCart(ad.id)} variant={inCart(ad.id) ? 'tonal' : 'primary'}>
                  <ShoppingBasket className="h-4 w-4" />
                  {inCart(ad.id) ? 'Sepette' : 'Sepete Ekle'}
                </Button>
                */}
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const response = await apiClient.createConversation(ad.seller_id);
                      navigate(`/mesajlar/${response.data.id}`);
                    } catch (error) {
                      toast.error(getApiErrorMessage(error, 'Sohbet başlatılamadı.'));
                    }
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Mesaj Gönder
                </Button>
              </div>
            )}
            {own ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-[color:var(--primary-07)] p-3 text-sm font-bold text-primary">
                <BadgeCheck className="h-5 w-5" />
                Bu ilan size ait
              </div>
            ) : null}
          </div>

          <InfoCard title="Satıcı">
            <Link to={`/satici/${ad.seller_id}`} className="flex items-center gap-3">
              <Avatar name={ad.seller_full_name} />
              <div>
                <div className="font-bold">{ad.seller_full_name}</div>
                <div className="text-sm text-muted">Doğrulanmış öğrenci</div>
              </div>
            </Link>
          </InfoCard>

          <InfoCard title="Açıklama">
            <p className="text-sm leading-6 text-muted">{ad.description}</p>
          </InfoCard>

          <InfoCard title="Ürün Bilgisi">
            <div className="grid gap-3 text-sm">
              <InfoRow icon={<Tag />} label="Durum" value={conditionLabels[ad.condition]} />
              <InfoRow icon={<Tag />} label="Kategori" value={categoryLabels[ad.category]} />
              <InfoRow icon={<BadgeCheck />} label="Takas" value={ad.is_swap ? 'Evet' : 'Hayır'} />
              <InfoRow icon={<MapPin />} label="Konum" value={ad.location} />
              <InfoRow icon={<Calendar />} label="Tarih" value={formatShortDate(ad.created_at)} />
            </div>
          </InfoCard>
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-surface p-5 shadow-card">
      <h2 className="mb-3 text-base font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--primary-12)] text-primary">
        {icon}
      </span>
      <span className="text-muted">{label}</span>
      <span className="ml-auto font-bold">{value}</span>
    </div>
  );
}
