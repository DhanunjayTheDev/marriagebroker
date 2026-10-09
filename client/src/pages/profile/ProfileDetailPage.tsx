import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Phone, Video, Star, Lock, Flag,
  Ban, MapPin, Briefcase, GraduationCap, Home, Activity,
  Sparkles, ChevronLeft, ChevronRight, BadgeCheck, Image, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { profileService } from '../../services/profile.service';
import { interestService, contactAccessService, photoAccessService, chatService, callService, post } from '../../services';
import { ScoreRing } from '../../components/common/ScoreRing';
import { Skeleton } from '../../components/common/Skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '../../components/ui/sheet';
import { cn, calculateAge, formatHeight, formatIncome } from '../../lib/utils';
import type { Profile, Astrology, User } from '../../types';

const REPORT_REASONS = [
  'Fake profile',
  'Inappropriate content',
  'Harassment or abuse',
  'Scam or fraud',
  'Spam',
  'Other',
];

const ReportModal: React.FC<{ userId: string; name: string; onClose: () => void }> = ({ userId, name, onClose }) => {
  const [reason, setReason] = useState('');

  const reportMutation = useMutation({
    mutationFn: () => post(`/users/${userId}/report`, { reason }),
    onSuccess: () => {
      toast.success('Report submitted. We\'ll review it within 24 hours.');
      onClose();
    },
    onError: () => toast.error('Failed to submit report'),
  });

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <SheetTitle>Report {name}</SheetTitle>
          </div>
        </SheetHeader>
        <SheetBody>
          <p className="text-sm text-slate-500 mb-4">Select the reason for reporting this profile.</p>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={cn(
                  'w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-all',
                  reason === r ? 'border-brand-400 bg-brand-50 text-brand-700 font-medium' : 'border-border hover:border-brand-200',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </SheetBody>
        <SheetFooter>
          <button
            onClick={() => reportMutation.mutate()}
            disabled={!reason || reportMutation.isPending}
            className="btn-luxury w-full py-3 disabled:opacity-60"
          >
            {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export const ProfileDetailPage: React.FC = () => {
  const { userId } = useParams({ from: '/profile/$userId' });
  const navigate = useNavigate();
  const [activePhoto, setActivePhoto] = useState(0);
  const [showReport, setShowReport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getProfile(userId),
  });

  const { data: compatData } = useQuery({
    queryKey: ['compatibility', userId],
    queryFn: () => profileService.getCompatibility(userId),
    enabled: !!userId,
  });

  const interestMutation = useMutation({
    mutationFn: () => interestService.sendInterest(userId),
    onSuccess: () => toast.success('Interest sent! 💝'),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const chatMutation = useMutation({
    mutationFn: () => chatService.getOrCreateConversation(userId),
    onSuccess: (res) => navigate({ to: '/chat', search: { c: res.data?._id } as never }),
  });

  const callMutation = useMutation({
    mutationFn: (type: 'voice' | 'video') => callService.initiateCall(userId, type),
    onSuccess: () => toast.success('Calling...'),
  });

  const contactMutation = useMutation({
    mutationFn: () => contactAccessService.requestAccess(userId),
    onSuccess: () => toast.success('Contact request sent'),
  });

  const photoMutation = useMutation({
    mutationFn: () => photoAccessService.requestAccess(userId),
    onSuccess: () => toast.success('Photo access request sent'),
  });

  const blockMutation = useMutation({
    mutationFn: () => post(`/users/${userId}/block`),
    onSuccess: () => {
      toast.success('User blocked');
      navigate({ to: '/matches' });
    },
    onError: () => toast.error('Failed to block user'),
  });

  if (isLoading) return <ProfileDetailSkeleton />;

  const user = data?.data?.user as User | undefined;
  const profile = data?.data?.profile as Profile | undefined;
  const astrology = data?.data?.astrology as Astrology | undefined;

  if (!user || !profile) {
    return <div className="text-center py-20 text-slate-500">Profile not found</div>;
  }

  const age = calculateAge(user.dateOfBirth);
  const photos = profile.photos?.filter((p) => !p.isPrivate) ?? [];
  const compatScore = (compatData?.data as { score: number })?.score ?? 0;

  return (
    <>
    <AnimatePresence>
      {showReport && (
        <ReportModal userId={userId} name={user.firstName} onClose={() => setShowReport(false)} />
      )}
    </AnimatePresence>
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate({ to: '/matches' })}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-950 mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Matches
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: photos + actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Photo carousel */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
            {photos.length > 0 ? (
              <>
                <img src={photos[activePhoto]?.url} alt={user.firstName} className="w-full h-full object-cover" />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhoto((p) => (p - 1 + photos.length) % photos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActivePhoto((p) => (p + 1) % photos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActivePhoto(i)}
                          className={cn('w-1.5 h-1.5 rounded-full transition-all', i === activePhoto ? 'bg-white w-4' : 'bg-white/50')}
                        />
                      ))}
                    </div>
                  </>
                )}
                {user.profile.verificationBadge && (
                  <div className="absolute top-3 left-3 badge-verified">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-maroon text-white">
                <span className="text-6xl font-display font-bold opacity-30">{user.firstName[0]}</span>
                <button onClick={() => photoMutation.mutate()} className="mt-4 flex items-center gap-1.5 text-sm bg-white/20 px-4 py-2 rounded-lg">
                  <Lock className="w-4 h-4" />
                  Request Photo Access
                </button>
              </div>
            )}
          </div>

          {/* Private photos */}
          <button
            onClick={() => photoMutation.mutate()}
            className="w-full flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Image className="w-4 h-4" />
            Request Private Photos
          </button>

          {/* Actions */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
            <button onClick={() => interestMutation.mutate()} className="btn-luxury w-full flex items-center justify-center gap-2 py-3">
              <Heart className="w-4 h-4 fill-white" />
              Send Interest
            </button>
            <div className="grid grid-cols-3 gap-2">
              <ActionBtn icon={MessageCircle} label="Chat" onClick={() => chatMutation.mutate()} />
              <ActionBtn icon={Phone} label="Call" onClick={() => callMutation.mutate('voice')} />
              <ActionBtn icon={Video} label="Video" onClick={() => callMutation.mutate('video')} />
            </div>
            <button onClick={() => contactMutation.mutate()} className="w-full flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              <Phone className="w-4 h-4" />
              Request Contact
            </button>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowReport(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-red-600 py-1.5 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                Report
              </button>
              <button
                onClick={() => {
                  if (confirm(`Block ${user.firstName}? They won't be able to contact you.`)) {
                    blockMutation.mutate();
                  }
                }}
                disabled={blockMutation.isPending}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-red-600 py-1.5 transition-colors disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                Block
              </button>
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-2xl">{user.firstName} {user.lastName}</h1>
                  {user.profile.verificationBadge && <BadgeCheck className="w-5 h-5 text-brand-700" />}
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                  <span>{age} yrs</span>
                  {profile.personal?.height && <span>• {formatHeight(profile.personal.height)}</span>}
                  {profile.religion?.religion && <span>• {profile.religion.religion}</span>}
                  {profile.location?.city && (
                    <span className="flex items-center gap-1">
                      • <MapPin className="w-3.5 h-3.5" /> {profile.location.city}
                    </span>
                  )}
                </div>
              </div>
              <ScoreRing score={compatScore} size="md" label="Match" />
            </div>

            {profile.personal?.aboutMe && (
              <p className="text-sm text-slate-500 leading-relaxed mt-4 pt-4 border-t border-border">
                {profile.personal.aboutMe}
              </p>
            )}
          </div>

          {/* Why matched */}
          {compatScore > 0 && (
            <div className="bg-gradient-to-br from-brand-50 to-rose-50 dark:from-brand-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-brand-100 dark:border-brand-900/40">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-brand-700" />
                <h2 className="font-display font-semibold">Why You Match</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  profile.religion?.religion && `Same religion (${profile.religion.religion})`,
                  profile.education?.highestDegree && 'Similar education level',
                  astrology?.rasi && `Astrological compatibility`,
                  profile.lifestyle?.foodHabits && 'Compatible lifestyle',
                ].filter(Boolean).map((reason, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-700" />
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detail sections */}
          <DetailSection icon={Briefcase} title="Career">
            <DetailRow label="Profession" value={profile.employment?.designation} />
            <DetailRow label="Company" value={profile.employment?.company} />
            <DetailRow label="Industry" value={profile.employment?.industry} />
            {!profile.employment?.isIncomePrivate && profile.employment?.annualIncome && (
              <DetailRow label="Annual Income" value={formatIncome(profile.employment.annualIncome)} />
            )}
          </DetailSection>

          <DetailSection icon={GraduationCap} title="Education">
            <DetailRow label="Qualification" value={profile.education?.highestDegree} />
            <DetailRow label="Field" value={profile.education?.fieldOfStudy} />
            <DetailRow label="College" value={profile.education?.college} />
          </DetailSection>

          <DetailSection icon={Home} title="Family">
            <DetailRow label="Family Type" value={profile.family?.familyType} />
            <DetailRow label="Family Values" value={profile.family?.familyValues} />
            <DetailRow label="Native Place" value={profile.family?.nativePlaceCity} />
            <DetailRow label="Father" value={profile.family?.fatherOccupation} />
            <DetailRow label="Mother" value={profile.family?.motherOccupation} />
          </DetailSection>

          <DetailSection icon={Activity} title="Lifestyle">
            <DetailRow label="Food Habits" value={profile.lifestyle?.foodHabits} />
            <DetailRow label="Smoking" value={profile.lifestyle?.smokingHabit} />
            <DetailRow label="Drinking" value={profile.lifestyle?.drinkingHabit} />
          </DetailSection>

          {astrology && (
            <DetailSection icon={Star} title="Astrology">
              <DetailRow label="Rasi" value={astrology.rasi} />
              <DetailRow label="Nakshatra" value={astrology.nakshatram} />
              <DetailRow label="Gothram" value={astrology.gothram} />
              <DetailRow label="Manglik" value={astrology.doshams?.manglik ? 'Yes' : 'No'} />
            </DetailSection>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

const ActionBtn: React.FC<{ icon: React.ElementType; label: string; onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 border border-border rounded-xl py-2.5 hover:bg-muted transition-colors">
    <Icon className="w-4 h-4 text-brand-700" />
    <span className="text-[11px] font-medium">{label}</span>
  </button>
);

const DetailSection: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="bg-card rounded-2xl border border-border p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4.5 h-4.5 text-brand-700" />
      <h2 className="font-display font-semibold">{title}</h2>
    </div>
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">{children}</div>
  </div>
);

const DetailRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium capitalize text-right">{String(value).replace(/_/g, ' ')}</span>
    </div>
  );
};

const ProfileDetailSkeleton: React.FC = () => (
  <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
    <Skeleton className="aspect-[4/5] rounded-2xl" />
    <div className="lg:col-span-2 space-y-4">
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  </div>
);

