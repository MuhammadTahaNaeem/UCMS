import {
  Home,
  MessageSquare,
  FileText,
  Bell,
  UserCircle2,
} from "lucide-react";

export const userNavigation = [
  {
    group: "Overview",
    label: "Dashboard",
    href: "/user/dashboard",
    icon: Home,
  },
  {
    group: "Requests",
    label: "Complaints",
    href: "/user/complaints",
    icon: MessageSquare,
  },
  {
    group: "Requests",
    label: "Create Complaint",
    href: "/user/complaints/create",
    icon: FileText,
  },
  {
    group: "Account Settings",
    label: "Notifications",
    href: "/user/notifications",
    icon: Bell,
  },
  {
    group: "Account Settings",
    label: "Profile",
    href: "/user/profile",
    icon: UserCircle2,
  },
];
