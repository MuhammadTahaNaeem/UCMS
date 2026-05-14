import { ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export function AuthLayout({ title = "University Complaint Management System", subtitle, children }) {
  const { data: settingsResponse } = useQuery({
    queryKey: ["public", "settings"],
    queryFn: async () => {
      const response = await apiClient.get("/public/settings");
      return response.data;
    },
  });

  const branding = settingsResponse?.data;
  const systemName = branding?.systemName || "University Complaint Management System";
  const logoUrl = branding?.logo?.url || "";

  return (
    <main className="auth-page-bg min-h-screen px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg items-center justify-center">
        <div className="w-full space-y-7">
          <header className="space-y-4 text-center">
            <div className="inline-flex items-center gap-4 self-center rounded-full border border-border bg-background/90 px-7 py-3 text-base font-semibold tracking-wide text-foreground shadow-md backdrop-blur-sm sm:px-8 sm:py-3.5">
              {logoUrl ? (
                <img src={logoUrl} alt={systemName} className="size-7 rounded-sm object-contain sm:size-8" />
              ) : (
                <ShieldCheck className="size-7 text-primary sm:size-8" />
              )}
              <span className="text-center">{systemName}</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
              {subtitle ? <p className="mx-auto max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">{subtitle}</p> : null}
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
