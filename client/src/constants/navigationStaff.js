import {
  Home,
  CheckSquare,
  ClipboardList,
  User,
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
    group: "Account",
    label: "Profile",
    href: "/staff/profile",
    icon: User,
  },
];
