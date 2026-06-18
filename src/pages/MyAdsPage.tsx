import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { List, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { EmptyState, LoadingState } from '../components/ui/StateBlocks';
import { apiClient, getApiErrorMessage } from '../lib/api/client';
import { conditionLabels, formatPrice, resolveMediaUrl } from '../lib/utils';

export function MyAdsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['my-ads'], queryFn: () => apiClient.myAds().then((response) => response.data) });

  if (query.isLoading) return <LoadingState />;

  return (
    <section>
      <div className="mb-5 hidden items-center desktop:flex">
        <h1 className="text-2xl font-extrabold">İlanlarım</h1>
        <div className="flex-1" />
        <Link to="/ilan-ekle"><Button><Plus className="h-4 w-4" /> İlan Ekle</Button></Link>
      </div>
      {query.data?.length ? (
        <div className="space-y-3">
          {query.data.map((ad) => {
            const image = resolveMediaUrl(ad.image_urls[0]);
            return (
              <article key={ad.id} className="flex gap-3 rounded-card bg-surface p-3 shadow-card">
                {image ? <img src={image} alt={ad.title} className="h-24 w-24 rounded-md object-cover" /> : null}
                <div className="min-w-0 flex-1">
                  <Link to={`/ilan/${ad.id}`} className="line-clamp-2 font-bold">{ad.title}</Link>
                  <div className="mt-1 text-sm font-extrabold text-primary">{formatPrice(ad.price)}</div>
                  <div className="mt-2 inline-flex rounded-pill bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                    {conditionLabels[ad.condition]} {ad.is_swap ? ' · Takas' : ''}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to={`/ilan/${ad.id}/duzenle`}>
                    <Button
                      variant="icon"
                      aria-label="Düzenle"
                      className="h-11 w-11 rounded-lg border border-[color:var(--primary-35)] bg-background text-primary shadow-card"
                    >
                      <Pencil className="h-5 w-5" strokeWidth={2.75} />
                    </Button>
                  </Link>
                  <Button
                    variant="icon"
                    aria-label="Sil"
                    className="h-11 w-11 rounded-lg border border-[color:var(--outline-variant)]/70 bg-background text-error shadow-card"
                    onClick={async () => {
                      try {
                        await apiClient.deleteAd(ad.id);
                        await queryClient.invalidateQueries({ queryKey: ['my-ads'] });
                        await queryClient.invalidateQueries({ queryKey: ['ads'] });
                        toast.success('İlan silindi');
                      } catch (error) {
                        toast.error(getApiErrorMessage(error, 'İlan silinemedi.'));
                      }
                    }}
                  >
                    <Trash2 className="h-5 w-5" strokeWidth={2.75} />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={List} title="Henüz ilanın yok" description="İlk ilanını oluşturmak için + simgesine dokun" />
      )}
    </section>
  );
}
