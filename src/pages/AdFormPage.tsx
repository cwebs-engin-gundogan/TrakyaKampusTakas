import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { FilterChip } from '../components/ui/FilterChip';
import { apiClient, getApiErrorMessage } from '../lib/api/client';
import { categoryLabels, conditionLabels, resolveMediaUrl } from '../lib/utils';
import type { CategoryEnum, ConditionEnum } from '../types';

const categories = Object.keys(categoryLabels) as CategoryEnum[];
const conditions = Object.keys(conditionLabels) as ConditionEnum[];
const supportedImageMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']);
const webpConvertibleMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png']);
const supportedImageExtensionPattern = /\.(jpe?g|png|webp|gif|heic|heif)$/i;

function isSupportedImageFile(file: File) {
  return supportedImageMimeTypes.has(file.type) || supportedImageExtensionPattern.test(file.name);
}

function getFileBaseName(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Gorsel okunamadi.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Gorsel hazirlanamadi.'));
    image.src = dataUrl;
  });
}

async function prepareImageFile(file: File) {
  if (!webpConvertibleMimeTypes.has(file.type)) return file;

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext('2d');

  if (!context || !canvas.width || !canvas.height) return file;

  context.drawImage(image, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value);
      else reject(new Error('WEBP dosyasi olusturulamadi.'));
    }, 'image/webp', 0.9);
  });

  return new File([blob], `${getFileBaseName(file.name)}.webp`, {
    type: 'image/webp',
    lastModified: file.lastModified,
  });
}

const schema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı'),
  price: z.coerce.number().min(0, 'Fiyat negatif olamaz'),
  is_swap: z.boolean(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  category: z.enum(['HOUSEHOLD_GOODS', 'TEXTBOOKS', 'STUDENT_ESSENTIALS', 'ELECTRONICS', 'CLOTHING', 'SPORTS', 'OTHER']),
  location: z.string().min(2, 'Konum zorunlu'),
});

type AdFormValues = z.infer<typeof schema>;

