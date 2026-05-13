import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BACKEND_TO_DISPLAY_STATUS, STATUS } from "@/constants/statusMap";

const STATUS_STYLES = {
  [STATUS.PENDING]: "bg-secondary text-secondary-foreground border-border",
  [STATUS.APPROVED]: "bg-primary/10 text-primary border-border",
  [STATUS.IN_PROGRESS]: "bg-accent text-accent-foreground border-border",
  [STATUS.COMPLETED]: "bg-primary/10 text-primary border-border",
  [STATUS.REJECTED]: "bg-destructive/10 text-destructive border-border",
  [STATUS.UNCOMPLETED]: "bg-muted text-muted-foreground border-border",
};

function normalizeStatus(status) {
  if (!status) return "Unknown";
  const maybeMapped = BACKEND_TO_DISPLAY_STATUS[String(status).toLowerCase()];
  return maybeMapped || status;
}

export function StatusBadge({ status, className }) {
  const displayStatus = normalizeStatus(status);
  const statusClass = STATUS_STYLES[displayStatus] || "bg-muted text-muted-foreground border-border";

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", statusClass, className)}
    >
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {displayStatus}
    </Badge>
  );
}
