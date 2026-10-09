import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  Heart, Phone, Video, Calendar, CreditCard, Wallet, Gift, Bell, Store,
  Star, Trash2, RotateCcw, AlertTriangle, Activity as ActivityIcon, UsersRound,
  Check, ShieldAlert, Image as ImageIcon,
} from 'lucide-react';
import { dataService } from '../services';
import { PageHeader, DataTable, Avatar, FilterBar, StatCard } from '../components/common';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, StatusBadge, Badge, Button } from '../components/ui';
import { formatDate, formatCurrency, formatCompact } from '../lib/utils';
import type { Pagination } from '../types';

// ─── shared helpers ───────────────────────────────────────────────────────────
type Row = Record<string, any>;
const useList = (key: string, fn: (p: Record<string, unknown>) => Promise<any>, params: Record<string, unknown>) =>
  useQuery({ queryKey: [key, params], queryFn: () => fn(params) });

const userCell = (u: Row | undefined | string) => {
  if (!u || typeof u === 'string') return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-2.5">
      <Avatar src={u.profile?.photoUrl} name={`${u.firstName ?? ''} ${u.lastName ?? ''}`} size="sm" />
      <div>
        <div className="font-medium">{u.firstName} {u.lastName}</div>
        <div className="text-xs text-muted-foreground">{u.phone}</div>
      </div>
    </div>
  );
};

interface PageScaffoldProps {
  title: string; description: string;
  columns: ColumnDef<Row, unknown>[];
  fetcher: (p: Record<string, unknown>) => Promise<any>;
  queryKey: string;
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[];
  empty?: string;
  stats?: (meta: Row | undefined) => React.ReactNode;
}

const DataPage: React.FC<PageScaffoldProps> = ({ title, description, columns, fetcher, queryKey, filters = [], empty, stats }) => {
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, limit: 20 });
  const { data, isLoading } = useList(queryKey, fetcher, params);
  const rows = (data?.data ?? []) as Row[];
  const pagination = data?.pagination as Pagination | undefined;
  const meta = (data as Row)?.meta;

  return (
    <div>
      <PageHeader title={title} description={description} />
      {stats?.(meta)}
      {filters.length > 0 && (
        <FilterBar>
          {filters.map((f) => (
            <Select
              key={f.key}
              value={String(params[f.key] ?? '') || 'all'}
              onValueChange={(v) => setParams((p) => ({ ...p, [f.key]: v === 'all' ? '' : v, page: 1 }))}
            >
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{f.label}</SelectItem>
                {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
        </FilterBar>
      )}
      <DataTable columns={columns} data={rows} isLoading={isLoading} pagination={pagination}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))} emptyMessage={empty ?? 'No records found'} />
    </div>
  );
};

// ─── Finance ──────────────────────────────────────────────────────────────────
export const PaymentsPage = () => (
  <DataPage title="Payments" description="All transactions across Razorpay & Cashfree" queryKey="payments" fetcher={dataService.payments}
    filters={[
      { key: 'status', label: 'All Status', options: ['created', 'pending', 'paid', 'failed', 'refunded'].map((v) => ({ value: v, label: v })) },
      { key: 'provider', label: 'All Providers', options: ['razorpay', 'cashfree', 'wallet'].map((v) => ({ value: v, label: v })) },
    ]}
    columns={[
      { header: 'User', cell: ({ row }) => userCell(row.original.userId) },
      { header: 'Order', accessorKey: 'orderId', cell: ({ row }) => <span className="font-mono text-xs">{row.original.orderId}</span> },
      { header: 'Purpose', accessorKey: 'purpose', cell: ({ row }) => <Badge variant="outline">{row.original.purpose?.replace(/_/g, ' ')}</Badge> },
      { header: 'Amount', cell: ({ row }) => <span className="font-semibold tnum">{formatCurrency(row.original.amount)}</span> },
      { header: 'Provider', accessorKey: 'provider', cell: ({ row }) => <span className="capitalize">{row.original.provider}</span> },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Date', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.paidAt ?? row.original.createdAt, 'datetime')}</span> },
    ]} />
);

export const SubscriptionsPage = () => (
  <DataPage title="Subscriptions" description="Active and historical subscriptions" queryKey="subscriptions" fetcher={dataService.subscriptions}
    filters={[
      { key: 'status', label: 'All Status', options: ['active', 'expired', 'cancelled', 'pending'].map((v) => ({ value: v, label: v })) },
      { key: 'plan', label: 'All Plans', options: ['silver', 'gold', 'platinum', 'elite', 'vip_assisted'].map((v) => ({ value: v, label: v })) },
    ]}
    columns={[
      { header: 'User', cell: ({ row }) => userCell(row.original.userId) },
      { header: 'Plan', accessorKey: 'plan', cell: ({ row }) => <Badge variant="default" className="capitalize">{row.original.plan?.replace(/_/g, ' ')}</Badge> },
      { header: 'Price', cell: ({ row }) => <span className="tnum">{formatCurrency(row.original.price)}</span> },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Start', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.startDate)}</span> },
      { header: 'End', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.endDate)}</span> },
    ]} />
);

