import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/features/user/components/StatCard";
import { fetchStaffDashboard } from "@/features/staff/staffApi";
import { staffQueryKeys } from "@/features/staff/staffQueryKeys";

const statCards = [
  { label: "Assigned Complaints", icon: ListChecks, key: "total", tone: "primary", description: "Queued for work" },
  { label: "Awaiting Start", icon: Clock3, key: "pending", tone: "accent", description: "Auto-assigned and waiting to be picked up" },
  { label: "In Progress", icon: AlertCircle, key: "inProgress", tone: "secondary", description: "Currently being resolved" },
  { label: "Resolved", icon: CheckCircle2, key: "resolved", tone: "primary", description: "Finished tasks" },
];

export function StaffDashboardPage() {
  const { data: dashboardResponse, isLoading, error } = useQuery({
    queryKey: staffQueryKeys.dashboard,
    queryFn: fetchStaffDashboard,
  });

  const stats = dashboardResponse?.data ?? {};

  if (isLoading) {
    return (
      <div className="space-y-8">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          </div>
        </section>
        <div className="text-center py-8">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          </div>
        </section>
        <div className="text-center py-8 text-destructive">Error loading dashboard stats</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track your workload and keep assigned complaints moving through the workflow.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key] || 0;

          return (
            <StatCard
              key={card.label}
              label={card.label}
              value={value}
              icon={<Icon className="size-5" />}
              description={card.description}
              tone={card.tone}
            />
          );
        })}
      </section>

      <Card className="rounded-2xl border border-border shadow-sm">
        <div className="p-6 text-center sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">Staff Dashboard</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the navigation menu to access complaints and profile.
          </p>
        </div>
      </Card>
    </div>
  );
}
