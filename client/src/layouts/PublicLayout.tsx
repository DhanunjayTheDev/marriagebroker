import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, Phone, ChevronDown } from 'lucide-react';
import { useUIStore, useAuthStore } from '../store';
import { cn } from '../lib/utils';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Success Stories', to: '/success-stories' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Blogs', to: '/blogs' },
  {
    label: 'More',
    children: [
      { label: 'About Us', to: '/about' },
      { label: 'Astrology', to: '/astrology-articles' },
      { label: 'Relationship Advice', to: '/relationship-advice' },
      { label: 'Marketplace', to: '/marketplace' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
];

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header
        className={cn(
          'safe-top fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-background/95 backdrop-blur-xl',
          scrolled
            ? 'shadow-warm border-b border-border/60'
            : 'border-b border-border/30'
        )}
      >
        <nav className="container flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-maroon group-hover:shadow-warm-lg transition-shadow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-xl text-brand-950 tracking-tight">Avyuktha</span>
              <span className="text-[10px] font-semibold text-gold-500 tracking-[0.2em] uppercase">Matrimony</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <DropdownNavItem key={link.label} label={link.label} items={link.children} />
              ) : (
                <NavLink key={link.label} to={link.to!} label={link.label} />
              )
            )}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+919999999999" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" />
              +91 99999 99999
            </a>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-luxury text-sm px-5 py-2.5">Dashboard</Link>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm font-semibold text-foreground/80 hover:bg-accent px-4 py-2 rounded-full transition-colors">
                  Login
                </Link>
                <Link to="/auth/register" className="btn-luxury text-sm px-5 py-2.5">Register Free</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-brand-950 hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background border-t border-border overflow-hidden"
            >
              <div className="container py-4 flex flex-col gap-1">
                {NAV_LINKS.flatMap((link) =>
                  link.children
                    ? link.children.map((c) => <MobileNavLink key={c.to} to={c.to} label={c.label} onClick={() => setMobileMenuOpen(false)} />)
                    : [<MobileNavLink key={link.label} to={link.to!} label={link.label} onClick={() => setMobileMenuOpen(false)} />]
                )}
                <div className="pt-3 flex flex-col gap-2 border-t border-border mt-2">
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="btn-luxury text-center">Dashboard</Link>
                  ) : (
                    <>
                      <Link to="/auth/login" className="text-center py-2.5 rounded-full border border-border text-brand-950 font-semibold hover:bg-accent transition-colors">Login</Link>
                      <Link to="/auth/register" className="btn-luxury text-center">Register Free</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
};

const NavLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link
    to={to}
    className="px-3.5 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-colors"
    activeProps={{ className: '!text-brand-700 !bg-accent font-semibold' }}
  >
    {label}
  </Link>
);

const MobileNavLink: React.FC<{ to: string; label: string; onClick: () => void }> = ({ to, label, onClick }) => (
  <Link to={to} onClick={onClick} className="px-3 py-2.5 rounded-lg text-sm font-medium text-brand-950 hover:bg-accent transition-colors">
    {label}
  </Link>
);

const DropdownNavItem: React.FC<{ label: string; items: Array<{ label: string; to: string }> }> = ({ label, items }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-colors">
        {label}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-2xl shadow-warm-lg overflow-hidden p-1.5"
          >
            {items.map((item) => (
              <Link key={item.to} to={item.to} className="block px-3.5 py-2.5 text-sm text-brand-950 hover:bg-accent rounded-xl transition-colors">
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-muted border-t border-border">
    <div className="container py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-maroon">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="font-display font-bold text-xl leading-none text-brand-950">Avyuktha</div>
              <div className="text-[10px] text-gold-500 tracking-[0.2em] uppercase">Matrimony</div>
            </div>
          </div>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            India's most trusted premium matrimony platform connecting compatible life partners with AI-powered matchmaking and expert assistance.
          </p>
          <div className="flex gap-2 mt-6">
            {['facebook', 'instagram', 'twitter', 'youtube'].map((s) => (
              <a key={s} href={`https://${s}.com/avyukthamatrimony`} aria-label={s}
                className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-brand-950 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors">
                <span className="text-xs font-bold capitalize">{s[0].toUpperCase()}</span>
              </a>
            ))}
          </div>
        </div>

        {[
          { title: 'Platform', links: [['How It Works', '/how-it-works'], ['Success Stories', '/success-stories'], ['Pricing', '/pricing'], ['AI Matching', '/ai-matching'], ['Verification', '/verification']] },
          { title: 'Discover', links: [['Blogs', '/blogs'], ['Relationship Advice', '/relationship-advice'], ['Astrology', '/astrology-articles'], ['Marketplace', '/marketplace'], ['Careers', '/careers']] },
          { title: 'Legal', links: [['Privacy Policy', '/privacy-policy'], ['Terms', '/terms'], ['Cookie Policy', '/cookie-policy'], ['FAQ', '/faq'], ['Contact', '/contact']] },
        ].map((section) => (
          <div key={section.title}>
            <h4 className="label-caps text-brand-700 mb-4">{section.title}</h4>
            <ul className="space-y-2.5">
              {section.links.map(([label, to]) => (
                <li key={to}><Link to={to} className="text-sm text-slate-500 hover:text-foreground transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Avyuktha Matrimony Pvt. Ltd. All rights reserved.</p>
        <p className="text-sm text-slate-500">Made with <span className="text-brand-600">♥</span> in India</p>
      </div>
    </div>
  </footer>
);

