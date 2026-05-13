import { BarChart, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/components/shared/PageShell";
import { fetchAnalytics } from "@/features/admin/adminApi";
import { adminQueryKeys } from "@/features/admin/adminQueryKeys";
import { StatCard } from "@/features/user/components/StatCard";

export default function AdminAnalyticsPage() {
  const { data: analyticsData = {}, isLoading, error } = useQuery({
    queryKey: adminQueryKeys.analytics,
    queryFn: fetchAnalytics,
  });

  const stats = analyticsData?.stats || {
    total: 0,
    pending: 0,
    approved: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    uncompleted: 0,
  };

  const departmentStats = analyticsData?.departmentStats || [];
  const staffPerformance = analyticsData?.staffPerformance || [];

  if (isLoading) {
    return (
      <PageShell title="Analytics" subtitle="Complaint Management Analytics">
        <div className="py-12 text-center">Loading analytics...</div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Analytics" subtitle="Complaint Management Analytics">
        <div className="py-12 text-center text-destructive">Failed to load analytics</div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Analytics" 
      subtitle="Complaint Management Analytics"
    >
      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Complaints" value={stats.total} tone="primary" description="Across the system" icon={<BarChart className="size-5" />} />
        <StatCard label="Pending" value={stats.pending} tone="accent" description="Awaiting review" icon={<BarChart className="size-5" />} />
        <StatCard label="Approved" value={stats.approved} tone="secondary" description="Ready for assignment" icon={<BarChart className="size-5" />} />
        <StatCard label="In Progress" value={stats.inProgress} tone="secondary" description="Actively being handled" icon={<BarChart className="size-5" />} />
        <StatCard label="Completed" value={stats.completed} tone="primary" description="Fully resolved" icon={<BarChart className="size-5" />} />
      </div>

      {/* Completion metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border border-border shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground">Status Distribution</h3>
            <div className="mt-4 space-y-3">
              <StatusBar label="Completed" value={stats.completed} total={stats.total} color="green" />
              <StatusBar label="In Progress" value={stats.inProgress} total={stats.total} color="purple" />
              <StatusBar label="Approved (pending assignment)" value={stats.approved} total={stats.total} color="blue" />
              <StatusBar label="Pending Review" value={stats.pending} total={stats.total} color="yellow" />
              <StatusBar label="Rejected" value={stats.rejected} total={stats.total} color="red" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground">Resolution Rate</h3>
            <div className="mt-6 flex items-end justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl font-bold text-primary">
                  {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
            <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
              <p className="text-muted-foreground">
                <span className="font-semibold">{stats.completed}</span> of <span className="font-semibold">{stats.total}</span> complaints resolved
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Department Performance Table */}
      <Card className="rounded-2xl border border-border shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-lg font-semibold text-foreground">Department Performance</h3>
          <p className="text-sm text-muted-foreground">Complaints by department and completion status</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Completion %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentStats.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-right">{dept.total}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-primary/10 text-primary">{dept.completed}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-accent/10 text-accent">{dept.pending}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {dept.total > 0 ? ((dept.completed / dept.total) * 100).toFixed(1) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Top Performing Staff */}
      <Card className="rounded-2xl border border-border shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-lg font-semibold text-foreground">Top Performing Staff</h3>
          <p className="text-sm text-muted-foreground">Staff members with highest completion rates</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Avg Time (days)</TableHead>
                <TableHead className="text-right">Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffPerformance.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.fullName}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-primary/10 text-primary">{staff.completedComplaints}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{staff.assignedComplaints}</TableCell>
                  <TableCell className="text-right">{staff.avgResolutionTime}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{staff.completionRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Uncompleted Complaints */}
      <Card className="rounded-2xl border border-border shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-lg font-semibold text-foreground">Complaint Metrics</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3 p-6">
          <MetricBox 
            icon={<BarChart className="size-5" />}
            label="Uncompleted Complaints"
            value={stats.uncompleted}
            color="red"
          />
          <MetricBox 
            icon={<TrendingUp className="size-5" />}
            label="Rejected Complaints"
            value={stats.rejected}
            color="orange"
          />
          <MetricBox 
            icon={<BarChart className="size-5" />}
            label="Average Resolution Capacity"
            value={`${(stats.completed / stats.total > 0 ? (stats.completed / stats.total * 100) : 0).toFixed(1)}%`}
            color="blue"
          />
        </div>
      </Card>
    </PageShell>
  );
}

function StatusBar({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    green: "bg-primary",
    purple: "bg-accent",
    blue: "bg-primary",
    yellow: "bg-accent",
    red: "bg-destructive",
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value, color }) {
  const bgClasses = {
    red: "bg-destructive/10 border-border",
    orange: "bg-accent/10 border-border",
    blue: "bg-primary/10 border-border",
  };

  const iconClasses = {
    red: "text-destructive",
    orange: "text-accent",
    blue: "text-primary",
  };

  return (
    <div className={`rounded-xl border p-4 ${bgClasses[color]}`}>
      <div className={`mb-2 ${iconClasses[color]}`}>
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
