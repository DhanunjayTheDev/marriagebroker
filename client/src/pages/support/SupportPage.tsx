import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle2, Loader2, Phone, BookOpen } from 'lucide-react';
import { supportService } from '../../services';
import { EmptyState } from '../../components/common/EmptyState';
import { cn, formatDate } from '../../lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import type { Ticket } from '../../types';

const CATEGORIES = ['Account', 'Payment', 'Profile', 'Technical', 'Verification', 'Report Abuse', 'Other'];

export const SupportPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ category: 'Account', subject: '', message: '' });

  const { data } = useQuery({ queryKey: ['tickets'], queryFn: () => supportService.getTickets() });
  const tickets = (data?.data ?? []) as Ticket[];

  const createMutation = useMutation({
    mutationFn: () => supportService.createTicket(form.category, form.subject, form.message),
    onSuccess: () => {
      toast.success('Ticket created! We\'ll respond shortly.');
      setShowNew(false);
      setForm({ category: 'Account', subject: '', message: '' });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl">Support Center</h1>
          <p className="text-slate-500 text-sm mt-1">We're here to help</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="btn-luxury text-sm px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Quick help */}
      <div className="grid grid-cols-2 gap-4">
        <a href="tel:+919999999999" className="bg-card rounded-2xl border border-border p-5 hover:shadow-card-hover transition-all">
          <Phone className="w-6 h-6 text-brand-700 mb-2" />
          <div className="font-semibold text-sm">Call Support</div>
          <div className="text-xs text-slate-500">+91 99999 99999</div>
        </a>
        <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-card-hover transition-all cursor-pointer">
          <BookOpen className="w-6 h-6 text-brand-700 mb-2" />
          <div className="font-semibold text-sm">Knowledge Base</div>
          <div className="text-xs text-slate-500">Browse FAQs & guides</div>
        </div>
      </div>

      {/* New ticket form */}
      {showNew && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card rounded-2xl border border-border p-6 overflow-hidden">
          <h2 className="font-semibold mb-4">Create Support Ticket</h2>
          <div className="space-y-4">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" />
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue..." rows={4} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-brand-700" />
            <button onClick={() => createMutation.mutate()} disabled={!form.subject || !form.message || createMutation.isPending} className="btn-luxury text-sm px-5 py-2.5 flex items-center gap-2">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Ticket'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Tickets */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">My Tickets</h2>
        {tickets.length === 0 ? (
          <EmptyState icon={HelpCircle} title="No tickets" description="Create a ticket if you need help." />
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">#{ticket.ticketNumber}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700')}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="font-medium text-sm mt-1">{ticket.subject}</div>
                    <div className="text-xs text-slate-500">{ticket.category} · {formatDate(ticket.createdAt, 'relative')}</div>
                  </div>
                  {ticket.status === 'resolved' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

