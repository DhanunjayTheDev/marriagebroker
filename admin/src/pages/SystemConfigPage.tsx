import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../services';
import { PageHeader, EmptyState } from '../components/common';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Skeleton, Badge } from '../components/ui';
import type { SystemConfig } from '../types';

export const SystemConfigPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['system-config'], queryFn: () => adminService.getConfig() });
  const configs = (data?.data ?? []) as SystemConfig[];
  const [edits, setEdits] = useState<Record<string, string>>({});

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => adminService.updateConfig(key, value),
    onSuccess: () => { toast.success('Configuration saved'); queryClient.invalidateQueries({ queryKey: ['system-config'] }); },
  });

  // Group by category
  const grouped = configs.reduce<Record<string, SystemConfig[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="System Configuration" description="Manage platform settings without deployment" />

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : configs.length === 0 ? (
        <Card><CardContent><EmptyState icon={Settings} title="No configuration keys" description="System config keys will appear here once seeded." /></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <Card key={category}>
              <CardHeader><CardTitle className="capitalize">{category.replace(/_/g, ' ')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {items.map((cfg) => (
                  <div key={cfg.key} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {cfg.key}
                        {cfg.isPublic && <Badge variant="outline">public</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{cfg.description}</div>
                    </div>
                    <Input
                      className="w-48"
                      defaultValue={String(cfg.value)}
                      onChange={(e) => setEdits((p) => ({ ...p, [cfg.key]: e.target.value }))}
                    />
                    <Button size="icon-sm" variant="ghost" disabled={edits[cfg.key] === undefined} onClick={() => updateMutation.mutate({ key: cfg.key, value: edits[cfg.key] })}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
