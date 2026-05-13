import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title = "No data available",
  description = "There is nothing to show right now.",
  action,
  className,
  cardClassName,
}) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {Icon ? <Icon className="mb-4 h-10 w-10 text-muted-foreground/40" /> : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );

  if (!cardClassName) {
    return content;
  }

  return <Card className={cardClassName}>{content}</Card>;
}
