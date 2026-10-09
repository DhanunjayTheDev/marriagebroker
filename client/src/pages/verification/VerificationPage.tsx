import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Upload, CheckCircle2, Clock, XCircle,
  Phone, Mail, CreditCard, FileText, Scan, Briefcase, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { verificationService } from '../../services';
import { ScoreRing } from '../../components/common/ScoreRing';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../lib/utils';
import type { Verification } from '../../types';

const VERIFICATION_ITEMS = [
  { type: 'mobile',     label: 'Mobile Number', icon: Phone,    desc: 'Verify your phone',    accept: 'image/*' },
  { type: 'email',      label: 'Email Address', icon: Mail,     desc: 'Verify your email',    accept: 'image/*' },
  { type: 'aadhaar',    label: 'Aadhaar Card',  icon: CreditCard, desc: 'Government ID',      accept: 'image/*,.pdf' },
  { type: 'pan',        label: 'PAN Card',       icon: FileText, desc: 'Tax identity',         accept: 'image/*,.pdf' },
  { type: 'face',       label: 'Face Verification', icon: Scan,  desc: 'Liveness check',     accept: 'image/*' },
  { type: 'employment', label: 'Employment',     icon: Briefcase, desc: 'Work verification',  accept: 'image/*,.pdf' },
];

export const VerificationPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['verifications'],
    queryFn: () => verificationService.getVerifications(),
  });

  const verifications = (data?.data ?? []) as Verification[];
  const getStatus = (type: string) => verifications.find((v) => v.type === type)?.status;

  const submitMutation = useMutation({
    mutationFn: ({ type, file }: { type: string; file: File }) =>
      verificationService.submitVerification(type, { document: file }),
    onSuccess: () => {
      toast.success('Verification submitted! We\'ll review it within 24 hours.');
      queryClient.invalidateQueries({ queryKey: ['verifications'] });
      setUploadingType(null);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? 'Failed to submit verification');
      setUploadingType(null);
    },
  });

  const handleVerify = (type: string) => {
    fileInputRefs.current[type]?.click();
  };

  const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return;
    }
    setUploadingType(type);
    submitMutation.mutate({ type, file });
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl">Verification Center</h1>
        <p className="text-slate-500 text-sm mt-1">Build trust and get a verified badge</p>
      </div>

      {/* Trust score header */}
      <div className="bg-gradient-maroon rounded-2xl p-6 flex items-center gap-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="bg-white/10 rounded-2xl p-2">
            <ScoreRing score={user?.profile.trustScore ?? 0} size="md" showValue />
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl">Trust Score</h2>
            <p className="text-white/70 text-sm mt-1 max-w-md">
              Verified profiles get 3× more matches. Complete verifications below to
              increase your trust score and unlock the verified badge.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden file inputs — one per type */}
      {VERIFICATION_ITEMS.map((item) => (
        <input
          key={item.type}
          type="file"
          accept={item.accept}
          className="hidden"
          ref={(el) => { fileInputRefs.current[item.type] = el; }}
          onChange={(e) => handleFileChange(item.type, e)}
        />
      ))}

      {/* Verification grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {VERIFICATION_ITEMS.map((item, i) => {
          const status = getStatus(item.type);
          const isUploading = uploadingType === item.type && submitMutation.isPending;
          return (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4"
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                status === 'approved'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-muted text-slate-500',
              )}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
              <StatusBadge
                status={status}
                isLoading={isUploading}
                onVerify={() => handleVerify(item.type)}
              />
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Accepted formats: JPG, PNG, PDF · Maximum file size: 5 MB
      </p>
    </div>
  );
};

const StatusBadge: React.FC<{ status?: string; isLoading?: boolean; onVerify: () => void }> = ({
  status, isLoading, onVerify,
}) => {
  if (status === 'approved') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="w-4 h-4" /> Verified
      </span>
    );
  }
  if (status === 'pending' || status === 'under_review') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
        <Clock className="w-4 h-4" /> Under Review
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <button
        onClick={onVerify}
        disabled={isLoading}
        className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
      >
        {isLoading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <XCircle className="w-4 h-4" />}
        Retry
      </button>
    );
  }
  return (
    <button
      onClick={onVerify}
      disabled={isLoading}
      className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors disabled:opacity-50"
    >
      {isLoading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Upload className="w-3.5 h-3.5" />}
      Verify
    </button>
  );
};
