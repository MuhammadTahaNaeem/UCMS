import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
  secondary: "bg-secondary text-secondary-foreground",
};

export function StatCard({ label, value, icon, description, loading = false, tone = "muted", className }) {
  return (
    <Card className={cn("rounded-2xl border border-border bg-card shadow-sm", className)}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{loading ? "—" : value}</p>
            {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {icon ? <div className={cn("rounded-xl p-3", toneClasses[tone] || toneClasses.muted)}>{icon}</div> : null}
        </div>
      </div>
    </Card>
  );
}
