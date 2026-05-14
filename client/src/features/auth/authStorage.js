export const AUTH_STORAGE_KEY = "ucms_auth_state";

export function loadAuthState() {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY) || window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) return undefined;
    return {
      user: parsed.user,
      token: parsed.token,
      role: parsed.role ?? parsed.user?.role ?? "User",
      isAuthenticated: true,
    };
  } catch {
    return undefined;
  }
}

export function persistAuthState(authState, rememberMe = true) {
  if (typeof window === "undefined") return;
  if (!authState?.token || !authState?.user) return;

  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  const otherStorage = rememberMe ? window.sessionStorage : window.localStorage;

  otherStorage.removeItem(AUTH_STORAGE_KEY);

  storage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token: authState.token,
      user: authState.user,
      role: authState.role ?? authState.user?.role ?? "User",
    })
  );
}

export function clearAuthState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}