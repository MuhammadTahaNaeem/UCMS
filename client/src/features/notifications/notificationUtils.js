const complaintDetailRoutes = {
  user: (complaintId) => `/user/complaints/${complaintId}`,
  admin: (complaintId) => `/admin/complaints/${complaintId}`,
  staff: (complaintId) => `/staff/complaints/${complaintId}`,
  "super-admin": (complaintId) => `/admin/complaints/${complaintId}`,
};

export function resolveNotificationHref(notification, rolePrefix = "/user") {
  const complaintId =
    notification?.complaintId?._id ||
    notification?.complaintId?.id ||
    notification?.complaintId ||
    notification?.complaint?._id ||
    notification?.complaint;

  const role = rolePrefix.replace(/^\//, "");
  const isComplaintNotification =
    Boolean(complaintId) &&
    (String(notification?.type || "").startsWith("complaint_") || notification?.type === "proof_submitted" || !notification?.type);

  if (isComplaintNotification) {
    const routeBuilder = complaintDetailRoutes[role] || complaintDetailRoutes.user;
    return routeBuilder(complaintId);
  }

  return `${rolePrefix}/notifications`;
}

export function resolveNotificationLabel(notification) {
  if (notification?.complaintId?.complaintId) {
    return `Complaint ${notification.complaintId.complaintId}`;
  }

  return notification?.title || "Notification";
}