import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/features/user/components/StatCard";
import { fetchAdminDashboard } from "@/features/admin/adminApi";
import { adminQueryKeys } from "@/features/admin/adminQueryKeys";

const statCards = [
  { label: "Total Complaints", icon: ListChecks, key: "total", tone: "primary", description: "Across all departments" },
  { label: "Pending Review", icon: Clock3, key: "pending", tone: "accent", description: "Waiting for triage" },
  { label: "Approved", icon: CheckCircle2, key: "approved", tone: "secondary", description: "Ready for staff assignment" },
  { label: "In Progress", icon: AlertCircle, key: "inProgress", tone: "secondary", description: "Currently under investigation" },
  { label: "Rejected", icon: AlertCircle, key: "rejected", tone: "primary", description: "Not accepted by admin" },
  { label: "Resolved", icon: CheckCircle2, key: "resolved", tone: "primary", description: "Closed and resolved" },
];

export function AdminDashboardPage() {
  const { data: dashboardResponse, isLoading, error } = useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: fetchAdminDashboard,
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
            Monitor queue health, workload distribution, and resolution progress for your department.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          <h2 className="text-lg font-semibold text-foreground">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-muted-foreground">
           Use the navigation menu to access complaints, staff management, and analytics.
          </p>
        </div>
      </Card>
    </div>
  );
}
