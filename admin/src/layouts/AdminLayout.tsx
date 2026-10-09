import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard, Users, ShieldCheck, Flag, AlertTriangle, Heart, MessageSquare,
  Phone, Calendar, CreditCard, Wallet, Gift, Headphones, Bell, Megaphone,
  FileText, Search as SearchIcon, Sparkles, Brain, Image, Store, ToggleLeft,
  Settings, ScrollText, Activity, Database, Lock, Gauge, Clock, Globe,
  ChevronLeft, Menu, LogOut, Moon, Sun, Trash2, UsersRound, Eye, BarChart3, Star,
} from 'lucide-react';
import { useAuthStore, useUIStore, useRealtimeStore } from '../store';
import { hasPermission, hasAnyPermission, Permission, ROLE_LABELS, AdminRole } from '../permissions';
import { cn } from '../lib/utils';
import { Avatar } from '../components/common';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  permission: Permission;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, permission: Permission.DASHBOARD_VIEW }],
  },
  {
    label: 'Operations',
    items: [
      { to: '/users', label: 'Users', icon: Users, permission: Permission.USER_VIEW },
      { to: '/verification', label: 'Verification', icon: ShieldCheck, permission: Permission.VERIFICATION_VIEW },
      { to: '/background-verification', label: 'Background Checks', icon: Eye, permission: Permission.BACKGROUND_VERIFICATION },
      { to: '/moderation', label: 'Moderation', icon: Flag, permission: Permission.MODERATION_VIEW },
      { to: '/fraud', label: 'Fraud Management', icon: AlertTriangle, permission: Permission.FRAUD_VIEW },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/interests', label: 'Interests', icon: Heart, permission: Permission.INTEREST_VIEW },
      { to: '/chat', label: 'Chat Monitor', icon: MessageSquare, permission: Permission.CHAT_VIEW },
      { to: '/calls', label: 'Calls', icon: Phone, permission: Permission.CALL_VIEW },
      { to: '/meetings', label: 'Meetings', icon: Calendar, permission: Permission.MEETING_VIEW },
      { to: '/family', label: 'Family Accounts', icon: UsersRound, permission: Permission.FAMILY_VIEW },
    ],
  },
  {
    label: 'Matchmaking',
    items: [
      { to: '/matchmaking', label: 'Matchmaking Rules', icon: Sparkles, permission: Permission.MATCHMAKING_MANAGE },
      { to: '/ai', label: 'AI Management', icon: Brain, permission: Permission.AI_MANAGE },
      { to: '/search-mgmt', label: 'Search Management', icon: SearchIcon, permission: Permission.SEARCH_MANAGE },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard, permission: Permission.SUBSCRIPTION_MANAGE },
      { to: '/payments', label: 'Payments', icon: CreditCard, permission: Permission.PAYMENT_VIEW },
      { to: '/wallet', label: 'Wallet', icon: Wallet, permission: Permission.WALLET_MANAGE },
      { to: '/referrals', label: 'Referrals', icon: Gift, permission: Permission.REFERRAL_VIEW },
    ],
  },
  {
    label: 'Customer',
    items: [
      { to: '/crm', label: 'CRM', icon: Heart, permission: Permission.CRM_VIEW },
      { to: '/support', label: 'Support', icon: Headphones, permission: Permission.SUPPORT_VIEW },
    ],
  },
  {
    label: 'Content & Marketing',
    items: [
      { to: '/notifications', label: 'Notifications', icon: Bell, permission: Permission.NOTIFICATION_MANAGE },
      { to: '/announcements', label: 'Announcements', icon: Megaphone, permission: Permission.ANNOUNCEMENT_MANAGE },
      { to: '/cms', label: 'CMS', icon: FileText, permission: Permission.CMS_MANAGE },
      { to: '/seo', label: 'SEO', icon: Globe, permission: Permission.SEO_MANAGE },
      { to: '/success-stories', label: 'Success Stories', icon: Star, permission: Permission.SUCCESS_STORY_MANAGE },
      { to: '/marketplace', label: 'Marketplace', icon: Store, permission: Permission.MARKETPLACE_MANAGE },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3, permission: Permission.ANALYTICS_VIEW },
      { to: '/recommendation-analytics', label: 'Recommendations', icon: Brain, permission: Permission.RECOMMENDATION_ANALYTICS },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/feature-flags', label: 'Feature Flags', icon: ToggleLeft, permission: Permission.FEATURE_FLAG_MANAGE },
      { to: '/system-config', label: 'System Config', icon: Settings, permission: Permission.SYSTEM_CONFIG_MANAGE },
      { to: '/audit', label: 'Audit Logs', icon: ScrollText, permission: Permission.AUDIT_VIEW },
      { to: '/activity', label: 'Activity', icon: Activity, permission: Permission.ACTIVITY_VIEW },
      { to: '/storage', label: 'Storage', icon: Database, permission: Permission.STORAGE_MANAGE },
      { to: '/security', label: 'Security Center', icon: Lock, permission: Permission.SECURITY_MANAGE },
      { to: '/monitoring', label: 'Monitoring', icon: Gauge, permission: Permission.MONITORING_VIEW },
      { to: '/cron', label: 'Cron Jobs', icon: Clock, permission: Permission.CRON_MANAGE },
      { to: '/data-export', label: 'Data Export', icon: Database, permission: Permission.DATA_EXPORT },
      { to: '/account-deletion', label: 'Account Deletion', icon: Trash2, permission: Permission.ACCOUNT_DELETION_MANAGE },
    ],
  },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, theme, setTheme } = useUIStore();
  const { alerts } = useRealtimeStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const visibleGroups = NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => hasPermission(user?.role, i.permission)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate">Avyuktha</div>
                <div className="text-[9px] text-white/50 tracking-widest uppercase">Admin</div>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-4">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors',
                      sidebarCollapsed && 'justify-center'
                    )}
                    activeProps={{ className: '!bg-primary !text-white' }}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-2">
          <div className={cn('flex items-center gap-2.5 px-2 py-2', sidebarCollapsed && 'justify-center')}>
            <Avatar src={user?.profile?.photoUrl} name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} size="sm" />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] text-white/50 truncate">{ROLE_LABELS[user?.role as AdminRole] ?? user?.role}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-destructive/20 hover:text-red-300 transition-colors mt-1', sidebarCollapsed && 'justify-center')}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />}

      {/* Main */}
      <div className={cn('flex-1 flex flex-col min-h-screen transition-all duration-300', sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-14 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-muted rounded-md"><Menu className="w-5 h-5" /></button>
            <button onClick={toggleSidebar} className="hidden lg:flex p-2 hover:bg-muted rounded-md">
              <ChevronLeft className={cn('w-5 h-5 transition-transform', sidebarCollapsed && 'rotate-180')} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 hover:bg-muted rounded-md">
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button className="relative p-2 hover:bg-muted rounded-md">
              <Bell className="w-4.5 h-4.5" />
              {alerts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive animate-pulse-dot" />}
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <Avatar src={user?.profile?.photoUrl} name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} size="sm" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};
