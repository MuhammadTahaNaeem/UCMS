import { apiClient } from "@/lib/apiClient";

async function unwrap(responsePromise) {
  const response = await responsePromise;
  return response.data;
}

// Dashboard
export function fetchStaffDashboard() {
  return unwrap(apiClient.get("/staff/dashboard"));
}

// Assigned Complaints
export function fetchAssignedComplaints() {
  return unwrap(apiClient.get("/staff/assigned"));
}

export function fetchAssignedComplaintDetail(id) {
  return unwrap(apiClient.get(`/staff/assigned/${id}`));
}

// Work Management
export function startWork(id) {
  return unwrap(apiClient.post(`/staff/assigned/${id}/start`));
}

export function completeComplaint(id) {
  return unwrap(apiClient.post(`/staff/assigned/${id}/complete`));
}

// Proof Upload
export function uploadProof(id, formData) {
  return unwrap(
    apiClient.post(`/staff/assigned/${id}/proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
}

// Profile
export function fetchStaffProfile() {
  return unwrap(apiClient.get("/user/profile"));
}

export function updateStaffProfile(payload) {
  return unwrap(apiClient.put("/user/profile", payload));
}
