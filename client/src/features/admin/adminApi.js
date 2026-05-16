import { apiClient } from "@/lib/apiClient";

async function unwrap(responsePromise) {
  const response = await responsePromise;
  return response.data;
}

// Dashboard
export function fetchAdminDashboard() {
  return unwrap(apiClient.get("/admin/dashboard"));
}

// Complaints
export function fetchAllComplaints() {
  return unwrap(apiClient.get("/admin/complaints"));
}

export function fetchPendingComplaints() {
  return unwrap(apiClient.get("/admin/complaints/pending"));
}

export function fetchComplaintDetail(id) {
  return unwrap(apiClient.get(`/admin/complaints/${id}`));
}

export function approveComplaint(id) {
  return unwrap(apiClient.post(`/admin/complaints/${id}/approve`));
}

export function rejectComplaint(id, requestBody) {
  return unwrap(apiClient.post(`/admin/complaints/${id}/reject`, requestBody));
}

export function updateComplaintPriority(id, priority) {
  return unwrap(apiClient.patch(`/admin/complaints/${id}/priority`, { priority }));
}

export function assignComplaint(id, requestBody) {
  return unwrap(apiClient.post(`/admin/complaints/${id}/assign`, requestBody));
}

// Staff Management
export function fetchStaffMembers() {
  return unwrap(apiClient.get("/admin/staff"));
}

export function createStaff(requestBody) {
  return unwrap(apiClient.post("/admin/staff", requestBody));
}

export function updateStaff(id, requestBody) {
  return unwrap(apiClient.put(`/admin/staff/${id}`, requestBody));
}

export function deleteStaff(id) {
  return unwrap(apiClient.delete(`/admin/staff/${id}`));
}

export function toggleStaffStatus(id) {
  return unwrap(apiClient.post(`/admin/staff/${id}/toggle`));
}

// Departments
export function fetchDepartments() {
  return unwrap(apiClient.get("/admin/departments"));
}

export function createDepartment(requestBody) {
  return unwrap(apiClient.post("/admin/departments", requestBody));
}

// Analytics
export function fetchAnalytics() {
  return unwrap(apiClient.get("/admin/analytics"));
}
