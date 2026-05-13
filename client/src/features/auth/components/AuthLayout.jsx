import { ShieldCheck } from "lucide-react";

export function AuthLayout({ title = "University Complaint Management System", subtitle, children }) {
  return (
    <main className="auth-page-bg min-h-screen px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full space-y-6">
          <header className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 self-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <ShieldCheck className="size-4 text-primary" />
              University Complaint Management System
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
              {subtitle ? <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
