/**
 * Theme Color Constants
 * All colors should use these constants instead of hardcoded tailwind classes
 */

// Theme token helpers using shadcn token class names
export const roleTheme = {
  user: {
    avatar: "bg-primary",
    avatarForeground: "text-primary-foreground",
    lightSurface: "bg-background",
  },
  admin: {
    avatar: "bg-primary",
    avatarForeground: "text-primary-foreground",
    lightSurface: "bg-background",
  },
  staff: {
    avatar: "bg-primary",
    avatarForeground: "text-primary-foreground",
    lightSurface: "bg-background",
  },
};

export const statusClasses = {
  Pending: "bg-accent/10 text-accent border-border",
  "In Progress": "bg-primary/10 text-primary border-border",
  Approved: "bg-primary/10 text-primary border-border",
  Rejected: "bg-destructive/10 text-destructive border-border",
  Uncompleted: "bg-muted/10 text-muted-foreground border-border",
  Completed: "bg-primary/10 text-primary border-border",
};

export const commonClasses = {
  background: "bg-background",
  foreground: "text-foreground",
  muted: "text-muted-foreground",
  border: "border-border",
  card: "rounded-xl border border-border shadow-sm bg-card",
  pageContainer: "max-w-7xl mx-auto px-6 py-8",
  pageHeaderTitle: "text-3xl font-semibold tracking-tight",
  pageHeaderSubtitle: "text-sm text-muted-foreground",
};
