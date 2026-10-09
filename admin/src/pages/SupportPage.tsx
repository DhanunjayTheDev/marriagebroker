import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Headphones, Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supportService } from '../services';
import { PageHeader, DataTable, FilterBar } from '../components/common';
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, StatusBadge, Badge } from '../components/ui';
import { formatDate } from '../lib/utils';
import type { Ticket, Pagination } from '../types';

export const SupportPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, status: '' });

  const { data, isLoading } = useQuery({ queryKey: ['support', filters], queryFn: () => supportService.getTickets(filters) });
  const tickets = (data?.data ?? []) as Ticket[];
  const pagination = data?.pagination as Pagination | undefined;

  const resolveMutation = useMutation({
    mutationFn: (id: string) => supportService.resolveTicket(id),
    onSuccess: () => { toast.success('Ticket resolved'); queryClient.invalidateQueries({ queryKey: ['support'] }); },
  });

  const columns: ColumnDef<Ticket, unknown>[] = [
    { header: 'Ticket', accessorKey: 'ticketNumber', cell: ({ row }) => <span className="font-mono text-xs">#{row.original.ticketNumber}</span> },
    { header: 'Subject', accessorKey: 'subject', cell: ({ row }) => <div className="max-w-xs truncate font-medium">{row.original.subject}</div> },
    { header: 'Category', accessorKey: 'category', cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge> },
    { header: 'Priority', accessorKey: 'priority', cell: ({ row }) => {
      const p = row.original.priority;
      return <Badge variant={p === 'critical' || p === 'high' ? 'destructive' : p === 'medium' ? 'warning' : 'secondary'}>{p}</Badge>;
    } },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Created', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt, 'relative')}</span> },
    { header: '', id: 'actions', cell: ({ row }) => (
      row.original.status !== 'resolved' && row.original.status !== 'closed' ? (
        <div onClick={(e) => e.stopPropagation()} className="flex gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => resolveMutation.mutate(row.original._id)} title="Resolve"><Check className="w-4 h-4 text-success" /></Button>
        </div>
      ) : null
    ) },
  ];

  return (
    <div>
      <PageHeader title="Support Management" description="Handle customer support tickets and escalations" />
      <FilterBar>
        <Select value={filters.status || 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, status: v === 'all' ? '' : v, page: 1 }))}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {['open', 'in_progress', 'resolved', 'closed', 'reopened'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable columns={columns} data={tickets} isLoading={isLoading} pagination={pagination} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} emptyMessage="No tickets" />
    </div>
  );
};
