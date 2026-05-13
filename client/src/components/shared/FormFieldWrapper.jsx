import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FormFieldWrapper({ label, htmlFor, required = false, error, hint, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
