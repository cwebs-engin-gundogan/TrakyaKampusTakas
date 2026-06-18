import { Outlet } from 'react-router-dom';
import { Store } from 'lucide-react';

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-on-background">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 desktop:grid-cols-[1fr_440px] desktop:items-center">
          <section className="hidden desktop:block">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-auth bg-primary text-on-primary shadow-fab">
              <Store className="h-11 w-11" />
            </div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight">
              Kampüs içinde güvenli, hızlı ve sıcak ikinci el alışveriş.
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted">
              Yalnızca .edu.tr doğrulamalı öğrenciler. İlanı gör, mesaj at, kampüste buluş.
            </p>
          </section>
          <Outlet />
        </div>
      </div>
    </main>
  );
}
