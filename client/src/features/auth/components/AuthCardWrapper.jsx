import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AuthCardWrapper({ className, children }) {
  return (
    <Card className={cn("mx-auto w-full max-w-md border-border/70 bg-background py-0 shadow-sm", className)}>
      <div className="p-6">{children}</div>
    </Card>
  );
}
