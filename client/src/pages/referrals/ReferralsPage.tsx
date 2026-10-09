import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Gift, Copy, Share2, Users, IndianRupee, Check } from 'lucide-react';
import { toast } from 'sonner';
import { referralService } from '../../services';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { copyToClipboard, formatDate } from '../../lib/utils';

export const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const { data: referralsData } = useQuery({ queryKey: ['referrals'], queryFn: () => referralService.getMyReferrals() });
  const referrals = (referralsData?.data ?? []) as Array<{ _id: string; referredUserId: { firstName: string; lastName: string; createdAt: string }; status: string; rewardAmount: number }>;

  const code = user?.referralCode ?? 'LOADING';
  const link = `${window.location.origin}/auth/register?ref=${code}`;

  const handleCopy = async () => {
    await copyToClipboard(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join Avyuktha Matrimony', text: `Use my referral code ${code}`, url: link });
    } else {
      handleCopy();
    }
  };

  const totalEarned = referrals.reduce((sum, r) => sum + (r.rewardAmount ?? 0), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl">Refer & Earn</h1>
        <p className="text-slate-500 text-sm mt-1">Invite friends and earn wallet rewards</p>
      </div>

      {/* Referral card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-maroon rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative z-10">
          <Gift className="w-10 h-10 mb-3" />
          <h2 className="font-display font-semibold text-xl">Earn ₹500 per referral</h2>
          <p className="text-white/70 text-sm mt-1">When your friend subscribes to a premium plan</p>

          <div className="flex items-center gap-2 mt-5 bg-white/15 backdrop-blur-sm rounded-xl p-1.5">
            <div className="flex-1 px-3 py-2 font-mono font-bold text-lg tracking-wider">{code}</div>
            <button onClick={handleCopy} className="bg-white text-brand-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <button onClick={handleShare} className="mt-3 w-full bg-white/10 hover:bg-white/20 transition-colors rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Referral Link
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <Users className="w-6 h-6 text-brand-700 mb-2" />
          <div className="font-display font-bold text-2xl">{referrals.length}</div>
          <div className="text-sm text-slate-500">Total Referrals</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <IndianRupee className="w-6 h-6 text-emerald-600 mb-2" />
          <div className="font-display font-bold text-2xl">₹{totalEarned}</div>
          <div className="text-sm text-slate-500">Total Earned</div>
        </div>
      </div>

      {/* Referral list */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Your Referrals</h2>
        {referrals.length === 0 ? (
          <EmptyState icon={Gift} title="No referrals yet" description="Share your code to start earning rewards!" />
        ) : (
          <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {referrals.map((ref) => (
              <div key={ref._id} className="flex items-center gap-3 p-4">
                <Avatar name={`${ref.referredUserId?.firstName ?? ''} ${ref.referredUserId?.lastName ?? ''}`} size="md" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{ref.referredUserId?.firstName} {ref.referredUserId?.lastName}</div>
                  <div className="text-xs text-slate-500">Joined {formatDate(ref.referredUserId?.createdAt, 'relative')}</div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted capitalize">{ref.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

