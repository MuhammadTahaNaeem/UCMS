import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";
import { Bell } from "lucide-react";
import { fetchUserNotifications, markNotificationRead } from "@/features/user/userApi";

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: fetchUserNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    },
  });

  const notes = response?.data ?? [];

  return (
    <PageShell title="Notifications" subtitle="Recent system notifications">
      <div className="space-y-4">
        {isLoading ? (
          <Card className="rounded-xl border border-border shadow-sm">
            <div className="p-6">
              <TableRowsSkeleton rows={4} />
            </div>
          </Card>
        ) : error ? (
          <Card className="rounded-xl border border-border shadow-sm">
            <div className="p-6 text-center text-destructive">Failed to load notifications.</div>
          </Card>
        ) : notes.length ? (
          notes.map((n) => (
            <Card key={n._id} className="rounded-xl border border-border shadow-sm">
              <div className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  {n.complaintId?.complaintId ? (
                    <p className="mt-1 text-xs text-muted-foreground">Complaint: {n.complaintId.complaintId}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                  {!n.isRead ? (
                    <Button size="sm" variant="outline" onClick={() => markReadMutation.mutate(n._id)}>
                      Mark as read
                    </Button>
                  ) : (
                    <span className="text-xs text-primary">Read</span>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="rounded-xl border border-border shadow-sm">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You’re all caught up. New updates will appear here."
            />
          </Card>
        )}
      </div>
    </PageShell>
  );
}
