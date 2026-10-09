import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ScrollText } from 'lucide-react';
import { adminService } from '../services';
import { PageHeader, DataTable, FilterBar } from '../components/common';
import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge } from '../components/ui';
import { formatDate, debounce } from '../lib/utils';
import type { AuditLog, Pagination } from '../types';

export const AuditPage: React.FC = () => {
  const [filters, setFilters] = useState({ page: 1, action: '', userId: '' });
  const { data, isLoading } = useQuery({ queryKey: ['audit', filters], queryFn: () => adminService.getAuditLogs(filters) });
  const logs = (data?.data ?? []) as AuditLog[];
  const pagination = data?.pagination as Pagination | undefined;

  const setUserId = debounce((v: string) => setFilters((f) => ({ ...f, userId: v, page: 1 })), 400);

  const columns: ColumnDef<AuditLog, unknown>[] = [
    { header: 'Action', accessorKey: 'action', cell: ({ row }) => <Badge variant="outline" className="font-mono text-[11px]">{row.original.action}</Badge> },
    { header: 'Entity', cell: ({ row }) => <span className="text-sm">{row.original.entityType ?? ''}</span> },
    { header: 'Entity ID', cell: ({ row }) => <code className="text-xs text-muted-foreground">{row.original.entityId?.slice(0, 12) ?? ''}</code> },
    { header: 'Performed By', cell: ({ row }) => <code className="text-xs">{String(row.original.performedBy ?? row.original.userId ?? '').slice(0, 12)}</code> },
    { header: 'IP', accessorKey: 'ipAddress', cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.ipAddress ?? ''}</span> },
    { header: 'Platform', cell: ({ row }) => <Badge variant="secondary">{row.original.platform ?? ''}</Badge> },
    { header: 'Time', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'datetime')}</span> },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" description="Complete trail of admin and user actions" />
      <FilterBar>
        <Input placeholder="Filter by user ID..." className="max-w-xs" onChange={(e) => setUserId(e.target.value)} />
        <Select value={filters.action || 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, action: v === 'all' ? '' : v, page: 1 }))}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {['auth.login', 'user.suspended', 'payment.success', 'verification.approved', 'admin.action'].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable columns={columns} data={logs} isLoading={isLoading} pagination={pagination} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} emptyMessage="No audit logs" />
    </div>
  );
};
