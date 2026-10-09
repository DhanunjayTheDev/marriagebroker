import React, { useEffect, useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Search, Heart, MessageCircle, Phone, Bell,
  User, CreditCard, Wallet, Gift, Star, ShieldCheck, Settings,
  LogOut, ChevronLeft, Menu, Sparkles, Users, HelpCircle,
  Home, Activity, Calendar, Store,
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useUIStore, useNotificationStore } from '../store';
import { cn, getInitials } from '../lib/utils';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/ui/badge';
import { ProfileCompletionModal } from '../components/common/ProfileCompletionModal';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/matches', label: 'Matches', icon: Heart },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/interests', label: 'Interests', icon: Users },
  { to: '/chat', label: 'Messages', icon: MessageCircle, badge: 'messages' },
  { to: '/calls', label: 'Calls', icon: Phone },
  { to: '/meetings', label: 'Meetings', icon: Calendar },
];

const SECONDARY_NAV = [
  { to: '/profile/edit', label: 'My Profile', icon: User },
  { to: '/astrology', label: 'Astrology', icon: Star },
  { to: '/verification', label: 'Verification', icon: ShieldCheck },
  { to: '/subscriptions', label: 'Subscription', icon: CreditCard },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/referrals', label: 'Referrals', icon: Gift },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
];

