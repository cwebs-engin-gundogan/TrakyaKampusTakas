# Trakya Kampüs Takas — Web

Kampüs içi ikinci el alışveriş ve takas platformunun **React web arayüzü**. Yalnızca `.edu.tr` uzantılı e-postayla kayıt olunabilen, öğrenciden öğrenciye ilan, mesajlaşma ve takas uygulamasının mobil uygulamayla aynı tasarım diline sahip web sürümüdür.

## Özellikler

- **Keşfet / arama / filtre** (kategori, durum, fiyat, takasa açık)
- **İlan ekleme, düzenleme, silme** (çoklu fotoğraf yükleme)
- **Gerçek zamanlı mesajlaşma** (WebSocket)
- **Satıcı profilleri**, favoriler ve sepet
- **Açık / koyu tema**, TR/EN, masaüstü + mobil web duyarlı tasarım

## Teknolojiler

Vite · React 18 · TypeScript · Tailwind CSS · React Router · TanStack Query · Axios · React Hook Form + Zod · lucide-react · sonner

## Kurulum

```bash
npm install
npm run dev      # http://localhost:3001
```

## Backend bağlantısı

Geliştirme sunucusu, tarayıcı isteklerini Vite proxy ile backend'e iletir (böylece CORS sorunu olmaz). Varsayılan hedef **canlı sunucudur**.

Yerel backend'e bağlanmak için proje köküne bir `.env` dosyası ekle:

```
BACKEND_ORIGIN=http://localhost:8000
```

> `VITE_API_BASE_URL` / `VITE_WS_BASE_URL` değişkenlerini yalnızca frontend'i proxy'siz (kendi domaininde) yayınlarken ve backend'de CORS açıkken doldur.

## Komutlar

```bash
npm run dev       # geliştirme sunucusu
npm run build     # üretim derlemesi (tsc + vite build)
npm run preview   # derlenmiş çıktıyı önizle
npm run lint      # ESLint
```
