import { ShieldCheck, Users, Activity, Building2, UserPlus } from "lucide-react";

export const superAdminNavigation = [
  {
    group: "Overview",
    label: "Dashboard",
    href: "/super-admin/dashboard",
    icon: ShieldCheck,
  },
  {
    group: "Oversight",
    label: "Admins",
    href: "/super-admin/admins",
    icon: Users,
  },
  {
    group: "Management",
    label: "Departments",
    href: "/super-admin/departments",
    icon: Building2,
  },
  {
    group: "Management",
    label: "Create Dept Admin",
    href: "/super-admin/department-admins",
    icon: UserPlus,
  },
  {
    group: "Management",
    label: "Settings",
    href: "/super-admin/settings",
  },
  {
    group: "Account",
    label: "Profile",
    href: "/super-admin/profile",
  },
  {
    group: "Oversight",
    label: "Activity Log",
    href: "/super-admin/activity",
    icon: Activity,
  },
];
