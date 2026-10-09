import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { type ColumnDef } from '@tanstack/react-table';
import { Users, Search, Download, Ban, RotateCcw, Shield, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../services';
import { PageHeader, DataTable, Avatar, FilterBar, PermissionGate } from '../components/common';
import { Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, StatusBadge, Badge } from '../components/ui';
import { Permission } from '../permissions';
import { calculateAge, formatDate, debounce } from '../lib/utils';
import type { PlatformUser, Pagination } from '../types';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', status: '', plan: '', role: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminService.getUsers(filters),
  });

  const users = (data?.data ?? []) as PlatformUser[];
  const pagination = data?.pagination as Pagination | undefined;

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminService.suspendUser(id),
    onSuccess: () => { toast.success('User suspended'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
  });
  const restoreMutation = useMutation({
    mutationFn: (id: string) => adminService.restoreUser(id),
    onSuccess: () => { toast.success('User restored'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
  });

  const setSearch = debounce((v: string) => setFilters((f) => ({ ...f, search: v, page: 1 })), 400);

  const columns: ColumnDef<PlatformUser, unknown>[] = [
    {
      header: 'User',
      accessorKey: 'firstName',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar src={u.profile?.photoUrl} name={`${u.firstName} ${u.lastName}`} size="md" />
            <div>
              <div className="font-medium flex items-center gap-1.5">
                {u.firstName} {u.lastName}
                {u.profile?.verificationBadge && <Shield className="w-3.5 h-3.5 text-secondary" />}
              </div>
              <div className="text-xs text-muted-foreground">{u.phone}{u.email && ` · ${u.email}`}</div>
            </div>
          </div>
        );
      },
    },
    { header: 'Age', cell: ({ row }) => calculateAge(row.original.dateOfBirth) },
    { header: 'Gender', accessorKey: 'gender', cell: ({ row }) => <span className="capitalize">{row.original.gender}</span> },
    { header: 'Plan', cell: ({ row }) => <Badge variant="outline">{row.original.subscription?.plan ?? 'free'}</Badge> },
    {
      header: 'Trust',
      cell: ({ row }) => {
        const s = row.original.profile?.trustScore ?? 0;
        return <span className={s >= 70 ? 'text-success' : s >= 40 ? 'text-warning' : 'text-muted-foreground'}>{s}%</span>;
      },
    },
    { header: 'Completion', cell: ({ row }) => `${row.original.profile?.completionScore ?? 0}%` },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Joined', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span> },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <PermissionGate permission={Permission.USER_SUSPEND}>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {u.status === 'suspended' ? (
                <Button size="icon-sm" variant="ghost" onClick={() => restoreMutation.mutate(u._id)} title="Restore">
                  <RotateCcw className="w-4 h-4 text-success" />
                </Button>
              ) : (
                <Button size="icon-sm" variant="ghost" onClick={() => suspendMutation.mutate(u._id)} title="Suspend">
                  <Ban className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          </PermissionGate>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage all platform users, profiles, and accounts"
        actions={
          <PermissionGate permission={Permission.DATA_EXPORT}>
            <Button variant="outline" size="sm"><Download className="w-4 h-4" /> Export</Button>
          </PermissionGate>
        }
      />

      <FilterBar>
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, phone, email..." className="pl-9" onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filters.status || 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, status: v === 'all' ? '' : v, page: 1 }))}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending_verification">Pending</SelectItem>
            <SelectItem value="deactivated">Deactivated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.plan || 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, plan: v === 'all' ? '' : v, page: 1 }))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {['free', 'silver', 'gold', 'platinum', 'elite', 'vip_assisted'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.role || 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, role: v === 'all' ? '' : v, page: 1 }))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {['candidate', 'parent', 'guardian'].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        onRowClick={(u) => navigate({ to: '/users/$userId', params: { userId: u._id } })}
        emptyMessage="No users found"
      />
    </div>
  );
};
