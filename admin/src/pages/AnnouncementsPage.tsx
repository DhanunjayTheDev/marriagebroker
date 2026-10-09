import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, Plus } from 'lucide-react';
import { adminService } from '../services';
import { PageHeader, EmptyState } from '../components/common';
import { Card, CardContent, Button, Badge, StatusBadge, Skeleton } from '../components/ui';
import { formatDate } from '../lib/utils';
import type { Announcement } from '../types';

export const AnnouncementsPage: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['announcements'], queryFn: () => adminService.getAnnouncements() });
  const announcements = (data?.data ?? []) as Announcement[];

  return (
    <div>
      <PageHeader title="Announcements" description="Banners, popups, promotions, and maintenance notices" actions={<Button size="sm"><Plus className="w-4 h-4" /> New Announcement</Button>} />
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : announcements.length === 0 ? (
        <Card><CardContent><EmptyState icon={Megaphone} title="No announcements" description="Create banners and campaigns to engage users." /></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a._id}>
              <CardContent className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{a.title}</h3>
                    <Badge variant="outline">{a.type}</Badge>
                    <Badge variant="secondary">{a.target}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{a.content}</p>
                  {(a.startsAt || a.endsAt) && (
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(a.startsAt)} → {formatDate(a.endsAt)}</p>
                  )}
                </div>
                <StatusBadge status={a.isActive ? 'active' : 'expired'} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