export function AdFormPage({ edit = false }: { edit?: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const query = useQuery({
    queryKey: ['ad-form', id],
    queryFn: () => apiClient.getAd(Number(id)).then((response) => response.data),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const form = useForm<AdFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      is_swap: false,
      condition: 'GOOD',
      category: 'STUDENT_ESSENTIALS',
      location: '',
    },
  });

  useEffect(() => {
    if (query.data && edit) {
      form.reset({
        title: query.data.title,
        description: query.data.description,
        price: query.data.price,
        is_swap: query.data.is_swap,
        condition: query.data.condition,
        category: query.data.category,
        location: query.data.location,
      });
      setExistingImages(query.data.image_urls ?? []);
      setFiles([]);
    }
  }, [edit, form, query.data]);

  const filePreviews = useMemo(
    () =>
      files.map((file, index) => ({
        file,
        index,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => () => {
    filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [filePreviews]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 hidden text-2xl font-extrabold desktop:block">{edit ? 'İlanı Düzenle' : 'İlan Ekle'}</h1>
      <form
        className="space-y-5 rounded-auth bg-surface p-5 shadow-card tablet:p-7"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            if (edit && id) {
              const adId = Number(id);
              let response = await apiClient.updateAd(adId, { ...values, image_urls: existingImages });
              if (files.length) response = await apiClient.uploadAdImages(adId, files);
              queryClient.setQueryData(['ad-form', id], response.data);
              queryClient.setQueryData(['ad', id], response.data);
              toast.success('İlan güncellendi');
            } else {
              const created = await apiClient.createAd({ ...values, image_urls: [] });
              if (files.length) await apiClient.uploadAdImages(created.data.id, files);
              toast.success('İlan yayınlandı');
            }
            await queryClient.invalidateQueries({ queryKey: ['ads'] });
            await queryClient.invalidateQueries({ queryKey: ['my-ads'] });
            await queryClient.invalidateQueries({ queryKey: ['ad-form', id] });
            await queryClient.invalidateQueries({ queryKey: ['ad', id] });
            navigate('/ilanlarim');
          } catch (error) {
            toast.error(getApiErrorMessage(error, edit ? 'İlan güncellenemedi.' : 'İlan oluşturulamadı.'));
          }
        })}
      >
        <section>
          <div className="mb-2 text-sm font-bold">Fotoğraflar</div>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-primary bg-[color:var(--primary-12)] text-primary">
              <ImagePlus className="h-8 w-8" />
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
                multiple
                className="sr-only"
                onChange={async (event) => {
                  const selectedFiles = Array.from(event.target.files ?? []);
                  event.target.value = '';
                  const imageFiles = selectedFiles.filter(isSupportedImageFile);
                  if (imageFiles.length !== selectedFiles.length) {
                    toast.error('Desteklenmeyen dosyalar eklenmedi. JPG, PNG, WEBP, GIF, HEIC veya HEIF yukleyebilirsin.');
                  }
                  if (imageFiles.length) {
                    try {
                      const preparedFiles = await Promise.all(imageFiles.map(prepareImageFile));
                      setFiles((prev) => [...prev, ...preparedFiles]);
                    } catch {
                      toast.error('Bazi gorseller WEBP formatina cevrilemedi, orijinal dosya eklendi.');
                      setFiles((prev) => [...prev, ...imageFiles]);
                    }
                  }
                }}
              />
            </label>
            {existingImages.map((image, index) => (
              <div key={image} className="relative aspect-square overflow-hidden rounded-lg bg-background">
                <img src={resolveMediaUrl(image) ?? image} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/80 text-white shadow-card ring-1 ring-white/15 backdrop-blur-sm hover:bg-black/90"
                  aria-label="Fotoğrafı kaldır"
                  onClick={() => setExistingImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <X className="h-5 w-5" strokeWidth={2.75} />
                </button>
              </div>
            ))}
            {filePreviews.map(({ file, index, url }) => (
              <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="relative aspect-square overflow-hidden rounded-lg bg-background">
                <img src={url} alt={file.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/80 text-white shadow-card ring-1 ring-white/15 backdrop-blur-sm hover:bg-black/90"
                  aria-label="Seçilen fotoğrafı kaldır"
                  onClick={() => setFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <X className="h-5 w-5" strokeWidth={2.75} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <TextArea label="Başlık" error={form.formState.errors.title?.message}>
          <input {...form.register('title')} placeholder="Ürün adını gir" className="form-input" />
        </TextArea>

        <TextArea label="Açıklama" error={form.formState.errors.description?.message}>
          <textarea {...form.register('description')} placeholder="Ürününü detaylı anlat" rows={5} className="form-input min-h-32 py-3" />
        </TextArea>

        <div className="grid gap-4 tablet:grid-cols-2">
          <TextArea label="Fiyat (TL)" error={form.formState.errors.price?.message}>
            <input {...form.register('price')} inputMode="decimal" className="form-input" />
          </TextArea>
          <TextArea label="Konum" error={form.formState.errors.location?.message}>
            <input {...form.register('location')} placeholder="örn. İstanbul, Kadıköy" className="form-input" />
          </TextArea>
        </div>

        <Controller
          control={form.control}
          name="condition"
          render={({ field }) => (
            <ChipField label="Durum">
              {conditions.map((condition) => (
                <FilterChip key={condition} selected={field.value === condition} onClick={() => field.onChange(condition)}>
                  {conditionLabels[condition]}
                </FilterChip>
              ))}
            </ChipField>
          )}
        />

        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <ChipField label="Kategori">
              {categories.map((category) => (
                <FilterChip key={category} selected={field.value === category} onClick={() => field.onChange(category)}>
                  {categoryLabels[category]}
                </FilterChip>
              ))}
            </ChipField>
          )}
        />

        <Controller
          control={form.control}
          name="is_swap"
          render={({ field }) => (
            <label className="flex h-14 items-center justify-between rounded-lg bg-background px-4">
              <span className="font-bold">Takas</span>
              <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} className="h-5 w-5 accent-primary" />
            </label>
          )}
        />

        <Button className="h-14 w-full rounded-lg" loading={form.formState.isSubmitting}>{edit ? 'Değişiklikleri Kaydet' : 'İlanı yayınla'}</Button>
      </form>
    </div>
  );
}

function TextArea({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-error">{error}</span> : null}
    </label>
  );
}

function ChipField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 text-sm font-bold">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}
