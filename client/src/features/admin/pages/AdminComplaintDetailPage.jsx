import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { FileDown, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared";
import { useToast } from "@/components/ui/toast";
import { formatDate, normalizeStatus } from "@/features/user/utils";
import {
  fetchComplaintDetail,
  approveComplaint,
  rejectComplaint,
  updateComplaintPriority,
} from "@/features/admin/adminApi";
import { adminQueryKeys } from "@/features/admin/adminQueryKeys";
import { PriorityDropdown } from "@/features/admin/components/PriorityDropdown";

const PRIORITY_COLORS = {
  low: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  high: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  urgent: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Critical",
};

function PriorityBadge({ priority }) {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  const label = PRIORITY_LABELS[priority] || priority;
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
      {label}
    </span>
  );
}

export default function AdminComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [rejectReason, setRejectReason] = useState("");

  const { data: complaintResponse, isLoading: isComplaintLoading } = useQuery({
    queryKey: adminQueryKeys.complaintDetail(id),
    queryFn: () => fetchComplaintDetail(id),
    enabled: Boolean(id),
  });

  const complaint = complaintResponse?.data;
  const canApproveOrReject = complaint?.status === "pending";

  const refreshComplaint = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.complaintDetail(id) });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.complaintsPending });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.complaints });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
  };

  const approveMutation = useMutation({
    mutationFn: () => approveComplaint(id),
    onSuccess: () => {
      refreshComplaint();
      toast({ title: "Approved", description: "Complaint moved to Approved." });
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
    mutationFn: () => rejectComplaint(id, { rejectionReason: rejectReason.trim() }),
    onSuccess: () => {
      setRejectReason("");
      refreshComplaint();
      toast({ title: "Rejected", description: "Complaint rejected.", variant: "destructive" });
    },
    onError: (error) => {
      toast({
        title: "Reject failed",
        description: error?.response?.data?.message || "Unable to reject complaint.",
        variant: "destructive",
      });
    },
  });

  const priorityMutation = useMutation({
    mutationFn: (priority) => updateComplaintPriority(id, priority),
    onSuccess: () => {
      refreshComplaint();
      toast({ title: "Priority updated", description: "Complaint priority has been updated." });
    },
    onError: (error) => {
      toast({
        title: "Priority update failed",
        description: error?.response?.data?.message || "Unable to update priority.",
        variant: "destructive",
      });
    },
  });

  if (isComplaintLoading) {
    return (
      <PageShell title="Loading..." subtitle="Admin">
        <Card>
          <CardContent className="p-6 text-muted-foreground">Loading complaint details...</CardContent>
        </Card>
      </PageShell>
    );
  }

  if (!complaint) {
    return (
      <PageShell title="Complaint not found" subtitle="Admin">
        <Card>
          <CardContent className="p-6">No complaint found with that id.</CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title={`Complaint #${complaint.complaintId || complaint._id}`} subtitle={complaint.department?.name || "—"}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="md:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-foreground">{complaint.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{complaint.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <StatusBadge status={normalizeStatus(complaint.status)} />
                {complaint.priority && (
                  <PriorityBadge priority={complaint.priority} />
                )}
                <span className="rounded-md bg-muted px-2 py-1">Submitted: {formatDate(complaint.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(complaint.timeline || []).map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-40 text-xs text-muted-foreground">{formatDate(t.timestamp)}</div>
                    <div>{t.note || t.action}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">User Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.attachments?.length ? (
                <div className="space-y-3">
                  {complaint.attachments.map((attachment) => (
                    <div key={attachment.public_id || attachment.url} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{attachment.originalName || "Attachment"}</p>
                          <p className="text-xs text-muted-foreground">{attachment.fileType || "file"}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={attachment.url} target="_blank" rel="noreferrer">
                            <FileDown className="size-4" />
                            Open
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No attachments were uploaded with this complaint.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resolution Proof</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.proof?.length ? (
                <div className="space-y-4">
                  {complaint.proof.map((proof) => (
                    <div key={proof.public_id || proof.url} className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{proof.originalName || "Proof image"}</p>
                          <p className="text-xs text-muted-foreground">Submitted {formatDate(proof.submittedAt)}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={proof.url} target="_blank" rel="noreferrer">
                            <ImageIcon className="size-4" />
                            View
                          </a>
                        </Button>
                      </div>
                      {proof.description ? <p className="text-sm text-muted-foreground">{proof.description}</p> : null}
                      <img src={proof.url} alt={proof.originalName || "Proof image"} className="max-h-64 w-full rounded-md object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No proof has been submitted yet.</p>
              )}
            </CardContent>
          </Card>

          {complaint.assignedTo ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Assigned Staff</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{complaint.assignedTo.fullName}</p>
                <p>{complaint.assignedTo.email}</p>
                <p>{complaint.assignedTo.department?.name || complaint.department?.name || "Department unavailable"}</p>
              </CardContent>
            </Card>
          ) : null}
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Complaint Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending || !canApproveOrReject}>Approve</Button>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} className="mt-2" placeholder="Rejection reason" />
              <Button
                variant="destructive"
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast({ title: "Reason required", description: "Please provide a rejection reason.", variant: "destructive" });
                    return;
                  }
                  rejectMutation.mutate();
                }}
                disabled={rejectMutation.isPending || !canApproveOrReject}
              >
                Reject
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Status: {normalizeStatus(complaint.status)}</p>
                <p>Department: {complaint.department?.name || "—"}</p>
              </div>

              {complaint.suggestedPriority && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">User Suggested Priority:</p>
                  <PriorityBadge priority={complaint.suggestedPriority} />
                </div>
              )}

              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Set Final Priority:</p>
                <PriorityDropdown
                  currentPriority={complaint.priority}
                  onUpdatePriority={priorityMutation.mutate}
                  isUpdating={priorityMutation.isPending}
                />
              </div>

              <Button variant="outline" onClick={() => navigate(-1)} className="w-full">Back</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
