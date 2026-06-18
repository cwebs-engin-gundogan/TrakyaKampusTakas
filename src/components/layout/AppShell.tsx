import {
  ArrowLeft,
  Heart,
  Home,
  List,
  MessageCircle,
  Plus,
  Search,
  ShoppingBasket,
  Store,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../AppState';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { apiClient } from '../../lib/api/client';

const navItems = [
  { to: '/kesfet', label: 'Ana Sayfa', icon: Home },
  { to: '/favorilerim', label: 'Favoriler', icon: Heart },
  { to: '/ilanlarim', label: 'İlanlarım', icon: List },
  { to: '/mesajlar', label: 'Mesajlar', icon: MessageCircle },
  { to: '/profil', label: 'Profil', icon: User },
];

const mobileNavItems = [
  { to: '/kesfet', label: 'Ana Sayfa', icon: Home },
  { to: '/favorilerim', label: 'Favoriler', icon: Heart },
  { to: '/ilan-ekle', label: 'İlan Ekle', icon: Plus, fab: true },
  { to: '/ilanlarim', label: 'İlanlarım', icon: List },
  { to: '/profil', label: 'Profil', icon: User },
];

const mobileTopBarHomeRoutes = new Set(['/kesfet', '/favorilerim', '/ilanlarim', '/profil']);

const titles: Record<string, string> = {
  '/kesfet': 'Keşfet',
  '/favorilerim': 'Favoriler',
  '/ilan-ekle': 'İlan Ekle',
  '/ilanlarim': 'İlanlarım',
  '/mesajlar': 'Mesajlar',
  '/sepet': 'Sepet',
  '/profil': 'Profil',
  '/profil/hesap-bilgileri': 'Hesap Bilgileri',
};

const fallbackUser = {
  full_name: 'Kampüs Kullanıcısı',
  university: 'Üniversite',
  avatar_url: null,
};

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, favorites } = useAppState();
  const conversationsQuery = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () => apiClient.conversations().then((response) => response.data),
  });
  const unread = (conversationsQuery.data ?? []).reduce((total, item) => total + item.unread_count, 0);
  const title = titles[location.pathname] ?? (location.pathname.startsWith('/ilan/') ? 'İlan Detayı' : location.pathname.startsWith('/satici/') ? 'Satıcı Profili' : 'KampüsTakasNoktam');
  const hideMobileBar = location.pathname.startsWith('/mesajlar/');
  const fullBleedMobile = location.pathname.startsWith('/mesajlar/');
  const showMobileHomeIcon = mobileTopBarHomeRoutes.has(location.pathname);

  const goBack = () => {
    const canGoBack = window.history.state && window.history.state.idx > 0;
    if (canGoBack) navigate(-1);
    else navigate('/kesfet');
  };

  // Mobil üst bar: aşağı kaydırırken gizlenir, yukarı kaydırırken görünür.
  const [barHidden, setBarHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 12) setBarHidden(false);
        else if (y > lastY + 6) setBarHidden(true);
        else if (y < lastY - 6) setBarHidden(false);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background desktop:flex">
      <DesktopSidebar />
      <div className="min-w-0 flex-1 desktop:pl-72">
        <header className={cn('sticky top-0 z-30 border-b border-[color:var(--outline-variant)]/50 bg-background/92 backdrop-blur transition-transform duration-300 will-change-transform desktop:hidden', barHidden ? '-translate-y-full' : 'translate-y-0', hideMobileBar ? 'hidden' : '')}>
          <div className="flex h-16 items-center gap-2 px-4">
            <div className="flex items-center gap-2">
              {showMobileHomeIcon ? (
                <Link
                  to="/kesfet"
                  aria-label="Ana sayfa"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary"
                >
                  <Store className="h-5 w-5" />
                </Link>
              ) : (
                <button
                  type="button"
                  aria-label="Geri dön"
                  onClick={goBack}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[color:var(--outline-variant)]/70 bg-surface text-on-surface"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <span className="text-lg font-extrabold">{title}</span>
            </div>
            <div className="flex-1" />
            <IconBadge label="Mesajlar" count={unread} onClick={() => navigate('/mesajlar')}>
              <MessageCircle className="h-5 w-5" />
            </IconBadge>
            <IconBadge label="Sepet" count={cart.length} onClick={() => navigate('/sepet')}>
              <ShoppingBasket className="h-5 w-5" />
            </IconBadge>
          </div>
        </header>

        <DesktopTopbar cartCount={cart.length} favoriteCount={favorites.length} unread={unread} />

        <main
          className={cn(
            'mx-auto w-full max-w-[1280px] desktop:px-8 desktop:py-8',
            fullBleedMobile ? 'px-0 py-0 desktop:safe-bottom' : 'safe-bottom px-4 py-5 tablet:px-6',
          )}
        >
          <Outlet />
        </main>
      </div>
      <FloatingBottomNav />
    </div>
  );
}