export const WalletPage = () => (
  <DataPage title="Wallet Transactions" description="Credits, debits, and rewards across the platform" queryKey="wallet" fetcher={dataService.walletTransactions}
    filters={[{ key: 'type', label: 'All Types', options: [{ value: 'credit', label: 'Credit' }, { value: 'debit', label: 'Debit' }] }]}
    columns={[
      { header: 'User', cell: ({ row }) => userCell(row.original.userId) },
      { header: 'Type', cell: ({ row }) => <Badge variant={row.original.type === 'credit' ? 'success' : 'destructive'}>{row.original.type}</Badge> },
      { header: 'Source', accessorKey: 'source', cell: ({ row }) => <span className="capitalize">{row.original.source?.replace(/_/g, ' ')}</span> },
      { header: 'Amount', cell: ({ row }) => <span className="font-semibold tnum">{formatCurrency(row.original.amount)}</span> },
      { header: 'Balance After', cell: ({ row }) => <span className="tnum text-muted-foreground">{formatCurrency(row.original.balanceAfter ?? 0)}</span> },
      { header: 'Date', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'datetime')}</span> },
    ]} />
);

export const ReferralsPage = () => (
  <DataPage title="Referrals" description="Referral performance and reward distribution" queryKey="referrals" fetcher={dataService.referrals}
    filters={[{ key: 'status', label: 'All Status', options: ['registered', 'subscribed', 'rewarded'].map((v) => ({ value: v, label: v })) }]}
    columns={[
      { header: 'Referrer', cell: ({ row }) => userCell(row.original.referrerId) },
      { header: 'Referred', cell: ({ row }) => userCell(row.original.referredUserId) },
      { header: 'Code', accessorKey: 'referralCode', cell: ({ row }) => <code className="text-xs">{row.original.referralCode}</code> },
      { header: 'Reward', cell: ({ row }) => <span className="tnum">{formatCurrency(row.original.rewardAmount ?? 0)}</span> },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Date', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'relative')}</span> },
    ]} />
);

// ─── Engagement ───────────────────────────────────────────────────────────────
export const InterestsPage = () => (
  <DataPage title="Interest Management" description="Track interests and conversion across the platform" queryKey="interests" fetcher={dataService.interests}
    filters={[{ key: 'status', label: 'All Status', options: ['sent', 'accepted', 'declined', 'chat_started', 'engaged', 'married'].map((v) => ({ value: v, label: v.replace(/_/g, ' ') })) }]}
    columns={[
      { header: 'Sender', cell: ({ row }) => userCell(row.original.senderId) },
      { header: 'Receiver', cell: ({ row }) => userCell(row.original.receiverId) },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Stage', accessorKey: 'currentStage', cell: ({ row }) => <Badge variant="outline">{row.original.currentStage?.replace(/_/g, ' ')}</Badge> },
      { header: 'Date', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'relative')}</span> },
    ]} />
);

export const CallsPage = () => (
  <DataPage title="Call Management" description="Voice & video call logs (Agora RTC)" queryKey="calls" fetcher={dataService.calls}
    filters={[
      { key: 'type', label: 'All Types', options: [{ value: 'voice', label: 'Voice' }, { value: 'video', label: 'Video' }] },
      { key: 'status', label: 'All Status', options: ['ended', 'missed', 'declined', 'failed'].map((v) => ({ value: v, label: v })) },
    ]}
    columns={[
      { header: 'Caller', cell: ({ row }) => userCell(row.original.callerId) },
      { header: 'Receiver', cell: ({ row }) => userCell(row.original.receiverId) },
      { header: 'Type', cell: ({ row }) => <Badge variant="outline">{row.original.type === 'video' ? 'Video' : 'Voice'}</Badge> },
      { header: 'Duration', cell: ({ row }) => <span className="tnum">{Math.floor((row.original.durationSeconds ?? 0) / 60)}m {(row.original.durationSeconds ?? 0) % 60}s</span> },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Date', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'relative')}</span> },
    ]} />
);

