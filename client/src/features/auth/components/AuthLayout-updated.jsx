import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";

export function AuthLayout({ title = "Sign in", subtitle, children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get("/public/settings");
        setSettings(response.data?.data);
      } catch (error) {
        console.log("Could not fetch settings, using defaults");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const systemName = settings?.systemName || "University Complaint Management System";
  const logo = settings?.logo;

  return (
    <main className="auth-page-bg min-h-screen px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full space-y-6">
          <header className="space-y-3 text-center">
            <div className="inline-flex flex-col items-center gap-3 self-center rounded-full border border-border bg-background/80 px-4 py-3 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              {logo?.url && (
                <img src={logo.url} alt="System logo" className="h-12 object-contain" />
              )}
              {!logo?.url && <ShieldCheck className="size-6 text-primary" />}
              <span>{systemName}</span>
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