function DesktopSidebar() {
  const { user } = useAppState();
  const navigate = useNavigate();
  const displayUser = user ?? fallbackUser;
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[color:var(--outline-variant)]/50 bg-surface p-5 desktop:flex desktop:flex-col">
      <Link to="/kesfet" className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-fab">
          <Store className="h-7 w-7" />
        </div>
        <div>
          <div className="text-lg font-extrabold">KampüsTakas</div>
          <div className="text-xs font-semibold text-muted">Noktam</div>
        </div>
      </Link>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex h-12 items-center gap-3 rounded-lg px-4 text-sm font-bold transition',
                isActive ? 'bg-[color:var(--primary-12)] text-primary' : 'text-on-surface hover:bg-[color:var(--primary-07)]',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Button className="mt-6 h-12 w-full rounded-lg" onClick={() => navigate('/ilan-ekle')}>
        <Plus className="h-5 w-5" />
        İlan Ekle
      </Button>

      <div className="mt-auto rounded-card bg-[color:var(--primary-07)] p-3">
        <Link to="/profil" className="flex items-center gap-3">
          <Avatar name={displayUser.full_name} src={displayUser.avatar_url} />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{displayUser.full_name}</div>
            <div className="truncate text-xs text-muted">{displayUser.university}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function DesktopTopbar({ cartCount, favoriteCount, unread }: { cartCount: number; favoriteCount: number; unread: number }) {
  const { user } = useAppState();
  const navigate = useNavigate();
  const displayUser = user ?? fallbackUser;
  return (
    <header className="sticky top-0 z-30 hidden h-20 border-b border-[color:var(--outline-variant)]/50 bg-background/90 px-8 backdrop-blur desktop:flex desktop:items-center desktop:gap-4">
      <div className="flex h-12 w-full max-w-xl items-center gap-3 rounded-lg border border-[color:var(--primary-35)] bg-surface px-4 text-muted">
        <Search className="h-5 w-5" />
        <span className="text-sm">Ürün, kitap, elektronik ara...</span>
      </div>
      <div className="flex-1" />
      <IconBadge label="Favoriler" count={favoriteCount} onClick={() => navigate('/favorilerim')}>
        <Heart className="h-5 w-5" />
      </IconBadge>
      <IconBadge label="Mesajlar" count={unread} onClick={() => navigate('/mesajlar')}>
        <MessageCircle className="h-5 w-5" />
      </IconBadge>
      <IconBadge label="Sepet" count={cartCount} onClick={() => navigate('/sepet')}>
        <ShoppingBasket className="h-5 w-5" />
      </IconBadge>
      <button type="button" onClick={() => navigate('/profil')} aria-label="Profil">
        <Avatar name={displayUser.full_name} src={displayUser.avatar_url} />
      </button>
    </header>
  );
}

function IconBadge({ children, count, label, onClick }: { children: React.ReactNode; count?: number; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative flex h-11 w-11 items-center justify-center rounded-md border border-[color:var(--outline-variant)]/60 bg-surface text-on-surface shadow-card"
    >
      {children}
      {count ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </button>
  );
}

function FloatingBottomNav() {
  const location = useLocation();
  const visibleRoutes = new Set(['/kesfet', '/favorilerim', '/ilanlarim', '/profil']);
  if (!visibleRoutes.has(location.pathname)) return null;

  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(92vw,390px)] items-center justify-between rounded-pill bg-surface px-2 py-2 shadow-nav desktop:hidden">
      {mobileNavItems.map((item) => {
        const active = location.pathname === item.to || (item.to === '/kesfet' && location.pathname === '/');
        const Icon = item.icon;
        if (item.fab) {
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className="relative -mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-fab transition active:scale-95"
            >
              <Icon className="h-8 w-8" />
            </Link>
          );
        }
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-pill transition',
              active ? 'bg-[color:var(--primary-12)] text-primary' : 'text-on-surface',
            )}
          >
            <Icon className={cn('h-5 w-5 transition', active ? 'scale-110' : '')} />
          </Link>
        );
      })}
    </nav>
  );
}
