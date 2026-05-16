import {
  Home,
  CheckSquare,
  ClipboardList,
  UserCircle2,
} from "lucide-react";

export const staffNavigation = [
  {
    group: "Overview",
    label: "Dashboard",
    href: "/staff/dashboard",
    icon: Home,
  },
  {
    group: "Work Queue",
    label: "Assigned Complaints",
    href: "/staff/complaints",
    icon: CheckSquare,
  },
  {
    group: "Account Settings",
    label: "Profile",
    href: "/staff/profile",
    icon: UserCircle2,
  },
];
