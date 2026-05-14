import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileDown, Image as ImageIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { statusClasses } from "@/constants/theme";
import { Card } from "@/components/ui/card";
import { useComplaintDetails } from "@/features/user/hooks/useComplaintDetails";
import { formatDateTime, getStatusTimelineEntries, normalizeStatus } from "@/features/user/utils";

export function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: complaintResponse, isLoading } = useComplaintDetails(id);

  const complaint = complaintResponse?.data;

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading complaint details...</div>;
  }

  if (!complaint) {
    return (
      <div className="space-y-6">
        <section className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Complaint Details</p>
            <h1 className="text-3xl font-semibold tracking-tight">Complaint not found</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/user/complaints")}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </section>

        <Card className="rounded-xl border border-border shadow-sm">
          <div className="p-8 text-center text-muted-foreground">The complaint may not exist or may have been removed.</div>
        </Card>
      </div>
    );
  }

  const displayStatus = normalizeStatus(complaint.status);
  const timeline = getStatusTimelineEntries({
    ...complaint,
    status: displayStatus,
    assignedStaff: complaint.assignedTo?.fullName,
    timeline: (complaint.timeline || []).map((entry) => ({
      label: normalizeStatus(entry.action?.replaceAll("_", " ") || entry.action),
      date: entry.timestamp,
      detail: entry.note,
    })),
  });

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" className="px-0 text-muted-foreground hover:text-foreground" onClick={() => navigate("/user/complaints")}>
            <ArrowLeft className="size-4" />
            Back to complaints
          </Button>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Complaint ID: {complaint.complaintId || complaint._id}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{complaint.title}</h1>
            <p className="text-sm text-muted-foreground">Created {formatDateTime(complaint.createdAt)}</p>
          </div>
        </div>

        {displayStatus === "Pending" ? (
          <Button
            render={<Link to="/user/complaints/create" state={{ mode: "edit", complaint: { id: complaint._id, title: complaint.title, department: complaint.department?.name, description: complaint.description } }} />}
          >
            <Pencil className="size-4" />
            Edit Complaint
          </Button>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-xl border border-border shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Complaint Summary</h2>
                <Badge variant="outline" className={statusClasses[displayStatus] || "bg-muted/10 text-muted-foreground border-border"}>{displayStatus}</Badge>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <MetaItem label="Department" value={complaint.department?.name || "—"} />
                <MetaItem label="Assigned Staff" value={complaint.assignedTo?.fullName || "Not assigned"} />
                <MetaItem label="Last Updated" value={formatDateTime(complaint.updatedAt)} />
                <MetaItem label="Attachments" value={complaint.attachments?.length ? `${complaint.attachments.length} file(s)` : "None"} />
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{complaint.description}</p>
            </div>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Attachments</h2>
              <div className="mt-4 space-y-2">
                {complaint.attachments?.length ? (
                  complaint.attachments.map((attachment) => (
                    <div key={attachment.public_id || attachment.url} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                      <span className="text-sm text-muted-foreground">{attachment.originalName || attachment.url}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={attachment.url} target="_blank" rel="noreferrer">
                          <FileDown className="size-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No attachments uploaded.</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Resolution Proof</h2>
              <div className="mt-4 space-y-3">
                {complaint.proof?.length ? (
                  complaint.proof.map((proof) => (
                    <div key={proof.public_id || proof.url} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{proof.originalName || "Proof image"}</p>
                          <p className="text-xs text-muted-foreground">Submitted {formatDateTime(proof.submittedAt)}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={proof.url} target="_blank" rel="noreferrer">
                            <ImageIcon className="size-4" />
                            View
                          </a>
                        </Button>
                      </div>
                      {proof.description ? <p className="text-sm text-muted-foreground">{proof.description}</p> : null}
                      <img src={proof.url} alt={proof.originalName || "Resolution proof"} className="max-h-72 w-full rounded-md object-cover" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No resolution proof has been submitted yet.</p>
                )}
              </div>
            </div>
          </Card>

          {displayStatus === "Rejected" && complaint.rejectionReason ? (
            <Card className="rounded-xl border border-border bg-background shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-destructive">Rejection Reason</h2>
                <p className="mt-2 text-sm text-destructive">{complaint.rejectionReason}</p>
              </div>
            </Card>
          ) : null}
        </div>

        <Card className="rounded-xl border border-border shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Timeline</h2>
            <div className="mt-6 space-y-5">
              {timeline.map((entry, index) => (
                <div key={`${entry.label}-${index}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 size-3 rounded-full bg-primary" />
                    {index < timeline.length - 1 ? <span className="mt-1 h-full w-px flex-1 bg-border" /> : null}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-foreground">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</p>
                    {entry.detail ? <p className="mt-1 text-sm text-muted-foreground">{entry.detail}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
