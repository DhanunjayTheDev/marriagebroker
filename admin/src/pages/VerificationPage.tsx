import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Check, X, Eye, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../services';
import { PageHeader, Avatar, FilterBar, EmptyState } from '../components/common';
import { Card, CardContent, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, StatusBadge, Badge, TableSkeleton } from '../components/ui';
import { formatDate, cn } from '../lib/utils';
import type { Verification, Pagination } from '../types';

export const VerificationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: 'pending', page: 1, limit: 20 });
  const [selected, setSelected] = useState<Verification | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['verifications', filters],
    queryFn: () => adminService.getVerifications(filters),
  });

  const verifications = (data?.data ?? []) as Verification[];
  const pagination = data?.pagination as Pagination | undefined;

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveVerification(id),
    onSuccess: () => { toast.success('Verification approved'); setSelected(null); queryClient.invalidateQueries({ queryKey: ['verifications'] }); },
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminService.rejectVerification(id, reason),
    onSuccess: () => { toast.success('Verification rejected'); setSelected(null); setRejectReason(''); queryClient.invalidateQueries({ queryKey: ['verifications'] }); },
  });

  const userOf = (v: Verification) => (typeof v.userId === 'object' ? v.userId : null);

  return (
    <div>
      <PageHeader title="Verification Queue" description="Review and process identity verification requests" />

      <FilterBar>
        <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v, page: 1 }))}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="warning"><Clock className="w-3 h-3" /> {pagination?.total ?? 0} in queue</Badge>
      </FilterBar>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Queue list */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <Card><CardContent><TableSkeleton rows={6} cols={3} /></CardContent></Card>
          ) : verifications.length === 0 ? (
            <Card><CardContent><EmptyState icon={ShieldCheck} title="Queue empty" description="No verification requests to process." /></CardContent></Card>
          ) : (
            verifications.map((v) => {
              const u = userOf(v);
              return (
                <Card key={v._id} className={cn('cursor-pointer transition-all hover:shadow-md', selected?._id === v._id && 'ring-2 ring-primary')} >
                  <CardContent className="flex items-center gap-3" >
                    <div onClick={() => setSelected(v)} className="flex items-center gap-3 flex-1">
                      <Avatar name={u ? `${u.firstName} ${u.lastName}` : 'User'} size="md" />
                      <div className="flex-1">
                        <div className="font-medium">{u ? `${u.firstName} ${u.lastName}` : 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{u?.phone}</div>
                      </div>
                      <Badge variant="outline" className="capitalize">{v.type.replace(/_/g, ' ')}</Badge>
                      <StatusBadge status={v.status} />
                    </div>
                    {v.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => approveMutation.mutate(v._id)} title="Approve"><Check className="w-4 h-4 text-success" /></Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => setSelected(v)} title="Review"><Eye className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Review panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent>
              {!selected ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Select a request to review</div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold capitalize">{selected.type.replace(/_/g, ' ')} Verification</h3>
                  {selected.documentUrl ? (
                    <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                      <img src={selected.documentUrl} alt="document" className="max-w-full max-h-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <FileText className="w-10 h-10 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">No document</div>
                  )}
                  <div className="text-xs text-muted-foreground">Submitted {formatDate(selected.createdAt, 'datetime')}</div>

                  {selected.status === 'pending' && (
                    <>
                      <Button className="w-full" variant="success" onClick={() => approveMutation.mutate(selected._id)} loading={approveMutation.isPending}>
                        <Check className="w-4 h-4" /> Approve
                      </Button>
                      <div className="space-y-2">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Rejection reason..."
                          rows={2}
                          className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                        <Button className="w-full" variant="destructive" disabled={!rejectReason} onClick={() => rejectMutation.mutate({ id: selected._id, reason: rejectReason })} loading={rejectMutation.isPending}>
                          <X className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