export const MeetingsPage = () => (
  <DataPage title="Meeting Management" description="Video, family, and physical meetings" queryKey="meetings" fetcher={dataService.meetings}
    filters={[
      { key: 'type', label: 'All Types', options: ['video', 'family', 'physical'].map((v) => ({ value: v, label: v })) },
      { key: 'status', label: 'All Status', options: ['scheduled', 'confirmed', 'completed', 'cancelled'].map((v) => ({ value: v, label: v })) },
    ]}
    columns={[
      { header: 'Type', accessorKey: 'type', cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.type}</Badge> },
      { header: 'Scheduled', cell: ({ row }) => <span className="text-sm">{formatDate(row.original.scheduledAt, 'datetime')}</span> },
      { header: 'Duration', cell: ({ row }) => <span className="tnum">{row.original.duration ?? 60} min</span> },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Outcome', cell: ({ row }) => row.original.outcome ? <Badge variant="secondary">{row.original.outcome}</Badge> : <span className="text-muted-foreground">—</span> },
    ]} />
);

// ─── Content ──────────────────────────────────────────────────────────────────
export const NotificationsPage = () => (
  <DataPage title="Notifications" description="Delivered notifications across channels" queryKey="notifications" fetcher={dataService.notifications}
    columns={[
      { header: 'User', cell: ({ row }) => userCell(row.original.userId) },
      { header: 'Type', accessorKey: 'type', cell: ({ row }) => <Badge variant="outline">{row.original.type?.replace(/_/g, ' ')}</Badge> },
      { header: 'Title', accessorKey: 'title', cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
      { header: 'Channels', cell: ({ row }) => <span className="text-xs text-muted-foreground">{(row.original.channels ?? []).join(', ')}</span> },
      { header: 'Read', cell: ({ row }) => <Badge variant={row.original.isRead ? 'secondary' : 'warning'}>{row.original.isRead ? 'read' : 'unread'}</Badge> },
      { header: 'Date', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'relative')}</span> },
    ]} />
);

export const MarketplacePage = () => {
  const qc = useQueryClient();
  const approve = useMutation({ mutationFn: (id: string) => dataService.approveMarketplace(id), onSuccess: () => { toast.success('Listing approved'); qc.invalidateQueries({ queryKey: ['marketplace-admin'] }); } });
  return (
    <DataPage title="Marketplace" description="Wedding vendor listings & approvals" queryKey="marketplace-admin" fetcher={dataService.marketplace}
      filters={[{ key: 'category', label: 'All Categories', options: ['venue', 'photography', 'catering', 'decoration', 'makeup', 'priest', 'event_management'].map((v) => ({ value: v, label: v.replace(/_/g, ' ') })) }]}
      columns={[
        { header: 'Business', accessorKey: 'businessName', cell: ({ row }) => <span className="font-medium">{row.original.businessName}</span> },
        { header: 'Category', cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.category?.replace(/_/g, ' ')}</Badge> },
        { header: 'City', cell: ({ row }) => <span>{row.original.location?.city}</span> },
        { header: 'Rating', cell: ({ row }) => <span className="tnum">★ {row.original.rating?.toFixed(1) ?? '0.0'}</span> },
        { header: 'Approved', cell: ({ row }) => <StatusBadge status={row.original.isApproved ? 'approved' : 'pending'} /> },
        { header: '', id: 'a', cell: ({ row }) => !row.original.isApproved ? <Button size="sm" variant="success" onClick={() => approve.mutate(row.original._id)}><Check className="w-3.5 h-3.5" /> Approve</Button> : null },
      ]} />
  );
};

export const SuccessStoriesPage = () => {
  const qc = useQueryClient();
  const approve = useMutation({ mutationFn: (id: string) => dataService.approveSuccessStory(id), onSuccess: () => { toast.success('Story approved'); qc.invalidateQueries({ queryKey: ['stories-admin'] }); } });
  return (
    <DataPage title="Success Stories" description="Review and publish success stories" queryKey="stories-admin" fetcher={dataService.successStories}
      filters={[{ key: 'isApproved', label: 'All', options: [{ value: 'true', label: 'Approved' }, { value: 'false', label: 'Pending' }] }]}
      columns={[
        { header: 'Title', accessorKey: 'title', cell: ({ row }) => <span className="font-medium max-w-xs truncate block">{row.original.title}</span> },
        { header: 'Marriage Date', cell: ({ row }) => <span className="text-sm">{formatDate(row.original.marriageDate)}</span> },
        { header: 'Views', cell: ({ row }) => <span className="tnum">{formatCompact(row.original.viewCount ?? 0)}</span> },
        { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isApproved ? 'approved' : 'pending'} /> },
        { header: '', id: 'a', cell: ({ row }) => !row.original.isApproved ? <Button size="sm" variant="success" onClick={() => approve.mutate(row.original._id)}><Check className="w-3.5 h-3.5" /> Approve</Button> : null },
      ]} />
  );
};

