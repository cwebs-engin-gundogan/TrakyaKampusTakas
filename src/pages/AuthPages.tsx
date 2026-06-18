import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { useAppState } from '../AppState';
import { apiClient, getApiErrorMessage } from '../lib/api/client';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta gir'),
  password: z.string().min(1, 'Şifre zorunlu'),
});

const registerSchema = loginSchema.extend({
  full_name: z.string().min(3, 'Ad soyad en az 3 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta gir').endsWith('.edu.tr', 'Sadece .edu.tr e-posta kabul edilir'),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginPage() {
  const { login, isAuthenticated } = useAppState();
  const navigate = useNavigate();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  if (isAuthenticated) return <Navigate to="/kesfet" replace />;

  return (
    <AuthCard title="Tekrar hoş geldin" subtitle="Kampüs hesabınla devam et.">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            const response = await apiClient.login({ username: values.email, password: values.password });
            login(response.data.access_token);
            navigate('/kesfet');
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Giriş yapılamadı.'));
          }
        })}
      >
        <TextInput label="E-posta" type="email" autoComplete="username" error={form.formState.errors.email?.message} {...form.register('email')} />
        <TextInput label="Şifre" type="password" autoComplete="current-password" error={form.formState.errors.password?.message} {...form.register('password')} />
        <div className="flex justify-end">
          <Link to="/sifremi-unuttum" className="text-sm font-bold text-primary">Şifremi unuttum</Link>
        </div>
        <Button className="h-14 w-full rounded-lg" loading={form.formState.isSubmitting}>Giriş yap</Button>
      </form>
      <Link to="/kayit" className="mt-5 block text-center text-sm font-bold text-primary">Hesabın yok mu? Kayıt ol</Link>
    </AuthCard>
  );
}

export function RegisterPage() {
  const { login, isAuthenticated } = useAppState();
  const navigate = useNavigate();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', password: '' },
  });

  if (isAuthenticated) return <Navigate to="/kesfet" replace />;

  return (
    <AuthCard title="Hesabını oluştur" subtitle=".edu.tr e-postan üniversiteni otomatik belirler.">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await apiClient.register(values);
            const response = await apiClient.login({ username: values.email, password: values.password });
            login(response.data.access_token);
            toast.success('Kayıt oluşturuldu');
            navigate('/kesfet');
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Kayıt oluşturulamadı.'));
          }
        })}
      >
        <TextInput label="Ad Soyad" autoComplete="name" error={form.formState.errors.full_name?.message} {...form.register('full_name')} />
        <TextInput label="E-posta" type="email" autoComplete="username" error={form.formState.errors.email?.message} {...form.register('email')} />
        <TextInput label="Şifre" type="password" autoComplete="new-password" error={form.formState.errors.password?.message} {...form.register('password')} />
        <Button className="h-14 w-full rounded-lg" loading={form.formState.isSubmitting}>Kayıt ol</Button>
      </form>
      <Link to="/giris" className="mt-5 block text-center text-sm font-bold text-primary">Girişe dön</Link>
    </AuthCard>
  );
}

export function ForgotPage() {
  const form = useForm<{ email: string }>({ defaultValues: { email: '' } });
  const navigate = useNavigate();
  return (
    <AuthCard title="Şifre sıfırla" subtitle="Bu özellik backend’de yok; web’de yakında davranışı gösterilir.">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(() => {
          toast.info('Şifre sıfırlama bağlantısı yakında gönderilebilecek.');
          navigate('/giris');
        })}
      >
        <TextInput label="E-posta" type="email" {...form.register('email')} />
        <Button className="h-14 w-full rounded-lg">Sıfırlama bağlantısı gönder</Button>
      </form>
      <Link to="/giris" className="mt-5 block text-center text-sm font-bold text-primary">Girişe dön</Link>
    </AuthCard>
  );
}

export function OnboardingPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-on-background">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col justify-center gap-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-auth bg-primary text-on-primary shadow-fab">
          <Store className="h-11 w-11" />
        </div>
        <div>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight desktop:text-5xl">Kampüs içinde al, sat, takas et.</h1>
          <p className="mt-4 max-w-2xl text-muted">Güvenli .edu.tr topluluğu, hızlı mesajlaşma ve kampüs buluşmalarıyla mobil uygulamanın web karşılığı.</p>
        </div>
        <div className="grid gap-4 tablet:grid-cols-3">
          {['Doğrulanmış öğrenciler', 'Kart merkezli keşif', 'Gerçek zamanlı sohbet'].map((item, index) => (
            <div key={item} className="rounded-card bg-surface p-5 shadow-card">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary-12)] font-extrabold text-primary">{index + 1}</div>
              <div className="font-bold">{item}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Link to="/giris"><Button className="h-12 rounded-lg">Giriş yap</Button></Link>
          <Link to="/kayit"><Button variant="outline" className="h-12 rounded-lg">Kayıt ol</Button></Link>
        </div>
      </div>
    </main>
  );
}

function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-[440px] rounded-auth bg-surface p-6 shadow-card tablet:p-8">
      <div className="mb-7 flex justify-center desktop:hidden">
        <div className="flex h-16 w-16 items-center justify-center rounded-auth bg-primary text-on-primary shadow-fab">
          <Store className="h-9 w-9" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold leading-8">{title}</h2>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }>(
  function TextInput({ label, error, ...props }, ref) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <input
        ref={ref}
        className="h-[52px] w-full rounded-[18px] border border-[color:var(--primary-35)] bg-background px-4 text-sm outline-none focus:border-primary"
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-semibold text-error">{error}</span> : null}
    </label>
  );
});
