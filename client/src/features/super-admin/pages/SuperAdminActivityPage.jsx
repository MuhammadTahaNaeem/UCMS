import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchSuperAdminActivity } from "@/features/super-admin/superAdminApi";

const getUserLabel = (user) => {
  if (!user) return "—";
  if (typeof user === "string") return user;
  return user.fullName || user.email || user._id || "—";
};

const getDepartmentLabel = (department) => {
  if (!department) return "—";
  if (typeof department === "string") return department;
  return department.name ? `${department.name} • ${department._id}` : department._id || "—";
};

export function SuperAdminActivityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["super-admin", "activity"],
    queryFn: () => fetchSuperAdminActivity(100),
  });

  const activity = data?.data ?? [];
  const pendingCount = activity.filter((item) => String(item.status).toLowerCase() === "pending").length;
  const resolvedCount = activity.filter((item) => String(item.status).toLowerCase() === "resolved").length;
  const inProgressCount = activity.filter((item) => String(item.status).toLowerCase() === "in_progress").length;

  return (
    <PageShell
      title="Global Activity Log"
      subtitle="SuperAdmin / All complaint activity across departments"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Events</p>
            <div className="mt-1 text-2xl font-semibold">{activity.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <div className="mt-1 text-2xl font-semibold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">In progress</p>
            <div className="mt-1 text-2xl font-semibold">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <div className="mt-1 text-2xl font-semibold">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableRowsSkeleton rows={6} />
            </div>
          ) : activity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Complaint updates will appear here as departments process requests."
              cardClassName="rounded-none border-0"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted by</TableHead>
                  <TableHead>Latest activity</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.map((complaint) => {
                  const timeline = Array.isArray(complaint.timeline) && complaint.timeline.length > 0
                    ? complaint.timeline[complaint.timeline.length - 1]
                    : null;

                  return (
                    <TableRow key={complaint._id}>
                      <TableCell>
                        <div className="font-medium">{complaint.complaintId || complaint.title}</div>
                        <div className="text-xs text-muted-foreground">{complaint.title}</div>
                      </TableCell>
                      <TableCell>{getDepartmentLabel(complaint.department)}</TableCell>
                      <TableCell>
                        <StatusBadge status={complaint.status} />
                      </TableCell>
                      <TableCell>{getUserLabel(complaint.submittedBy)}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium capitalize">
                          {timeline?.action ? timeline.action.replace(/_/g, " ") : "Complaint updated"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {timeline?.performedBy ? `by ${getUserLabel(timeline.performedBy)}` : complaint.assignedTo ? `assigned to ${getUserLabel(complaint.assignedTo)}` : "Activity captured from complaint history"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <span>{complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleString() : "—"}</span>
                          <Button asChild size="sm" variant="outline" className="w-fit">
                            <Link to={`/admin/complaints/${complaint._id}`}>Open complaint</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
