import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ImagePlus, LogOut } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/components/ui/toast";
import { clearAuthState } from "@/features/auth/authStorage";
import { logout } from "@/features/auth/authSlice";

function SidebarPanel({
  navItems = [],
  roleName = "User",
  rolePrefix = "/user",
  onNavigate,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const logoInputRef = useRef(null);

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
  const isSuperAdmin = roleName === "SuperAdmin";

  const uploadLogoMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("attachment", file);
      const response = await apiClient.post("/super/settings/logo", formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin", "settings"] });
      toast({ title: "Logo uploaded", description: "System logo updated successfully." });
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error?.response?.data?.message || "Unable to upload logo.",
        variant: "destructive",
      });
    },
  });

  const handleLogoClick = () => {
    if (!isSuperAdmin) return;
    logoInputRef.current?.click();
  };

  const handleLogoAreaClick = () => {
    if (isSuperAdmin) {
      handleLogoClick();
      return;
    }
    navigate(`${rolePrefix}/dashboard`);
    onNavigate?.();
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadLogoMutation.mutate(file);
  };

  const userName = user?.fullName || user?.name || user?.email || roleName;
  const userEmail = user?.email || `${roleName.toLowerCase()}@ucms.local`;
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const groupedNav = navItems.reduce((groups, item) => {
    const groupName = item.group || "General";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push(item);
    return groups;
  }, {});

  // Build a map of explicit child segments for each nav item.
  // This allows distinguishing between sibling child routes (like '/create')
  // and dynamic detail pages (like '/:id'). If a child segment matches
  // an explicit nav item's segment, the parent should NOT be marked active.
  const childSegmentMap = navItems.reduce((map, it) => {
    navItems.forEach((other) => {
      if (other.href !== it.href && other.href.startsWith(`${it.href}/`)) {
        const seg = other.href.slice(it.href.length + 1).split("/")[0];
        if (!map[it.href]) map[it.href] = new Set();
        map[it.href].add(seg);
      }
    });
    return map;
  }, {});

  const handleLogout = () => {
    clearAuthState();
    dispatch(logout());
    onNavigate?.();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="group relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background"
            onClick={handleLogoAreaClick}
            aria-label={isSuperAdmin ? "Upload logo" : "Go to dashboard"}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={systemName} className="h-full w-full object-contain p-1" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-[11px] font-bold text-primary-foreground">
                UCM
              </div>
            )}
            {isSuperAdmin ? (
              <span className="absolute inset-0 flex items-center justify-center bg-background/75 opacity-0 transition-opacity group-hover:opacity-100">
                <ImagePlus className="h-4 w-4 text-foreground" />
              </span>
            ) : null}
          </button>
          {isSuperAdmin ? (
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          ) : null}
          <Link
            to={`${rolePrefix}/dashboard`}
            className="min-w-0"
            onClick={() => onNavigate?.()}
          >
            <p className="text-sm font-semibold text-foreground">{systemName}</p>
            <p className="truncate text-xs text-muted-foreground">Complaints</p>
          </Link>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {Object.entries(groupedNav).map(([groupName, items], groupIndex) => (
          <div key={groupName}>
            <p
              className={cn(
                "mb-1 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
                groupIndex === 0 ? "mt-2" : "mt-6",
              )}
            >
              {groupName}
            </p>
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = (() => {
                  if (location.pathname === item.href) return true;
                  if (!location.pathname.startsWith(`${item.href}/`))
                    return false;

                  // get the next path segment after the item's href
                  const nextSeg = location.pathname
                    .slice(item.href.length + 1)
                    .split("/")[0];
                  const explicitChildSegs = childSegmentMap[item.href];
                  // If the next segment matches an explicit child nav (like 'create'),
                  // don't mark the parent active. Otherwise (e.g. an id), keep parent active.
                  if (explicitChildSegs && explicitChildSegs.has(nextSeg))
                    return false;
                  return true;
                })();

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => onNavigate?.()}
                    className={cn(
                      "mx-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                      "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isActive &&
                        "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground",
                    )}
                  >
                    {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user?.avatarUrl || ""} alt={userName} />
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials || roleName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {userName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar({
  navItems = [],
  roleName = "User",
  rolePrefix = "/user",
}) {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-border bg-background lg:sticky lg:top-0 lg:flex">
      <SidebarPanel
        navItems={navItems}
        roleName={roleName}
        rolePrefix={rolePrefix}
      />
    </aside>
  );
}

export function MobileSidebarSheet({
  navItems = [],
  roleName = "User",
  rolePrefix = "/user",
  trigger,
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close sheet when pathname changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
        <SidebarPanel
          navItems={navItems}
          roleName={roleName}
          rolePrefix={rolePrefix}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
