import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, ChevronRight, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebarSheet } from "@/components/AppSidebar";
import { clearAuthState } from "@/features/auth/authStorage";
import { logout } from "@/features/auth/authSlice";

export function AppHeader({ roleName, rolePrefix, navItems = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const userName = user?.fullName || user?.name || user?.email || roleName;
  const initials = useMemo(() => {
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    return parts.length >= 2
      ? `${parts[0][0] || roleName[0]}${parts[1][0] || ""}`.toUpperCase()
      : (parts[0]?.slice(0, 2) || roleName[0]).toUpperCase();
  }, [userName, roleName]);

  const crumbs = useMemo(() => {
    const dashboardHref = `${rolePrefix}/dashboard`;
    const navByHref = new Map(navItems.map((item) => [item.href, item.label]));
    const path = location.pathname;

    if (path === dashboardHref) {
      return [
        { label: `${roleName} Portal`, href: dashboardHref },
        { label: "Dashboard" },
      ];
    }

    const activeLabel = navByHref.get(path);
    if (activeLabel) {
      return [
        { label: `${roleName} Portal`, href: dashboardHref },
        { label: activeLabel },
      ];
    }

    if (path.includes("/complaints/")) {
      return [
        { label: `${roleName} Portal`, href: dashboardHref },
        {
          label: navByHref.get(`${rolePrefix}/complaints`) || "Complaints",
          href: `${rolePrefix}/complaints`,
        },
        { label: "Details" },
      ];
    }

    return [{ label: `${roleName} Portal`, href: dashboardHref }];
  }, [location.pathname, navItems, roleName, rolePrefix]);

  const handleLogout = () => {
    clearAuthState();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const unreadCount = 2;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-6">
      <MobileSidebarSheet
        navItems={navItems}
        roleName={roleName}
        rolePrefix={rolePrefix}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        }
      />

      <nav className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
        {crumbs.map((crumb, index) => (
          <div
            key={`${crumb.label}-${index}`}
            className="flex items-center gap-1.5"
          >
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-foreground">
                {crumb.label}
              </span>
            )}
            {index < crumbs.length - 1 ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : null}
          </div>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Link to={`${rolePrefix}/notifications`}>
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount}
            </span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 w-9 rounded-full p-0"
              aria-label="Open user menu"
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={user?.avatarUrl || ""} alt={userName} />
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate(`${rolePrefix}/profile`)}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
