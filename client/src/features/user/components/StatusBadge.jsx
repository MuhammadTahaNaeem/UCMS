import { StatusBadge as SharedStatusBadge } from "@/components/shared/StatusBadge";

export function StatusBadge({ status, className }) {
  return <SharedStatusBadge status={status} className={className} />;
}
