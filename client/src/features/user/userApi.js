import { apiClient } from "@/lib/apiClient";

async function unwrap(responsePromise) {
  const response = await responsePromise;
  return response.data;
}

export function fetchUserDashboard() {
  return unwrap(apiClient.get("/user/dashboard"));
}

export function fetchUserComplaints(params) {
  return unwrap(apiClient.get("/complaints/me", { params }));
}

export function fetchComplaintDetails(id) {
  return unwrap(apiClient.get(`/complaints/${id}`));
}

export function createComplaint(payload) {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

  return unwrap(
    apiClient.post("/complaints", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    })
  );
}

export function updateComplaint(id, payload) {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

  return unwrap(
    apiClient.put(`/complaints/${id}`, payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    })
  );
}

export function fetchUserProfile() {
  return unwrap(apiClient.get("/user/profile"));
}

export function updateUserProfile(payload) {
  return unwrap(apiClient.put("/user/profile", payload));
}

export function fetchUserNotifications() {
  return unwrap(apiClient.get("/user/notifications"));
}

export function markNotificationRead(id) {
  return unwrap(apiClient.patch(`/user/notifications/${id}/read`));
}

export function fetchDepartments() {
  return unwrap(apiClient.get("/complaints/departments"));
}
