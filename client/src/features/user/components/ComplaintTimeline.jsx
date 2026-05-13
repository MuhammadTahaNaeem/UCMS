import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/features/user/utils";

export function ComplaintTimeline({ entries = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="mt-1 size-3 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">Timeline will appear once the complaint starts moving through the workflow.</p>;
  }

  return (
    <div className="space-y-5">
      {entries.map((entry, index) => (
        <div key={`${entry.label}-${index}`} className="flex gap-4">
          <div className="relative flex flex-col items-center">
            <span className="z-10 mt-1 size-3 rounded-full bg-primary" />
            {index < entries.length - 1 ? <span className="mt-1 h-full w-px flex-1 bg-border" /> : null}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{entry.label}</p>
              {entry.date ? <span className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</span> : null}
            </div>
            {entry.detail ? <p className="mt-1 text-sm text-muted-foreground">{entry.detail}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
