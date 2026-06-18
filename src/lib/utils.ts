import type { AdvertisementResponse, CategoryEnum, ConditionEnum } from '../types';

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const categoryLabels: Record<CategoryEnum, string> = {
  HOUSEHOLD_GOODS: 'Ev Eşyaları',
  TEXTBOOKS: 'Ders Kitapları',
  STUDENT_ESSENTIALS: 'Öğrenci İhtiyaçları',
  ELECTRONICS: 'Elektronik',
  CLOTHING: 'Giyim',
  SPORTS: 'Spor',
  OTHER: 'Diğer',
};

export const conditionLabels: Record<ConditionEnum, string> = {
  EXCELLENT: 'Yeni',
  GOOD: 'İyi',
  FAIR: 'Orta',
  POOR: 'Kötü',
  DAMAGED: 'Hasarlı',
};

export function formatPrice(value: number) {
  const formatted = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
  return `${formatted} TL`;
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('tr-TR'))
    .join('');
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date));
}

export function formatMemberSince(date: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function filterAds(ads: AdvertisementResponse[], filters: {
  q?: string;
  category?: string;
  condition?: string;
  min_price?: string;
  max_price?: string;
  is_swap?: string;
}) {
  const q = filters.q?.trim().toLocaleLowerCase('tr-TR') ?? '';
  const min = filters.min_price ? Number(filters.min_price) : null;
  const max = filters.max_price ? Number(filters.max_price) : null;

  return ads.filter((ad) => {
    const matchesText = !q || [ad.title, ad.description, ad.location, ad.seller_full_name]
      .join(' ')
      .toLocaleLowerCase('tr-TR')
      .includes(q);
    const matchesCategory = !filters.category || filters.category === 'ALL' || ad.category === filters.category;
    const matchesCondition = !filters.condition || filters.condition === 'ALL' || ad.condition === filters.condition;
    const matchesMin = min === null || ad.price >= min;
    const matchesMax = max === null || ad.price <= max;
    const matchesSwap = !filters.is_swap || filters.is_swap === 'ALL' || String(ad.is_swap) === filters.is_swap;
    return matchesText && matchesCategory && matchesCondition && matchesMin && matchesMax && matchesSwap;
  });
}