// ─── Ops ──────────────────────────────────────────────────────────────────────
export const ModerationPage = () => (
  <DataPage title="Moderation" description="Profiles with unverified photos awaiting review" queryKey="moderation" fetcher={dataService.moderation}
    empty="Nothing to moderate — all photos reviewed"
    columns={[
      { header: 'User', cell: ({ row }) => userCell(row.original.userId) },
      { header: 'Photos', cell: ({ row }) => <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />{row.original.photos?.length ?? 0}</span> },
      { header: 'Completion', cell: ({ row }) => `${row.original.completionScore ?? 0}%` },
      { header: 'Submitted', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'relative')}</span> },
    ]} />
);

export const FraudPage = () => (
  <DataPage title="Fraud Management" description="Suspended accounts and duplicate detection" queryKey="fraud" fetcher={dataService.fraud}
    empty="No suspended accounts"
    stats={(meta) => meta ? (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="Suspended" value={meta.suspendedCount ?? 0} icon={ShieldAlert} color="destructive" />
        <StatCard title="Duplicate Emails" value={meta.duplicateEmails ?? 0} icon={AlertTriangle} color="warning" />
        <StatCard title="Duplicate Phones" value={meta.duplicatePhones ?? 0} icon={AlertTriangle} color="warning" />
      </div>
    ) : null}
    columns={[
      { header: 'User', cell: ({ row }) => userCell(row.original) },
      { header: 'Email', accessorKey: 'email', cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.email ?? '—'}</span> },
      { header: 'Trust', cell: ({ row }) => <span className="tnum">{row.original.profile?.trustScore ?? 0}%</span> },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Joined', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'relative')}</span> },
    ]} />
);

export const ActivityPage = () => (
  <DataPage title="Activity Timeline" description="Platform-wide audit & activity events" queryKey="activity" fetcher={dataService.activity}
    columns={[
      { header: 'Action', accessorKey: 'action', cell: ({ row }) => <Badge variant="outline" className="font-mono text-[11px]">{row.original.action}</Badge> },
      { header: 'Entity', cell: ({ row }) => <span>{row.original.entityType ?? '—'}</span> },
      { header: 'IP', cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.ipAddress ?? '—'}</span> },
      { header: 'Platform', cell: ({ row }) => <Badge variant="secondary">{row.original.platform ?? '—'}</Badge> },
      { header: 'Time', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'datetime')}</span> },
    ]} />
);

export const FamilyPage = () => (
  <DataPage title="Family Accounts" description="Candidate, parent, and guardian accounts" queryKey="family" fetcher={dataService.family}
    columns={[
      { header: 'Name', cell: ({ row }) => <span className="font-medium">{row.original.firstName} {row.original.lastName}</span> },
      { header: 'Phone', accessorKey: 'phone', cell: ({ row }) => <span className="text-sm">{row.original.phone}</span> },
      { header: 'Role', accessorKey: 'role', cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.role}</Badge> },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Joined', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'relative')}</span> },
    ]} />
);

export const CrmPage = () => (
  <DataPage title="CRM" description="Member portfolio for relationship managers" queryKey="crm" fetcher={dataService.crmMembers}
    columns={[
      { header: 'Member', cell: ({ row }) => userCell(row.original) },
      { header: 'Plan', cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.subscription?.plan?.replace(/_/g, ' ') ?? 'free'}</Badge> },
      { header: 'Completion', cell: ({ row }) => `${row.original.profile?.completionScore ?? 0}%` },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Last Active', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.lastActiveAt, 'relative')}</span> },
    ]} />
);

export const AccountDeletionPage = () => {
  const qc = useQueryClient();
  const restore = useMutation({ mutationFn: (id: string) => dataService.restoreAccount(id), onSuccess: () => { toast.success('Account restored'); qc.invalidateQueries({ queryKey: ['account-deletions'] }); } });
  return (
    <DataPage title="Account Deletion" description="Pending deletion & restore requests" queryKey="account-deletions" fetcher={dataService.accountDeletions}
      empty="No deletion requests"
      columns={[
        { header: 'Name', cell: ({ row }) => <span className="font-medium">{row.original.firstName} {row.original.lastName}</span> },
        { header: 'Phone', accessorKey: 'phone' },
        { header: 'Reason', cell: ({ row }) => <span className="text-sm text-muted-foreground max-w-xs truncate block">{row.original.deletionReason ?? '—'}</span> },
        { header: 'Deletes On', cell: ({ row }) => <span className="text-sm">{formatDate(row.original.scheduledDeletionAt)}</span> },
        { header: '', id: 'a', cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => restore.mutate(row.original._id)}><RotateCcw className="w-3.5 h-3.5" /> Restore</Button> },
      ]} />
  );
};
