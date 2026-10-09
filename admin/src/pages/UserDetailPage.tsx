import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Ban, RotateCcw, Shield, Phone, Mail, MapPin, Briefcase, GraduationCap, Heart, Star, Calendar, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { profileService, adminService } from '../services';
import { PageHeader, Avatar, PermissionGate } from '../components/common';
import { Card, CardContent, Button, StatusBadge, Badge, Skeleton } from '../components/ui';
import { Permission } from '../permissions';
import { calculateAge, formatDate, cn } from '../lib/utils';
import type { PlatformUser } from '../types';

const TABS = ['Overview', 'Profile', 'Activity', 'Sessions', 'Notes'];

export const UserDetailPage: React.FC = () => {
  const { userId } = useParams({ from: '/users/$userId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('Overview');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => profileService.getProfile(userId),
  });

  const suspendMutation = useMutation({
    mutationFn: () => adminService.suspendUser(userId),
    onSuccess: () => { toast.success('User suspended'); queryClient.invalidateQueries({ queryKey: ['admin-user', userId] }); },
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>;
  }

  const user = data?.data?.user as PlatformUser | undefined;
  const profile = data?.data?.profile as Record<string, any> | undefined;
  const astrology = data?.data?.astrology as Record<string, any> | undefined;

  if (!user) return <div className="py-16 text-center text-muted-foreground">User not found</div>;

  return (
    <div>
      <button onClick={() => navigate({ to: '/users' })} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Header card */}
      <Card className="mb-6">
        <CardContent className="flex flex-col md:flex-row md:items-center gap-4">
          <Avatar src={user.profile?.photoUrl} name={`${user.firstName} ${user.lastName}`} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold">{user.firstName} {user.lastName}</h1>
              {user.profile?.verificationBadge && <Shield className="w-4 h-4 text-secondary" />}
              <StatusBadge status={user.status} />
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user.phone}</span>
              {user.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>}
              <span>{calculateAge(user.dateOfBirth)} yrs · {user.gender}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PermissionGate permission={Permission.USER_SUSPEND}>
              {user.status === 'suspended' ? (
                <Button variant="success" size="sm"><RotateCcw className="w-4 h-4" /> Restore</Button>
              ) : (
                <Button variant="destructive" size="sm" onClick={() => suspendMutation.mutate()}><Ban className="w-4 h-4" /> Suspend</Button>
              )}
            </PermissionGate>
          </div>
        </CardContent>
      </Card>

      {/* Score chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Trust Score', value: `${user.profile?.trustScore ?? 0}%`, icon: Shield },
          { label: 'Profile Strength', value: `${user.profile?.profileStrengthScore ?? user.profile?.completionScore ?? 0}%`, icon: Star },
          { label: 'Completion', value: `${user.profile?.completionScore ?? 0}%`, icon: Activity },
          { label: 'Plan', value: user.subscription?.plan ?? 'free', icon: Heart },
        ].map((s) => (
          <Card key={s.label}><CardContent className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-primary"><s.icon className="w-4.5 h-4.5" /></div>
            <div><div className="font-bold capitalize">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors', tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Overview' && (
        <div className="grid md:grid-cols-2 gap-4">
          <DetailCard title="Career" icon={Briefcase} rows={[
            ['Designation', profile?.employment?.designation],
            ['Company', profile?.employment?.company],
            ['Industry', profile?.employment?.industry],
            ['Income', profile?.employment?.annualIncome ? `₹${profile.employment.annualIncome}` : undefined],
          ]} />
          <DetailCard title="Education" icon={GraduationCap} rows={[
            ['Degree', profile?.education?.highestDegree],
            ['Field', profile?.education?.fieldOfStudy],
            ['College', profile?.education?.college],
          ]} />
          <DetailCard title="Location" icon={MapPin} rows={[
            ['City', profile?.location?.city],
            ['State', profile?.location?.state],
            ['NRI', profile?.location?.isNRI ? 'Yes' : 'No'],
          ]} />
          <DetailCard title="Astrology" icon={Star} rows={[
            ['Rasi', astrology?.rasi],
            ['Nakshatra', astrology?.nakshatram],
            ['Manglik', astrology?.doshams?.manglik ? 'Yes' : 'No'],
          ]} />
        </div>
      )}
      {tab !== 'Overview' && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          {tab} data for this user  loaded from /admin endpoints (timeline, sessions, internal notes).
        </CardContent></Card>
      )}
    </div>
  );
};

const DetailCard: React.FC<{ title: string; icon: React.ElementType; rows: Array<[string, string | undefined]> }> = ({ title, icon: Icon, rows }) => (
  <Card>
    <CardContent>
      <div className="flex items-center gap-2 mb-3"><Icon className="w-4 h-4 text-primary" /><h3 className="font-semibold">{title}</h3></div>
      <div className="space-y-2">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm"><span className="text-muted-foreground">{k}</span><span className="font-medium capitalize">{String(v).replace(/_/g, ' ')}</span></div>
        ))}
        {rows.every(([, v]) => !v) && <p className="text-sm text-muted-foreground">No data</p>}
      </div>
    </CardContent>
  </Card>
);
