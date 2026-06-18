import { useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AuthLayout } from './components/layout/AuthLayout';
import { LoginPage, RegisterPage, ForgotPage, OnboardingPage } from './pages/AuthPages';
import { DiscoverPage } from './pages/DiscoverPage';
import { AdDetailPage } from './pages/AdDetailPage';
import { AdFormPage } from './pages/AdFormPage';
import { MyAdsPage } from './pages/MyAdsPage';
import { SellerPage } from './pages/SellerPage';
import { MessagesPage } from './pages/MessagesPage';
import { BasketPage } from './pages/BasketPage';
import { AccountPage, ProfilePage } from './pages/ProfilePages';
import { useAppState } from './AppState';
import { LoadingState } from './components/ui/StateBlocks';

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/giris" element={<LoginPage />} />
          <Route path="/kayit" element={<RegisterPage />} />
          <Route path="/sifremi-unuttum" element={<ForgotPage />} />
        </Route>
        <Route element={<ProtectedShell />}>
          <Route path="/kesfet" element={<DiscoverPage />} />
          <Route path="/favorilerim" element={<DiscoverPage favoritesOnly />} />
          <Route path="/ilan-ekle" element={<AdFormPage />} />
          <Route path="/ilanlarim" element={<MyAdsPage />} />
          <Route path="/ilan/:id" element={<AdDetailPage />} />
          <Route path="/ilan/:id/duzenle" element={<AdFormPage edit />} />
          <Route path="/satici/:id" element={<SellerPage />} />
          <Route path="/mesajlar" element={<MessagesPage />} />
          <Route path="/mesajlar/:id" element={<MessagesPage />} />
          <Route path="/sepet" element={<BasketPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/profil/hesap-bilgileri" element={<AccountPage />} />
        </Route>
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/kesfet" replace />} />
      </Routes>
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function ProtectedShell() {
  const { isAuthenticated, user, userLoading } = useAppState();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/giris" replace state={{ from: location }} />;
  if (userLoading) {
    return (
      <main className="min-h-screen bg-background text-on-background">
        <LoadingState label="Oturum bilgileri yükleniyor..." />
      </main>
    );
  }
  if (!user) return <Navigate to="/giris" replace />;
  return <AppShell />;
}

function RootRedirect() {
  const { isAuthenticated } = useAppState();
  return <Navigate to={isAuthenticated ? '/kesfet' : '/giris'} replace />;
}
