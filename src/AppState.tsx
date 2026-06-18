import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLocalStorage } from './hooks/useLocalStorage';
import { apiClient, TOKEN_STORAGE_KEY } from './lib/api/client';
import type { AppPreferences, Language, ThemeMode, UserResponse } from './types';

interface AppStateValue {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  userLoading: boolean;
  favorites: number[];
  cart: number[];
  preferences: AppPreferences;
  login: (accessToken: string) => void;
  logout: () => void;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  inCart: (id: number) => boolean;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setNotifications: (enabled: boolean) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => window.localStorage.getItem(TOKEN_STORAGE_KEY));
  const [favorites, setFavorites] = useLocalStorage<number[]>('ktn_favorites', []);
  const [cart, setCart] = useLocalStorage<number[]>('ktn_cart', []);
  const [preferences, setPreferences] = useLocalStorage<AppPreferences>('ktn_preferences', {
    theme: 'light',
    language: 'tr',
    notifications: false,
  });

  const userQuery = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.me().then((response) => response.data),
    enabled: Boolean(token),
    retry: false,
  });
  const cartAdsQuery = useQuery({
    queryKey: ['ads', 'cart-sync'],
    queryFn: () => apiClient.listAds().then((response) => response.data),
    enabled: Boolean(token) && cart.length > 0,
    retry: false,
    staleTime: 30_000,
  });

  const setAuthToken = useCallback((nextToken: string | null) => {
    if (nextToken) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setTokenState(nextToken);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    document.documentElement.style.colorScheme = preferences.theme;
  }, [preferences.theme]);

  useEffect(() => {
    const handler = () => {
      setAuthToken(null);
      queryClient.removeQueries({ queryKey: ['user'] });
      toast.error('Oturum süreniz doldu veya giriş yapmadınız.');
    };
    window.addEventListener('ktn:unauthorized', handler);
    return () => window.removeEventListener('ktn:unauthorized', handler);
  }, [queryClient, setAuthToken]);

  useEffect(() => {
    if (!cartAdsQuery.data || cart.length === 0) return;
    const validAdIds = new Set(cartAdsQuery.data.map((ad) => ad.id));
    setCart((prev) => {
      const seen = new Set<number>();
      const next = prev.filter((id) => {
        if (!validAdIds.has(id) || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      return next.length === prev.length && next.every((id, index) => id === prev[index]) ? prev : next;
    });
  }, [cart, cartAdsQuery.data, setCart]);

  const value = useMemo<AppStateValue>(() => ({
    user: userQuery.data ?? null,
    token,
    isAuthenticated: Boolean(token),
    userLoading: Boolean(token) && userQuery.isLoading,
    favorites,
    cart,
    preferences,
    login: (accessToken) => {
      setAuthToken(accessToken);
      void queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      toast.success('Giriş başarılı');
    },
    logout: () => {
      setAuthToken(null);
      queryClient.clear();
      toast.info('Çıkış yapıldı');
    },
    toggleFavorite: (id) => {
      setFavorites((prev) => {
        const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
        toast.success(next.includes(id) ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
        return next;
      });
    },
    isFavorite: (id) => favorites.includes(id),
    addToCart: (id) => {
      setCart((prev) => {
        if (prev.includes(id)) {
          toast.info('Zaten sepette');
          return prev;
        }
        toast.success('Sepete eklendi');
        return [...prev, id];
      });
    },
    removeFromCart: (id) => {
      setCart((prev) => prev.filter((item) => item !== id));
      toast.success('Sepetten kaldırıldı');
    },
    inCart: (id) => cart.includes(id),
    setTheme: (theme) => setPreferences((prev) => ({ ...prev, theme })),
    setLanguage: (language) => setPreferences((prev) => ({ ...prev, language })),
    setNotifications: (enabled) => {
      setPreferences((prev) => ({ ...prev, notifications: enabled }));
      if (enabled && 'Notification' in window) {
        void Notification.requestPermission();
      }
      toast.success(enabled ? 'Bildirimler açıldı' : 'Bildirimler kapatıldı');
    },
  }), [cart, favorites, preferences, queryClient, setAuthToken, setCart, setFavorites, setPreferences, token, userQuery.data, userQuery.isLoading]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
