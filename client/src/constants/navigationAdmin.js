import {
  Home,
  ListChecks,
  Users,
  BarChart3,
  User,
  UserCog,
} from "lucide-react";

export const adminNavigation = [
  {
    group: "Overview",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    group: "Operations",
    label: "Complaints Queue",
    href: "/admin/complaints",
    icon: ListChecks,
  },
  {
    group: "Operations",
    label: "Assignment Board",
    href: "/admin/assignments",
    icon: UserCog,
  },
  {
    group: "Operations",
    label: "Staff Management",
    href: "/admin/staff",
    icon: Users,
  },
  {
    group: "Insights",
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    group: "Account",
    label: "Profile",
    href: "/admin/profile",
    icon: User,
  },
];
