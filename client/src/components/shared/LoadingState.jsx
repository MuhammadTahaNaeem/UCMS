import { Skeleton } from "@/components/ui/skeleton";

export function StatCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full rounded-xl bg-muted" />
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full bg-muted" />
      ))}
    </div>
  );
}

export function CardSkeleton({ className = "h-48 w-full rounded-xl bg-muted" }) {
  return <Skeleton className={className} />;
}
