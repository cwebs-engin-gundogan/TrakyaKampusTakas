import { Bell, ChevronRight, HelpCircle, Languages, LogOut, Moon, Shield, Sun, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { cityOptions } from '../data/mockData';
import { useAppState } from '../AppState';
import { apiClient, getApiErrorMessage } from '../lib/api/client';
import { LoadingState } from '../components/ui/StateBlocks';

export function ProfilePage() {
  const { user, preferences, setTheme, setLanguage, setNotifications, logout } = useAppState();
  const navigate = useNavigate();
  if (!user) return <LoadingState label="Profil yükleniyor..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="text-center">
        <div className="flex justify-center"><Avatar name={user.full_name} src={user.avatar_url} size={108} /></div>
        <h1 className="mt-4 text-2xl font-extrabold">{user.full_name}</h1>
        <p className="text-sm text-muted">{user.email}</p>
      </section>

      <SettingsCard title="Tercihler">
        <SwitchRow
          icon={preferences.theme === 'dark' ? Moon : Sun}
          label="Tema"
          value={preferences.theme === 'dark'}
          onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
        <button
          className="flex h-14 w-full items-center gap-3 px-4 text-left"
          onClick={() => setLanguage(preferences.language === 'tr' ? 'en' : 'tr')}
        >
          <Languages className="h-5 w-5 text-primary" />
          <span className="font-bold">Diller ({preferences.language === 'tr' ? 'Türkçe' : 'English'})</span>
          <ChevronRight className="ml-auto h-5 w-5 text-muted" />
        </button>
        <SwitchRow icon={Bell} label="Bildirimler" value={preferences.notifications} onChange={setNotifications} />
      </SettingsCard>

      <SettingsCard title="Hesap">
        <MenuRow icon={UserRound} label="Hesap Bilgileri" to="/profil/hesap-bilgileri" />
        <MenuRow icon={Shield} label="Gizlilik ve Güvenlik" onClick={() => toast.info('Yakında')} />
        <MenuRow icon={HelpCircle} label="Yardım ve Destek" onClick={() => toast.info('Yakında')} />
        <button
          className="flex h-14 w-full items-center gap-3 px-4 text-left text-error"
          onClick={() => {
            logout();
            navigate('/giris');
          }}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-bold">Çıkış Yap</span>
        </button>
      </SettingsCard>
    </div>
  );
}

const accountSchema = z.object({
  phone: z.string().regex(/^\+905[0-9]{9}$/, '+905XXXXXXXXX formatında olmalı'),
  city: z.string().min(1, 'Şehir seç'),
});

type AccountValues = z.infer<typeof accountSchema>;

export function AccountPage() {
  const { user } = useAppState();
  const queryClient = useQueryClient();
  const form = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { phone: user?.phone ?? '+905', city: user?.city ?? 'İstanbul' },
  });
  if (!user) return <LoadingState label="Hesap bilgileri yükleniyor..." />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 hidden text-2xl font-extrabold desktop:block">Hesap Bilgileri</h1>
      <form
        className="space-y-5 rounded-auth bg-surface p-6 shadow-card"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await apiClient.updateMe(values);
            await queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
            toast.success('Profil başarıyla güncellendi');
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Profil güncellenemedi.'));
          }
        })}
      >
        <div className="text-center">
          <div className="flex justify-center"><Avatar name={user.full_name} src={user.avatar_url} size={96} /></div>
          <label className="mt-3 inline-flex cursor-pointer">
            <span className="inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-bold text-primary transition hover:bg-[color:var(--primary-12)]">
              Fotoğrafı Değiştir
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  await apiClient.uploadAvatar(file);
                  await queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
                  toast.success('Profil fotoğrafı güncellendi');
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Profil fotoğrafı yüklenemedi.'));
                }
              }}
            />
          </label>
        </div>
        <Field label="Telefon Numarası" error={form.formState.errors.phone?.message}>
          <input {...form.register('phone')} className="form-input" placeholder="+905XXXXXXXXX" />
        </Field>
        <Field label="Üniversite">
          <input value={user.university} readOnly className="form-input opacity-75" />
        </Field>
        <Field label="Şehir" error={form.formState.errors.city?.message}>
          <select {...form.register('city')} className="form-input">
            {cityOptions.map((city) => <option key={city}>{city}</option>)}
          </select>
        </Field>
        <Button className="h-14 w-full rounded-lg" loading={form.formState.isSubmitting}>Değişiklikleri Kaydet</Button>
      </form>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-card bg-surface shadow-card">
      <div className="px-4 pt-4 text-sm font-extrabold text-muted">{title}</div>
      <div className="divide-y divide-[color:var(--outline-variant)]/50">{children}</div>
    </section>
  );
}

function SwitchRow({ icon: Icon, label, value, onChange }: { icon: React.ElementType; label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex h-14 items-center gap-3 px-4">
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-bold">{label}</span>
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} className="ml-auto h-5 w-5 accent-primary" />
    </label>
  );
}

function MenuRow({ icon: Icon, label, to, onClick }: { icon: React.ElementType; label: string; to?: string; onClick?: () => void }) {
  const content = (
    <>
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-bold">{label}</span>
      <ChevronRight className="ml-auto h-5 w-5 text-muted" />
    </>
  );
  if (to) return <Link to={to} className="flex h-14 items-center gap-3 px-4">{content}</Link>;
  return <button type="button" className="flex h-14 w-full items-center gap-3 px-4 text-left" onClick={onClick}>{content}</button>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-error">{error}</span> : null}
    </label>
  );
}
