import { format } from "date-fns";
import { statusBadgeClasses } from "@/features/user/constants";
import { BACKEND_TO_DISPLAY_STATUS, STATUS_BADGE_CLASSES } from "@/constants/statusMap";

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "dd MMM yyyy");
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "dd MMM yyyy, hh:mm a");
}

// Normalize backend status to display status
export function normalizeStatus(status) {
  if (!status) return "Unknown";
  return BACKEND_TO_DISPLAY_STATUS[status.toLowerCase()] || status;
}

export function getStatusBadgeClass(status) {
  const displayStatus = normalizeStatus(status);
  return STATUS_BADGE_CLASSES[displayStatus] || statusBadgeClasses[status] || "bg-muted/10 text-muted-foreground border-border";
}

export function getStatusTimelineEntries(complaint) {
  const timeline = complaint?.timeline ?? [];

  if (timeline.length > 0) {
    return timeline;
  }

  return [
    { label: "Created", date: complaint?.createdAt, detail: "Complaint submitted" },
    { label: complaint?.status === "Rejected" ? "Rejected" : "Approved", date: complaint?.approvedAt || complaint?.rejectedAt, detail: complaint?.rejectionReason || undefined },
    { label: "Assigned", date: complaint?.assignedAt, detail: complaint?.assignedStaff?.name || complaint?.assignedStaff || undefined },
    { label: "In Progress", date: complaint?.inProgressAt },
    { label: complaint?.status === "Completed" ? "Completed" : "Uncompleted", date: complaint?.completedAt || complaint?.uncompletedAt },
  ].filter((entry) => entry.date || entry.detail);
}
