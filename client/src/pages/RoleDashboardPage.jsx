import { useDispatch, useSelector } from "react-redux";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { logout } from "@/features/auth/authSlice";
import { clearAuthState } from "@/features/auth/authStorage";
import { useNavigate } from "react-router-dom";

export function RoleDashboardPage({ title, description }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthState();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">University Complaint Management System</p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>

        <Card className="border-border/70">
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              {description}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium">{user?.fullName || user?.name || user?.email || "Current user"}</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
