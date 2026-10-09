import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Loader2, IndianRupee } from 'lucide-react';
import { walletService, post } from '../../services';
import { EmptyState } from '../../components/common/EmptyState';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '../../components/ui/sheet';
import { cn, formatDate } from '../../lib/utils';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

const TopUpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number>(1000);
  const [custom, setCustom] = useState('');

  const finalAmount = custom ? Number(custom) : amount;

  const topUpMutation = useMutation({
    mutationFn: (amt: number) => post('/wallet/topup', { amount: amt }),
    onSuccess: () => {
      toast.success(`₹${finalAmount} added to wallet`);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-txns'] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Top-up failed. Please try again.'),
  });

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Add Money</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustom(''); }}
                className={cn(
                  'py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                  amount === a && !custom
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-border hover:border-brand-200',
                )}
              >
                ₹{a.toLocaleString()}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Custom Amount
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min={100}
                max={50000}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Min ₹100 · Max ₹50,000</p>
          </div>
        </SheetBody>

        <SheetFooter>
          <button
            onClick={() => topUpMutation.mutate(finalAmount)}
            disabled={!finalAmount || finalAmount < 100 || finalAmount > 50000 || topUpMutation.isPending}
            className="btn-luxury w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {topUpMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Plus className="w-4 h-4" />}
            Add ₹{finalAmount ? finalAmount.toLocaleString() : '—'}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export const WalletPage: React.FC = () => {
  const [showTopUp, setShowTopUp] = useState(false);
  const { data: balanceData } = useQuery({ queryKey: ['wallet'], queryFn: () => walletService.getBalance() });
  const { data: txnData } = useQuery({ queryKey: ['wallet-txns'], queryFn: () => walletService.getTransactions() });

  const balance = (balanceData?.data as { balance: number })?.balance ?? 0;
  const transactions = (txnData?.data ?? []) as Array<{
    _id: string; type: string; source: string; amount: number;
    description: string; createdAt: string; balanceAfter: number;
  }>;

  return (
    <>
      <AnimatePresence>
        {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
      </AnimatePresence>

      <div className="space-y-6 max-w-3xl">
        <h1 className="font-display font-bold text-2xl lg:text-3xl">Wallet</h1>

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-maroon rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-hero-pattern opacity-10" />
          <div className="relative z-10 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                <Wallet className="w-4 h-4" /> Available Balance
              </div>
              <div className="font-display font-bold text-4xl">₹{balance.toLocaleString()}</div>
              <p className="text-white/60 text-sm mt-2">Use credits for subscriptions and premium features</p>
            </div>
            <button
              onClick={() => setShowTopUp(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Money
            </button>
          </div>
        </motion.div>

        {/* Transactions */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No transactions yet"
              description="Your wallet activity will appear here."
              action={
                <button onClick={() => setShowTopUp(true)} className="btn-luxury text-sm px-5 py-2.5">
                  Add Money
                </button>
              }
            />
          ) : (
            <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {transactions.map((txn) => (
                <div key={txn._id} className="flex items-center gap-3 p-4">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    txn.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
                  )}>
                    {txn.type === 'credit'
                      ? <ArrowDownLeft className="w-5 h-5" />
                      : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{txn.description}</div>
                    <div className="text-xs text-slate-500 capitalize">
                      {txn.source.replace(/_/g, ' ')} · {formatDate(txn.createdAt, 'relative')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('font-semibold text-sm', txn.type === 'credit' ? 'text-emerald-600' : 'text-red-600')}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                    </div>
                    <div className="text-xs text-slate-400">Bal: ₹{txn.balanceAfter}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
