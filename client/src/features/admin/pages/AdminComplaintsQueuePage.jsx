import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState, StatusBadge, TableRowsSkeleton } from "@/components/shared";
import { approveComplaint, fetchPendingComplaints, rejectComplaint } from "@/features/admin/adminApi";
import { adminQueryKeys } from "@/features/admin/adminQueryKeys";
import { formatDate } from "@/features/user/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/toast";

export default function AdminComplaintsQueuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: complaintsResponse = {}, isLoading, error } = useQuery({
    queryKey: adminQueryKeys.complaintsPending,
    queryFn: fetchPendingComplaints,
  });
  
  const complaints = complaintsResponse?.data ?? [];

  const refreshQueue = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.complaintsPending });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.complaints });
  };

  const approveMutation = useMutation({
    mutationFn: approveComplaint,
    onSuccess: () => {
      refreshQueue();
      toast({ title: "Complaint approved", description: "The complaint moved to approved status." });
    },
    onError: (error) => {
      toast({
        title: "Approve failed",
        description: error?.response?.data?.message || "Unable to approve complaint.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, rejectionReason }) => rejectComplaint(id, { rejectionReason }),
    onSuccess: () => {
      refreshQueue();
      toast({ title: "Complaint rejected", description: "The complaint was rejected.", variant: "destructive" });
    },
    onError: (error) => {
      toast({
        title: "Reject failed",
        description: error?.response?.data?.message || "Unable to reject complaint.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id) => {
    const rejectionReason = window.prompt("Enter rejection reason");
    if (!rejectionReason?.trim()) {
      toast({ title: "Reason required", description: "Provide a rejection reason to continue.", variant: "destructive" });
      return;
    }
    rejectMutation.mutate({ id, rejectionReason: rejectionReason.trim() });
  };

  if (isLoading) {
    return (
      <PageShell title="Complaints Queue" subtitle="Admin / Pending approvals">
        <Card className="rounded-xl border border-border shadow-sm p-4">
          <TableRowsSkeleton rows={5} />
        </Card>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Complaints Queue" subtitle="Admin / Pending approvals">
        <Card className="rounded-xl border border-border shadow-sm">
          <div className="py-8 text-center text-destructive">Error loading complaints</div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Complaints Queue" subtitle="Admin / Pending approvals">
      <Card className="rounded-xl border border-border shadow-sm">
        {complaints.length === 0 ? (
          <EmptyState
            title="No pending complaints"
            description="Incoming complaints awaiting review will appear here."
          />
        ) : (
        <ScrollArea className="w-full whitespace-nowrap">
          <Table className="min-w-190">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Submitted</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((c) => (
                  <TableRow key={c._id} className="cursor-pointer border-border hover:bg-muted/50" onClick={() => navigate(`/admin/complaints/${c._id}`)}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.complaintId || c._id}</TableCell>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.department?.name || "Unknown"}</TableCell>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/complaints/${c._id}`)}>View</Button>
                        <Button
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleApprove(c._id);
                          }}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleReject(c._id);
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
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
