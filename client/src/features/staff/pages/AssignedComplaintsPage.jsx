import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/shared/PageShell";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAssignedComplaints } from "@/features/staff/staffApi";
import { staffQueryKeys } from "@/features/staff/staffQueryKeys";
import { formatDate } from "@/features/user/utils";
import { EmptyState, StatusBadge, TableRowsSkeleton } from "@/components/shared";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AssignedComplaintsPage() {
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useQuery({
    queryKey: staffQueryKeys.assigned,
    queryFn: fetchAssignedComplaints,
  });

  const complaints = response?.data ?? [];

  return (
    <PageShell title="Assigned Complaints" subtitle="Staff / Your active assignments">
      <Card className="rounded-xl border border-border shadow-sm">
        {isLoading ? (
          <div className="p-4">
            <TableRowsSkeleton rows={5} />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">Failed to load assigned complaints</div>
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No assigned complaints"
            description="New assignments will appear here when routed to you."
          />
        ) : (
        <ScrollArea className="w-full whitespace-nowrap">
          <Table className="min-w-190">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((c) => (
                  <TableRow key={c._id} className="cursor-pointer border-border hover:bg-muted/50" onClick={() => navigate(`/staff/complaints/${c._id}`)}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.complaintId || c._id}</TableCell>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.department?.name || "—"}</TableCell>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </ScrollArea>
        )}
      </Card>
    </PageShell>
  );
}
