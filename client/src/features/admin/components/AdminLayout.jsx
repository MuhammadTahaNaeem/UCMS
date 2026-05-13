import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { adminNavigation } from "@/constants/navigationAdmin";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:flex">
        <AppSidebar navItems={adminNavigation} roleName="Admin" rolePrefix="/admin" />
        <div className="min-w-0 flex-1">
        <AppHeader roleName="Admin" rolePrefix="/admin" navItems={adminNavigation} />
          <main className="min-h-[calc(100vh-4rem)]">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6 lg:p-8">
            <Outlet />
            </div>
          </main>
          </div>
      </div>
    </div>
  );
}
