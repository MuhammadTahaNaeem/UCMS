export const complaintStatusOptions = [
  "Pending",
  "In Progress",
  "Approved",
  "Rejected",
  "Completed",
  "Uncompleted",
];

// Department options are now fetched from /admin/departments API
// This constant is kept for backward compatibility but should be populated from Redux state
// See: client/src/features/user/components/ComplaintForm.jsx for usage
export const departmentOptions = [];

export const statusBadgeClasses = {
  Pending: "bg-accent/10 text-accent border-border",
  Approved: "bg-primary/10 text-primary border-border",
  Rejected: "bg-destructive/10 text-destructive border-border",
  "In Progress": "bg-primary/10 text-primary border-border",
  Completed: "bg-primary/10 text-primary border-border",
  Uncompleted: "bg-muted/10 text-muted-foreground border-border",
};
