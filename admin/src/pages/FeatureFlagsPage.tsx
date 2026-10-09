import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ToggleLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../services';
import { PageHeader, EmptyState } from '../components/common';
import { Card, CardContent, Badge, Button, Skeleton } from '../components/ui';
import { cn } from '../lib/utils';
import type { FeatureFlag } from '../types';

export const FeatureFlagsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['feature-flags'], queryFn: () => adminService.getFeatureFlags() });
  const flags = (data?.data ?? []) as FeatureFlag[];

  const toggleMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) => adminService.updateFeatureFlag(id, { isEnabled }),
    onSuccess: () => { toast.success('Feature flag updated'); queryClient.invalidateQueries({ queryKey: ['feature-flags'] }); },
  });

  return (
    <div>
      <PageHeader title="Feature Flags" description="Control feature rollouts by role, plan, region, and percentage" actions={<Button size="sm"><Plus className="w-4 h-4" /> New Flag</Button>} />

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : flags.length === 0 ? (
        <Card><CardContent><EmptyState icon={ToggleLeft} title="No feature flags" description="Create flags to control feature rollouts." /></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {flags.map((flag) => (
            <Card key={flag._id}>
              <CardContent className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{flag.name}</h3>
                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{flag.key}</code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {flag.rolloutPercentage < 100 && <Badge variant="warning">{flag.rolloutPercentage}% rollout</Badge>}
                    {flag.enabledForPlans?.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}
                    {flag.enabledForRoles?.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
                  </div>
                </div>
                <button
                  onClick={() => toggleMutation.mutate({ id: flag._id, isEnabled: !flag.isEnabled })}
                  className={cn('relative w-11 h-6 rounded-full transition-colors flex-shrink-0', flag.isEnabled ? 'bg-success' : 'bg-muted')}
                >
                  <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', flag.isEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
