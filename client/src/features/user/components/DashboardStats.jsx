import { AlertCircle, CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/features/user/components/StatCard";

const statIcons = {
  total: <ListChecks className="size-5" />,
  pending: <Clock3 className="size-5" />,
  inProgress: <AlertCircle className="size-5" />,
  completed: <CheckCircle2 className="size-5" />,
};

export function DashboardStats({ stats, isLoading }) {
  const cards = [
    { label: "Total Complaints", key: "total", tone: "primary", description: "All submitted requests" },
    { label: "Pending", key: "pending", tone: "accent", description: "Awaiting review" },
    { label: "In Progress", key: "inProgress", tone: "secondary", description: "Being handled by staff" },
    { label: "Completed", key: "completed", tone: "primary", description: "Successfully resolved" },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <div key={item.key} className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-9 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => (
        <StatCard
          key={item.key}
          label={item.label}
          value={stats?.[item.key] ?? 0}
          icon={statIcons[item.key]}
          description={item.description}
          tone={item.tone}
        />
      ))}
    </div>
  );
}
