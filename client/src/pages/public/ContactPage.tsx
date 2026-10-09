import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Clock, MessageSquare, HeadphonesIcon, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { supportService } from '../../services';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';

const OFFICES = [
  {
    city: 'Hyderabad',
    label: 'Head Office',
    address: 'Plot 42, Cyber Towers, Hitech City, Madhapur, Hyderabad – 500081, Telangana',
    phone: '+91 40 6789 0123',
    email: 'hyderabad@avyuktha.com',
  },
  {
    city: 'Bangalore',
    label: 'South Office',
    address: '3rd Floor, Prestige Tech Park, Outer Ring Road, Marathahalli, Bangalore – 560037',
    phone: '+91 80 6789 0456',
    email: 'bangalore@avyuktha.com',
  },
  {
    city: 'Chennai',
    label: 'Tamil Nadu Office',
    address: 'No. 5, Dr. Radhakrishnan Salai, Mylapore, Chennai – 600004, Tamil Nadu',
    phone: '+91 44 6789 0789',
    email: 'chennai@avyuktha.com',
  },
];

const CHANNELS = [
  { icon: Phone, title: 'Phone Support', detail: '+91 99999 99999', sub: 'Mon – Sat, 9 AM – 9 PM IST', href: 'tel:+919999999999' },
  { icon: Mail, title: 'Email Support', detail: 'support@avyuktha.com', sub: 'Response within 4 hours', href: 'mailto:support@avyuktha.com' },
  { icon: MessageSquare, title: 'WhatsApp', detail: '+91 99999 99999', sub: 'Quick replies 9 AM – 6 PM', href: 'https://wa.me/919999999999' },
  { icon: HeadphonesIcon, title: 'Relationship Manager', detail: 'For Gold+ subscribers', sub: 'Dedicated personal assistance', href: '/auth/login' },
];

const REASONS = ['Subscription & billing', 'Profile assistance', 'Verification help', 'Technical issues', 'Privacy concerns', 'Relationship advice', 'Wedding marketplace', 'Partnership enquiries'];

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', reason: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submitMutation = useMutation({
    mutationFn: () =>
      supportService.createTicket(
        form.reason,
        `Contact Form: ${form.reason}`,
        `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\n\n${form.message}`,
      ),
    onSuccess: () => setSubmitted(true),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to send message. Please try again.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason) {
      toast.error('Please select a reason for contact');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="pt-28 pb-14 bg-gradient-to-b from-brand-50/50 via-white to-white">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold text-brand-700 bg-brand-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
              Get in Touch
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-5">
              We're Here to Help
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Reach out through any channel. Our team responds within 4 hours on working days.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support channels */}
      <section className="pb-16 container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {CHANNELS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.a
                key={c.title}
                href={c.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-border p-5 hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <div className="font-semibold text-sm mb-0.5">{c.title}</div>
                <div className="text-sm text-brand-700 font-medium mb-0.5">{c.detail}</div>
                <div className="text-xs text-slate-500">{c.sub}</div>
              </motion.a>
            );
          })}
        </div>

        {/* Contact form + offices */}
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="font-display font-bold text-2xl mb-6">Send Us a Message</h2>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 rounded-2xl border border-emerald-200 p-8 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl mb-2">Message Sent!</h3>
                <p className="text-slate-500">
                  Thank you, {form.name}. Our team will reply to <strong>{form.email}</strong> within 4 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone *</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Reason for Contact *</label>
                  <Select value={form.reason} onValueChange={(v) => update('reason', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                    <SelectContent>
                      {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Message *</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    placeholder="Describe your query in detail..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="btn-luxury px-8 py-3.5 flex items-center gap-2 disabled:opacity-60"
                >
                  {submitMutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Offices */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="font-display font-bold text-2xl mb-2">Our Offices</h2>
            {OFFICES.map((o) => (
              <div key={o.city} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-sm">{o.city}</span>
                  <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">{o.label}</span>
                </div>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{o.address}</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Phone className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <a href={`tel:${o.phone}`} className="hover:text-brand-600 transition-colors">{o.phone}</a>
                  </div>
                  <div className="flex gap-2.5">
                    <Mail className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <a href={`mailto:${o.email}`} className="hover:text-brand-600 transition-colors">{o.email}</a>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-brand-50 rounded-2xl border border-brand-200 p-5">
              <Clock className="w-5 h-5 text-brand-600 mb-3" />
              <h3 className="font-semibold text-sm mb-2">Support Hours</h3>
              <div className="space-y-1 text-sm text-slate-500">
                <div className="flex justify-between"><span>Phone & Chat</span><span className="font-medium text-brand-950">9 AM – 9 PM</span></div>
                <div className="flex justify-between"><span>Email</span><span className="font-medium text-brand-950">24 hours</span></div>
                <div className="flex justify-between"><span>Working Days</span><span className="font-medium text-brand-950">Mon – Sat</span></div>
                <div className="flex justify-between"><span>Emergency</span><span className="font-medium text-brand-950">WhatsApp only</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

