import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left: decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-maroon" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />

        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-800/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gold-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-rose-800/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <div className="font-display font-bold text-xl leading-none">Avyuktha</div>
              <div className="text-[10px] text-gold-300 tracking-widest uppercase mt-0.5">Matrimony</div>
            </div>
          </Link>

          {/* Center content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h1 className="font-display text-display-lg text-white mb-6 leading-tight">
                Begin Your<br />
                <span className="text-gradient-gold">Sacred Journey</span><br />
                Together
              </h1>
              <p className="text-white/70 text-lg leading-relaxed max-w-sm">
                Join millions of happy couples who found their perfect life partner on Avyuktha Matrimony.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { value: '50L+', label: 'Happy Members' },
                { value: '10L+', label: 'Marriages' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="font-display font-bold text-2xl text-gold-300">{stat.value}</div>
                  <div className="text-white/60 text-xs mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="glass rounded-2xl p-6 dark:bg-white/5">
            <p className="text-white/80 text-sm italic leading-relaxed">
              "We found each other on Avyuktha Matrimony. The AI matching was incredibly accurate it understood exactly what we were looking for."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-sm font-bold text-gray-900">
                RK
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Rahul & Kavya</div>
                <div className="text-white/50 text-xs">Married Nov 2023, Hyderabad</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 flex flex-col">
        {/* Back button */}
        <div className="p-4 lg:p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Mobile logo */}
        <div className="flex lg:hidden justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-maroon flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none text-brand-800">Avyuktha</div>
              <div className="text-[10px] text-gold-600 tracking-widest uppercase">Matrimony</div>
            </div>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

