import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";
import {
  clearReadNotifications,
  clearNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/notificationsApi";
import { resolveNotificationHref, resolveNotificationLabel } from "@/features/notifications/notificationUtils";

export function NotificationsPage({ rolePrefix = "/user", title = "Notifications", subtitle = "Recent system notifications" }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["notifications", rolePrefix],
    queryFn: () => fetchNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", rolePrefix] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", rolePrefix] });
    },
  });

  const clearReadMutation = useMutation({
    mutationFn: clearReadNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", rolePrefix] });
    },
  });

  const clearNotificationMutation = useMutation({
    mutationFn: clearNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", rolePrefix] });
    },
  });

  const notes = response?.data ?? [];

  return (
    <PageShell title={title} subtitle={subtitle}>
      <div className="space-y-4">
        <Card className="rounded-xl border border-border shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Notification Actions</p>
              <p className="text-xs text-muted-foreground">Mark everything as read or clear read items from the list.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending || !notes.length}
              >
                Mark all as read
              </Button>
              <Button
                variant="destructive"
                onClick={() => clearReadMutation.mutate()}
                disabled={clearReadMutation.isPending || notes.every((note) => !note.isRead)}
              >
                Clear read notifications
              </Button>
            </div>
          </div>
        </Card>

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
          notes.map((notification) => {
            const href = resolveNotificationHref(notification, rolePrefix);
            return (
              <Card
                key={notification._id}
                className="cursor-pointer rounded-xl border border-border shadow-sm transition-colors hover:bg-muted/40"
                onClick={() => {
                  if (!notification.isRead) {
                    markReadMutation.mutate(notification._id);
                  }
                  navigate(href);
                }}
              >
                <div className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    {notification.complaintId ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {resolveNotificationLabel(notification)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                    <div className="flex flex-col gap-2">
                      {!notification.isRead ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            markReadMutation.mutate(notification._id);
                          }}
                        >
                          Mark as read
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            clearNotificationMutation.mutate(notification._id);
                          }}
                        >
                          Clear
                        </Button>
                      )}
                      {!notification.isRead ? (
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-center text-xs font-medium text-primary">
                          New
                        </span>
                      ) : (
                        <span className="text-xs text-primary">Read</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
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