const BOTTOM_NAV = [
  { to: '/support', label: 'Support', icon: HelpCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const COMPLETION_SECTIONS = [
  { key: 'personal',           label: 'Personal' },
  { key: 'religion',           label: 'Religion' },
  { key: 'location',           label: 'Location' },
  { key: 'education',          label: 'Education' },
  { key: 'employment',         label: 'Career' },
  { key: 'family',             label: 'Family' },
  { key: 'lifestyle',          label: 'Lifestyle' },
  { key: 'health',             label: 'Health' },
  { key: 'assets',             label: 'Assets' },
  { key: 'personality',        label: 'Personality' },
  { key: 'partnerPreferences', label: 'Partner Preferences' },
  { key: 'privacy',            label: 'Privacy' },
];

const SESSION_KEY = 'avyuktha-profile-completion-prompted';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, fullWidth }) => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { unreadCount } = useNotificationStore();

  const [completionModalOpen, setCompletionModalOpen] = useState(false);

  useEffect(() => {
    const score = user?.profile.completionScore ?? 0;
    if (score < 100 && !sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      // small delay so layout paints first
      const t = setTimeout(() => setCompletionModalOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [user?.profile.completionScore]);

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300',
          'bg-white dark:bg-card border-r border-border',
          sidebarCollapsed ? 'w-16' : 'w-64',
          'hidden lg:flex'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center p-4 h-16 border-b border-border', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-maroon flex-shrink-0 flex items-center justify-center shadow-maroon">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-display font-bold text-base leading-none text-brand-800 dark:text-brand-300 truncate">Avyuktha</div>
                <div className="text-[9px] text-gold-600 tracking-widest uppercase mt-0.5">Matrimony</div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {/* Primary nav */}
          <div className="space-y-0.5">
            {!sidebarCollapsed && (
              <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Main
              </p>
            )}
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.to}
                item={item}
                collapsed={sidebarCollapsed}
                badge={item.badge === 'messages' ? undefined : item.badge === 'notifications' ? unreadCount : undefined}
              />
            ))}
          </div>

          <div className="my-2 border-t border-border" />

          {/* Secondary nav */}
          <div className="space-y-0.5">
            {!sidebarCollapsed && (
              <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Account
              </p>
            )}
            {SECONDARY_NAV.map((item) => (
              <SidebarNavItem
                key={item.to}
                item={item}
                collapsed={sidebarCollapsed}
                badge={item.badge === 'notifications' ? unreadCount : undefined}
              />
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border p-2 space-y-0.5">
          {BOTTOM_NAV.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={sidebarCollapsed} />
          ))}

          {/* User profile */}
          <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1', sidebarCollapsed && 'justify-center')}>
            <Avatar
              src={user?.profile.photoUrl}
              name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
              size="sm"
              verified={user?.profile.verificationBadge}
            />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-slate-500 truncate capitalize">{user?.subscription.plan} Plan</div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500',
              'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform text-slate-500', sidebarCollapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 bg-white dark:bg-card border-r border-border lg:hidden flex flex-col"
            >
              <MobileSidebar user={user} logout={logout} unreadCount={unreadCount} onClose={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-16'
        )}
      >
        {/* Top bar */}
        <header className="safe-top sticky top-0 z-30 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border">
          <div className={cn('flex items-center justify-between h-16 px-4 lg:px-6', fullWidth ? '' : 'max-w-7xl mx-auto')}>
            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page will set breadcrumb via context if needed */}
            <div className="hidden lg:block" />

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/matches/ai"
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Matches
              </Link>

              <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-slate-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link to="/profile/edit" className="flex items-center gap-2">
                <Avatar
                  src={user?.profile.photoUrl}
                  name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                  size="sm"
                  verified={user?.profile.verificationBadge}
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={cn('flex-1 p-4 pb-24 lg:p-6', !fullWidth && 'max-w-7xl mx-auto w-full')}>
          {children}
        </main>
      </div>

      {/* Profile completion modal shown once per session if incomplete */}
      <ProfileCompletionModal
        open={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        score={user?.profile.completionScore ?? 0}
        sections={COMPLETION_SECTIONS.map((s) => ({
          ...s,
          filled: Boolean((user?.profile as any)?.[s.key] &&
            Object.values((user?.profile as any)[s.key] ?? {}).some((v: unknown) => v !== null && v !== undefined && v !== '')),
        }))}
      />

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-card border-t border-border lg:hidden safe-bottom">
        <div className="flex items-center">
          {[
            { to: '/dashboard', icon: Home, label: 'Home' },
            { to: '/matches', icon: Heart, label: 'Matches' },
            { to: '/chat', icon: MessageCircle, label: 'Chat' },
            { to: '/interests', icon: Users, label: 'Interests' },
            { to: '/profile/edit', icon: User, label: 'Profile' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 text-slate-500"
              activeProps={{ className: '!text-brand-700' }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

const SidebarNavItem: React.FC<{
  item: { to: string; label: string; icon: React.ElementType };
  collapsed: boolean;
  badge?: number;
}> = ({ item, collapsed, badge }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-500',
        'hover:bg-muted hover:text-foreground transition-colors group',
        collapsed && 'justify-center'
      )}
      activeProps={{ className: '!bg-brand-50 !text-brand-700 dark:!bg-brand-900/20 dark:!text-brand-300' }}
    >
      <Icon className="w-4.5 h-4.5 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {badge && badge > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
};

const MobileSidebar: React.FC<{
  user: ReturnType<typeof useAuth>['user'];
  logout: () => void;
  unreadCount: number;
  onClose: () => void;
}> = ({ user, logout, unreadCount, onClose }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Avatar
          src={user?.profile.photoUrl}
          name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
          size="sm"
          verified={user?.profile.verificationBadge}
        />
        <div>
          <div className="font-semibold text-sm">{user?.firstName}</div>
          <div className="text-xs text-slate-500 capitalize">{user?.subscription.plan}</div>
        </div>
      </div>
      <button onClick={onClose} className="p-3 rounded-lg hover:bg-muted">
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {[...NAV_ITEMS, ...SECONDARY_NAV, ...BOTTOM_NAV].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-muted hover:text-foreground transition-colors"
          activeProps={{ className: '!bg-brand-50 !text-brand-700' }}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
          {'badge' in item && item.badge === 'notifications' && unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">{unreadCount}</Badge>
          )}
        </Link>
      ))}
    </nav>
    <div className="p-2 border-t border-border">
      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  </div>
);

