export const STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  UNCOMPLETED: "Uncompleted",
};

export const STATUS_LIST = Object.values(STATUS);

// Map backend status values (lowercase, snake_case) to frontend display values
export const BACKEND_TO_DISPLAY_STATUS = {
  pending: STATUS.PENDING,
  approved: STATUS.APPROVED,
  rejected: STATUS.REJECTED,
  in_progress: STATUS.IN_PROGRESS,
  completed: STATUS.COMPLETED,
  uncompleted: STATUS.UNCOMPLETED,
};

// Map frontend display values to backend status values
export const DISPLAY_TO_BACKEND_STATUS = Object.entries(BACKEND_TO_DISPLAY_STATUS).reduce((acc, [backend, display]) => {
  acc[display] = backend;
  return acc;
}, {});

export const STATUS_BADGE_CLASSES = {
  [STATUS.PENDING]: "bg-accent/10 text-accent border-border",
  [STATUS.APPROVED]: "bg-primary/10 text-primary border-border",
  [STATUS.REJECTED]: "bg-destructive/10 text-destructive border-border",
  [STATUS.IN_PROGRESS]: "bg-primary/10 text-primary border-border",
  [STATUS.COMPLETED]: "bg-primary/10 text-primary border-border",
  [STATUS.UNCOMPLETED]: "bg-muted/10 text-muted-foreground border-border",
};
