import { apiClient } from "@/lib/apiClient";

async function unwrap(responsePromise) {
  const response = await responsePromise;
  return response.data;
}

export function fetchSuperAdminAdmins() {
  return unwrap(apiClient.get("/super/admins"));
}

export function fetchSuperAdminActivity(limit = 100) {
  return unwrap(apiClient.get(`/super/activity?limit=${limit}`));
}

export function createSuperDepartment(requestBody) {
  return unwrap(apiClient.post("/super/departments", requestBody));
}

export function createSuperDepartmentAdmin(requestBody) {
  return unwrap(apiClient.post("/super/department-admins", requestBody));
}

export function fetchAllDepartments() {
  return unwrap(apiClient.get("/admin/departments"));
}

export function fetchSettings() {
  return unwrap(apiClient.get("/public/settings"));
}

export function updateSettings(requestBody) {
  return unwrap(apiClient.put("/super/settings", requestBody));
}

export function uploadSettingsLogo(formData) {
  return unwrap(
    apiClient.post("/super/settings/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
}
