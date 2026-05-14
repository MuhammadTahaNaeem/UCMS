import { apiClient } from "@/lib/apiClient";

async function unwrap(responsePromise) {
  const response = await responsePromise;
  return response.data;
}

export function fetchNotifications(params = {}) {
  return unwrap(apiClient.get("/notifications", { params }));
}

export function markNotificationRead(id) {
  return unwrap(apiClient.patch(`/notifications/${id}/read`));
}

export function markAllNotificationsRead() {
  return unwrap(apiClient.patch("/notifications/read-all"));
}

export function clearReadNotifications() {
  return unwrap(apiClient.delete("/notifications/read"));
}

export function clearNotification(id) {
  return unwrap(apiClient.delete(`/notifications/${id}`));
}