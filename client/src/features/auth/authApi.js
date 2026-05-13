import { apiClient } from "@/lib/apiClient";

async function handleResponse(promise) {
  const response = await promise;
  return response.data;
}

export function registerRequest(payload) {
  return handleResponse(apiClient.post("/auth/register", { ...payload, role: "User" }));
}

export function loginRequest(payload) {
  return handleResponse(apiClient.post("/auth/login", payload));
}

export function resendVerificationRequest(payload) {
  return handleResponse(apiClient.post("/auth/resend-verification", payload));
}

export function verifyEmailRequest(token) {
  return handleResponse(apiClient.get(`/auth/email-verification/${token}`));
}

export function forgotPasswordRequest(payload) {
  return handleResponse(apiClient.post("/auth/forgot-password", payload));
}

export function resetPasswordRequest(token, payload) {
  return handleResponse(apiClient.post(`/auth/reset-password/${token}`, payload));
}
