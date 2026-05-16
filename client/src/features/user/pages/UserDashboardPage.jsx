import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Clock3, FilePlus, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserDashboard } from "@/features/user/hooks/useUserDashboard";
import { useUserComplaints } from "@/features/user/hooks/useUserComplaints";
import { formatDate } from "@/features/user/utils";
import { StatCard } from "@/features/user/components/StatCard";
import { StatusBadge } from "@/features/user/components/StatusBadge";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";

const statCards = [
  { label: "Total Complaints", icon: MessageSquareText, key: "total", tone: "primary", description: "All complaints submitted by you" },
  { label: "Pending", icon: Clock3, key: "pending", tone: "accent", description: "Waiting for triage" },
  { label: "In Progress", icon: ArrowUpRight, key: "inProgress", tone: "secondary", description: "Currently being handled" },
  { label: "Completed", icon: CheckCircle2, key: "completed", tone: "primary", description: "Resolved requests" },
];

export function UserDashboardPage() {
  const navigate = useNavigate();
  const { data: dashboardResponse, isLoading: isStatsLoading } = useUserDashboard();
  const { data: complaintsResponse, isLoading: isComplaintsLoading } = useUserComplaints();

  const stats = dashboardResponse?.data ?? { total: 0, pending: 0, inProgress: 0, completed: 0 };
  const complaints = complaintsResponse?.data ?? [];

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track your complaint lifecycle, review recent submissions, and jump into the latest actions.
          </p>
        </div>
        <Button render={<Link to="/user/complaints/create" />}>
          <FilePlus className="size-4" />
          Create Complaint
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <StatCard
              key={card.label}
              label={card.label}
              value={isStatsLoading ? "—" : stats[card.key]}
              icon={<Icon className="size-5" />}
              description={card.description}
              tone={card.tone}
            />
          );
        })}
      </section>

      <Card className="rounded-2xl border border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg">Recent Complaints</CardTitle>
          <CardDescription>Latest five complaints submitted by you.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isComplaintsLoading ? (
            <TableRowsSkeleton rows={5} />
          ) : recentComplaints.length === 0 ? (
            <EmptyState
              title="No complaints found"
              description="Create a complaint to start tracking request updates."
            />
          ) : (
            <ScrollArea className="w-full whitespace-nowrap">
              <Table className="min-w-190">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentComplaints.map((item) => (
                    <TableRow
                      key={item._id}
                      className="cursor-pointer border-border transition-colors hover:bg-muted/50"
                      onClick={() => navigate(`/user/complaints/${item.complaintId || item._id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.complaintId || item._id}</TableCell>
                      <TableCell className="text-sm text-foreground">{item.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.department?.name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                        <Button variant="ghost" size="sm" render={<Link to={`/user/complaints/${item.complaintId || item._id}`} />}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
