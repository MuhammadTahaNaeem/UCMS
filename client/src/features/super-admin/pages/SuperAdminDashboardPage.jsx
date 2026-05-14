import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Activity, Building2, Users, UserPlus, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  fetchAllDepartments,
  fetchSuperAdminAdmins,
  fetchSuperAdminActivity,
} from "@/features/super-admin/superAdminApi";

export function SuperAdminDashboardPage() {
  const { data: adminsResponse, isLoading: adminsLoading } = useQuery({
    queryKey: ["super-admin", "admins"],
    queryFn: fetchSuperAdminAdmins,
  });

  const { data: departmentsResponse, isLoading: departmentsLoading } = useQuery({
    queryKey: ["super-admin", "departments"],
    queryFn: fetchAllDepartments,
  });

  const { data: activityResponse, isLoading: activityLoading } = useQuery({
    queryKey: ["super-admin", "activity"],
    queryFn: () => fetchSuperAdminActivity(8),
  });

  const admins = adminsResponse?.data ?? [];
  const departments = departmentsResponse?.data ?? [];
  const activity = activityResponse?.data ?? [];

  const activeAdmins = React.useMemo(
    () => admins.filter((admin) => admin.isActive !== false),
    [admins]
  );

  const recentActivity = activity.slice(0, 5);

  const overviewCards = [
    {
      label: "Total admins",
      value: adminsLoading ? "..." : admins.length,
      description: "All department administrators",
      icon: Users,
      href: "/super-admin/admins",
    },
    {
      label: "Active admins",
      value: adminsLoading ? "..." : activeAdmins.length,
      description: "Enabled admin accounts",
      icon: UserPlus,
      href: "/super-admin/department-admins",
    },
    {
      label: "Departments",
      value: departmentsLoading ? "..." : departments.length,
      description: "Registered departments",
      icon: Building2,
      href: "/super-admin/departments",
    },
    {
      label: "Activity items",
      value: activityLoading ? "..." : activity.length,
      description: "Latest complaint actions",
      icon: Activity,
      href: "/super-admin/activity",
    },
  ];

  return (
    <PageShell title="SuperAdmin Dashboard" subtitle="Central oversight for departments, admins, and complaint activity">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="rounded-xl border border-border shadow-sm">
              <CardContent className="p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <div className="text-2xl font-semibold">{card.value}</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{card.description}</p>
                <Button asChild variant="link" className="mt-3 h-auto px-0 text-sm font-medium">
                  <Link to={card.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Latest complaint events across every department.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/super-admin/activity">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <TableRowsSkeleton rows={5} />
            ) : recentActivity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Complaint updates will appear here as they happen."
                cardClassName="rounded-none border-0"
              />
            ) : (
              <div className="space-y-3">
                {recentActivity.map((complaint) => {
                  const latestAction = Array.isArray(complaint.timeline) && complaint.timeline.length
                    ? complaint.timeline[complaint.timeline.length - 1]
                    : null;

                  return (
                    <div key={complaint._id} className="flex flex-col gap-2 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{complaint.complaintId || complaint.title}</p>
                          <StatusBadge status={complaint.status} />
                        </div>
                        <p className="truncate text-sm text-muted-foreground">{complaint.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {latestAction?.action ? latestAction.action.replace(/_/g, " ") : "Complaint updated"}
                        </p>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="shrink-0">
                        <Link to="/super-admin/activity">Open log</Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Jump straight into the main super-admin workflows.</p>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <Button asChild className="w-full justify-start px-4 py-6">
              <Link to="/super-admin/department-admins">
                <UserPlus className="mr-2 h-4 w-4" />
                Create department admin
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start px-4 py-6">
              <Link to="/super-admin/departments">
                <Building2 className="mr-2 h-4 w-4" />
                Manage departments
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start px-4 py-6">
              <Link to="/super-admin/admins">
                <Users className="mr-2 h-4 w-4" />
                Review all admins
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start px-4 py-6">
              <Link to="/super-admin/settings">
                <Settings2 className="mr-2 h-4 w-4" />
                Update branding
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
