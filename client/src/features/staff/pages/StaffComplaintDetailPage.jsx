import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared";
import { useToast } from "@/components/ui/toast";
import { formatDate, normalizeStatus } from "@/features/user/utils";
import {
  fetchAssignedComplaintDetail,
  startWork,
  completeComplaint,
  uploadProof,
} from "@/features/staff/staffApi";
import { staffQueryKeys } from "@/features/staff/staffQueryKeys";

export default function StaffComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [proofFile, setProofFile] = useState(null);
  const [proofDescription, setProofDescription] = useState("");

  const { data: response, isLoading, error } = useQuery({
    queryKey: staffQueryKeys.assignedDetail(id),
    queryFn: () => fetchAssignedComplaintDetail(id),
    enabled: Boolean(id),
  });

  const complaint = response?.data;
  const canStartWork = complaint?.status === "approved";
  const canComplete = complaint?.status === "in_progress";
  const canUploadProof = !!complaint && ["approved", "in_progress"].includes(complaint.status);

  const startWorkMutation = useMutation({
    mutationFn: () => startWork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.assignedDetail(id) });
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.assigned });
      toast({ title: "In Progress", description: "Complaint is now in progress." });
    },
    onError: (error) => {
      toast({
        title: "Start work failed",
        description: error?.response?.data?.message || "Unable to start work.",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => completeComplaint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.assignedDetail(id) });
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.assigned });
      toast({ title: "Completed", description: "Complaint marked as completed." });
    },
    onError: (error) => {
      toast({
        title: "Complete failed",
        description: error?.response?.data?.message || "Unable to mark complaint as completed.",
        variant: "destructive",
      });
    },
  });

  const uploadProofMutation = useMutation({
    mutationFn: async () => {
      if (!proofFile) throw new Error("Proof file is required");
      const formData = new FormData();
      formData.append("attachment", proofFile);
      formData.append("description", proofDescription);
      return uploadProof(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.assignedDetail(id) });
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.assigned });
      setProofFile(null);
      setProofDescription("");
      toast({ title: "Proof uploaded", description: "Proof uploaded successfully." });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error?.response?.data?.message || error?.message || "Unable to upload proof.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <PageShell title="Loading..." subtitle="Staff">
        <Card>
          <CardContent className="p-6 text-muted-foreground">Loading complaint details...</CardContent>
        </Card>
      </PageShell>
    );
  }

  if (!complaint) {
    return (
      <PageShell title="Complaint not found" subtitle="Staff">
        <Card>
          <CardContent className="p-6 text-destructive">
            {error?.response?.data?.message || "Unable to load this complaint."}
          </CardContent>
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
                <span className="rounded-md bg-muted px-2 py-1">Assigned To: {complaint.assignedTo?.fullName ?? "Unassigned"}</span>
                <span className="rounded-md bg-muted px-2 py-1">Submitted: {formatDate(complaint.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Work Log</CardTitle>
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
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Staff Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => startWorkMutation.mutate()} disabled={startWorkMutation.isPending || !canStartWork}>Start Work</Button>
              <Button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending || !canComplete}>Mark Complete</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
              {!canStartWork ? <p className="text-xs text-muted-foreground">Start work is available after approval.</p> : null}
              {!canComplete ? <p className="text-xs text-muted-foreground">Complete is available after work is in progress.</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Proof</CardTitle>
            </CardHeader>
            <CardContent>
            <Input type="file" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="mt-2" />
            <Input value={proofDescription} onChange={(e)=>setProofDescription(e.target.value)} placeholder="Proof description (optional)" className="mt-2" />
            <div className="mt-2">
              <Button onClick={() => uploadProofMutation.mutate()} disabled={uploadProofMutation.isPending || !proofFile || !canUploadProof}>Upload</Button>
            </div>
            {!canUploadProof ? <p className="mt-2 text-xs text-muted-foreground">Proof can be uploaded after the complaint is approved.</p> : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
