import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, BadgeCheck, MapPin, Briefcase, GraduationCap, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '../common/Avatar';
import { ScoreRing } from '../common/ScoreRing';
import { cn, calculateAge, formatHeight, formatIncome } from '../../lib/utils';
import { useAuth } from '../../providers/AuthProvider';
import type { MatchedUser, Profile } from '../../types';

interface ProfileCardProps {
  userId: string;
  user: MatchedUser;
  profile?: Partial<Profile>;
  matchScore?: number;
  onSendInterest?: () => void;
  onChat?: () => void;
  variant?: 'default' | 'compact' | 'list';
  index?: number;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  userId,
  user,
  profile,
  matchScore,
  onSendInterest,
  onChat,
  variant = 'default',
  index = 0,
  className,
}) => {
  const age = calculateAge(user.dateOfBirth);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const handleSendInterest = () => {
    const score = authUser?.profile.completionScore ?? 0;
    if (score < 100) {
      toast.error('Complete your profile to send interest requests', {
        description: 'A 100% profile builds trust and gets more responses.',
        action: {
          label: 'Complete Profile',
          onClick: () => navigate({ to: '/profile/edit' }),
        },
        duration: 5000,
      });
      return;
    }
    onSendInterest?.();
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn('profile-card', className)}
      >
        <Link to="/profile/$userId" params={{ userId }}>
          <div className="relative aspect-[3/4] bg-muted overflow-hidden">
            {user.profile.photoUrl ? (
              <img
                src={user.profile.photoUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className={cn('w-full h-full object-cover transition-all duration-500', imageLoaded ? 'scale-100 blur-0' : 'scale-105 blur-sm')}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-maroon">
                <span className="text-white text-4xl font-display font-bold opacity-30">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* Match score badge */}
            {matchScore !== undefined && (
              <div className="absolute top-2 right-2">
                <div className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
                  matchScore >= 70 ? 'bg-emerald-500 text-white' : matchScore >= 40 ? 'bg-amber-500 text-white' : 'bg-brand-700 text-white'
                )}>
                  <Star className="w-3 h-3 fill-current" />
                  {matchScore}%
                </div>
              </div>
            )}

            {/* Verified badge */}
            {user.profile.verificationBadge && (
              <div className="absolute top-2 left-2 badge-verified">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </div>
            )}

            {/* Info overlay */}
            <div className="absolute bottom-0 inset-x-0 p-3 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm leading-tight">
                    {user.firstName}, {age}
                  </h3>
                  {profile?.location?.city && (
                    <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {profile.location.city}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Quick actions */}
        <div className="flex items-center divide-x divide-border">
          <button
            onClick={handleSendInterest}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
          >
            <Heart className="w-3.5 h-3.5" />
            Interest
          </button>
          <button
            onClick={onChat}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chat
          </button>
        </div>
      </motion.div>
    );
  }

  // List variant
  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className={cn('bg-card rounded-2xl border border-border p-4 hover:shadow-card-hover transition-all', className)}
      >
        <div className="flex items-start gap-4">
          <Link to="/profile/$userId" params={{ userId }}>
            <Avatar
              src={user.profile.photoUrl}
              name={`${user.firstName} ${user.lastName}`}
              size="xl"
              verified={user.profile.verificationBadge}
              className="flex-shrink-0"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to="/profile/$userId" params={{ userId }}>
                  <h3 className="font-semibold text-base hover:text-brand-700 transition-colors">
                    {user.firstName} {user.lastName}, {age}
                  </h3>
                </Link>
                <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                  {profile?.location?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {profile.location.city}, {profile.location.state}
                    </span>
                  )}
                  {profile?.education?.highestDegree && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {profile.education.highestDegree}
                    </span>
                  )}
                  {profile?.employment?.designation && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {profile.employment.designation}
                      {profile.employment.company && ` at ${profile.employment.company}`}
                    </span>
                  )}
                </div>

                {profile?.personal?.aboutMe && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {profile.personal.aboutMe}
                  </p>
                )}
              </div>

              {matchScore !== undefined && (
                <ScoreRing score={matchScore} size="sm" showValue />
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleSendInterest}
                className="btn-luxury text-xs px-3 py-1.5"
              >
                <Heart className="w-3.5 h-3.5 inline mr-1" />
                Send Interest
              </button>
              <button
                onClick={onChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </button>
              <Link
                to="/profile/$userId" params={{ userId }}
                className="text-xs text-brand-700 hover:underline ml-auto"
              >
                View Profile â†’
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn('profile-card', className)}
    >
      <Link to="/profile/$userId" params={{ userId }}>
        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
          {user.profile.photoUrl ? (
            <img
              src={user.profile.photoUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className={cn('w-full h-full object-cover transition-all duration-700', imageLoaded ? 'scale-100' : 'scale-110 blur-md')}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-maroon">
              <span className="text-white text-6xl font-display font-bold opacity-20">
                {user.firstName[0]}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {matchScore !== undefined && (
              <div className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm',
                matchScore >= 70 ? 'bg-emerald-500/90 text-white' : matchScore >= 40 ? 'bg-amber-500/90 text-white' : 'bg-brand-700/90 text-white'
              )}>
                <Star className="w-3 h-3 fill-current" />
                {matchScore}% Match
              </div>
            )}
          </div>

          {user.profile.verificationBadge && (
            <div className="absolute top-3 left-3 badge-verified">
              <BadgeCheck className="w-3 h-3" />
              Verified
            </div>
          )}

          {/* Info overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h3 className="font-display font-semibold text-lg text-white leading-tight">
              {user.firstName} {user.lastName}, {age}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile?.location?.city && (
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <MapPin className="w-3 h-3" />
                  {profile.location.city}
                </span>
              )}
              {profile?.education?.highestDegree && (
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <GraduationCap className="w-3 h-3" />
                  {profile.education.highestDegree}
                </span>
              )}
            </div>
            {profile?.employment?.annualIncome && !profile.employment.isIncomePrivate && (
              <div className="text-white/60 text-xs mt-0.5">
                {formatIncome(profile.employment.annualIncome)} / year
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center divide-x divide-border">
        <button
          onClick={handleSendInterest}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
        >
          <Heart className="w-4 h-4" />
          Send Interest
        </button>
        <button
          onClick={onChat}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
      </div>
    </motion.div>
  );
};

