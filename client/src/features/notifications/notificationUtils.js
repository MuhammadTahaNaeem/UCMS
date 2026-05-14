export function resolveNotificationHref(notification, rolePrefix = "/user") {
  const complaintId = notification?.complaintId?._id || notification?.complaintId;
  if (!complaintId) return `${rolePrefix}/notifications`;

  const role = rolePrefix.replace(/^\//, "");

  if (role === "staff") {
    return `/staff/complaints/${complaintId}`;
  }

  if (role === "admin") {
    return `/admin/complaints/${complaintId}`;
  }

  if (role === "super-admin") {
    return `/admin/complaints/${complaintId}`;
  }

  return `/user/complaints/${complaintId}`;
}

export function resolveNotificationLabel(notification) {
  if (notification?.complaintId?.complaintId) {
    return `Complaint ${notification.complaintId.complaintId}`;
  }

  return notification?.title || "Notification";
}