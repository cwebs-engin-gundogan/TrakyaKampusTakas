import type {
  AdvertisementResponse,
  Conversation,
  MessageResponse,
  Review,
  SellerProfileResponse,
  UserResponse,
} from '../types';

function productImage(label: string, toneA: string, toneB: string, motif: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="520" viewBox="0 0 720 520">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${toneA}"/>
        <stop offset="1" stop-color="${toneB}"/>
      </linearGradient>
      <filter id="s"><feDropShadow dx="0" dy="20" stdDeviation="22" flood-color="#101826" flood-opacity=".18"/></filter>
    </defs>
    <rect width="720" height="520" rx="42" fill="url(#g)"/>
    <circle cx="595" cy="85" r="86" fill="#ffffff" opacity=".24"/>
    <circle cx="90" cy="425" r="115" fill="#ffffff" opacity=".16"/>
    <g filter="url(#s)">
      <rect x="154" y="106" width="412" height="260" rx="34" fill="#F8FAFC" opacity=".92"/>
      <text x="360" y="242" text-anchor="middle" font-family="Segoe UI,Roboto,sans-serif" font-size="92" font-weight="800" fill="#101826">${motif}</text>
    </g>
    <text x="48" y="454" font-family="Segoe UI,Roboto,sans-serif" font-size="42" font-weight="800" fill="#F8FAFC">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const currentUser: UserResponse = {
  id: '6db4578a-e04f-490f-9227-ea2c1c904101',
  full_name: 'Çağla Deniz',
  email: 'cagla.deniz@itu.edu.tr',
  university: 'İstanbul Teknik Üniversitesi',
  phone: '+905321234567',
  city: 'İstanbul',
  avatar_url: null,
  member_since: '2025-09-18T10:30:00.000Z',
  is_email_verified: true,
};

export const sellers: SellerProfileResponse[] = [
  {
    id: '7bd8f5c0-e983-4f72-a399-a55f0d09a621',
    full_name: 'Baran Keser',
    university: 'İstanbul Teknik Üniversitesi',
    city: 'İstanbul',
    avatar_url: null,
    phone: '+905551112233',
    rating: 4.8,
    total_sales: 24,
    total_reviews: 18,
    member_since: '2024-10-12T08:00:00.000Z',
    is_email_verified: true,
    ads: [],
  },
  {
    id: '0b6a1f51-8600-44da-a76b-e6f69f356412',
    full_name: 'Ece Arslan',
    university: 'Boğaziçi Üniversitesi',
    city: 'İstanbul',
    avatar_url: null,
    phone: null,
    rating: 4.6,
    total_sales: 16,
    total_reviews: 11,
    member_since: '2025-01-22T08:00:00.000Z',
    is_email_verified: true,
    ads: [],
  },
  {
    id: 'bb753157-aa73-4038-b0f2-d0bc58e410b1',
    full_name: 'Mina Yılmaz',
    university: 'Marmara Üniversitesi',
    city: 'İstanbul',
    avatar_url: null,
    phone: '+905443334455',
    rating: 4.9,
    total_sales: 31,
    total_reviews: 25,
    member_since: '2023-11-04T08:00:00.000Z',
    is_email_verified: true,
    ads: [],
  },
];

export const ads: AdvertisementResponse[] = [
  {
    id: 101,
    title: 'Casio bilimsel hesap makinesi',
    description: 'Mühendislik derslerinde kullanıldı, tüm fonksiyonları sorunsuz çalışıyor. Kılıfı ve pili dahil.',
    price: 420,
    is_swap: true,
    condition: 'GOOD',
    category: 'STUDENT_ESSENTIALS',
    location: 'İTÜ Ayazağa',
    image_urls: [productImage('Hesap Makinesi', '#2563EB', '#0F766E', 'fx')],
    seller_id: sellers[0].id,
    seller_full_name: sellers[0].full_name,
    created_at: '2026-06-12T09:20:00.000Z',
    is_active: true,
  },
  {
    id: 102,
    title: 'Temiz çizim tableti',
    description: 'Ders notu ve dijital çizim için ideal. Kalemi, kablosu ve kutusu duruyor.',
    price: 1850,
    is_swap: false,
    condition: 'EXCELLENT',
    category: 'ELECTRONICS',
    location: 'Beşiktaş',
    image_urls: [productImage('Çizim Tableti', '#0F766E', '#9FE3D1', '✎')],
    seller_id: sellers[1].id,
    seller_full_name: sellers[1].full_name,
    created_at: '2026-06-10T12:00:00.000Z',
    is_active: true,
  },
  {
    id: 103,
    title: 'Lineer Cebir ders kitabı',
    description: 'Az işaretlenmiş, sayfaları tam. Final öncesi hızlıca elden çıkarıyorum.',
    price: 260,
    is_swap: true,
    condition: 'GOOD',
    category: 'TEXTBOOKS',
    location: 'Kadıköy',
    image_urls: [productImage('Ders Kitabı', '#FF8A7A', '#2563EB', 'A')],
    seller_id: sellers[2].id,
    seller_full_name: sellers[2].full_name,
    created_at: '2026-06-09T16:45:00.000Z',
    is_active: true,
  },
  {
    id: 104,
    title: 'Yurt odası çalışma lambası',
    description: 'Üç renk ışık, kademeli parlaklık. Masaya klipsle sabitleniyor.',
    price: 310,
    is_swap: false,
    condition: 'GOOD',
    category: 'HOUSEHOLD_GOODS',
    location: 'Maslak',
    image_urls: [productImage('Çalışma Lambası', '#1D4ED8', '#CDE7E2', '☼')],
    seller_id: sellers[0].id,
    seller_full_name: sellers[0].full_name,
    created_at: '2026-06-07T14:10:00.000Z',
    is_active: true,
  },
  {
    id: 105,
    title: 'Spor ayakkabı 42 numara',
    description: 'Kampüs içinde birkaç kez giyildi. Tabanı sağlam, temiz teslim edilir.',
    price: 690,
    is_swap: true,
    condition: 'FAIR',
    category: 'CLOTHING',
    location: 'Üsküdar',
    image_urls: [productImage('Spor Ayakkabı', '#0B1220', '#2563EB', '42')],
    seller_id: sellers[1].id,
    seller_full_name: sellers[1].full_name,
    created_at: '2026-06-06T10:00:00.000Z',
    is_active: true,
  },
  {
    id: 106,
    title: 'Yoga matı ve direnç bandı',
    description: 'Mat kalın ve kaydırmaz. Direnç bandı yanında ücretsiz verilecek.',
    price: 380,
    is_swap: false,
    condition: 'EXCELLENT',
    category: 'SPORTS',
    location: 'Göztepe Kampüsü',
    image_urls: [productImage('Yoga Seti', '#0F766E', '#FF8A7A', '●')],
    seller_id: sellers[2].id,
    seller_full_name: sellers[2].full_name,
    created_at: '2026-06-04T11:35:00.000Z',
    is_active: true,
  },
  {
    id: 107,
    title: 'Mini buzdolabı',
    description: 'Yurt odası için uygun. Sesi düşük, rafları sağlam. Taşıma alıcıya ait.',
    price: 2450,
    is_swap: false,
    condition: 'GOOD',
    category: 'HOUSEHOLD_GOODS',
    location: 'Sarıyer',
    image_urls: [productImage('Mini Buzdolabı', '#9FE3D1', '#1D4ED8', '▥')],
    seller_id: sellers[0].id,
    seller_full_name: sellers[0].full_name,
    created_at: '2026-06-02T18:15:00.000Z',
    is_active: true,
  },
  {
    id: 108,
    title: 'Kulak üstü bluetooth kulaklık',
    description: 'Şarjı uzun gidiyor, mikrofonu online dersler için yeterli. Çantası mevcut.',
    price: 980,
    is_swap: true,
    condition: 'FAIR',
    category: 'ELECTRONICS',
    location: 'Levent',
    image_urls: [productImage('Kulaklık', '#FF8A7A', '#0B1220', '♫')],
    seller_id: sellers[1].id,
    seller_full_name: sellers[1].full_name,
    created_at: '2026-06-01T08:25:00.000Z',
    is_active: true,
  },
];

sellers.forEach((seller) => {
  seller.ads = ads.filter((ad) => ad.seller_id === seller.id);
});

export const myAds: AdvertisementResponse[] = [
  {
    id: 201,
    title: 'Mimarlık maket bıçağı seti',
    description: 'Yedek uçlarıyla birlikte, temiz kullanıldı.',
    price: 190,
    is_swap: true,
    condition: 'GOOD',
    category: 'STUDENT_ESSENTIALS',
    location: 'İTÜ Taşkışla',
    image_urls: [productImage('Maket Seti', '#2563EB', '#FF8A7A', 'X')],
    seller_id: currentUser.id,
    seller_full_name: currentUser.full_name,
    created_at: '2026-06-14T13:10:00.000Z',
    is_active: true,
  },
];

export const conversations: Conversation[] = [
  {
    id: 1,
    user1_id: currentUser.id,
    user2_id: sellers[0].id,
    target_user_id: sellers[0].id,
    participant_name: sellers[0].full_name,
    participant_image_url: sellers[0].avatar_url,
    last_message: 'Saat 17.00 gibi kütüphane önünde olabilir.',
    last_message_timestamp: '14:30',
    unread_count: 2,
    is_online: true,
  },
  {
    id: 2,
    user1_id: currentUser.id,
    user2_id: sellers[1].id,
    target_user_id: sellers[1].id,
    participant_name: sellers[1].full_name,
    participant_image_url: sellers[1].avatar_url,
    last_message: 'Çizim tableti için pazarlık olur mu?',
    last_message_timestamp: 'Dün',
    unread_count: 0,
    is_online: false,
  },
];

export const messages: MessageResponse[] = [
  {
    id: 1,
    conversation_id: 1,
    sender_id: sellers[0].id,
    text: 'Merhaba, hesap makinesi hala duruyor.',
    timestamp: '2026-06-18T11:12:00.000Z',
    status: 'READ',
    attachment_url: null,
    attachment_type: null,
  },
  {
    id: 2,
    conversation_id: 1,
    sender_id: currentUser.id,
    text: 'Süper. Bugün kampüste müsün?',
    timestamp: '2026-06-18T11:14:00.000Z',
    status: 'READ',
    attachment_url: null,
    attachment_type: null,
  },
  {
    id: 3,
    conversation_id: 1,
    sender_id: sellers[0].id,
    text: 'Saat 17.00 gibi kütüphane önünde olabilir.',
    timestamp: '2026-06-18T11:16:00.000Z',
    status: 'DELIVERED',
    attachment_url: null,
    attachment_type: null,
  },
  {
    id: 4,
    conversation_id: 2,
    sender_id: currentUser.id,
    text: 'Çizim tableti için pazarlık olur mu?',
    timestamp: '2026-06-17T18:30:00.000Z',
    status: 'SENT',
    attachment_url: null,
    attachment_type: null,
  },
];

export const reviews: Review[] = [
  {
    id: 1,
    seller_id: sellers[0].id,
    author_name: 'Deniz K.',
    rating: 5,
    text: 'Ürünü anlattığı gibi teslim etti, iletişimi hızlıydı.',
    created_at: '2026-05-28T09:00:00.000Z',
  },
  {
    id: 2,
    seller_id: sellers[0].id,
    author_name: 'Aylin S.',
    rating: 4,
    text: 'Kampüs içinde buluşmak çok pratik oldu.',
    created_at: '2026-05-11T09:00:00.000Z',
  },
  {
    id: 3,
    seller_id: sellers[2].id,
    author_name: 'Kerem T.',
    rating: 5,
    text: 'Kitaplar temizdi, fiyatı da makuldü.',
    created_at: '2026-04-21T09:00:00.000Z',
  },
];

export const cityOptions = ['İstanbul', 'Ankara', 'İzmir', 'Eskişehir', 'Bursa', 'Antalya', 'Kocaeli'];
