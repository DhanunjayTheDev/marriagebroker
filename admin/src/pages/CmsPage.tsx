import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { FileText, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../services';
import { PageHeader, DataTable, FilterBar } from '../components/common';
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge, StatusBadge } from '../components/ui';
import { formatDate } from '../lib/utils';
import type { CmsPage as CmsPageType, Pagination } from '../types';

export const CmsPage: React.FC = () => {
  const [type, setType] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['cms', type], queryFn: () => adminService.getCmsPages(type || undefined) });
  const pages = (data?.data ?? []) as CmsPageType[];

  const columns: ColumnDef<CmsPageType, unknown>[] = [
    { header: 'Title', accessorKey: 'title', cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
    { header: 'Type', accessorKey: 'type', cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge> },
    { header: 'Slug', accessorKey: 'slug', cell: ({ row }) => <code className="text-xs text-muted-foreground">/{row.original.slug}</code> },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isPublished ? 'active' : 'pending'} /> },
    { header: 'Views', accessorKey: 'viewCount', cell: ({ row }) => <span className="flex items-center gap-1 text-sm"><Eye className="w-3.5 h-3.5 text-muted-foreground" />{row.original.viewCount}</span> },
    { header: 'Updated', cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.updatedAt, 'relative')}</span> },
  ];

  return (
    <div>
      <PageHeader title="CMS Management" description="Manage pages, blogs, FAQs, and marketing content" actions={<Button size="sm"><Plus className="w-4 h-4" /> New Page</Button>} />
      <FilterBar>
        <Select value={type || 'all'} onValueChange={(v) => setType(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {['page', 'blog', 'faq', 'banner'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable columns={columns} data={pages} isLoading={isLoading} emptyMessage="No content pages" />
    </div>
  );
};
