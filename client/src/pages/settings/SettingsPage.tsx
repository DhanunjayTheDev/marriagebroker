import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Lock, Bell, Shield, Smartphone, Globe, Trash2, Download,
  Moon, Sun, Monitor, LogOut, Loader2, Check, KeyRound,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { profileService } from '../../services/profile.service';
import { accountService, dataExportService, post } from '../../services';
import { useAuth } from '../../providers/AuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { useUIStore } from '../../store';
import { LANGUAGES } from '../../constants';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from '../../components/ui/sheet';
import { cn, formatDate } from '../../lib/utils';
import type { Session } from '../../services/auth.service';

const TABS = [
  { key: 'privacy',       label: 'Privacy',       icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security',      label: 'Security',      icon: Shield },
  { key: 'sessions',      label: 'Devices',       icon: Smartphone },
  { key: 'language',      label: 'Language',      icon: Globe },
  { key: 'account',       label: 'Account',       icon: Trash2 },
];

export const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState('privacy');

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display font-bold text-2xl lg:text-3xl">Settings</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-2 flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                  tab === t.key
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700'
                    : 'text-slate-500 hover:bg-muted',
                )}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-3">
          {tab === 'privacy'       && <PrivacySettings />}
          {tab === 'security'      && <SecuritySettings />}
          {tab === 'sessions'      && <SessionsSettings />}
          {tab === 'language'      && <LanguageSettings />}
          {tab === 'account'       && <AccountSettings />}
          {tab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
};

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-card rounded-2xl border border-border p-6">
    <h2 className="font-display font-semibold text-lg mb-5">{title}</h2>
    {children}
  </div>
);

const Toggle: React.FC<{
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; loading?: boolean;
}> = ({ label, desc, checked, onChange, loading }) => (
  <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border last:border-0">
    <div>
      <div className="text-sm font-medium text-brand-950">{label}</div>
      {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={loading}
      className={cn(
        'relative w-12 h-7 rounded-full flex-shrink-0 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2',
        checked ? 'bg-brand-600' : 'bg-slate-200',
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  </div>
);

const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const [privacy, setPrivacy] = useState(user?.privacy ?? {} as Record<string, boolean>);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, boolean>) => profileService.updatePrivacy(data),
    onSuccess: () => toast.success('Privacy settings saved'),
  });

  const update = (key: string, value: boolean) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    saveMutation.mutate(updated);
  };

  return (
    <SettingsCard title="Privacy Controls">
      <Toggle label="Hide Phone Number"   desc="Only approved contacts can see your number" checked={privacy.hidePhone ?? false}        onChange={(v) => update('hidePhone', v)}        loading={saveMutation.isPending} />
      <Toggle label="Hide Salary"         desc="Keep your income private"                    checked={privacy.hideSalary ?? false}       onChange={(v) => update('hideSalary', v)}       loading={saveMutation.isPending} />
      <Toggle label="Hide Horoscope"      desc="Share horoscope on request only"             checked={privacy.hideHoroscope ?? false}    onChange={(v) => update('hideHoroscope', v)}    loading={saveMutation.isPending} />
      <Toggle label="Hide Health Data"    desc="Keep health info private"                    checked={privacy.hideHealthData ?? false}   onChange={(v) => update('hideHealthData', v)}   loading={saveMutation.isPending} />
      <Toggle label="Hide Property Data"  desc="Keep assets private"                         checked={privacy.hidePropertyData ?? false} onChange={(v) => update('hidePropertyData', v)} loading={saveMutation.isPending} />
      <Toggle label="Hide Last Seen"      desc="Don't show when you were last active"        checked={privacy.hideLastSeen ?? false}     onChange={(v) => update('hideLastSeen', v)}     loading={saveMutation.isPending} />
    </SettingsCard>
  );
};

const NotificationSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ push: true, email: true, sms: true, whatsapp: false });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, boolean>) => post('/notifications/preferences', data),
    onSuccess: () => toast.success('Notification preferences saved'),
    onError: () => toast.error('Failed to save preferences'),
  });

  const update = (key: string, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    saveMutation.mutate(updated);
  };

  return (
    <SettingsCard title="Notification Preferences">
      <Toggle label="Push Notifications" desc="Browser & app notifications" checked={prefs.push}     onChange={(v) => update('push', v)}     loading={saveMutation.isPending} />
      <Toggle label="Email Notifications" desc="Updates via email"          checked={prefs.email}    onChange={(v) => update('email', v)}    loading={saveMutation.isPending} />
      <Toggle label="SMS Notifications"  desc="Text message alerts"         checked={prefs.sms}      onChange={(v) => update('sms', v)}      loading={saveMutation.isPending} />
      <Toggle label="WhatsApp Notifications" desc="Updates on WhatsApp"     checked={prefs.whatsapp} onChange={(v) => update('whatsapp', v)} loading={saveMutation.isPending} />
    </SettingsCard>
  );
};

// ─── 2FA Modal ───────────────────────────────────────────────────────────────
const TwoFAModal: React.FC<{ mode: 'enable' | 'disable'; onClose: () => void }> = ({ mode, onClose }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [setup, setSetup] = useState<{ secret: string; qrCode: string; backupCodes: string[] } | null>(null);

  const setupMutation = useMutation({
    mutationFn: () => authService.setup2FA(),
    onSuccess: (res) => {
      setSetup(res.data ?? null);
      setStep('verify');
    },
    onError: () => toast.error('Failed to setup 2FA'),
  });

  const enableMutation = useMutation({
    mutationFn: (t: string) => authService.enable2FA(t),
    onSuccess: () => {
      toast.success('Two-factor authentication enabled');
      queryClient.invalidateQueries({ queryKey: ['me'] });
      onClose();
    },
    onError: () => toast.error('Invalid code. Please try again.'),
  });

  const disableMutation = useMutation({
    mutationFn: (t: string) => authService.disable2FA(t),
    onSuccess: () => {
      toast.success('Two-factor authentication disabled');
      queryClient.invalidateQueries({ queryKey: ['me'] });
      onClose();
    },
    onError: () => toast.error('Invalid code. Please try again.'),
  });

  React.useEffect(() => {
    if (mode === 'enable') setupMutation.mutate();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'enable') enableMutation.mutate(token);
    else disableMutation.mutate(token);
  };

  const isPending = enableMutation.isPending || disableMutation.isPending;

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-brand-700" />
            <SheetTitle>{mode === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}</SheetTitle>
          </div>
        </SheetHeader>

        <SheetBody>
        {mode === 'enable' && step === 'setup' && setupMutation.isPending && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-brand-700" />
          </div>
        )}

        {mode === 'enable' && step === 'verify' && setup && (
          <div className="space-y-4 mb-5">
            <p className="text-sm text-slate-500">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
            <div className="bg-white rounded-xl p-3 flex items-center justify-center">
              <img src={setup.qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Manual entry key:</p>
              <code className="text-xs font-mono break-all">{setup.secret}</code>
            </div>
            {setup.backupCodes?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-2">Save these backup codes:</p>
                <div className="grid grid-cols-2 gap-1">
                  {setup.backupCodes.map((code) => (
                    <code key={code} className="text-xs font-mono bg-muted px-2 py-1 rounded">{code}</code>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'disable' && (
          <p className="text-sm text-slate-500 mb-5">
            Enter the 6-digit code from your authenticator app to disable 2FA.
          </p>
        )}

        {(mode === 'disable' || (mode === 'enable' && step === 'verify')) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                6-Digit Code
              </label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border text-center text-2xl font-mono tracking-[0.5em] outline-none focus:border-brand-400 transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={token.length !== 6 || isPending}
              className="btn-luxury w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {mode === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
            </button>
          </form>
        )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const [twoFAModal, setTwoFAModal] = useState<'enable' | 'disable' | null>(null);

  return (
    <>
      <SettingsCard title="Security">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="text-sm font-medium">Two-Factor Authentication</div>
              <div className="text-xs text-slate-500">
                {user?.auth.twoFactorEnabled ? 'Enabled — your account is protected' : 'Add an extra layer of security'}
              </div>
            </div>
            <button
              onClick={() => setTwoFAModal(user?.auth.twoFactorEnabled ? 'disable' : 'enable')}
              className={cn(
                'text-sm font-semibold hover:underline',
                user?.auth.twoFactorEnabled ? 'text-red-600' : 'text-brand-700',
              )}
            >
              {user?.auth.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
          <button
            onClick={() => authService.logoutAll()}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:underline"
          >
            <LogOut className="w-4 h-4" />
            Logout from all devices
          </button>
        </div>
      </SettingsCard>

      <AnimatePresence>
        {twoFAModal && (
          <TwoFAModal mode={twoFAModal} onClose={() => setTwoFAModal(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

const SessionsSettings: React.FC = () => {
  const { data } = useQuery({ queryKey: ['sessions'], queryFn: () => authService.getSessions() });
  const sessions = (data?.data ?? []) as Session[];

  const revokeMutation = useMutation({
    mutationFn: (id: string) => authService.revokeSession(id),
    onSuccess: () => toast.success('Session revoked'),
  });

  return (
    <SettingsCard title="Active Devices">
      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.sessionId} className="flex items-center justify-between p-3 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm font-medium capitalize">{session.platform} · {session.deviceName ?? 'Unknown device'}</div>
                <div className="text-xs text-slate-500">{session.ipAddress} · {formatDate(session.lastActiveAt, 'relative')}</div>
              </div>
            </div>
            <button
              onClick={() => revokeMutation.mutate(session.sessionId)}
              disabled={revokeMutation.isPending}
              className="text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              Revoke
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No active sessions</p>
        )}
      </div>
    </SettingsCard>
  );
};

const LanguageSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useUIStore();

  return (
    <div className="space-y-6">
      <SettingsCard title="Theme">
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'light',  icon: Sun,     label: 'Light' },
            { key: 'dark',   icon: Moon,    label: 'Dark' },
            { key: 'system', icon: Monitor, label: 'System' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key as 'light' | 'dark' | 'system')}
              className={cn(
                'flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all',
                theme === t.key
                  ? 'border-brand-700 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-border',
              )}
            >
              <t.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Language">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                toast.success(`Language set to ${lang}`);
              }}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm transition-all',
                language === lang
                  ? 'border-brand-400 bg-brand-50 text-brand-700 font-semibold'
                  : 'border-border hover:border-brand-300',
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
};

const AccountSettings: React.FC = () => {
  const exportMutation = useMutation({
    mutationFn: () => dataExportService.requestExport('json'),
    onSuccess: () => toast.success('Export requested. Check your email shortly.'),
  });
  const deleteMutation = useMutation({
    mutationFn: () => accountService.requestDeletion('User requested'),
    onSuccess: () => toast.success('Account scheduled for deletion in 30 days. Login to restore.'),
  });

  return (
    <div className="space-y-6">
      <SettingsCard title="Data Export">
        <p className="text-sm text-slate-500 mb-4">
          Download all your data including profile, chats, and activity history.
        </p>
        <button
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
        >
          {exportMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />}
          Request Data Export
        </button>
      </SettingsCard>

      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/40 p-6">
        <h2 className="font-display font-semibold text-lg mb-2 text-red-700 dark:text-red-400">Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">
          Delete your account. You have 30 days to restore before permanent deletion.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure? Your account will be scheduled for deletion in 30 days.')) {
              deleteMutation.mutate();
            }
          }}
          disabled={deleteMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Account
        </button>
      </div>
    </div>
  );
};
